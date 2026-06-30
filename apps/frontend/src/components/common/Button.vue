<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    :class="{
      'bg-brand-600 text-white shadow-sm hover:bg-brand-700': variant === 'primary',
      'border bg-white text-slate-700 shadow-sm hover:bg-slate-50': variant === 'secondary',
      'text-slate-600 hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
      'bg-rose-600 text-white shadow-sm hover:bg-rose-700': variant === 'danger',
      'h-9 px-3 text-sm': size === 'sm',
      'h-10 px-4 text-sm': size === 'md',
      'h-12 px-5 text-base': size === 'lg',
    }"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
