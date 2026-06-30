import type { User } from './auth'

export interface Room {
  id: string
  name: string
  description: string
  participants: User[]
  unreadCount: number
  lastMessageAt: string
}

export interface CreateRoomPayload {
  name: string
  description: string
}
