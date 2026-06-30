import type { Message } from './message'

export type WebSocketEventType =
  | 'connection_established'
  | 'message_queued'
  | 'chat_message'
  | 'message_rejected'
  | 'error'

export interface ConnectionEstablishedEvent {
  type: 'connection_established'
  payload: {
    roomId: string
    connectedAt: string
  }
}

export interface MessageQueuedEvent {
  type: 'message_queued'
  payload: {
    tempId: string
    roomId: string
    status: 'PENDING'
    message: Message
  }
}

export interface ChatMessageEvent {
  type: 'chat_message'
  payload: Message
}

export interface MessageRejectedEvent {
  type: 'message_rejected'
  payload: {
    tempId: string
    id?: string
    reason: string
    message?: Message
  }
}

export interface WebSocketErrorEvent {
  type: 'error'
  payload: {
    message: string
    code?: string
  }
}

export type ChatWebSocketEvent =
  | ConnectionEstablishedEvent
  | MessageQueuedEvent
  | ChatMessageEvent
  | MessageRejectedEvent
  | WebSocketErrorEvent

export interface WebSocketOutgoingMessage {
  type: 'chat_message'
  payload: {
    roomId: string
    content: string
    tempId: string
  }
}
