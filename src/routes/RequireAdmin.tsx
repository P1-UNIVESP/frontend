import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { authClient } from "@/lib/auth-client"
import { isAdminUser } from "@/lib/auth-utils"

type RequireAdminProps = {
  children: ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const session = authClient.useSession()

  if (!isAdminUser(session.data?.user)) {
    return <Navigate to="/obitos" replace />
  }

  return children
}
