<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { loginSchema } from '@/validation/schemas'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const form = reactive({
  email: '',
  password: '',
})

async function submit(): Promise<void> {
  error.value = ''
  const parsed = loginSchema.safeParse(form)

  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Dados inválidos'
    return
  }

  loading.value = true
  try {
    await authStore.login(parsed.data)
    router.push({ name: 'rooms' })
  } catch {
    error.value = 'Email ou senha inválidos'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <form class="space-y-4" @submit.prevent="submit">
      <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</p>
      <Input id="email" v-model="form.email" label="Email" type="email" placeholder="voce@empresa.com" />
      <Input id="password" v-model="form.password" label="Senha" type="password" placeholder="Sua senha" />
      <Button type="submit" size="lg" class="w-full" :loading="loading">Entrar</Button>
    </form>
    <p class="mt-6 text-center text-sm text-slate-500">
      Ainda não tem conta?
      <RouterLink class="font-semibold text-brand-700 hover:text-brand-600" to="/register">Cadastro</RouterLink>
    </p>
  </AuthLayout>
</template>
