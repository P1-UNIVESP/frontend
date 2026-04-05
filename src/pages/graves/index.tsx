import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"

import { RegisterGraveModal } from "./components/RegisterGraveModal"
import { useCreatePlot, useDeletePlot, usePlots, useUpdatePlot } from "./queries"
import { graveStatusOptions, graveTypeOptions, type CreateGraveBody } from "./types"

const DEFAULT_LIMIT = 10

type StatusFilter = "TODOS" | (typeof graveStatusOptions)[number]
const statusFilterOptions = ["TODOS", ...graveStatusOptions] as const

export default function GravesPage() {
  const createPlotMutation = useCreatePlot()
  const updatePlotMutation = useUpdatePlot()
  const deletePlotMutation = useDeletePlot()
  const [localSearch, setLocalSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useQueryState(
    "graveSearch",
    parseAsString.withDefault(""),
  )
  const [limit] = useQueryState(
    "graveLimit",
    parseAsInteger.withDefault(DEFAULT_LIMIT),
  )
  const [offset, setOffset] = useQueryState(
    "graveOffset",
    parseAsInteger.withDefault(0),
  )
  const [statusFilter, setStatusFilter] = useQueryState(
    "graveStatus",
    parseAsStringLiteral(statusFilterOptions).withDefault("TODOS"),
  )
  const [typeFilter, setTypeFilter] = useQueryState(
    "graveType",
    parseAsString.withDefault(""),
  )
  const { data, isFetching, isError } = usePlots({
    q: search.trim(),
    limit,
    offset,
    status: statusFilter === "TODOS" ? undefined : statusFilter,
    type: typeFilter || undefined,
  })

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch)
      setOffset(0)
    }, 400)

    return () => clearTimeout(timer)
  }, [localSearch, setOffset, setSearch])

  const rows = data?.data ?? []

  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  function handleCreateGrave(data: CreateGraveBody) {
    createPlotMutation.mutate(data)
  }

  function handleUpdateGrave(id: string, data: CreateGraveBody) {
    updatePlotMutation.mutate({ id, data })
  }

  function handleDeleteGrave(id: string) {
    setSelectedDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (selectedDeleteId) {
      deletePlotMutation.mutate(selectedDeleteId, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setSelectedDeleteId(null)
        },
      })
    }
  }

  return (
    <main className="min-h-dvh bg-linear-to-b from-muted/30 to-background px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Gestão de sepulturas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Busque registros e cadastre novas sepulturas.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="search"
                placeholder="Buscar por código ou nome do proprietário"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                className="sm:w-80"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="TODOS">Todos os status</option>
                {graveStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Todos os tipos</option>
                {graveTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <RegisterGraveModal
              onSubmit={handleCreateGrave}
              isLoading={createPlotMutation.isPending}
            />
          </div>
        </header>

        <section className="rr border bg-card p-2 shadow-sm sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-destructive"
                  >
                    Erro ao carregar sepulturas.
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.status ?? "-"}</TableCell>
                    <TableCell>{item.capacity}</TableCell>
                    <TableCell>{item.owner?.name ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <RegisterGraveModal
                          mode="edit"
                          initialData={{
                            code: item.code,
                            type: item.type,
                            status: item.status,
                            capacity: item.capacity,
                            ownerId: item.ownerId,
                          }}
                          onSubmit={(data) => handleUpdateGrave(item.id, data)}
                          isLoading={updatePlotMutation.isPending}
                          trigger={
                            <Button type="button" variant="outline" size="sm">
                              Editar
                            </Button>
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGrave(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhuma sepultura encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-4 px-2 text-sm text-muted-foreground">
            <span>
              {total > 0
                ? `Pagina ${currentPage} de ${totalPages} - ${total} registro${total !== 1 ? "s" : ""}`
                : "Nenhum registro"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={offset === 0 || isFetching}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={offset + limit >= total || isFetching}
                onClick={() => setOffset(offset + limit)}
              >
                Proximo
              </Button>
            </div>
          </div>
        </section>
      </section>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deletar sepultura?"
        description="Esta ação não pode ser desfeita. Todos os dados associados serão perdidos."
        onConfirm={confirmDelete}
        isLoading={deletePlotMutation.isPending}
      />
    </main>
  )
}
