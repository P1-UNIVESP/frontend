export type PlotOwnerHistoryPlot = {
  id: string
  code: string
  type: string
  status: string
  capacity: number
  ownerId: string | null
}

export type PlotOwnerHistoryOwner = {
  id: string
  name: string
  cpf: string
  phone: string | null
  createdAt: string
  updatedAt: string
}

export type PlotOwnerHistory = {
  id: string
  plotId: string
  ownerId: string
  startedAt: string
  endedAt: string | null
  createdAt: string
  plot: PlotOwnerHistoryPlot
  owner: PlotOwnerHistoryOwner
}

export type PlotOwnerHistoriesListResponse = {
  data: PlotOwnerHistory[]
  total: number
  limit: number
  offset: number
}
