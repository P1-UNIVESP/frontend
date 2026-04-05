import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

async function deleteDeceased(id: string) {
  const { data } = await api.delete(`/deceased/${id}`)
  return data
}

export function useDeleteDeceased() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDeceased,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deceased"] })
      toast.success("Óbito deletado com sucesso!")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erro ao deletar óbito"
      toast.error(message)
    },
  })
}
