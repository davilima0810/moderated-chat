import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { RawData, Server, WebSocket } from 'ws';
import { AuthService } from '../auth/auth.service';
import { PublicUser } from '../common/types/user.types';
import { MessagesService } from '../messages/messages.service';
import { RoomsService } from '../rooms/rooms.service';

interface AuthenticatedSocket extends WebSocket {
  roomId?: string;
  user?: PublicUser;
}

interface IncomingChatMessage {
  type: 'chat_message';
  message?: string;
  payload?: {
    roomId?: string;
    content?: string;
    tempId?: string;
  };
}

@Injectable()
export class ChatGateway implements OnModuleInit {
  private server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private readonly clientsByRoom = new Map<string, Set<AuthenticatedSocket>>();

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly authService: AuthService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
  ) {}

  onModuleInit(): void {
    this.server = new Server({ noServer: true });
    const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer();

    httpServer.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
      const url = new URL(request.url ?? '/', 'ws://localhost:3000');

      if (!url.pathname.startsWith('/ws/chat/')) {
        return;
      }

      this.server.handleUpgrade(request, socket, head, (client) => {
        this.server.emit('connection', client, request);
        void this.handleConnection(client as AuthenticatedSocket, request);
      });
    });
  }

  private async handleConnection(
    client: AuthenticatedSocket,
    request: IncomingMessage,
  ): Promise<void> {
    const url = new URL(request.url ?? '/', 'ws://localhost:3000');
    const roomId = this.extractRoomId(url.pathname);
    const token = this.extractToken(url);

    if (!roomId || !token) {
      this.closeInvalidConnection(client);
      return;
    }

    try {
      const user = await this.authService.verifyAccessToken(token);
      await this.roomsService.findByIdOrThrow(roomId);
      client.roomId = roomId;
      client.user = user;

      const roomClients = this.clientsByRoom.get(roomId) ?? new Set<AuthenticatedSocket>();
      roomClients.add(client);
      this.clientsByRoom.set(roomId, roomClients);
      client.on('message', (rawMessage) => this.handleRawMessage(client, rawMessage));
      client.on('close', () => this.handleDisconnect(client));

      this.send(client, {
        type: 'connection_established',
        payload: {
          roomId,
          connectedAt: new Date().toISOString(),
        },
      });

      const messages = await this.messagesService.list(roomId);
      for (const message of messages) {
        this.send(client, {
          type: 'chat_message',
          payload: message,
        });
      }
    } catch {
      this.closeInvalidConnection(client);
    }
  }

  private handleDisconnect(client: AuthenticatedSocket): void {
    if (!client.roomId) {
      return;
    }

    const roomClients = this.clientsByRoom.get(client.roomId);
    roomClients?.delete(client);

    if (roomClients?.size === 0) {
      this.clientsByRoom.delete(client.roomId);
    }
  }

  private handleRawMessage(client: AuthenticatedSocket, rawMessage: RawData): void {
    try {
      const body = JSON.parse(rawMessage.toString()) as IncomingChatMessage;

      if (body.type !== 'chat_message') {
        this.sendError(client, 'Unsupported event type', 'UNSUPPORTED_EVENT');
        return;
      }

      void this.handleChatMessage(client, body);
    } catch {
      this.sendError(client, 'Invalid JSON message', 'INVALID_JSON');
    }
  }

  private async handleChatMessage(
    client: AuthenticatedSocket,
    body: IncomingChatMessage,
  ): Promise<void> {
    const roomId = body.payload?.roomId ?? client.roomId;
    const content = body.payload?.content ?? body.message;
    const tempId = body.payload?.tempId ?? randomUUID();

    if (!client.user || !roomId || !content) {
      this.sendError(client, 'Invalid chat message', 'INVALID_MESSAGE');
      return;
    }

    const pendingMessage = await this.messagesService.createPending(roomId, content, client.user);

    this.send(client, {
      type: 'message_queued',
      payload: {
        tempId,
        roomId,
        status: 'PENDING',
        message: pendingMessage,
      },
    });

    setTimeout(() => {
      void this.moderateMessage(client, roomId, pendingMessage.id, tempId);
    }, 1000);
  }

  private async moderateMessage(
    client: AuthenticatedSocket,
    roomId: string,
    messageId: string,
    tempId: string,
  ): Promise<void> {
    const approved = Math.random() < 0.8;

    if (!approved) {
      const reason = 'Message rejected by local moderation simulation';
      const rejectedMessage = await this.messagesService.reject(messageId, reason);
      this.send(client, {
        type: 'message_rejected',
        payload: {
          tempId,
          id: rejectedMessage.id,
          message: rejectedMessage,
          reason,
          status: 'REJECTED',
        },
      });
      return;
    }

    const approvedMessage = await this.messagesService.approve(messageId);

    this.broadcast(roomId, {
      type: 'chat_message',
      payload: approvedMessage,
    });
  }

  private broadcast(roomId: string, event: unknown): void {
    const clients = this.clientsByRoom.get(roomId) ?? new Set<AuthenticatedSocket>();

    for (const client of clients) {
      this.send(client, event);
    }
  }

  private send(client: AuthenticatedSocket, event: unknown): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  }

  private sendError(client: AuthenticatedSocket, message: string, code?: string): void {
    this.send(client, {
      type: 'error',
      payload: { message, code },
    });
  }

  private closeInvalidConnection(client: AuthenticatedSocket): void {
    this.sendError(client, 'Invalid websocket token or room', 'UNAUTHORIZED');
    client.close(1008, 'Unauthorized');
  }

  private extractToken(url: URL): string | undefined {
    const queryToken = url.searchParams.get('token') ?? undefined;
    const bearerToken = url.searchParams.get('authorization') ?? undefined;
    return queryToken ?? bearerToken ?? undefined;
  }

  private extractRoomId(pathname: string): string | undefined {
    const segments = pathname.split('/').filter(Boolean);
    return segments.at(-1);
  }
}
