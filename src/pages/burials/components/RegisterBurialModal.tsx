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

import { usePlots } from "@/pages/graves/queries"
import { useDeceased } from "@/pages/deceased/queries"

import {
  createBurialBodySchema,
  type CreateBurialBody,
} from "../types"
import {
  dateTimeLocalToIso,
  isoToDateTimeLocal,
} from "@/utils/date"

type RegisterBurialModalProps = {
  onSubmit: (data: CreateBurialBody) => void
  mode?: "create" | "edit"
  initialData?: CreateBurialBody
  trigger?: ReactNode
  isLoading?: boolean
}


function getDefaultValues(initialData?: CreateBurialBody): CreateBurialBody {
  if (!initialData) {
    return {
      burialDate: "",
      plotId: "",
      deceasedId: "",
    }
  }

  return {
    ...initialData,
    burialDate: isoToDateTimeLocal(initialData.burialDate),
  }
}

export function RegisterBurialModal({
  onSubmit,
  mode = "create",
  initialData,
  trigger,
  isLoading = false,
}: RegisterBurialModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlotComboboxOpen, setIsPlotComboboxOpen] = useState(false)
  const [isDeceasedComboboxOpen, setIsDeceasedComboboxOpen] = useState(false)
  const [plotSearch, setPlotSearch] = useState("")
  const [deceasedSearch, setDeceasedSearch] = useState("")

  const form = useForm<CreateBurialBody>({
    resolver: zodResolver(createBurialBodySchema),
    defaultValues: getDefaultValues(initialData),
  })

  const selectedPlotId = useWatch({
    control: form.control,
    name: "plotId",
  })
  const selectedDeceasedId = useWatch({
    control: form.control,
    name: "deceasedId",
  })

  const { data: plotsData, isFetching: isPlotsFetching } = usePlots({
    q: plotSearch.trim(),
    limit: 10,
    offset: 0,
  })
  const plots = useMemo(() => plotsData?.data ?? [], [plotsData?.data])

  const { data: deceasedData, isFetching: isDeceasedFetching } = useDeceased({
    q: deceasedSearch.trim(),
    limit: 10,
    offset: 0,
  })
  const deceasedList = useMemo(() => deceasedData?.data ?? [], [deceasedData?.data])

  const selectedPlotOption = useMemo(() => {
    if (!selectedPlotId) {
      return null
    }

    return plots.find((plot) => plot.id === selectedPlotId) ?? null
  }, [plots, selectedPlotId])

  const selectedDeceasedOption = useMemo(() => {
    if (!selectedDeceasedId) {
      return null
    }

    return deceasedList.find((deceased) => deceased.id === selectedDeceasedId) ?? null
  }, [deceasedList, selectedDeceasedId])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (nextOpen) {
      setPlotSearch("")
      setDeceasedSearch("")
      setIsPlotComboboxOpen(false)
      setIsDeceasedComboboxOpen(false)
      form.reset(getDefaultValues(initialData))
      return
    }

    setPlotSearch("")
    setDeceasedSearch("")
    setIsPlotComboboxOpen(false)
    setIsDeceasedComboboxOpen(false)
    form.reset(getDefaultValues(initialData))
  }

  function handleSubmit(data: CreateBurialBody) {
    onSubmit(data)
    handleOpenChange(false)
  }

  const isEdit = mode === "edit"
  const title = isEdit ? "Editar sepultamento" : "Novo sepultamento"
  const description = isEdit
    ? "Atualize a sepultura, o óbito e a data de sepultamento."
    : "Selecione a sepultura, o óbito e informe a data de sepultamento."
  const submitLabel = isEdit
    ? "Salvar alterações"
    : "Salvar sepultamento"

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">Registrar novo sepultamento</Button>}
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
            <Label htmlFor="burialDate">Data de sepultamento</Label>
            <Input
              id="burialDate"
              type="datetime-local"
              {...form.register("burialDate", {
                setValueAs: (value: string) => dateTimeLocalToIso(value),
              })}
            />
            {form.formState.errors.burialDate?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.burialDate.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-2">
              <Label htmlFor="plotId">Sepultura</Label>
              <input
                type="hidden"
                {...form.register("plotId")}
              />
              <Popover
                open={isPlotComboboxOpen}
                onOpenChange={setIsPlotComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isPlotComboboxOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {selectedPlotOption
                        ? `${selectedPlotOption.code} — ${selectedPlotOption.type}`
                        : selectedPlotId
                          ? "Sepultura selecionada"
                          : "Selecione uma sepultura"}
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
                      placeholder="Buscar sepultura por código ou tipo"
                      value={plotSearch}
                      onValueChange={setPlotSearch}
                    />
                    <CommandList className="max-h-56 min-h-20 overflow-y-auto">
                      <CommandEmpty>Nenhuma sepultura encontrada.</CommandEmpty>
                      <CommandGroup>
                        {plots.map((plot) => (
                          <CommandItem
                            key={plot.id}
                            value={`${plot.code} ${plot.type}`}
                            onSelect={() => {
                              form.setValue("plotId", plot.id, { shouldDirty: true })
                              setIsPlotComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2",
                                plot.id === selectedPlotId ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {plot.code} — {plot.type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="min-h-4 text-xs text-muted-foreground">
                {isPlotsFetching ? "Buscando sepulturas..." : ""}
              </p>
              {form.formState.errors.plotId?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.plotId.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deceasedId">Óbito</Label>
              <input
                type="hidden"
                {...form.register("deceasedId")}
              />
              <Popover
                open={isDeceasedComboboxOpen}
                onOpenChange={setIsDeceasedComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isDeceasedComboboxOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {selectedDeceasedOption
                        ? `${selectedDeceasedOption.name} — ${selectedDeceasedOption.deathCertificate}`
                        : selectedDeceasedId
                          ? "Óbito selecionado"
                          : "Selecione um óbito"}
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
                      placeholder="Buscar óbito por nome ou certidão"
                      value={deceasedSearch}
                      onValueChange={setDeceasedSearch}
                    />
                    <CommandList className="max-h-56 min-h-20 overflow-y-auto">
                      <CommandEmpty>Nenhum óbito encontrado.</CommandEmpty>
                      <CommandGroup>
                        {deceasedList.map((deceased) => (
                          <CommandItem
                            key={deceased.id}
                            value={`${deceased.name} ${deceased.deathCertificate}`}
                            onSelect={() => {
                              form.setValue("deceasedId", deceased.id, { shouldDirty: true })
                              setIsDeceasedComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2",
                                deceased.id === selectedDeceasedId ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {deceased.name} — {deceased.deathCertificate}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="min-h-4 text-xs text-muted-foreground">
                {isDeceasedFetching ? "Buscando óbitos..." : ""}
              </p>
              {form.formState.errors.deceasedId?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.deceasedId.message}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={form.formState.isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || isLoading}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
