import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

import type { CreateBurialBody } from "../types"

async function createBurial(data: CreateBurialBody) {
  const { data: response } = await api.post("/burials", data)
  return response
}

export function useCreateBurial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBurial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["burials"] })
      toast.success("Sepultamento criado com sucesso!")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erro ao criar sepultamento"
      toast.error(message)
    },
  })
}
