import { useQuery } from "@tanstack/react-query"

import api from "@/api"

import type { PlotOwnerHistoriesListResponse } from "../types"

type FetchPlotOwnerHistoriesParams = {
  q: string
  active?: "true" | "false"
  limit: number
  offset: number
}

async function fetchPlotOwnerHistories(
  params: FetchPlotOwnerHistoriesParams,
): Promise<PlotOwnerHistoriesListResponse> {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  )

  const { data } = await api.get<PlotOwnerHistoriesListResponse>(
    "/plot-owner-histories",
    {
      params: filteredParams,
    },
  )

  return data
}

export function usePlotOwnerHistories(params: FetchPlotOwnerHistoriesParams) {
  return useQuery({
    queryKey: ["plot-owner-histories", params],
    queryFn: () => fetchPlotOwnerHistories(params),
    placeholderData: (prev) => prev,
  })
}
