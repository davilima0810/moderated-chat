import api from './axios'
import type { CreateRoomPayload, Room } from '@/types/room'

export const roomsApi = {
  list() {
    return api.get<Room[]>('/rooms')
  },
  create(payload: CreateRoomPayload) {
    return api.post<Room>('/rooms', payload)
  },
  addParticipant(roomId: string, email: string) {
    return api.post(`/rooms/${roomId}/participants`, { email })
  },
}
