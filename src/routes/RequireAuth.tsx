import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"

type RequireAuthProps = {
  children: ReactNode
}

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/20 px-4">
      <section className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </section>
    </main>
  )
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const session = authClient.useSession()

  if (session.isPending) {
    return <AuthLoadingScreen />
  }

  if (!session.data) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
