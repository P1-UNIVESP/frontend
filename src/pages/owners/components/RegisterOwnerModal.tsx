import { useState, type ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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
  formatBrazilianPhone,
  formatCpf,
  onlyDigits,
} from "@/utils/masks"

import { createOwnerBodySchema, type CreateOwnerBody } from "../types"

type RegisterOwnerModalProps = {
  onSubmit: (data: CreateOwnerBody) => void
  mode?: "create" | "edit"
  initialData?: CreateOwnerBody
  trigger?: ReactNode
  isLoading?: boolean
}

function getDefaultValues(initialData?: CreateOwnerBody): CreateOwnerBody {
  if (!initialData) {
    return {
      name: "",
      cpf: "",
      phone: undefined,
    }
  }

  return initialData
}

export function RegisterOwnerModal({
  onSubmit,
  mode = "create",
  initialData,
  trigger,
  isLoading = false,
}: RegisterOwnerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<CreateOwnerBody>({
    resolver: zodResolver(createOwnerBodySchema),
    defaultValues: getDefaultValues(initialData),
  })

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (nextOpen) {
      form.reset(getDefaultValues(initialData))
      return
    }

    form.reset(getDefaultValues(initialData))
  }

  function handleSubmit(data: CreateOwnerBody) {
    onSubmit(data)
    handleOpenChange(false)
  }

  const isEdit = mode === "edit"
  const title = isEdit ? "Editar proprietário" : "Novo proprietário"
  const description = isEdit
    ? "Atualize os dados do proprietário."
    : "Preencha os dados do proprietário."
  const submitLabel = isEdit ? "Salvar alterações" : "Salvar proprietário"

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">Registrar proprietário</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Ex.: Carlos Souza"
              {...form.register("name")}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                {...form.register("cpf", {
                  onChange: (event) => {
                    event.target.value = formatCpf(event.target.value)
                  },
                  setValueAs: (value: string) => onlyDigits(value),
                })}
              />
              {form.formState.errors.cpf?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.cpf.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-8888"
                inputMode="numeric"
                maxLength={15}
                {...form.register("phone", {
                  onChange: (event) => {
                    event.target.value = formatBrazilianPhone(event.target.value)
                  },
                  setValueAs: (value: string) =>
                    onlyDigits(value) || undefined,
                })}
              />
              {form.formState.errors.phone?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
            </div>
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
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
