import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { roomsApi } from '@/services/rooms'
import type { CreateRoomPayload, Room } from '@/types/room'

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([])
  const selectedRoomId = ref<string | null>(null)
  const loading = ref(false)
  const selectedRoom = computed(() => rooms.value.find((room) => room.id === selectedRoomId.value) ?? null)

  function selectRoom(roomId: string): void {
    selectedRoomId.value = roomId
  }

  async function loadRooms(): Promise<void> {
    loading.value = true
    try {
      const { data } = await roomsApi.list()
      rooms.value = data
    } finally {
      loading.value = false
    }
  }

  async function createRoom(payload: CreateRoomPayload): Promise<Room> {
    loading.value = true
    try {
      const { data: room } = await roomsApi.create(payload)
      rooms.value.unshift(room)
    selectedRoomId.value = room.id
    return room
    } finally {
      loading.value = false
    }
  }

  async function addParticipant(roomId: string, email: string): Promise<void> {
    const { data } = await roomsApi.addParticipant(roomId, email)
    const index = rooms.value.findIndex((room) => room.id === roomId)

    if (index >= 0) {
      rooms.value[index] = data as Room
    }
  }

  return {
    rooms,
    selectedRoom,
    selectedRoomId,
    loading,
    selectRoom,
    loadRooms,
    createRoom,
    addParticipant,
  }
})
