/**
 * ContentViewerPage.tsx
 * 
 * PROPÓSITO:
 * Es el "Visor" que ven los alumnos. Muestra el contenido de una lección específica.
 * Tiene una barra lateral (Sidebar) con el índice de todo el módulo.
 * 
 * ¿QUÉ HACE?:
 * 1. fetchCourseData: Carga todo el temario (unidades y lecciones) para pintar el índice.
 * 2. Renderiza el contenido según el tipo:
 *    - 'lesson' / 'activity': Usa ReactMarkdown para convertir el texto a HTML bonito.
 *    - 'pdf': Usa el componente PDFSlides (ahora un iframe) para mostrar el documento.
 *    - 'quiz': Carga el QuizPlayer para hacer el test.
 * 3. Gestiona el progreso (marcar como visto al terminar).
 */

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CheckCircle, Menu, ChevronLeft, ChevronRight, FileText, Lock, Dumbbell, BookOpen, User, Lightbulb, Code, Terminal, Monitor, Cpu, AlertTriangle, Cloud, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { QuizPlayer } from "@/components/QuizPlayer"
import { PDFSlides } from "@/components/PDFSlides"

type Content = {
    id: string
    title: string
    type: 'lesson' | 'pdf' | 'quiz' | 'activity'
    body?: string
    data?: any
    is_free: boolean
    icon?: string
    unit_id: string
}

const ICONS = [
    { name: "BookOpen", icon: BookOpen },
    { name: "FileText", icon: FileText },
    { name: "Video", icon: Video },
    { name: "Code", icon: Code },
    { name: "Terminal", icon: Terminal },
    { name: "Monitor", icon: Monitor },
    { name: "Cpu", icon: Cpu },
    { name: "Cloud", icon: Cloud },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "AlertTriangle", icon: AlertTriangle },
    { name: "User", icon: User },
    { name: "Dumbbell", icon: Dumbbell },
]

type Unit = {
    id: string
    title: string
    contents: Content[]
    alert_message?: string
}

export default function ContentViewerPage() {
    const { moduleId, contentId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [units, setUnits] = useState<Unit[]>([])
    const [currentContent, setCurrentContent] = useState<Content | null>(null)
    const [loading, setLoading] = useState(true)
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        if (moduleId) fetchCourseData()
    }, [moduleId])

    const getIconComponent = (iconName?: string) => {
        const found = ICONS.find(i => i.name === iconName)
        const Icon = found ? found.icon : BookOpen
        return <Icon className="h-4 w-4" />
    }

    useEffect(() => {
        if (units.length > 0 && contentId) {
            // Find content
            let found = null
            for (const u of units) {
                const c = u.contents.find(c => c.id === contentId)
                if (c) {
                    found = c
                    break
                }
            }
            if (found) setCurrentContent(found)
        } else if (units.length > 0 && !contentId) {
            // Default to first content
            if (units[0]?.contents[0]) {
                navigate(`/modulos/${moduleId}/lesson/${units[0].contents[0].id}`, { replace: true })
            }
        }
    }, [units, contentId, moduleId])

    const fetchCourseData = async () => {
        setLoading(true)

        // 1. Fetch Units & Contents
        const { data: unitsData } = await supabase
            .from("units")
            .select(`
                id, title, alert_message,
                contents (id, title, type, body, data, is_free, order_index, unit_id)
            `)
            .eq("module_id", moduleId)
            .order("order_index", { ascending: true })

        if (unitsData) {
            // Sort contents manually as well just in case
            // Sort contents and hoist icon
            const sortedUnits = unitsData.map((u: any) => ({
                ...u,
                contents: u.contents
                    .sort((a: any, b: any) => a.order_index - b.order_index)
                    .map((c: any) => ({ ...c, icon: c.data?.icon, unit_id: u.id }))
            }))
            setUnits(sortedUnits)
        }

        // 2. Fetch User Progress
        if (user) {
            const { data: progress } = await supabase
                .from("user_progress")
                .select("content_id")
                .eq("user_id", user.id)

            if (progress) {
                setCompletedIds(new Set(progress.map(p => p.content_id)))
            }
        }
        setLoading(false)
    }

    const handleToggleComplete = async (cid: string, scoreData?: { score: number, total: number }) => {
        if (!user) return

        const isCompleted = completedIds.has(cid)

        if (isCompleted) {
            // UNMARK (Remove progress)
            if (confirm("¿Quieres desmarcar esta lección como vista? Si tiene nota, se perderá.")) {
                const newSet = new Set(completedIds)
                newSet.delete(cid)
                setCompletedIds(newSet)

                await supabase.from("user_progress").delete().eq("user_id", user.id).eq("content_id", cid)
            }
            return
        }

        // MARK AS COMPLETE
        let finalScore = null

        // Validation for Quizzes
        if (currentContent?.type === 'quiz' && scoreData) {
            const grade = (scoreData.score / scoreData.total) * 10

            if (grade < 5) {
                alert(`Has sacado un ${grade.toFixed(1)}. Necesitas al menos un 5 para aprobar y completar la lección. ¡Inténtalo de nuevo!`)
                return // Stop execution, do not mark as complete
            }
            finalScore = grade
        }

        // Optimistic update
        const newSet = new Set(completedIds)
        newSet.add(cid)
        setCompletedIds(newSet)

        // Save to DB
        const payload: any = { user_id: user.id, content_id: cid }
        if (finalScore !== null) payload.score = finalScore

        const { error } = await supabase.from("user_progress").insert([payload])

        if (error) {
            if (error.code === '23505') { // Unique violation
                if (finalScore !== null) {
                    await supabase.from("user_progress")
                        .update({ score: finalScore })
                        .eq("user_id", user.id)
                        .eq("content_id", cid)
                }
            } else {
                console.log("Progress update error", error.message)
            }
        }
    }

    const navigateToNext = () => {
        // Find current index
        let flatContents: Content[] = []
        units.forEach(u => flatContents.push(...u.contents))

        const idx = flatContents.findIndex(c => c.id === currentContent?.id)
        if (idx >= 0 && idx < flatContents.length - 1) {
            navigate(`/modulos/${moduleId}/lesson/${flatContents[idx + 1].id}`)
        }
    }

    const navigateToPrev = () => {
        let flatContents: Content[] = []
        units.forEach(u => flatContents.push(...u.contents))

        const idx = flatContents.findIndex(c => c.id === currentContent?.id)
        if (idx > 0) {
            navigate(`/modulos/${moduleId}/lesson/${flatContents[idx - 1].id}`)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Cargando curso...</div>

    const Sidebar = () => (
        <div className="h-full bg-muted/20 border-r flex flex-col">
            <div className="p-4 border-b font-semibold bg-background flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/modulos")}>
                    ← Volver a Módulos
                </Button>
                <span>Índice del Curso</span>
            </div>
            <ScrollArea className="flex-1 p-4">
                {units.map(unit => (
                    <div key={unit.id} className="mb-6">
                        <h3 className="font-semibold text-sm text-foreground/70 mb-2 uppercase tracking-wider">{unit.title}</h3>
                        <div className="space-y-1">
                            {unit.contents.map(content => {
                                const isActive = content.id === contentId
                                const isCompleted = completedIds.has(content.id)
                                const isLocked = !user && !content.is_free

                                return (
                                    <button
                                        key={content.id}
                                        disabled={isLocked}
                                        onClick={() => {
                                            navigate(`/modulos/${moduleId}/lesson/${content.id}`)
                                            setIsSidebarOpen(false)
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors text-left",
                                            isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
                                            isLocked && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                        ) : (
                                            <div className="text-muted-foreground shrink-0">
                                                {getIconComponent(content.icon)}
                                            </div>
                                        )}
                                        <span className="truncate flex-1">{content.title}</span>
                                        {isLocked && <Lock className="h-3 w-3 shrink-0" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </div>
    )

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-80 shrink-0">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b flex items-center gap-4">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon"><Menu /></Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-80">
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold truncate">{currentContent?.title}</span>
                </div>

                <ScrollArea className="flex-1">
                    <div className="container max-w-4xl py-8">
                        {currentContent && units.find(u => u.id === currentContent.unit_id)?.alert_message && (
                            <div className="mb-6 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 text-yellow-800 dark:text-yellow-200 shadow-sm rounded-r-lg flex gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm uppercase mb-1">Aviso del Tema</h4>
                                    <p className="text-sm leading-relaxed">{units.find(u => u.id === currentContent.unit_id)?.alert_message}</p>
                                </div>
                            </div>
                        )}

                        {currentContent ? (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold">{currentContent.title}</h1>
                                    </div>
                                    {user && (
                                        <Button
                                            onClick={() => handleToggleComplete(currentContent.id)}
                                            variant={completedIds.has(currentContent.id) ? "outline" : "default"}
                                            className="md:w-auto w-full"
                                        >
                                            {completedIds.has(currentContent.id) ? (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Completado (Desmarcar)
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Visto
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {/* Content Body */}
                                <div className="min-h-[400px]">
                                    {currentContent.type === 'lesson' && (
                                        <div className="prose dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                {currentContent.body || "Sin contenido"}
                                            </ReactMarkdown>
                                            {currentContent.data?.pdfUrl && (
                                                <div className="mt-8 border-t pt-8">
                                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        Material de Apoyo
                                                    </h3>
                                                    <PDFSlides url={currentContent.data.pdfUrl} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {currentContent.type === 'activity' && (
                                        <div className="space-y-6">
                                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex gap-4 items-start">
                                                <div className="bg-primary/10 p-3 rounded-full">
                                                    <Dumbbell className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Práctica / Actividad</h3>
                                                    <p className="text-muted-foreground text-sm">Sigue las instrucciones a continuación para completar esta tarea.</p>
                                                </div>
                                            </div>
                                            <div className="prose dark:prose-invert max-w-none border-l-4 border-primary/20 pl-6 py-2">
                                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                    {currentContent.body || "Sin instrucciones"}
                                                </ReactMarkdown>
                                            </div>
                                            {currentContent.data?.pdfUrl && (
                                                <div className="mt-8 border-t pt-8">
                                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md">
                                                            <Dumbbell className="h-5 w-5" />
                                                        </div>
                                                        Guía de la Actividad
                                                    </h3>
                                                    <PDFSlides url={currentContent.data.pdfUrl} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {currentContent.type === 'pdf' && currentContent.data?.url && (
                                        <PDFSlides url={currentContent.data.url} />
                                    )}

                                    {currentContent.type === 'quiz' && (
                                        <QuizPlayer
                                            questions={currentContent.data?.questions || []}
                                            onComplete={(scoreData) => handleToggleComplete(currentContent.id, scoreData)}
                                        />
                                    )}
                                </div>

                                {/* Navigation Footer */}
                                <div className="flex justify-between pt-8 border-t mt-12">
                                    <Button variant="ghost" onClick={navigateToPrev}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                                    </Button>
                                    <Button onClick={navigateToNext}>
                                        Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                Selecciona una lección para empezar.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
