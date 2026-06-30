<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'green' | 'slate' | 'amber' | 'rose'
  }>(),
  {
    tone: 'slate',
  },
)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="{
      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200': tone === 'green',
      'bg-slate-100 text-slate-700 ring-1 ring-slate-200': tone === 'slate',
      'bg-amber-50 text-amber-700 ring-1 ring-amber-200': tone === 'amber',
      'bg-rose-50 text-rose-700 ring-1 ring-rose-200': tone === 'rose',
    }"
  >
    <slot />
  </span>
</template>
