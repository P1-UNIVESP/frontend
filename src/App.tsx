import { useState } from "react"
import { Archive, LogOut } from "lucide-react"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { Toaster } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { isAdminUser } from "@/lib/auth-utils"
import { queryClient } from "@/lib/react-query"
import LoginPage from "@/pages/login"
import { AppRoutes } from "@/routes"
import { menuItems } from "@/routes/menu-items"
import { RequireAuth } from "@/routes/RequireAuth"

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = authClient.useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const user = session.data?.user
  const visibleMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdminUser(user),
  )

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await authClient.signOut()
      queryClient.clear()
      navigate("/login", { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Archive className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Memorial</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                Gestão cemiterial
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger />
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium">{user?.name ?? "Usuário"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="min-h-dvh bg-muted/20 p-4 sm:p-6">
          <AppRoutes />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NuqsAdapter>
        <TooltipProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            />
          </Routes>
          <Toaster richColors />
        </TooltipProvider>
      </NuqsAdapter>
    </BrowserRouter>
  )
}

export default App
