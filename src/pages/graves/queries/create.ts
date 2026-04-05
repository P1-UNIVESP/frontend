import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

import type { CreateGraveBody, PlotOption } from "../types"

async function createPlot(data: CreateGraveBody): Promise<PlotOption> {
  const { data: response } = await api.post<PlotOption>("/plots", data)
  return response
}

export function useCreatePlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlot,
    onSuccess: () => {
      toast.success("Sepultura registrada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["plots"] })
    },
    onError: (error) => {
      const message =
        (error as any)?.response?.data?.message ??
        "Erro ao registrar sepultura"
      toast.error(message)
    },
  })
}
