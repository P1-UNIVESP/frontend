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
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"

import { RegisterOwnerModal } from "./components/RegisterOwnerModal"
import { useCreateOwner, useDeleteOwner, useOwners, useUpdateOwner } from "./queries"
import { type CreateOwnerBody } from "./types"

const DEFAULT_LIMIT = 10

function formatCpfDisplay(cpf: string) {
  if (cpf.length !== 11) return cpf
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

function formatPhoneDisplay(phone: string) {
  const d = phone.replace(/\D/g, "")
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  }
  return phone
}

export default function OwnersPage() {
  const createOwnerMutation = useCreateOwner()
  const updateOwnerMutation = useUpdateOwner()
  const deleteOwnerMutation = useDeleteOwner()
  const [localSearch, setLocalSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null)

  const [search, setSearch] = useQueryState(
    "ownerSearch",
    parseAsString.withDefault(""),
  )
  const [limit] = useQueryState(
    "ownerLimit",
    parseAsInteger.withDefault(DEFAULT_LIMIT),
  )
  const [offset, setOffset] = useQueryState(
    "ownerOffset",
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

  const { data, isFetching, isError } = useOwners({
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

  function handleCreateOwner(data: CreateOwnerBody) {
    createOwnerMutation.mutate(data)
  }

  function handleUpdateOwner(id: string, data: CreateOwnerBody) {
    updateOwnerMutation.mutate({ id, data })
  }

  function handleDeleteOwner(id: string) {
    setSelectedDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (selectedDeleteId) {
      deleteOwnerMutation.mutate(selectedDeleteId, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setSelectedDeleteId(null)
        },
      })
    }
  }

  return (
    <main className="min-h-dvh bg-linear-to-b from-muted/30 to-background px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Gestão de proprietários
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Busque registros e cadastre novos proprietários.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              type="search"
              placeholder="Buscar por nome, CPF ou telefone"
              value={localSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="sm:w-80"
            />
            <RegisterOwnerModal 
              onSubmit={handleCreateOwner} 
              isLoading={createOwnerMutation.isPending}
            />
          </div>
        </header>

        <section className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-destructive"
                  >
                    Erro ao carregar proprietários.
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{formatCpfDisplay(item.cpf)}</TableCell>
                    <TableCell>
                      {item.phone ? formatPhoneDisplay(item.phone) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <RegisterOwnerModal
                          mode="edit"
                          initialData={{
                            name: item.name,
                            cpf: item.cpf,
                            phone: item.phone,
                          }}
                          onSubmit={(data) => handleUpdateOwner(item.id, data)}
                          isLoading={updateOwnerMutation.isPending}
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
                          onClick={() => handleDeleteOwner(item.id)}
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
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum proprietário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-4 px-2 text-sm text-muted-foreground">
            <span>
              {total > 0
                ? `Página ${currentPage} de ${totalPages} — ${total} registro${total !== 1 ? "s" : ""}`
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
                Próximo
              </Button>
            </div>
          </div>
        </section>
      </section>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deletar proprietário?"
        description="Esta ação não pode ser desfeita. Todos os dados associados serão perdidos."
        onConfirm={confirmDelete}
        isLoading={deleteOwnerMutation.isPending}
      />
    </main>
  )
}
