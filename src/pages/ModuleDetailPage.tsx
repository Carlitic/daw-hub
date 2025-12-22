/**
 * ModuleDetailPage.tsx
 * 
 * PROPÓSITO:
 * Es la portada de un Módulo (ej. "Seguridad Informática").
 * Muestra la lista completa de Unidades y Lecciones para que el alumno elija por dónde empezar.
 * 
 * LÓGICA IMPORTANTE:
 * - fetchModuleData: Hace una consulta "manual" (más segura) a Supabase para traer Unidades y luego sus Contenidos.
 * - Calcula el % de progreso del alumno (cuántas lecciones ha completado del total).
 * - Botón "Continuar": Te lleva a la última lección que dejaste a medias.
 */

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Lock, PlayCircle, FileText, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Unit = {
    id: string
    title: string
    contents: Content[]
}

type Content = {
    id: string
    title: string
    slug: string
    is_free: boolean
}

export default function ModuleDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [units, setUnits] = useState<Unit[]>([])
    const [moduleTitle, setModuleTitle] = useState("")
    const [completedContentIds, setCompletedContentIds] = useState<Set<string>>(new Set())
    const [contentScores, setContentScores] = useState<Map<string, number>>(new Map())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) fetchModuleData(id)
    }, [id, user]) // Added user dependency

    const fetchModuleData = async (moduleId: string) => {
        setLoading(true)
        try {
            // Check Admin Status first
            let isAdmin = false
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
                if (profile?.role === "admin") isAdmin = true
            }

            // 1. Get Module Info
            const { data: moduleData } = await supabase.from("modules").select("title, published").eq("id", moduleId).single()

            if (moduleData) {
                // SECURITY CHECK: If not published and not admin, redirect
                if (!moduleData.published && !isAdmin) {
                    alert("🚧 Este módulo está en mantenimiento o en preparación.\n\nPróximamente estará disponible.")
                    navigate("/modulos")
                    return
                }
                setModuleTitle(moduleData.title)
            }

            // 2. Get Units
            const { data: unitsData, error: unitsError } = await supabase
                .from("units")
                .select("id, title, order_index")
                .eq("module_id", moduleId)
                .order("order_index", { ascending: true })

            if (unitsError) throw unitsError

            if (!unitsData || unitsData.length === 0) {
                setUnits([])
                setLoading(false)
                return
            }

            // 3. Get Contents manually (Robust way)
            const unitIds = unitsData.map(u => u.id)
            const { data: contentsData, error: contentsError } = await supabase
                .from("contents")
                .select("id, title, slug, is_free, unit_id, order_index")
                .in("unit_id", unitIds)
                .order("order_index", { ascending: true })

            if (contentsError) throw contentsError

            // 4. Merge Units + Contents
            const mergedUnits: Unit[] = unitsData.map(unit => ({
                id: unit.id,
                title: unit.title,
                contents: contentsData?.filter(c => c.unit_id === unit.id) || []
            }))

            setUnits(mergedUnits)

            // 5. Get User Progress
            if (user) {
                const { data: progressData } = await supabase
                    .from("user_progress")
                    .select("content_id, score")
                    .eq("user_id", user.id)

                if (progressData) {
                    const ids = new Set(progressData.map(p => p.content_id))
                    setCompletedContentIds(ids)

                    // Create a map of contentId -> score
                    const scoresMap = new Map()
                    progressData.forEach(p => {
                        if (p.score !== null) scoresMap.set(p.content_id, p.score)
                    })
                    setContentScores(scoresMap)
                }
            }

        } catch (error) {
            console.error("Error fetching module data:", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleProgress = async (e: React.MouseEvent, contentId: string) => {
        e.stopPropagation() // Prevent card click
        if (!user) return

        const isCompleted = completedContentIds.has(contentId)
        const newSet = new Set(completedContentIds)

        if (isCompleted) {
            // Remove
            newSet.delete(contentId)
            setCompletedContentIds(newSet) // Optimistic update
            await supabase.from("user_progress").delete().eq("user_id", user.id).eq("content_id", contentId)
        } else {
            // Add
            newSet.add(contentId)
            setCompletedContentIds(newSet) // Optimistic update
            await supabase.from("user_progress").insert([{ user_id: user.id, content_id: contentId }])
        }
    }

    const handleContentClick = (content: Content) => {
        if (!user && !content.is_free) {
            // Show alert overlay or redirect to login
            alert("🔒 Este contenido es exclusivo para usuarios registrados.\n\nPor favor, inicia sesión para continuar.")
            navigate("/login")
            return
        }
        // Navigate to content viewer
        navigate(`/modulos/${id}/lesson/${content.id}`)
    }

    return (
        <div className="container py-8">
            <div className="mb-8">
                <Button variant="outline" onClick={() => navigate("/modulos")} className="mb-4">
                    ← Volver al catálogo
                </Button>
                <h1 className="text-3xl font-bold">{moduleTitle || "Cargando..."}</h1>
            </div>

            <div className="grid gap-6">
                {units.map((unit) => (
                    <div key={unit.id} className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">{unit.title}</h2>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {unit?.contents?.map((content: any) => (
                                <Card
                                    key={content.id}
                                    className="cursor-pointer hover:border-primary transition-colors group"
                                    onClick={() => handleContentClick(content)}
                                >
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            {/* Completion Checkbox */}
                                            {user && (
                                                <div
                                                    onClick={(e) => toggleProgress(e, content.id)}
                                                    className={cn(
                                                        "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-105 shadow-sm",
                                                        completedContentIds.has(content.id)
                                                            ? "bg-green-100 border-green-500 text-green-600"
                                                            : "bg-background border-muted text-muted-foreground hover:border-primary hover:text-primary"
                                                    )}
                                                    title={completedContentIds.has(content.id) ? "Marcar como no visto" : "Marcar como visto"}
                                                >
                                                    {completedContentIds.has(content.id) && (
                                                        <CheckCircle className="h-5 w-5 fill-current" />
                                                    )}
                                                </div>
                                            )}

                                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                            <div className="flex flex-col">
                                                <span className={cn("font-medium", completedContentIds.has(content.id) && "text-muted-foreground line-through decoration-green-500/50")}>
                                                    {content.title}
                                                </span>
                                                {contentScores.get(content.id) !== undefined && (
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit mt-1">
                                                        Nota: {contentScores.get(content.id)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!user && !content.is_free ? (
                                            <Lock className="h-4 w-4 text-destructive" />
                                        ) : (
                                            <PlayCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {(!unit.contents || unit.contents.length === 0) && (
                                <p className="text-sm text-muted-foreground italic col-span-3">No hay contenido en esta unidad.</p>
                            )}
                        </div>
                    </div>
                ))}

                {!loading && units.length === 0 && (
                    <div className="text-center py-10 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">Este módulo aún no tiene contenido publicado.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
