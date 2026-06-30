import type { User } from './auth'

export type MessageStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Message {
  id: string
  roomId: string
  author: User
  content: string
  createdAt: string
  status: MessageStatus
  reason?: string | null
}

export interface SendMessagePayload {
  roomId: string
  content: string
}
