import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"

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

import { RegisterDeceasedModal } from "./components/RegisterDeceasedModal"
import { useCreateDeceased, useDeleteDeceased, useDeceased, useUpdateDeceased } from "./queries"
import { type CreateDeceasedBody } from "./types"

const DEFAULT_LIMIT = 10

export default function DeceasedPage() {
  const createDeceasedMutation = useCreateDeceased()
  const updateDeceasedMutation = useUpdateDeceased()
  const deleteDeceasedMutation = useDeleteDeceased()
  const [localSearch, setLocalSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null)

  const [search, setSearch] = useQueryState(
    "deceasedSearch",
    parseAsString.withDefault(""),
  )
  const [limit] = useQueryState(
    "deceasedLimit",
    parseAsInteger.withDefault(DEFAULT_LIMIT),
  )
  const [offset, setOffset] = useQueryState(
    "deceasedOffset",
    parseAsInteger.withDefault(0),
  )

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch)
      setOffset(0)
    }, 400)

    return () => clearTimeout(timer)
  }, [localSearch, setSearch, setOffset])

  const { data, isFetching, isError } = useDeceased({
    q: search.trim(),
    limit,
    offset,
  })

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  function handleSearchChange(value: string) {
    setLocalSearch(value)
  }

  function handleCreateDeceased(data: CreateDeceasedBody) {
    createDeceasedMutation.mutate(data)
  }

  function handleUpdateDeceased(id: string, data: CreateDeceasedBody) {
    updateDeceasedMutation.mutate({ id, data })
  }

  function handleDeleteDeceased(id: string) {
    setSelectedDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (selectedDeleteId) {
      deleteDeceasedMutation.mutate(selectedDeleteId, {
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
            Gestão de obitos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Busque registros e cadastre novos óbitos.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              type="search"
              placeholder="Buscar por nome ou certidao"
              value={localSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="sm:max-w-md"
            />

            <RegisterDeceasedModal 
              onSubmit={handleCreateDeceased}
              isLoading={createDeceasedMutation.isPending}
            />
          </div>
        </header>

        <section className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nascimento</TableHead>
                <TableHead>Óbito</TableHead>
                <TableHead>Certidão de óbito</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-destructive"
                  >
                    Erro ao carregar obitos.
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{formatDateTimePtBr(item.birthDate)}</TableCell>
                    <TableCell>{formatDateTimePtBr(item.deathDate)}</TableCell>
                    <TableCell>{item.deathCertificate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <RegisterDeceasedModal
                          mode="edit"
                          initialData={{
                            name: item.name,
                            birthDate: item.birthDate,
                            deathDate: item.deathDate,
                            deathCertificate: item.deathCertificate,
                          }}
                          onSubmit={(data) => handleUpdateDeceased(item.id, data)}
                          isLoading={updateDeceasedMutation.isPending}
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
                          onClick={() => handleDeleteDeceased(item.id)}
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
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum obito encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-4 px-2 text-sm text-muted-foreground">
            <span>
              {total > 0
                ? `Pagina ${currentPage} de ${totalPages} — ${total} registro${total !== 1 ? "s" : ""}`
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
        title="Deletar óbito?"
        description="Esta ação não pode ser desfeita. Todos os dados associados serão perdidos."
        onConfirm={confirmDelete}
        isLoading={deleteDeceasedMutation.isPending}
      />
    </main>
  )
}
