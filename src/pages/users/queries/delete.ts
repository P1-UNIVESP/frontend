import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import api from "@/api"

type ErrorResponse = {
  message?: string
}

async function deleteUser(id: string) {
  const { data } = await api.delete(`/admin/users/${id}`)
  return data
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Usuário removido com sucesso.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message ?? "Erro ao remover usuário.")
    },
  })
}
