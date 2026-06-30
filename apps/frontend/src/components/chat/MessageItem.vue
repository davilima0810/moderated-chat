<script setup lang="ts">
import { computed } from 'vue'

import Badge from '@/components/common/Badge.vue'
import type { Message } from '@/types/message'
import { formatDate } from '@/utils/formatDate'

const props = defineProps<{
  message: Message
  own?: boolean
}>()

const initials = computed(() =>
  props.message.author.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
</script>

<template>
  <div class="flex gap-3" :class="{ 'flex-row-reverse': own }">
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
      {{ initials }}
    </div>
    <div class="max-w-[78%]" :class="{ 'text-right': own }">
      <div class="mb-1 flex items-center gap-2" :class="{ 'justify-end': own }">
        <span class="text-sm font-semibold text-slate-800">{{ message.author.name }}</span>
        <span class="text-xs text-slate-400">{{ formatDate(message.createdAt) }}</span>
        <Badge v-if="message.status !== 'APPROVED'" :tone="message.status === 'PENDING' ? 'amber' : 'rose'">
          {{ message.status === 'PENDING' ? 'PENDING' : 'REJECTED' }}
        </Badge>
      </div>
      <p
        class="rounded-lg px-4 py-2 text-sm leading-relaxed shadow-sm"
        :class="own ? 'bg-brand-600 text-white' : 'border bg-white text-slate-700'"
      >
        {{ message.content }}
      </p>
      <p v-if="message.reason" class="mt-1 text-xs text-rose-500">{{ message.reason }}</p>
    </div>
  </div>
</template>
