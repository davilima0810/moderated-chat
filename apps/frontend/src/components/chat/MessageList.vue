<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import MessageItem from '@/components/chat/MessageItem.vue'
import type { Message } from '@/types/message'

const props = defineProps<{
  messages: Message[]
  currentUserId?: string
  loading?: boolean
}>()

const listRef = ref<HTMLElement | null>(null)

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    listRef.value?.scrollTo({ top: listRef.value.scrollHeight, behavior: 'smooth' })
  },
  { immediate: true },
)
</script>

<template>
  <section ref="listRef" class="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 md:px-6">
    <div v-if="loading" class="flex h-full items-center justify-center text-sm text-slate-500">
      Carregando mensagens...
    </div>
    <div v-else-if="messages.length === 0" class="flex h-full items-center justify-center text-sm text-slate-500">
      Nenhuma mensagem ainda.
    </div>
    <div v-else class="mx-auto flex max-w-4xl flex-col gap-5">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :own="message.author.id === currentUserId"
      />
    </div>
  </section>
</template>
