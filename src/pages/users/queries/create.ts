import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import api from "@/api"

import type { CreateUserBody, UserOption } from "../types"

type ErrorResponse = {
  message?: string
}

async function createUser(data: CreateUserBody): Promise<UserOption> {
  const { data: response } = await api.post<UserOption>("/admin/users", data)
  return response
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Usuário criado com sucesso.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message ?? "Erro ao criar usuário.")
    },
  })
}
