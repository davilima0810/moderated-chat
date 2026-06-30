export interface User {
  id: string
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token: string
  user: User
}
