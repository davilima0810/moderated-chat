<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import ChatHeader from '@/components/chat/ChatHeader.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import MessageList from '@/components/chat/MessageList.vue'
import AddParticipantModal from '@/components/rooms/AddParticipantModal.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useRoomsStore } from '@/stores/rooms'
import { useWebSocketStore } from '@/stores/websocket'
import { messageSchema, participantSchema } from '@/validation/schemas'

const route = useRoute()
const authStore = useAuthStore()
const roomsStore = useRoomsStore()
const chatStore = useChatStore()
const websocketStore = useWebSocketStore()
const addParticipantOpen = ref(false)
const error = ref('')

const roomId = computed(() => String(route.params.id))
const room = computed(() => roomsStore.rooms.find((item) => item.id === roomId.value) ?? null)
const messages = computed(() => chatStore.getMessagesByRoom(roomId.value))

async function syncRoom(): Promise<void> {
  roomsStore.selectRoom(roomId.value)
  if (!room.value) {
    await roomsStore.loadRooms()
  }
  await chatStore.loadMessages(roomId.value)
  websocketStore.connect(roomId.value)
}

function sendMessage(content: string): void {
  const parsed = messageSchema.safeParse({ content })

  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Mensagem inválida'
    return
  }

  websocketStore.send({
    type: 'chat_message',
    payload: {
      roomId: roomId.value,
      content: parsed.data.content,
      tempId: crypto.randomUUID(),
    },
  })
}

async function addParticipant(email: string): Promise<void> {
  const parsed = participantSchema.safeParse({ email })

  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Email inválido'
    return
  }

  await roomsStore.addParticipant(roomId.value, parsed.data.email)
  addParticipantOpen.value = false
}

onMounted(() => {
  void syncRoom()
})
onBeforeUnmount(() => websocketStore.disconnect())
watch(roomId, () => {
  void syncRoom()
})
</script>

<template>
  <DefaultLayout>
    <main class="flex min-h-0 flex-1 flex-col">
      <ChatHeader
        :room="room"
        :connected="websocketStore.connected"
        :status="websocketStore.status"
        @add-participant="addParticipantOpen = true"
      />
      <p v-if="error" class="border-b bg-rose-50 px-4 py-2 text-sm text-rose-700">{{ error }}</p>
      <MessageList :messages="messages" :current-user-id="authStore.user?.id" :loading="chatStore.loading" />
      <MessageInput :disabled="!room || !websocketStore.connected" @send="sendMessage" />
    </main>

    <AddParticipantModal :open="addParticipantOpen" @close="addParticipantOpen = false" @add="addParticipant" />
  </DefaultLayout>
</template>
