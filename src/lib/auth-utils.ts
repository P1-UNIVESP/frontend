import type { AuthSession } from "@/lib/auth-client"

export function isAdminUser(user: AuthSession["user"] | undefined) {
  return (user?.role ?? "user")
    .split(",")
    .map((role) => role.trim())
    .includes("admin")
}
