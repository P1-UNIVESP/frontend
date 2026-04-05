import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"
import api from "@/api"

import type { OwnerOption, UpdateOwnerBody } from "../types"

async function updateOwner(id: string, data: UpdateOwnerBody): Promise<OwnerOption> {
  const { data: response } = await api.put<OwnerOption>(`/owners/${id}`, data)
  return response
}

export function useUpdateOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOwnerBody }) =>
      updateOwner(id, data),
    onSuccess: () => {
     toast.success("Proprietario atualizado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["owners"] })
    },
   onError: (error) => {
     const message = (error as any)?.response?.data?.message || "Erro ao atualizar proprietario"
     toast.error(message)
   },
  })
}
