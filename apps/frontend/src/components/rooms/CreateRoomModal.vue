<script setup lang="ts">
import { reactive } from 'vue'

import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import Modal from '@/components/common/Modal.vue'
import type { CreateRoomPayload } from '@/types/room'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [payload: CreateRoomPayload]
}>()

const form = reactive({
  name: '',
  description: '',
})

function submit(): void {
  if (!form.name.trim()) {
    return
  }

  emit('create', {
    name: form.name.trim(),
    description: form.description.trim() || 'Sala sem descrição.',
  })

  form.name = ''
  form.description = ''
}
</script>

<template>
  <Modal :open="open" title="Nova sala" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <Input id="room-name" v-model="form.name" label="Nome" placeholder="Ex: Frontend" />
      <Input id="room-description" v-model="form.description" label="Descrição" placeholder="Sobre o que a sala trata" />
      <div class="flex justify-end gap-2 pt-2">
        <Button variant="secondary" @click="emit('close')">Cancelar</Button>
        <Button type="submit">Criar sala</Button>
      </div>
    </form>
  </Modal>
</template>
