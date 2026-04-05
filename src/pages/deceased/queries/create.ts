import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"
import api from "@/api"

import type { CreateDeceasedBody, DeceasedOption } from "../types"

async function createDeceased(data: CreateDeceasedBody): Promise<DeceasedOption> {
  const { data: response } = await api.post<DeceasedOption>("/deceased", data)
  return response
}

export function useCreateDeceased() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDeceased,
    onSuccess: () => {
     toast.success("Obito registrado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["deceased"] })
    },
   onError: (error) => {
     const message = (error as any)?.response?.data?.message || "Erro ao registrar obito"
     toast.error(message)
   },
  })
}
