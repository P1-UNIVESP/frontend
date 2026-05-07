import { FileClock, FileText, LayoutGrid, ScrollText, UserCog, Users } from "lucide-react"

export const menuItems = [
  {
    title: "Sepulturas",
    url: "/sepulturas",
    icon: LayoutGrid,
  },
  {
    title: "Sepultamentos",
    url: "/sepultamentos",
    icon: ScrollText,
  },
  {
    title: "Óbitos",
    url: "/obitos",
    icon: FileText,
  },
  {
    title: "Proprietários",
    url: "/proprietarios",
    icon: Users,
  },
  {
    title: "Histórico de proprietários",
    url: "/historico-proprietarios",
    icon: FileClock,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: UserCog,
    adminOnly: true,
  },
]
