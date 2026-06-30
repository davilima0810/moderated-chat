import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import type { WebSocketOutgoingMessage } from '@/types/websocket'

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected'

export const useWebSocketStore = defineStore('websocket', () => {
  let socket: WebSocket | null = null
  let reconnectTimer: number | null = null
  const connected = ref(false)
  const status = ref<ConnectionStatus>('disconnected')
  const currentRoomId = ref<string | null>(null)

  function connect(roomId: string): void {
    const authStore = useAuthStore()

    if (!authStore.token) {
      return
    }

    disconnect()
    currentRoomId.value = roomId
    status.value = 'reconnecting'

    const baseUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000'
    socket = new WebSocket(`${baseUrl}/ws/chat/${roomId}?token=${authStore.token}`)
    const activeSocket = socket

    socket.onmessage = (event) => {
      const chatStore = useChatStore()
      const parsedEvent = JSON.parse(event.data)

      if (parsedEvent.type === 'connection_established') {
        connected.value = true
        status.value = 'connected'
      }

      if (parsedEvent.type === 'message_queued') {
        chatStore.addMessage(parsedEvent.payload.message)
      }

      if (parsedEvent.type === 'chat_message') {
        const message = parsedEvent.payload
        const existingMessage = chatStore.messages.find((item) => item.id === message.id)

        if (existingMessage) {
          chatStore.updateMessage(message.id, message)
        } else {
          chatStore.addMessage(message)
        }
      }

      if (parsedEvent.type === 'message_rejected') {
        const message = parsedEvent.payload.message
        if (message) {
          chatStore.updateMessage(message.id, message)
        }
        window.dispatchEvent(new CustomEvent('chat-toast', { detail: parsedEvent.payload.reason }))
      }

      if (parsedEvent.type === 'error') {
        window.dispatchEvent(new CustomEvent('chat-toast', { detail: parsedEvent.payload.message }))
      }
    }

    socket.onclose = () => {
      if (socket !== activeSocket) {
        return
      }

      connected.value = false
      status.value = currentRoomId.value ? 'reconnecting' : 'disconnected'

      if (currentRoomId.value) {
        reconnectTimer = window.setTimeout(() => reconnect(), 1500)
      }
    }

    socket.onerror = () => {
      connected.value = false
      status.value = 'reconnecting'
    }
  }

  function disconnect(): void {
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    currentRoomId.value = null
    socket?.close()
    socket = null
    connected.value = false
    status.value = 'disconnected'
  }

  function reconnect(): void {
    const roomId = currentRoomId.value

    if (!roomId) {
      return
    }

    connect(roomId)
  }

  function send(message: WebSocketOutgoingMessage): void {
    if (socket?.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(JSON.stringify(message))
  }

  return {
    connected,
    status,
    currentRoomId,
    connect,
    disconnect,
    reconnect,
    send,
  }
})
