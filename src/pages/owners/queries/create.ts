import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"
import api from "@/api"

import type { CreateOwnerBody, OwnerOption } from "../types"

async function createOwner(data: CreateOwnerBody): Promise<OwnerOption> {
  const { data: response } = await api.post<OwnerOption>("/owners", data)
  return response
}

export function useCreateOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
     toast.success("Proprietário criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["owners"] })
    },
   onError: (error) => {
     const message = (error as any)?.response?.data?.message || "Erro ao criar proprietário"
     toast.error(message)
   },
  })
}
