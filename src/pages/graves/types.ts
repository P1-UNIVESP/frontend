import { z } from "zod"

export const graveTypeOptions = ["TERRA", "GAVETA", "MAUSOLEU"] as const
export const graveStatusOptions = [
  "DISPONIVEL",
  "OCUPADO",
  "MANUTENCAO",
] as const

export const createGraveBodySchema = z.object({
  code: z.string().min(1),
  type: z.enum(graveTypeOptions),
  status: z.enum(graveStatusOptions).optional(),
  capacity: z.number().int().positive(),
  ownerId: z.string().uuid().optional(),
})

export const updateGraveBodySchema = createGraveBodySchema

export type CreateGraveBody = z.infer<typeof createGraveBodySchema>
export type UpdateGraveBody = z.infer<typeof updateGraveBodySchema>

// Base types
export type Owner = {
  id: string
  name: string
  cpf: string
  phone: string | null
}

export type Plot = CreateGraveBody & {
  id: string
}

// For option select/combobox
export type PlotOption = Plot

// For listings with includes
export type PlotWithOwner = Plot & {
  owner: Owner | null
}

export type PlotListResponse = {
  data: PlotWithOwner[]
  total: number
}
