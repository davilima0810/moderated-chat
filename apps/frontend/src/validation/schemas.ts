import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    passwordConfirmation: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'As senhas não conferem',
  })

export const roomSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
})

export const participantSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const messageSchema = z.object({
  content: z.string().trim().min(1, 'Mensagem obrigatória'),
})
