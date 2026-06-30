import axios from 'axios'

import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await authStore.refresh()
      originalRequest.headers.Authorization = `Bearer ${authStore.token}`
      return api(originalRequest)
    } catch (refreshError) {
      authStore.logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  },
)

export default api
