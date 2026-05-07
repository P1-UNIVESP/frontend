import { useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  type CreateUserBody,
  type UpdateUserBody,
  userRoleSchema,
} from "../types"

type RegisterUserModalProps = {
  mode?: "create" | "edit"
  initialData?: UpdateUserBody
  trigger?: ReactNode
  isLoading?: boolean
  onSubmit: (data: CreateUserBody | UpdateUserBody) => void
}

type UserFormValues = {
  name: string
  email: string
  password: string | undefined
  role: "user" | "admin"
}

function getDefaultValues(mode: "create" | "edit", initialData?: UpdateUserBody) {
  if (mode === "edit") {
    return {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      password: undefined,
      role: initialData?.role ?? "user",
    }
  }

  return {
    name: "",
    email: "",
    password: "",
    role: "user" as const,
  }
}

export function RegisterUserModal({
  mode = "create",
  initialData,
  trigger,
  isLoading = false,
  onSubmit,
}: RegisterUserModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEdit = mode === "edit"
  const schema = z.object({
    name: z.string().trim().min(1, "Informe o nome."),
    email: z.string().trim().email("Informe um e-mail válido."),
    password: isEdit
      ? z.string().optional()
      : z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    role: userRoleSchema,
  })

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(mode, initialData),
  })

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    form.reset(getDefaultValues(mode, initialData))
  }

  function handleSubmit(data: UserFormValues) {
    if (isEdit) {
      onSubmit({
        name: data.name,
        email: data.email,
        role: data.role,
      })
    } else {
      onSubmit({
        name: data.name,
        email: data.email,
        password: data.password ?? "",
        role: data.role,
      })
    }

    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">Cadastrar usuário</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados de acesso deste usuário."
              : "Crie um usuário para acessar o sistema."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="user-name">Nome completo</Label>
            <Input id="user-name" {...form.register("name")} />
            {form.formState.errors.name?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input id="user-email" type="email" {...form.register("email")} />
            {form.formState.errors.email?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          {!isEdit ? (
            <div className="grid gap-2">
              <Label htmlFor="user-password">Senha</Label>
              <Input
                id="user-password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="user-role">Perfil</Label>
            <select
              id="user-role"
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...form.register("role")}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
            {form.formState.errors.role?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.role.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
              {isEdit ? "Salvar alterações" : "Salvar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
