<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    label: 'Carregando',
    size: 'md',
  },
)
</script>

<template>
  <div class="inline-flex items-center gap-2 text-slate-500">
    <span
      class="animate-spin rounded-full border-2 border-current border-t-transparent"
      :class="{ 'h-4 w-4': size === 'sm', 'h-6 w-6': size === 'md', 'h-8 w-8': size === 'lg' }"
      aria-hidden="true"
    />
    <span class="text-sm">{{ label }}</span>
  </div>
</template>
