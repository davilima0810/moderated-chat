export enum WsEventType {
  CONNECTION_ESTABLISHED = 'connection_established',

  MESSAGE_QUEUED = 'message_queued',

  CHAT_MESSAGE = 'chat_message',

  MESSAGE_REJECTED = 'message_rejected',

  ERROR = 'error',
}