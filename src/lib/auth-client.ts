import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { API_BASE_URL } from "@/config/env"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [adminClient()],
})

export type AuthSession = typeof authClient.$Infer.Session
