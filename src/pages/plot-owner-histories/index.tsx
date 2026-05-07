import { useEffect, useState } from "react"
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

import { usePlotOwnerHistories } from "./queries"
import type { PlotOwnerHistory } from "./types"

const DEFAULT_LIMIT = 10

type ActiveFilter = "TODOS" | "ATIVOS" | "ENCERRADOS"

function formatCpfDisplay(cpf: string) {
  if (cpf.length !== 11) return cpf
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

function getHistoryStatus(history: PlotOwnerHistory) {
  return history.endedAt ? "Encerrado" : "Ativo"
}

export default function PlotOwnerHistoriesPage() {
  const [localSearch, setLocalSearch] = useState("")
  const [search, setSearch] = useQueryState(
    "historySearch",
    parseAsString.withDefault(""),
  )
  const [activeFilter, setActiveFilter] = useQueryState(
    "historyStatus",
    parseAsString.withDefault("TODOS"),
  )
  const [limit] = useQueryState(
    "historyLimit",
    parseAsInteger.withDefault(DEFAULT_LIMIT),
  )
  const [offset, setOffset] = useQueryState(
    "historyOffset",
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
  }, [localSearch, setOffset, setSearch])

  const { data, isFetching, isError } = usePlotOwnerHistories({
    q: search.trim(),
    active:
      activeFilter === "ATIVOS"
        ? "true"
        : activeFilter === "ENCERRADOS"
          ? "false"
          : undefined,
    limit,
    offset,
  })

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <main className="min-h-dvh bg-linear-to-b from-muted/30 to-background px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Histórico de proprietários
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulte as trocas de proprietário registradas para cada sepultura.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="search"
              placeholder="Buscar por sepultura, proprietário ou CPF"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              className="sm:w-96"
            />

            <select
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value as ActiveFilter)
                setOffset(0)
              }}
              className="h-9 rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="TODOS">Todos os históricos</option>
              <option value="ATIVOS">Vínculos ativos</option>
              <option value="ENCERRADOS">Vínculos encerrados</option>
            </select>
          </div>
        </header>

        <section className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sepultura</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Status</TableHead>
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
                    Erro ao carregar histórico de proprietários.
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell className="font-medium">
                      {history.plot.code}
                    </TableCell>
                    <TableCell>{history.owner.name}</TableCell>
                    <TableCell>{formatCpfDisplay(history.owner.cpf)}</TableCell>
                    <TableCell>{formatDateTimePtBr(history.startedAt)}</TableCell>
                    <TableCell>
                      {history.endedAt ? formatDateTimePtBr(history.endedAt) : "-"}
                    </TableCell>
                    <TableCell>{getHistoryStatus(history)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum histórico encontrado.
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
    </main>
  )
}
