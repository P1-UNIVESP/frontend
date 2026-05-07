import { Navigate, Route, Routes } from "react-router-dom"

import BurialsPage from "@/pages/burials"
import DeceasedPage from "@/pages/deceased"
import GravesPage from "@/pages/graves"
import OwnersPage from "@/pages/owners"
import PlotOwnerHistoriesPage from "@/pages/plot-owner-histories"
import UsersPage from "@/pages/users"
import { RequireAdmin } from "@/routes/RequireAdmin"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/obitos" replace />} />
      <Route path="/sepulturas" element={<GravesPage />} />
      <Route path="/sepultamentos" element={<BurialsPage />} />
      <Route path="/obitos" element={<DeceasedPage />} />
      <Route path="/proprietarios" element={<OwnersPage />} />
      <Route path="/historico-proprietarios" element={<PlotOwnerHistoriesPage />} />
      <Route
        path="/usuarios"
        element={
          <RequireAdmin>
            <UsersPage />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}
