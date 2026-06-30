import { Injectable } from '@nestjs/common';
import { Message } from '../common/types/chat.types';
import { PublicUser } from '../common/types/user.types';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomsService: RoomsService,
  ) {}

  list(roomId: string): Promise<Message[]> {
    return this.roomsService.listMessages(roomId);
  }

  async createApproved(roomId: string, content: string, author: PublicUser): Promise<Message> {
    await this.roomsService.findRecordByIdOrThrow(roomId);
    const message = await this.prisma.message.create({
      data: {
      roomId,
        authorId: author.id,
      content,
      status: 'APPROVED',
      },
      include: { author: true },
    });

    return this.roomsService.toMessage(message);
  }

  async createPending(roomId: string, content: string, author: PublicUser): Promise<Message> {
    await this.roomsService.findRecordByIdOrThrow(roomId);
    const message = await this.prisma.message.create({
      data: {
        roomId,
        authorId: author.id,
        content,
        status: 'PENDING',
      },
      include: { author: true },
    });

    return this.roomsService.toMessage(message);
  }

  async approve(messageId: string): Promise<Message> {
    const message = await this.prisma.message.update({
      where: { id: messageId },
      data: { status: 'APPROVED', reason: null },
      include: { author: true },
    });

    return this.roomsService.toMessage(message);
  }

  async reject(messageId: string, reason: string): Promise<Message> {
    const message = await this.prisma.message.update({
      where: { id: messageId },
      data: { status: 'REJECTED', reason },
      include: { author: true },
    });

    return this.roomsService.toMessage(message);
  }
}
