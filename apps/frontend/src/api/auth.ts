import api from '../services/axios'
import type { AuthResponse, LoginCredentials, RegisterPayload } from '@/types/auth'

export const authApi = {
  login(credentials: LoginCredentials) {
    return api.post<AuthResponse>('/auth/login', credentials)
  },
  register(payload: RegisterPayload) {
    return api.post<AuthResponse>('/auth/register', payload)
  },
  refresh(refreshToken: string) {
    return api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken })
  },
}
