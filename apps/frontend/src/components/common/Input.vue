<script setup lang="ts">
defineProps<{
  id: string
  label: string
  modelValue: string
  type?: string
  placeholder?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label :for="id" class="block">
    <span class="mb-1.5 block text-sm font-medium text-slate-700">{{ label }}</span>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      class="h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      :class="{ 'border-rose-300 focus:border-rose-500 focus:ring-rose-100': error }"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-1.5 block text-xs font-medium text-rose-600">{{ error }}</span>
  </label>
</template>
