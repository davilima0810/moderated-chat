import { FrontendMessageStatus } from '../enums/message-status.enum';
import { MessageStatus } from '@prisma/client'
import { WsEventType } from '../enums/ws-event.enum';
import { PublicUser } from './user.types';

export interface Room {
  id: string;
  name: string;
  description: string;
  participants: PublicUser[];
  messages: Message[];
  unreadCount: number;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  content: string;

  created_at: string;
  createdAt: string;

  status: MessageStatus | FrontendMessageStatus;

  reason?: string | null;

  author: PublicUser;
}

export interface WsEvent<TPayload> {
  type: WsEventType;
  payload: TPayload;
}