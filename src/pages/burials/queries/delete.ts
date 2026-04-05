import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import api from "@/api"

async function deleteBurial(id: string) {
  const { data } = await api.delete(`/burials/${id}`)
  return data
}

export function useDeleteBurial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBurial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["burials"] })
      toast.success("Sepultamento deletado com sucesso!")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erro ao deletar sepultamento"
      toast.error(message)
    },
  })
}
