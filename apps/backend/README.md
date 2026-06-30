# Chat VueJs Local Backend

Backend local em NestJS para desenvolver o frontend do projeto **Chat VueJs** sem depender da API remota.

Este projeto e apenas um mock de desenvolvimento. Ele nao substitui o backend oficial do desafio.

## Tecnologias

- NestJS
- TypeScript
- WebSocket Gateway
- JWT
- Class Validator
- UUID
- CORS liberado para `http://localhost:5173`
- Persistencia em memoria

## Como rodar

```bash
npm install
npm run start:dev
```

A API sobe em:

```text
http://localhost:3000
```

## Autenticacao

### POST /auth/register

```json
{
  "name": "Ana Lima",
  "email": "ana@example.com",
  "password": "123456",
  "passwordConfirmation": "123456"
}
```

### POST /auth/login

```json
{
  "email": "ana@example.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "token": "jwt",
  "user": {
    "id": "uuid",
    "name": "Ana Lima",
    "email": "ana@example.com"
  }
}
```

`token` e um alias de `access_token` para facilitar integracao com frontends que esperam esse campo.

### POST /auth/refresh

```json
{
  "refresh_token": "jwt"
}
```

## Salas

Rotas protegidas por Bearer Token:

- `GET /rooms`
- `POST /rooms`
- `GET /rooms/:id`
- `POST /rooms/:id/participants`
- `GET /rooms/:roomId/messages`
- `POST /rooms/:roomId/messages`

## WebSocket

Endpoint do desafio:

```text
ws://localhost:3000/ws/chat/:roomId?token=JWT
```

Ao conectar com token valido, o servidor envia:

```json
{
  "type": "connection_established",
  "payload": {
    "roomId": "general",
    "connectedAt": "2026-06-28T12:00:00.000Z"
  }
}
```

Mensagem aceita:

```json
{
  "type": "chat_message",
  "message": "texto"
}
```

Tambem e aceito o formato com `payload`:

```json
{
  "type": "chat_message",
  "payload": {
    "roomId": "general",
    "content": "texto",
    "tempId": "temp-1"
  }
}
```

Fluxo simulado:

- `message_queued` imediatamente para o autor, com status `PENDING`.
- Apos cerca de 1 segundo, 80% das mensagens sao aprovadas e enviadas como `chat_message` para todos os participantes conectados na sala.
- 20% sao rejeitadas e retornam como `message_rejected` apenas para o autor.

Eventos implementados:

- `connection_established`
- `message_queued`
- `chat_message`
- `message_rejected`
- `error`
