
import { Archive, PanelLeftIcon } from "lucide-react"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { BrowserRouter, NavLink, useLocation } from "react-router-dom"
import { Toaster } from "sonner"

import { Separator } from "@/components/ui/separator"
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
import { AppRoutes } from "@/routes"
import { menuItems } from "@/routes/menu-items"

function AppShell() {
  const location = useLocation()

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
                {menuItems.map((item) => (
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
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger />
          {/* <Separator orientation="vertical" className="h-5" /> */}
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
          <AppShell />
         <Toaster richColors />
        </TooltipProvider>
      </NuqsAdapter>
    </BrowserRouter>
  )
}

export default App
