import { z } from "zod"

export const createBurialBodySchema = z.object({
  burialDate: z.string().datetime(),
  plotId: z.string().uuid(),
  deceasedId: z.string().uuid(),
})

export const updateBurialBodySchema = createBurialBodySchema

export type CreateBurialBody = z.infer<typeof createBurialBodySchema>
export type UpdateBurialBody = z.infer<typeof updateBurialBodySchema>

// Base types
export type Owner = {
  id: string
  name: string
  cpf: string
  phone: string | null
}

export type Plot = {
  id: string
  code: string
  type: "TERRA" | "GAVETA" | "MAUSOLEU"
  status: "DISPONIVEL" | "OCUPADO" | "MANUTENCAO"
  capacity: number
  ownerId: string | null
}

export type Deceased = {
  id: string
  name: string
  birthDate: string
  deathDate: string
  deathCertificate: string
}

export type Burial = CreateBurialBody & {
  id: string
}

// For option select/combobox
export type PlotOption = Plot
export type DeceasedOption = Deceased

// For listings with includes
export type PlotWithOwner = Plot & {
  owner: Owner | null
}

export type BurialWithRelations = Burial & {
  plot: PlotWithOwner
  deceased: Deceased
}

export type BurialListResponse = {
  data: BurialWithRelations[]
  total: number
}

