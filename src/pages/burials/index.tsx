import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import {
  parseAsInteger,
  parseAsString,
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
import { formatDateTimePtBr } from "@/utils/date"
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"

import { RegisterBurialModal } from "./components/RegisterBurialModal"
import { useCreateBurial, useDeleteBurial, useBurials, useUpdateBurial } from "./queries"
import { type CreateBurialBody } from "./types"

const DEFAULT_LIMIT = 10

export default function BurialsPage() {
  const createBurialMutation = useCreateBurial()
  const updateBurialMutation = useUpdateBurial()
  const deleteBurialMutation = useDeleteBurial()
  const [localSearch, setLocalSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useQueryState(
    "burialSearch",
    parseAsString.withDefault(""),
  )
  const [limit] = useQueryState(
    "burialLimit",
    parseAsInteger.withDefault(DEFAULT_LIMIT),
  )
  const [offset, setOffset] = useQueryState(
    "burialOffset",
    parseAsInteger.withDefault(0),
  )
  const { data, isFetching, isError } = useBurials({
    q: search.trim(),
    limit,
    offset,
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

  function handleCreateBurial(data: CreateBurialBody) {
    createBurialMutation.mutate(data)
  }

  function handleUpdateBurial(id: string, data: CreateBurialBody) {
    updateBurialMutation.mutate({ id, data })
  }

  function handleDeleteBurial(id: string) {
    setSelectedDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (selectedDeleteId) {
      deleteBurialMutation.mutate(selectedDeleteId, {
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
            Gestão de sepultamentos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Busque registros e cadastre novos sepultamentos.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              type="search"
              placeholder="Buscar por sepultura ou obito"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              className="sm:max-w-md"
            />

            <RegisterBurialModal
              onSubmit={handleCreateBurial}
              isLoading={createBurialMutation.isPending}
            />
          </div>
        </header>

        <section className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data de sepultamento</TableHead>
                <TableHead>Sepultura</TableHead>
                <TableHead>Óbito</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Certidão</TableHead>
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
                    Erro ao carregar sepultamentos.
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {formatDateTimePtBr(item.burialDate)}
                    </TableCell>
                    <TableCell>{item.plot.code}</TableCell>
                    <TableCell>{item.deceased.name}</TableCell>
                    <TableCell>{item.plot.type}</TableCell>
                    <TableCell>{item.deceased.deathCertificate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <RegisterBurialModal
                          mode="edit"
                          initialData={{
                            burialDate: item.burialDate,
                            plotId: item.plotId,
                            deceasedId: item.deceasedId,
                          }}
                          onSubmit={(data) => handleUpdateBurial(item.id, data)}
                          isLoading={updateBurialMutation.isPending}
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
                          onClick={() => handleDeleteBurial(item.id)}
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
                    Nenhum sepultamento encontrado.
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
        title="Deletar sepultamento?"
        description="Esta ação não pode ser desfeita. Todos os dados associados serão perdidos."
        onConfirm={confirmDelete}
        isLoading={deleteBurialMutation.isPending}
      />
    </main>
  )
}
