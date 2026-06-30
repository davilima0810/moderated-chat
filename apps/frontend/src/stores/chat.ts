import { defineStore } from 'pinia'
import { ref } from 'vue'

import { messagesApi } from '@/services/messages'
import type { Message, SendMessagePayload } from '@/types/message'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const loading = ref(false)

  function getMessagesByRoom(roomId: string): Message[] {
    return messages.value.filter((message) => message.roomId === roomId)
  }

  function addMessage(message: Message): void {
    if (messages.value.some((item) => item.id === message.id)) {
      updateMessage(message.id, message)
      return
    }

    messages.value.push(message)
  }

  function updateMessage(messageId: string, updates: Partial<Message>): void {
    const index = messages.value.findIndex((message) => message.id === messageId)

    if (index >= 0) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  function clear(roomId?: string): void {
    messages.value = roomId
      ? messages.value.filter((message) => message.roomId !== roomId)
      : []
  }

  async function loadMessages(roomId: string): Promise<void> {
    loading.value = true
    try {
      const { data } = await messagesApi.list(roomId)
      messages.value = [
        ...messages.value.filter((message) => message.roomId !== roomId),
        ...data,
      ]
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(payload: SendMessagePayload): Promise<Message> {
    const { data } = await messagesApi.send(payload)
    addMessage(data)
    return data
  }

  return {
    messages,
    loading,
    getMessagesByRoom,
    addMessage,
    updateMessage,
    loadMessages,
    sendMessage,
    clear,
  }
})
