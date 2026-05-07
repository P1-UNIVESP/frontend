import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import api from "@/api"

import type { UpdateUserBody, UserOption } from "../types"

type ErrorResponse = {
  message?: string
}

async function updateUser(id: string, data: UpdateUserBody): Promise<UserOption> {
  const { data: response } = await api.put<UserOption>(`/admin/users/${id}`, data)
  return response
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserBody }) =>
      updateUser(id, data),
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message ?? "Erro ao atualizar usuário.")
    },
  })
}
