import { Injectable, NotFoundException } from '@nestjs/common';
import { Message as PrismaMessage, Room as PrismaRoom, User as PrismaUser } from '@prisma/client';
import { Message, Room } from '../common/types/chat.types';
import { PublicUser } from '../common/types/user.types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateRoomDto } from './dto/create-room.dto';

type RoomWithRelations = PrismaRoom & {
  participants: Array<{ user: PrismaUser }>;
  messages: PrismaMessage[];
};

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async list(): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rooms.map((room) => this.toRoom(room));
  }

  async create(dto: CreateRoomDto, owner: PublicUser): Promise<Room> {
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        participants: {
          create: { userId: owner.id },
        },
      },
      include: {
        participants: { include: { user: true } },
        messages: true,
      },
    });

    return this.toRoom(room);
  }

  async findByIdOrThrow(id: string): Promise<Room> {
    const room = await this.findRecordByIdOrThrow(id);
    return this.toRoom(room);
  }

  async addParticipant(roomId: string, email: string): Promise<Room> {
    const room = await this.findRecordByIdOrThrow(roomId);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.participant.upsert({
      where: { roomId_userId: { roomId: room.id, userId: user.id } },
      update: {},
      create: { roomId: room.id, userId: user.id },
    });

    return this.findByIdOrThrow(roomId);
  }

  async listMessages(roomId: string): Promise<Message[]> {
    await this.findRecordByIdOrThrow(roomId);
    const messages = await this.prisma.message.findMany({
      where: { roomId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((message) => this.toMessage(message));
  }

  async findRecordByIdOrThrow(id: string): Promise<RoomWithRelations> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  toRoom(room: RoomWithRelations): Room {
    const latestMessage = room.messages[0];
    const createdAt = room.createdAt.toISOString();

    return {
      id: room.id,
      name: room.name,
      description: '',
      participants: room.participants.map((participant) =>
        this.usersService.toPublicUser(participant.user),
      ),
      messages: [],
      unreadCount: 0,
      lastMessageAt: latestMessage?.createdAt.toISOString() ?? createdAt,
    };
  }

  toMessage(
    message: PrismaMessage & {
      author: PrismaUser;
    },
  ): Message {
    const createdAt = message.createdAt.toISOString();

    return {
      id: message.id,
      roomId: message.roomId,
      content: message.content,
      created_at: createdAt,
      createdAt,
      status: message.status,
      reason: message.reason,
      author: this.usersService.toPublicUser(message.author),
    };
  }
}
