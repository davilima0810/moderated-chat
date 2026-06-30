<script setup lang="ts">
import Badge from '@/components/common/Badge.vue'
import type { Room } from '@/types/room'
import { formatDate } from '@/utils/formatDate'

defineProps<{
  room: Room
  active?: boolean
}>()
</script>

<template>
  <article
    class="rounded-lg border bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-soft"
    :class="{ 'border-brand-500 ring-2 ring-brand-100': active }"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="truncate font-semibold text-slate-950">{{ room.name }}</h3>
        <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ room.description }}</p>
      </div>
      <Badge v-if="room.unreadCount > 0" tone="green">{{ room.unreadCount }}</Badge>
    </div>
    <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
      <span>{{ room.participants.length }} participantes</span>
      <span>{{ formatDate(room.lastMessageAt) }}</span>
    </div>
  </article>
</template>
