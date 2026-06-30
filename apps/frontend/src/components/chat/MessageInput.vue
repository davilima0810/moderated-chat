<script setup lang="ts">
import { ref } from 'vue'

import Button from '@/components/common/Button.vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const content = ref('')

function submit(): void {
  const trimmedContent = content.value.trim()

  if (!trimmedContent) {
    return
  }

  emit('send', trimmedContent)
  content.value = ''
}
</script>

<template>
  <form class="border-t bg-white p-4 md:px-6" @submit.prevent="submit">
    <div class="mx-auto flex max-w-4xl gap-2">
      <input
        v-model="content"
        :disabled="disabled"
        class="h-11 min-w-0 flex-1 rounded-lg border bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
        placeholder="Digite uma mensagem"
      />
      <Button type="submit" :disabled="disabled">Enviar</Button>
    </div>
  </form>
</template>
