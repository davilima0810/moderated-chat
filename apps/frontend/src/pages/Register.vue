<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { registerSchema } from '@/validation/schemas'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})

async function submit(): Promise<void> {
  error.value = ''
  const parsed = registerSchema.safeParse(form)

  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Dados inválidos'
    return
  }

  loading.value = true
  try {
    await authStore.register(parsed.data)
    router.push({ name: 'rooms' })
  } catch {
    error.value = 'Não foi possível cadastrar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <form class="space-y-4" @submit.prevent="submit">
      <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</p>
      <Input id="name" v-model="form.name" label="Nome" placeholder="Seu nome" />
      <Input id="email" v-model="form.email" label="Email" type="email" placeholder="voce@empresa.com" />
      <Input id="password" v-model="form.password" label="Senha" type="password" placeholder="Sua senha" />
      <Input
        id="password-confirmation"
        v-model="form.passwordConfirmation"
        label="Confirmar senha"
        type="password"
        placeholder="Repita sua senha"
      />
      <Button type="submit" size="lg" class="w-full" :loading="loading">Cadastrar</Button>
    </form>
    <p class="mt-6 text-center text-sm text-slate-500">
      Já tem conta?
      <RouterLink class="font-semibold text-brand-700 hover:text-brand-600" to="/login">Entrar</RouterLink>
    </p>
  </AuthLayout>
</template>
