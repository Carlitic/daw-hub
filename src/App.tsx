
/**
 * App.tsx
 * 
 * PROPÓSITO:
 * Archivo raíz de navegación. Aquí se definen las RUTAS (URLs) de la web.
 * Ej: Si quieres crear una página nueva "/contacto", tienes que añadirla aquí en <Routes>.
 * 
 * ESTRUCTURA:
 * Envuelve todo en:
 * 1. ThemeProvider (Modo oscuro/claro).
 * 2. AuthProvider (Gestión de usuario).
 * 3. BrowserRouter (Navegación sin recargar).
 */

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Layout } from "@/components/layout"
import HomePage from "@/pages/HomePage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import ModulesPage from "@/pages/ModulesPage"
import ModuleDetailPage from "@/pages/ModuleDetailPage"
import AdminModulePage from "@/pages/AdminModulePage"
import AboutPage from "@/pages/AboutPage"
import ContentViewerPage from "@/pages/ContentViewerPage"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter basename="/DAW-Hub/">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/modulos" element={<ModulesPage />} />
              <Route path="/modulos/:id" element={<ModuleDetailPage />} />
              <Route path="/modulos/:moduleId/viewer" element={<ContentViewerPage />} />
              <Route path="/modulos/:moduleId/lesson/:contentId" element={<ContentViewerPage />} />
              <Route path="/dashboard/module/:id" element={<AdminModulePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="*" element={<div className="container py-10">404 - Not Found</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
