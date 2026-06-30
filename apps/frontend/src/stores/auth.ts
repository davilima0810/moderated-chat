import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authApi } from '@/api/auth'
import type { LoginCredentials, RegisterPayload, User } from '@/types/auth'

const AUTH_STORAGE_KEY = 'chat_vue_auth'

interface PersistedAuth {
  token: string
  refreshToken: string
  user: User
}

function readPersistedAuth(): PersistedAuth | null {
  const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawAuth) {
    return null
  }

  try {
    return JSON.parse(rawAuth) as PersistedAuth
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const persistedAuth = readPersistedAuth()
  const token = ref<string | null>(persistedAuth?.token ?? null)
  const refreshToken = ref<string | null>(persistedAuth?.refreshToken ?? null)
  const user = ref<User | null>(persistedAuth?.user ?? null)
  const loading = ref(false)
  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  function persistAuth(authToken: string, authRefreshToken: string, authUser: User): void {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: authToken, refreshToken: authRefreshToken, user: authUser }),
    )
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true
    try {
      const { data } = await authApi.login(credentials)
      token.value = data.access_token
      refreshToken.value = data.refresh_token
      user.value = data.user
      persistAuth(data.access_token, data.refresh_token, data.user)
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<void> {
    loading.value = true
    try {
      const { data } = await authApi.register(payload)
      token.value = data.access_token
      refreshToken.value = data.refresh_token
      user.value = data.user
      persistAuth(data.access_token, data.refresh_token, data.user)
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    if (!refreshToken.value) {
      throw new Error('Missing refresh token')
    }

    const { data } = await authApi.refresh(refreshToken.value)
    token.value = data.access_token
    refreshToken.value = data.refresh_token
    user.value = data.user
    persistAuth(data.access_token, data.refresh_token, data.user)
  }

  function logout(): void {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return {
    token,
    refreshToken,
    user,
    loading,
    isAuthenticated,
    login,
    register,
    refresh,
    logout,
  }
})
