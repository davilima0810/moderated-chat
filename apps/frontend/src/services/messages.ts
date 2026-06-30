import api from './axios'
import type { Message, SendMessagePayload } from '@/types/message'

export const messagesApi = {
  list(roomId: string) {
    return api.get<Message[]>(`/rooms/${roomId}/messages`)
  },
  send(payload: SendMessagePayload) {
    return api.post<Message>(`/rooms/${payload.roomId}/messages`, payload)
  },
}
