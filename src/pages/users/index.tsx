import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"

import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"
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

import { RegisterUserModal } from "./components/RegisterUserModal"
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "./queries"
import type { CreateUserBody, UpdateUserBody, UserOption, UserRole } from "./types"

const DEFAULT_LIMIT = 10

function getRoleLabel(role: UserOption["role"]) {
  return role === "admin" ? "Administrador" : "Usuário"
}

function getStatusLabel(user: UserOption) {
  return user.banned ? "Bloqueado" : "Ativo"
}

export default function UsersPage() {
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const [localSearch, setLocalSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null)

  const [search, setSearch] = useQueryState(
    "userSearch",
    parseAsString.withDefault(""),
  )
  const [role, setRole] = useQueryState("userRole", parseAsString.withDefault(""))
  const [limit] = useQueryState(
    "userLimit",
    parseAsInteger.withDefault(DEFAULT_LIMIT),
  )
  const [offset, setOffset] = useQueryState(
    "userOffset",
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

  const { data, isFetching, isError } = useUsers({
    q: search.trim(),
    role: role === "admin" || role === "user" ? (role as UserRole) : "",
    limit,
    offset,
  })

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  function handleCreateUser(data: CreateUserBody | UpdateUserBody) {
    createUserMutation.mutate(data as CreateUserBody)
  }

  function handleUpdateUser(id: string, data: CreateUserBody | UpdateUserBody) {
    updateUserMutation.mutate({ id, data: data as UpdateUserBody })
  }

  function handleDeleteUser(id: string) {
    setSelectedDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (!selectedDeleteId) {
      return
    }

    deleteUserMutation.mutate(selectedDeleteId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedDeleteId(null)
      },
    })
  }

  return (
    <main className="min-h-dvh bg-linear-to-b from-muted/30 to-background px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Cadastro de usuários
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie usuários autorizados a acessar o sistema.
          </p>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="search"
                placeholder="Buscar por nome ou e-mail"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                className="sm:w-80"
              />
              <select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value)
                  setOffset(0)
                }}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos os perfis</option>
                <option value="user">Usuários</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            <RegisterUserModal
              onSubmit={handleCreateUser}
              isLoading={createUserMutation.isPending}
            />
          </div>
        </header>

        <section className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
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
                    Erro ao carregar usuários.
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>{getStatusLabel(user)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <RegisterUserModal
                          mode="edit"
                          initialData={{
                            name: user.name,
                            email: user.email,
                            role: user.role === "admin" ? "admin" : "user",
                          }}
                          onSubmit={(data) => handleUpdateUser(user.id, data)}
                          isLoading={updateUserMutation.isPending}
                          trigger={
                            <Button type="button" variant="outline" size="sm">
                              <Pencil className="size-4" />
                              Editar
                            </Button>
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
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
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-4 px-2 text-sm text-muted-foreground">
            <span>
              {total > 0
                ? `Página ${currentPage} de ${totalPages} - ${total} registro${total !== 1 ? "s" : ""}`
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
        title="Remover usuário?"
        description="Esta ação remove o acesso deste usuário ao sistema."
        onConfirm={confirmDelete}
        isLoading={deleteUserMutation.isPending}
      />
    </main>
  )
}
