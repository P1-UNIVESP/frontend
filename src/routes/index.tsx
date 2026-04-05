import { Navigate, Route, Routes } from "react-router-dom"

import BurialsPage from "@/pages/burials"
import DeceasedPage from "@/pages/deceased"
import GravesPage from "@/pages/graves"
import OwnersPage from "@/pages/owners"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/obitos" replace />} />
      <Route path="/sepulturas" element={<GravesPage />} />
      <Route path="/sepultamentos" element={<BurialsPage />} />
      <Route path="/obitos" element={<DeceasedPage />} />
      <Route path="/proprietarios" element={<OwnersPage />} />
    </Routes>
  )
}
