import { onBeforeUnmount, shallowRef } from 'vue'

import type { ChatWebSocketEvent, WebSocketOutgoingMessage } from '@/types/websocket'

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (event: ChatWebSocketEvent) => void
}

export function useWebSocket(roomId: string, options: UseWebSocketOptions = {}) {
  const socket = shallowRef<WebSocket | null>(null)
  const connected = shallowRef(false)

  function getUrl(): string {
    const baseUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000'
    const token = localStorage.getItem('chat_vue_auth')
    const parsedToken = token ? (JSON.parse(token) as { token?: string }).token : ''
    return `${baseUrl}/ws/chat/${roomId}?token=${parsedToken}`
  }

  function connect(): void {
    if (socket.value?.readyState === WebSocket.OPEN || socket.value?.readyState === WebSocket.CONNECTING) {
      return
    }

    socket.value = new WebSocket(getUrl())

    socket.value.onopen = (event) => {
      connected.value = true
      options.onOpen?.(event)
    }

    socket.value.onclose = (event) => {
      connected.value = false
      options.onClose?.(event)
    }

    socket.value.onerror = (event) => {
      options.onError?.(event)
    }

    socket.value.onmessage = (event) => {
      const parsedEvent = JSON.parse(event.data) as ChatWebSocketEvent
      if (parsedEvent.type === 'connection_established') {
        connected.value = true
      }
      options.onMessage?.(parsedEvent)
    }
  }

  function disconnect(): void {
    socket.value?.close()
    socket.value = null
    connected.value = false
  }

  function send(message: WebSocketOutgoingMessage): void {
    if (socket.value?.readyState !== WebSocket.OPEN) {
      return
    }

    socket.value.send(JSON.stringify(message))
  }

  onBeforeUnmount(disconnect)

  return {
    socket,
    connected,
    connect,
    disconnect,
    send,
  }
}
