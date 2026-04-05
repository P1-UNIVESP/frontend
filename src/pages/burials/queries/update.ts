import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

import type { CreateBurialBody } from "../types"

type UpdateBurialParams = {
  id: string
  data: CreateBurialBody
}

async function updateBurial({ id, data }: UpdateBurialParams) {
  const { data: response } = await api.put(`/burials/${id}`, data)
  return response
}

export function useUpdateBurial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBurial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["burials"] })
      toast.success("Sepultamento atualizado com sucesso!")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erro ao atualizar sepultamento"
      toast.error(message)
    },
  })
}
