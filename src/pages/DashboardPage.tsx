/**
 * DashboardPage.tsx
 * 
 * PROPÓSITO:
 * Es el panel de control PRINCIPAL para el usuario logueado.
 * 
 * FUNCIONALIDAD:
 * 1. Lista todos los módulos disponibles.
 * 2. Si eres ADMIN: Muestra botones para Crear, Editar y Borrar módulos.
 * 3. Si eres ADMIN: El botón "Gestionar Contenido" te lleva a AdminModulePage para editar lecciones.
 * 4. Si NO eres admin: Solo ves la lista y el aviso de que estás en modo lectura.
 */

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, FolderOpen, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

type Module = {
    id: string
    title: string
    description: string
    published: boolean
    created_at: string
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [modules, setModules] = useState<Module[]>([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newModule, setNewModule] = useState({ title: "", description: "", published: true })
    const [editingModule, setEditingModule] = useState<Module | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login")
            return
        }

        if (user) {
            checkAdminStatus()
            fetchModules()
        }
    }, [user, authLoading])

    const checkAdminStatus = async () => {
        if (!user) return
        const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (data && data.role === "admin") {
            setIsAdmin(true)
        } else {
            navigate("/") // Redirect unauthorized users
        }
        setLoading(false)
    }

    const fetchModules = async () => {
        const { data, error } = await supabase
            .from("modules")
            .select("*")
            .order("created_at", { ascending: true })

        if (error) console.error("Error fetching modules:", error)
        else setModules(data || [])
    }

    const handleSaveModule = async () => {
        if (!newModule.title) return

        if (editingModule) {
            // Update existing
            const { error } = await supabase
                .from("modules")
                .update({ title: newModule.title, description: newModule.description, published: newModule.published })
                .eq("id", editingModule.id)

            if (error) console.error("Error updating:", error)
        } else {
            // Create new
            const { error } = await supabase
                .from("modules")
                .insert([{ title: newModule.title, description: newModule.description, published: newModule.published }])

            if (error) console.error("Error creating:", error)
        }

        setNewModule({ title: "", description: "", published: true })
        setEditingModule(null)
        setIsDialogOpen(false)
        fetchModules()
    }

    const handleDeleteModule = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar este módulo? Se borrarán todas sus unidades.")) return;

        const { error } = await supabase.from("modules").delete().eq("id", id)
        if (error) console.error("Error deleting", error)
        else fetchModules()
    }

    const openEditDialog = (module: Module) => {
        setEditingModule(module)
        setNewModule({ title: module.title, description: module.description, published: module.published })
        setIsDialogOpen(true)
    }

    const openNewDialog = () => {
        setEditingModule(null)
        setNewModule({ title: "", description: "", published: true })
        setIsDialogOpen(true)
    }

    if (authLoading || loading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="container py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                    <p className="text-muted-foreground">Gestiona los módulos y contenidos de DAW-Hub.</p>
                </div>
                {isAdmin && (
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) {
                            setEditingModule(null)
                            setNewModule({ title: "", description: "", published: true })
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={openNewDialog} className="w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Módulo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingModule ? "Editar Módulo" : "Crear Nuevo Módulo"}</DialogTitle>
                                <DialogDescription>
                                    {editingModule ? "Modifica los datos de la asignatura." : "Añade una nueva asignatura o bloque temático."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                        id="title"
                                        value={newModule.title}
                                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                        placeholder="ej. Montaje y Mantenimiento de Equipos"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Descripción</Label>
                                    <Textarea
                                        id="desc"
                                        value={newModule.description}
                                        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                        placeholder="Breve descripción de la asignatura..."
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="published"
                                        checked={newModule.published}
                                        onCheckedChange={(checked) => setNewModule({ ...newModule, published: checked })}
                                    />
                                    <Label htmlFor="published">Visible para alumnos</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSaveModule}>{editingModule ? "Guardar Cambios" : "Crear Módulo"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Módulo</TableHead>
                            <TableHead className="hidden md:table-cell">Descripción</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {modules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No hay módulos creados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            modules.map((module) => (
                                <TableRow key={module.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="truncate max-w-[150px] md:max-w-none">{module.title}</span>
                                            {!module.published && (
                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                                                    Oculto
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{module.description}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/module/${module.id}`)}>
                                                <span className="hidden sm:inline">Gestionar</span> <span className="sm:hidden">Ver</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" disabled={!isAdmin} onClick={() => openEditDialog(module)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteModule(module.id)} disabled={!isAdmin}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isAdmin && (
                <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                    <p><strong>Modo Lectura:</strong> No tienes permisos de administrador para editar contenido.</p>
                </div>
            )}
        </div>
    )
}
