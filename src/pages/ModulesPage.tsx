/**
 * ModulesPage.tsx
 * 
 * PROPÓSITO:
 * Página pública que muestra las tarjetas de los módulos. 
 * Es accesible sin login (aunque para entrar, te pedirá cuenta luego).
 * Sirve como catálogo visual de lo que ofrece la plataforma.
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth-provider"

type Module = {
    id: string
    title: string
    description: string
    published: boolean
    created_at: string
}

type ModuleProgress = {
    module_id: string
    total_contents: number
    completed_contents: number
}

export default function ModulesPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [modules, setModules] = useState<Module[]>([])
    const [progressMap, setProgressMap] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return
            const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
            if (data?.role === "admin") setIsAdmin(true)
        }
        checkAdmin()
        fetchModules()
    }, [user])

    const fetchModules = async () => {
        // 1. Fetch Modules
        const { data: modulesData, error } = await supabase
            .from("modules")
            .select("*")
            .order("created_at", { ascending: true })

        if (error) {
            console.error("Error fetching modules:", error)
            setLoading(false)
            return
        }

        setModules(modulesData || [])

        // 2. Fetch Progress (if logged in)
        if (user) {
            const { data: progressData, error: progressError } = await supabase.rpc('get_user_module_progress', { uid: user.id })

            if (progressError) console.error("Error fetching progress:", progressError)

            if (progressData) {
                const map: Record<string, number> = {}
                progressData.forEach((p: ModuleProgress) => {
                    const total = p.total_contents || 0
                    const completed = p.completed_contents || 0
                    map[p.module_id] = total > 0 ? Math.round((completed / total) * 100) : 0
                })
                setProgressMap(map)
            }
        }
        setLoading(false)
    }

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Catálogo de Módulos</h1>
                <p className="text-muted-foreground">Explora nuestros cursos y empieza a aprender hoy mismo.</p>
            </div>

            {modules.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    No hay módulos publicados todavía.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {modules.map((module) => (
                        <Card key={module.id} className={`flex flex-col hover:shadow-lg transition-shadow relative overflow-hidden ${!module.published && !isAdmin ? "opacity-75" : ""}`}>

                            {/* OVERLAY FOR COMING SOON */}
                            {!module.published && !isAdmin && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center text-center p-4">
                                    <div className="bg-primary/10 text-primary border border-primary/20 rounded-lg p-4 shadow-lg transform rotate-[-5deg]">
                                        <h3 className="text-2xl font-black uppercase tracking-widest">Próximamente</h3>
                                        <p className="text-sm font-medium mt-1">Estamos preparando este contenido</p>
                                    </div>
                                </div>
                            )}

                            {/* ADMIN VISIBILITY BADGE */}
                            {!module.published && isAdmin && (
                                <div className="absolute top-2 right-2 z-30 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold border border-yellow-300">
                                    OCULTO A ALUMNOS
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    {module.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <CardDescription className="text-base line-clamp-3">
                                    {module.description || "Sin descripción disponible."}
                                </CardDescription>
                                {user && (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progreso</span>
                                            <span>{progressMap[module.id] || 0}%</span>
                                        </div>
                                        <Progress value={progressMap[module.id] || 0} className="h-2" />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => navigate(`/modulos/${module.id}/viewer`)} disabled={!module.published && !isAdmin}>
                                    {!module.published && !isAdmin ? "No Disponible" : "Entrar al Curso"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
