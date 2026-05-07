import { type FormEvent, useState } from "react"
import { Archive, Loader2, LogIn } from "lucide-react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

type LoginLocationState = {
  from?: {
    pathname?: string
    search?: string
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = authClient.useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LoginLocationState | null
  const fromPath = `${state?.from?.pathname ?? "/obitos"}${state?.from?.search ?? ""}`

  if (session.data) {
    return <Navigate to={fromPath} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      })

      if (error) {
        toast.error(error.message ?? "Não foi possível entrar.")
        return
      }

      await session.refetch()
      navigate(fromPath, { replace: true })
    } catch {
      toast.error("Não foi possível entrar.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh bg-muted/20 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_620px] lg:px-0 lg:py-0">
      <section className="hidden min-h-dvh flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            <Archive className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Memorial</p>
            <p className="text-xs text-primary-foreground/70">Gestão cemiterial</p>
          </div>
        </div>

        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight">
            Acesse o painel administrativo
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75">
            Use as credenciais para entrar e gerenciar óbitos,
            sepulturas, sepultamentos e proprietários.
          </p>
        </div>
      </section>

      <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center lg:min-h-dvh">
        <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Archive className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Memorial</p>
              <p className="text-xs text-muted-foreground">Gestão cemiterial</p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe seu e-mail e senha para continuar.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              Entrar
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
