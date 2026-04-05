import { useQuery } from "@tanstack/react-query"

import api from "@/api"

import type { DeceasedListResponse } from "../types"

type FetchDeceasedParams = {
  q: string
  limit: number
  offset: number
}

async function fetchDeceased(
  params: FetchDeceasedParams,
): Promise<DeceasedListResponse> {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  )
  const { data } = await api.get<DeceasedListResponse>("/deceased", { params: filteredParams })
  return data
}

export function useDeceased(params: FetchDeceasedParams) {
  return useQuery({
    queryKey: ["deceased", params],
    queryFn: () => fetchDeceased(params),
    placeholderData: (prev) => prev,
  })
}
