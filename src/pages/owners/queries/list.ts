import { useQuery } from "@tanstack/react-query"

import api from "@/api"

import type { OwnersListResponse } from "../types"

type FetchOwnersParams = {
  q: string
  limit: number
  offset: number
}

async function fetchOwners(
  params: FetchOwnersParams,
): Promise<OwnersListResponse> {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  )
  const { data } = await api.get<OwnersListResponse>("/owners", { params: filteredParams })
  return data
}

export function useOwners(params: FetchOwnersParams) {
  return useQuery({
    queryKey: ["owners", params],
    queryFn: () => fetchOwners(params),
    placeholderData: (prev) => prev,
  })
}
