<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@/components/common/Button.vue'
import CreateRoomModal from '@/components/rooms/CreateRoomModal.vue'
import RoomCard from '@/components/rooms/RoomCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useRoomsStore } from '@/stores/rooms'
import type { CreateRoomPayload } from '@/types/room'

const router = useRouter()
const authStore = useAuthStore()
const roomsStore = useRoomsStore()
const createRoomOpen = ref(false)

const userName = computed(() => authStore.user?.name ?? 'Usuário')

function openRoom(roomId: string): void {
  roomsStore.selectRoom(roomId)
  router.push({ name: 'chat', params: { id: roomId } })
}

async function createRoom(payload: CreateRoomPayload): Promise<void> {
  const room = await roomsStore.createRoom(payload)
  createRoomOpen.value = false
  openRoom(room.id)
}

function logout(): void {
  authStore.logout()
  router.push({ name: 'login' })
}

onMounted(() => {
  if (roomsStore.rooms.length === 0) {
    void roomsStore.loadRooms()
  }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <aside class="hidden w-80 shrink-0 border-r bg-white md:flex md:flex-col">
      <div class="border-b p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-brand-600">Chat Vue</p>
            <p class="truncate text-sm text-slate-500">{{ userName }}</p>
          </div>
          <Button size="sm" variant="ghost" @click="logout">Sair</Button>
        </div>
        <Button class="mt-4 w-full" variant="secondary" @click="createRoomOpen = true">Nova sala</Button>
      </div>

      <nav class="flex-1 space-y-3 overflow-y-auto p-4">
        <button
          v-for="room in roomsStore.rooms"
          :key="room.id"
          type="button"
          class="block w-full text-left"
          @click="openRoom(room.id)"
        >
          <RoomCard :room="room" :active="room.id === roomsStore.selectedRoomId" />
        </button>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <slot />
    </div>

    <CreateRoomModal :open="createRoomOpen" @close="createRoomOpen = false" @create="createRoom" />
  </div>
</template>
