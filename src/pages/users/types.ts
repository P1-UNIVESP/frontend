import { z } from "zod"

export const userRoleSchema = z.enum(["user", "admin"])

export const createUserBodySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  role: userRoleSchema.default("user"),
})

export const updateUserBodySchema = createUserBodySchema.omit({ password: true })

export type UserRole = z.infer<typeof userRoleSchema>
export type CreateUserBody = z.infer<typeof createUserBodySchema>
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>

export type UserOption = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: UserRole | string | null
  banned: boolean | null
  banReason: string | null
  banExpires: string | null
  createdAt: string
  updatedAt: string
}

export type UsersListResponse = {
  data: UserOption[]
  total: number
  limit: number
  offset: number
}
