<script setup lang="ts">
import { ref } from 'vue'

import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import Modal from '@/components/common/Modal.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  add: [email: string]
}>()

const email = ref('')

function submit(): void {
  if (!email.value.trim()) {
    return
  }

  emit('add', email.value.trim())
  email.value = ''
}
</script>

<template>
  <Modal :open="open" title="Adicionar participante" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <Input id="participant-email" v-model="email" label="Email" type="email" placeholder="pessoa@empresa.com" />
      <div class="flex justify-end gap-2 pt-2">
        <Button variant="secondary" @click="emit('close')">Cancelar</Button>
        <Button type="submit">Adicionar</Button>
      </div>
    </form>
  </Modal>
</template>
