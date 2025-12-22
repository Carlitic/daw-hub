/**
 * layout.tsx
 * 
 * PROPÓSITO:
 * Define la ESTRUCTURA BASE que tienen todas las páginas.
 * 
 * COMPONENTES:
 * 1. <header>: La barra de arriba con el logo, menú y botón de login/perfil.
 * 2. <main>: El contenido variable (lo que cambia según la página donde estés).
 * 3. <footer>: El pie de página con los créditos.
 * 
 * EXTRAS:
 * - Renderiza <Outlet />, que es donde React Router inyecta la página actual.
 * - Incluye animaciones suaves (AnimatePresence) al cambiar de página.
 */

import { Link, Outlet, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { LogOut, User as UserIcon, Github, Code2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Layout() {
    const { user, signOut } = useAuth()
    const location = useLocation()

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 max-w-screen-2xl items-center">
                    <Link to="/" className="mr-8 flex items-center space-x-2">
                        <Code2 className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            DAW-Hub
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link
                            to="/"
                            className="transition-colors hover:text-primary text-foreground/80"
                        >
                            Inicio
                        </Link>
                        <Link
                            to="/modulos"
                            className="transition-colors hover:text-primary text-foreground/60"
                        >
                            Módulos
                        </Link>
                        <Link
                            to="/about"
                            className="transition-colors hover:text-primary text-foreground/60"
                        >
                            Acerca de
                        </Link>
                    </nav>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full border border-primary/20 bg-primary/10">
                                            <UserIcon className="h-5 w-5 text-primary" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.user_metadata.full_name || "Usuario"}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/dashboard">Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={signOut}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Cerrar Sesión</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/login">
                                    <Button size="sm" className="hidden sm:flex bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity border-0">
                                        Iniciar Sesión
                                    </Button>
                                    <Button size="sm" variant="ghost" className="sm:hidden">
                                        <UserIcon className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            <ModeToggle />
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1 container max-w-screen-2xl py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        <p>Creado por <span className="font-medium text-foreground">Carlos Javier Castaños Blanco</span> (DAW-Hub).</p>
                        <p className="text-xs">Proyecto educativo para DAW.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/carlitic" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <Github className="h-5 w-5" />
                            <span className="text-sm font-medium">Ver más proyectos</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
