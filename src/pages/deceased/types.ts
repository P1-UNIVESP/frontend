import { z } from "zod"

export const createDeceasedBodySchema = z.object({
  name: z.string().min(3),
  birthDate: z.string().datetime(),
  deathDate: z.string().datetime(),
  deathCertificate: z.string().min(3),
})

export const updateDeceasedBodySchema = createDeceasedBodySchema

export type CreateDeceasedBody = z.infer<typeof createDeceasedBodySchema>
export type UpdateDeceasedBody = z.infer<typeof updateDeceasedBodySchema>

// Base types
export type Plot = {
  id: string
  code: string
  type: "TERRA" | "GAVETA" | "MAUSOLEU"
  status: "DISPONIVEL" | "OCUPADO" | "MANUTENCAO"
  capacity: number
  ownerId: string | null
}

export type Deceased = CreateDeceasedBody & {
  id: string
}

export type Burial = {
  id: string
  burialDate: string
  plotId: string
  deceasedId: string
}

// For option select/combobox
export type DeceasedOption = Deceased

// For listings with includes
export type DeceasedWithBurial = Deceased & {
  burial: (Burial & { plot: Plot }) | null
}

export type DeceasedListResponse = {
  data: DeceasedWithBurial[]
  total: number
}
