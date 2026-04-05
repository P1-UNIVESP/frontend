import { z } from "zod"

export const createOwnerBodySchema = z.object({
  name: z.string().min(3),
  cpf: z.string().min(11),
  phone: z.string().min(8).optional(),
})

export const updateOwnerBodySchema = createOwnerBodySchema

export type CreateOwnerBody = z.infer<typeof createOwnerBodySchema>
export type UpdateOwnerBody = z.infer<typeof updateOwnerBodySchema>

// Base types
export type Owner = CreateOwnerBody & {
  id: string
  createdAt: string
  updatedAt: string
}

export type Plot = {
  id: string
  code: string
  type: "TERRA" | "GAVETA" | "MAUSOLEU"
  status: "DISPONIVEL" | "OCUPADO" | "MANUTENCAO"
  capacity: number
  ownerId: string | null
}

// For option select/combobox
export type OwnerOption = Owner

// For listings with includes
export type OwnerWithPlots = Owner & {
  plots: Plot[]
}

export type OwnersListResponse = {
  data: OwnerWithPlots[]
  total: number
}
