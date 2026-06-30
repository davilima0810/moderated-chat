<script setup lang="ts">
import Badge from '@/components/common/Badge.vue'
import Button from '@/components/common/Button.vue'
import type { Room } from '@/types/room'

defineProps<{
  room: Room | null
  connected: boolean
  status?: 'connected' | 'reconnecting' | 'disconnected'
}>()

const emit = defineEmits<{
  addParticipant: []
}>()
</script>

<template>
  <header class="flex min-h-16 items-center justify-between gap-3 border-b bg-white px-4 md:px-6">
    <div class="min-w-0">
      <h1 class="truncate text-base font-semibold text-slate-950 md:text-lg">
        {{ room?.name ?? 'Sala não encontrada' }}
      </h1>
      <div class="mt-1 flex items-center gap-2">
        <Badge :tone="connected ? 'green' : status === 'reconnecting' ? 'amber' : 'slate'">
          ● {{ connected ? 'Conectado' : status === 'reconnecting' ? 'Reconectando' : 'Desconectado' }}
        </Badge>
        <span v-if="room" class="text-xs text-slate-500">{{ room.participants.length }} participantes</span>
      </div>
    </div>
    <Button size="sm" variant="secondary" @click="emit('addParticipant')">Adicionar participante</Button>
  </header>
</template>
