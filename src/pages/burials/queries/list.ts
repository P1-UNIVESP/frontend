import { useQuery } from "@tanstack/react-query"

import api from "@/api"

import type { BurialListResponse } from "../types"

type FetchBurialsParams = {
  q: string
  limit: number
  offset: number
}

async function fetchBurials(
  params: FetchBurialsParams,
): Promise<BurialListResponse> {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  )

  const { data } = await api.get<BurialListResponse>("/burials", {
    params: filteredParams,
  })

  return data
}

export function useBurials(params: FetchBurialsParams) {
  return useQuery({
    queryKey: ["burials", params],
    queryFn: () => fetchBurials(params),
    placeholderData: (prev) => prev,
  })
}
