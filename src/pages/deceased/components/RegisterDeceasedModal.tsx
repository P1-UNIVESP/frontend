import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, type ReactNode } from "react"

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
  createDeceasedBodySchema,
  type CreateDeceasedBody,
} from "../types"
import {
  dateTimeLocalToIso,
  isoToDateTimeLocal,
} from "@/utils/date"

type RegisterDeceasedModalProps = {
  onSubmit: (data: CreateDeceasedBody) => void
  mode?: "create" | "edit"
  initialData?: CreateDeceasedBody
  trigger?: ReactNode
  isLoading?: boolean
}

function getDefaultValues(initialData?: CreateDeceasedBody): CreateDeceasedBody {
  if (!initialData) {
    return {
      name: "",
      birthDate: "",
      deathDate: "",
      deathCertificate: "",
    }
  }

  return {
    ...initialData,
    birthDate: isoToDateTimeLocal(initialData.birthDate),
    deathDate: isoToDateTimeLocal(initialData.deathDate),
  }
}

export function RegisterDeceasedModal({
  onSubmit,
  mode = "create",
  initialData,
  trigger,
  isLoading = false,
}: RegisterDeceasedModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<CreateDeceasedBody>({
    resolver: zodResolver(createDeceasedBodySchema),
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

  function handleSubmit(data: CreateDeceasedBody) {
    onSubmit(data)
    handleOpenChange(false)
  }

  const isEdit = mode === "edit"
  const title = isEdit ? "Editar óbito" : "Novo óbito"
  const description = isEdit
    ? "Atualize os dados do óbito."
    : "Preencha os dados para enviar."
  const submitLabel = isEdit ? "Salvar alterações" : "Salvar óbito"

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">Registrar novo óbito</Button>}
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
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Nome completo"
              {...form.register("name")}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input
              id="birthDate"
              type="datetime-local"
              {...form.register("birthDate", {
                setValueAs: (value: string) => dateTimeLocalToIso(value),
              })}
            />
            {form.formState.errors.birthDate?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.birthDate.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deathDate">Data de óbito</Label>
            <Input
              id="deathDate"
              type="datetime-local"
              {...form.register("deathDate", {
                setValueAs: (value: string) => dateTimeLocalToIso(value),
              })}
            />
            {form.formState.errors.deathDate?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.deathDate.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deathCertificate">Certidão de óbito</Label>
            <Input
              id="deathCertificate"
              placeholder="Número da certidão"
              {...form.register("deathCertificate")}
            />
            {form.formState.errors.deathCertificate?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.deathCertificate.message}
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
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
