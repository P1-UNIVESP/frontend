import { useMemo, useState, type ReactNode } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { useOwners } from "@/pages/owners/queries"

import {
  createGraveBodySchema,
  graveStatusOptions,
  graveTypeOptions,
  type CreateGraveBody,
  type UpdateGraveBody,
} from "../types"

type RegisterGraveModalProps = {
  onSubmit: (data: CreateGraveBody | UpdateGraveBody) => void
  mode?: "create" | "edit"
  initialData?: UpdateGraveBody
  trigger?: ReactNode
  isLoading?: boolean
}

const selectClassName = cn(
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
)

function getDefaultValues(initialData?: UpdateGraveBody): CreateGraveBody {
  if (!initialData) {
    return {
      code: "",
      type: "TERRA",
      status: "DISPONIVEL",
      capacity: 1,
      ownerId: undefined,
    }
  }

  return {
    ...initialData,
    ownerId: initialData.ownerId ?? undefined,
  }
}

export function RegisterGraveModal({
  onSubmit,
  mode = "create",
  initialData,
  trigger,
  isLoading = false,
}: RegisterGraveModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isOwnerComboboxOpen, setIsOwnerComboboxOpen] = useState(false)
  const [ownerSearch, setOwnerSearch] = useState("")

  const form = useForm<CreateGraveBody>({
    resolver: zodResolver(createGraveBodySchema),
    defaultValues: getDefaultValues(initialData),
  })

  const selectedOwnerId = useWatch({
    control: form.control,
    name: "ownerId",
  })

  const { data: ownersData, isFetching: isOwnersFetching } = useOwners({
    q: ownerSearch.trim(),
    limit: 10,
    offset: 0,
  })
  const owners = useMemo(() => ownersData?.data ?? [], [ownersData?.data])

  const selectedOwnerOption = useMemo(() => {
    if (!selectedOwnerId) {
      return null
    }

    return owners.find((owner) => owner.id === selectedOwnerId) ?? null
  }, [owners, selectedOwnerId])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (nextOpen) {
      setOwnerSearch("")
      setIsOwnerComboboxOpen(false)
      form.reset(getDefaultValues(initialData))
      return
    }

    setOwnerSearch("")
    setIsOwnerComboboxOpen(false)
    form.reset(getDefaultValues(initialData))
  }

  function handleSubmit(data: CreateGraveBody) {
    if (!data.ownerId) {
      const payload = { ...data }
      delete payload.ownerId

      if (isEdit) {
        onSubmit({ ...payload, ownerId: null })
      } else {
        onSubmit(payload)
      }

      handleOpenChange(false)
      return
    }

    onSubmit(data)
    handleOpenChange(false)
  }

  const isEdit = mode === "edit"
  const title = isEdit ? "Editar sepultura" : "Nova sepultura"
  const description = isEdit
    ? "Atualize os dados da sepultura."
    : "Preencha os dados da sepultura."
  const submitLabel = isEdit ? "Salvar alterações" : "Salvar sepultura"

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">Registrar nova sepultura</Button>}
      </DialogTrigger>

      <DialogContent className="min-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              placeholder="Ex.: QD-A-12"
              {...form.register("code")}
            />
            {form.formState.errors.code?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.code.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <select id="type" className={selectClassName} {...form.register("type")}>
                {graveTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {form.formState.errors.type?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.type.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" className={selectClassName} {...form.register("status")}>
                {graveStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {form.formState.errors.status?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.status.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                {...form.register("capacity", {
                  setValueAs: (value: string) => Number(value),
                })}
              />
              {form.formState.errors.capacity?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.capacity.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownerId">Proprietário (opcional)</Label>
              <input
                type="hidden"
                {...form.register("ownerId", {
                  setValueAs: (value: string) => value || undefined,
                })}
              />
              <Popover
                open={isOwnerComboboxOpen}
                onOpenChange={setIsOwnerComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOwnerComboboxOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {selectedOwnerOption
                        ? `${selectedOwnerOption.name} — ${selectedOwnerOption.cpf}`
                        : selectedOwnerId
                          ? "Proprietário selecionado"
                          : "Selecione um proprietário"}
                    </span>
                    <ChevronsUpDown className="ml-2 opacity-50 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  avoidCollisions={false}
                  className="w-(--radix-popover-trigger-width) p-0"
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar proprietário por nome ou CPF"
                      value={ownerSearch}
                      onValueChange={setOwnerSearch}
                    />
                    <CommandList className="max-h-56 min-h-20 overflow-y-auto">
                      <CommandEmpty>Nenhum proprietário encontrado.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="sem-proprietario"
                          onSelect={() => {
                            form.setValue("ownerId", undefined, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                            setIsOwnerComboboxOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2",
                              !selectedOwnerId ? "opacity-100" : "opacity-0",
                            )}
                          />
                          Sem proprietário
                        </CommandItem>
                        {selectedOwnerId && !selectedOwnerOption ? (
                          <CommandItem
                            key={selectedOwnerId}
                            value={selectedOwnerId}
                            onSelect={() => {
                              setIsOwnerComboboxOpen(false)
                            }}
                          >
                            <Check className="mr-2 opacity-100" />
                            Proprietário selecionado
                          </CommandItem>
                        ) : null}
                        {owners.map((owner) => (
                          <CommandItem
                            key={owner.id}
                            value={`${owner.name} ${owner.cpf}`}
                            onSelect={() => {
                              form.setValue("ownerId", owner.id, { shouldDirty: true })
                              setIsOwnerComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2",
                                owner.id === selectedOwnerId ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {owner.name} — {owner.cpf}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="min-h-4 text-xs text-muted-foreground">
                {isOwnersFetching ? "Buscando proprietários..." : ""}
              </p>
              {form.formState.errors.ownerId?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.ownerId.message}
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
