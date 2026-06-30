<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        class="absolute inset-0 bg-slate-950/35"
        aria-label="Fechar modal"
        @click="emit('close')"
      />
      <section class="relative w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-950">{{ title }}</h2>
          <button
            type="button"
            class="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
            @click="emit('close')"
          >
            ×
          </button>
        </div>
        <slot />
      </section>
    </div>
  </Teleport>
</template>
