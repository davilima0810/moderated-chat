<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@/components/common/Button.vue'
import CreateRoomModal from '@/components/rooms/CreateRoomModal.vue'
import RoomCard from '@/components/rooms/RoomCard.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useRoomsStore } from '@/stores/rooms'
import type { CreateRoomPayload } from '@/types/room'
import { roomSchema } from '@/validation/schemas'

const router = useRouter()
const roomsStore = useRoomsStore()
const createRoomOpen = ref(false)
const error = ref('')

function openRoom(roomId: string): void {
  roomsStore.selectRoom(roomId)
  router.push({ name: 'chat', params: { id: roomId } })
}

async function createRoom(payload: CreateRoomPayload): Promise<void> {
  error.value = ''
  const parsed = roomSchema.safeParse(payload)

  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Dados inválidos'
    return
  }

  const room = await roomsStore.createRoom({
    name: parsed.data.name,
    description: parsed.data.description ?? '',
  })
  createRoomOpen.value = false
  openRoom(room.id)
}

onMounted(() => {
  void roomsStore.loadRooms()
})
</script>

<template>
  <DefaultLayout>
    <main class="flex-1 overflow-y-auto p-4 md:p-8">
      <div class="mx-auto max-w-5xl">
        <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-950">Salas</h1>
            <p class="mt-1 text-sm text-slate-500">Escolha uma conversa ou crie uma sala para o time.</p>
          </div>
          <Button @click="createRoomOpen = true">Nova Sala</Button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 xl:col-span-3">
            {{ error }}
          </p>
          <div v-if="roomsStore.loading" class="text-sm text-slate-500 sm:col-span-2 xl:col-span-3">Carregando salas...</div>
          <div
            v-else-if="roomsStore.rooms.length === 0"
            class="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3"
          >
            Nenhuma sala criada ainda.
          </div>
          <template v-else>
            <button
              v-for="room in roomsStore.rooms"
              :key="room.id"
              type="button"
              class="text-left"
              @click="openRoom(room.id)"
            >
              <RoomCard :room="room" />
            </button>
          </template>
        </div>
      </div>
    </main>
    <CreateRoomModal :open="createRoomOpen" @close="createRoomOpen = false" @create="createRoom" />
  </DefaultLayout>
</template>
