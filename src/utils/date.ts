import { format, isValid, parse, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export function formatDateTimePtBr(iso: string) {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return "-"
  }

  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
}

export function isoToDateTimeLocal(iso?: string) {
  if (!iso) {
    return ""
  }

  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }

  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function dateTimeLocalToIso(value?: string) {
  if (!value) {
    return ""
  }

  const parsedDate = parse(value, "yyyy-MM-dd'T'HH:mm", new Date())
  if (!isValid(parsedDate)) {
    return ""
  }

  return parsedDate.toISOString()
}
