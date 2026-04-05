import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

async function deletePlot(id: string) {
  const { data } = await api.delete(`/plots/${id}`)
  return data
}

export function useDeletePlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots"] })
      toast.success("Sepultura deletada com sucesso!")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erro ao deletar sepultura"
      toast.error(message)
    },
  })
}
