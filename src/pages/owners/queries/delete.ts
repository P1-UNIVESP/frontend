import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

async function deleteOwner(id: string) {
  const { data } = await api.delete(`/owners/${id}`)
  return data
}

export function useDeleteOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] })
      toast.success("Proprietário deletado com sucesso!")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erro ao deletar proprietário"
      toast.error(message)
    },
  })
}
