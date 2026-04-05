import { useQuery } from "@tanstack/react-query"

import api from "@/api"

import type { PlotListResponse } from "../types"

type FetchPlotsParams = {
  q: string
  limit: number
  offset: number
  status?: string
  type?: string
}

async function fetchPlots(
  params: FetchPlotsParams,
): Promise<PlotListResponse> {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  )

  const { data } = await api.get<PlotListResponse>("/plots", {
    params: filteredParams,
  })

  return data
}

export function usePlots(params: FetchPlotsParams) {
  return useQuery({
    queryKey: ["plots", params],
    queryFn: () => fetchPlots(params),
    placeholderData: (prev) => prev,
  })
}
