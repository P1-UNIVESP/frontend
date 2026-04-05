import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

import type { PlotOption, UpdateGraveBody } from "../types"

async function updatePlot(id: string, data: UpdateGraveBody): Promise<PlotOption> {
  const { data: response } = await api.put<PlotOption>(`/plots/${id}`, data)
  return response
}

export function useUpdatePlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGraveBody }) =>
      updatePlot(id, data),
    onSuccess: () => {
      toast.success("Sepultura atualizada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["plots"] })
    },
    onError: (error) => {
      const message =
        (error as any)?.response?.data?.message ??
        "Erro ao atualizar sepultura"
      toast.error(message)
    },
  })
}
