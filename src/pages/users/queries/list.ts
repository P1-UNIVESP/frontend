import { useQuery } from "@tanstack/react-query"

import api from "@/api"

import type { UserRole, UsersListResponse } from "../types"

type FetchUsersParams = {
  q: string
  role: UserRole | ""
  limit: number
  offset: number
}

async function fetchUsers(params: FetchUsersParams): Promise<UsersListResponse> {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  )

  const { data } = await api.get<UsersListResponse>("/admin/users", {
    params: filteredParams,
  })

  return data
}

export function useUsers(params: FetchUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    placeholderData: (prev) => prev,
  })
}
