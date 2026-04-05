import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"
import api from "@/api"

import type { DeceasedOption, UpdateDeceasedBody } from "../types"

async function updateDeceased(id: string, data: UpdateDeceasedBody): Promise<DeceasedOption> {
  const { data: response } = await api.put<DeceasedOption>(`/deceased/${id}`, data)
  return response
}

export function useUpdateDeceased() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeceasedBody }) =>
      updateDeceased(id, data),
    onSuccess: () => {
     toast.success("Obito atualizado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["deceased"] })
    },
   onError: (error) => {
     const message = (error as any)?.response?.data?.message || "Erro ao atualizar obito"
     toast.error(message)
   },
  })
}
