/**
 * AdminModulePage.tsx
 * 
 * PROPÓSITO:
 * Esta es la página PRINCIPAL de administración del contenido.
 * Aquí es donde el administrador (tú) puede:
 * 1. Crear y editar "Unidades" (Temas).
 * 2. Crear y editar "Contenidos" (Lecciones, Actividades, PDFs, Tests).
 * 3. Subir archivos PDF a Supabase Storage.
 * 4. Reordenar el contenido.
 * 
 * FUNCIONES CLAVE:
 * - handleSaveContent: La más importante. Guarda la lección en la base de datos y sube el PDF si hay uno.
 * - handleDeleteContent: Borra la lección y, si tiene PDF (y el código está activo), borra también el archivo para no dejar basura.
 * - openContentDialog: Abre el formulario para editar o crear. Carga el PDF existente si lo hay.
 * 
 * NOTA:
 * Tiene una "Consola de Depuración" visual abajo del todo para ver errores si algo falla.
 */

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Plus, Hash, FileText, Video, Trash2, Edit, ArrowUp, ArrowDown, BookOpen, User, Lightbulb, Code, Terminal, Monitor, Cpu, AlertTriangle, Cloud, Dumbbell } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// Types
type Unit = {
    id: string
    title: string
    order_index: number
    alert_message?: string
}

type Content = {
    id: string
    unit_id: string
    title: string
    slug: string
    type: 'lesson' | 'pdf' | 'quiz' | 'activity'
    is_free: boolean
    body?: string
    order_index: number
    data?: any
    icon?: string // Extracted from data for UI convenience
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

export default function AdminModulePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [moduleTitle, setModuleTitle] = useState("")
    const [units, setUnits] = useState<Unit[]>([])
    const [contents, setContents] = useState<Content[]>([])

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate("/login")
            } else {
                checkAdminStatus()
            }
        }
    }, [user, authLoading, navigate])

    const checkAdminStatus = async () => {
        if (!user) return
        const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!data || data.role !== "admin") {
            navigate("/")
            return
        }

        // Is Admin, proceed
        setLoading(false)
        fetchModuleData()
    }

    // State for Unit Dialog (Restored)
    const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false)
    const [editingUnitId, setEditingUnitId] = useState<string | null>(null)
    const [newUnitTitle, setNewUnitTitle] = useState("")
    const [newUnitAlert, setNewUnitAlert] = useState("")

    // State for Content Dialog
    const [isContentDialogOpen, setIsContentDialogOpen] = useState(false)
    const [editingContentId, setEditingContentId] = useState<string | null>(null)
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
    const [contentType, setContentType] = useState<'lesson' | 'pdf' | 'quiz' | 'activity'>('lesson')

    // Content Form State
    const [contentTitle, setContentTitle] = useState("")
    const [contentSlug, setContentSlug] = useState("")
    const [contentBody, setContentBody] = useState("") // For Markdown
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null) // NEW STATE

    const [selectedIcon, setSelectedIcon] = useState("BookOpen")

    const [quizQuestions, setQuizQuestions] = useState<{ q: string, options: string[], correct: number }[]>([{ q: "", options: ["", ""], correct: 0 }])
    const [isFree, setIsFree] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState("")

    const LANGUAGES = [
        { value: "", label: "Texto Plano" },
        { value: "bash", label: "Bash / Terminal" },
        { value: "powershell", label: "PowerShell" },
        { value: "python", label: "Python" },
        { value: "javascript", label: "JavaScript" },
        { value: "typescript", label: "TypeScript" },
        { value: "html", label: "HTML" },
        { value: "css", label: "CSS" },
        { value: "sql", label: "SQL" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "json", label: "JSON" },
    ]

    useEffect(() => {
        fetchModuleData()
    }, [id])

    const getIconComponent = (iconName?: string) => {
        const found = ICONS.find(i => i.name === iconName)
        const Icon = found ? found.icon : BookOpen
        return <Icon className="h-4 w-4" />
    }

    const insertCodeBlock = (elementId: string) => {
        const textarea = document.getElementById(elementId) as HTMLTextAreaElement;
        const langTag = selectedLanguage ? selectedLanguage : "";

        if (!textarea) {
            // Fallback if not found (e.g. just append)
            setContentBody(contentBody + `\n\`\`\`${langTag}\n\n\`\`\``);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = contentBody;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = `${before}\`\`\`${langTag}\n${selection || "código aquí"}\n\`\`\`${after}`;
        setContentBody(newText);

        // Defer focus to allow state update
        setTimeout(() => {
            const el = document.getElementById(elementId) as HTMLTextAreaElement;
            if (el) {
                el.focus();
                el.setSelectionRange(start + 4, start + 4 + (selection.length || 11));
            }
        }, 0);
    }

    const fetchModuleData = async () => {
        if (!id) return
        setLoading(true)

        try {
            // 1. Get Module Info
            const { data: moduleData, error: moduleError } = await supabase.from("modules").select("title").eq("id", id).single()
            if (moduleError) console.error("Error fetching module:", moduleError)
            if (moduleData) setModuleTitle(moduleData.title)

            // 2. Get Units
            const { data: unitsData, error: unitsError } = await supabase.from("units").select("*").eq("module_id", id).order("order_index", { ascending: true })
            if (unitsError) console.error("Error fetching units:", unitsError)
            setUnits(unitsData || [])

            // 3. Get Contents
            if (unitsData && unitsData.length > 0) {
                const unitIds = unitsData.map(u => u.id)
                const { data: contentsData, error: contentsError } = await supabase
                    .from("contents")
                    .select("*")
                    .in("unit_id", unitIds)
                    .order("order_index", { ascending: true })

                if (contentsError) {
                    console.error("Error fetching contents:", contentsError)
                    alert("Error cargando contenidos: " + contentsError.message)
                }

                // Map data.icon to top level for easier access
                const formattedContents = (contentsData || []).map((c: any) => ({
                    ...c,
                    icon: c.data?.icon || "BookOpen"
                }))

                setContents(formattedContents)
            } else {
                setContents([])
            }
        } catch (err) {
            console.error("Unexpected error:", err)
        } finally {
            setLoading(false)
        }
    }

    const openUnitDialog = (unit?: Unit) => {
        if (unit) {
            setEditingUnitId(unit.id)
            setNewUnitTitle(unit.title)
            setNewUnitAlert(unit.alert_message || "")
        } else {
            setEditingUnitId(null)
            setNewUnitTitle("")
            setNewUnitAlert("")
        }
        setIsUnitDialogOpen(true)
    }

    const handleSaveUnit = async () => {
        if (!newUnitTitle || !id) return

        if (editingUnitId) {
            // Update
            await supabase.from("units").update({ title: newUnitTitle, alert_message: newUnitAlert }).eq("id", editingUnitId)
        } else {
            // Insert
            await supabase.from("units").insert([{
                module_id: id,
                title: newUnitTitle,
                order_index: units.length + 1,
                alert_message: newUnitAlert
            }])
        }

        setNewUnitTitle("")
        setIsUnitDialogOpen(false)
        fetchModuleData()
    }

    const handleDeleteUnit = async (unitId: string) => {
        if (!confirm("¿Estás seguro de borrar este tema y todo su contenido?")) return
        const { error } = await supabase.from("units").delete().eq("id", unitId)
        if (error) alert("Error al borrar")
        else fetchModuleData()
    }

    // --- DEBUG LOGGING ---
    const [debugLogs, setDebugLogs] = useState<string[]>([])
    const addLog = (msg: string) => setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])
    // ---------------------

    const handleSaveContent = async () => {
        addLog("Iniciando guardado...")
        if (!contentTitle || !selectedUnitId) {
            addLog("Error validación: Falta título o unidad")
            alert("Error: Debes poner un título y asegurarte de que hay una Unidad seleccionada.")
            return
        }
        setLoading(true)

        let finalBody = contentBody
        let finalData: any = {}

        if (editingContentId) {
            const existing = contents.find(c => c.id === editingContentId)
            if (existing) finalData = existing.data || {}
        }

        try {
            if (pdfFile) {
                addLog("Subiendo PDF...")
                const fileExt = pdfFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('module_assets')
                    .upload(filePath, pdfFile, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) {
                    addLog("Error subida PDF: " + uploadError.message)
                    throw uploadError
                }
                addLog("PDF Subido OK")

                const { data: { publicUrl } } = supabase.storage.from('module_assets').getPublicUrl(filePath)

                if (contentType === 'pdf') {
                    finalData = { ...finalData, url: publicUrl }
                } else {
                    finalData = { ...finalData, pdfUrl: publicUrl }
                }
            }

            if (contentType === 'quiz') {
                finalData = { ...finalData, questions: quizQuestions }
            }

            const payload = {
                unit_id: selectedUnitId,
                title: contentTitle, // FIXED: Added title
                slug: contentSlug || contentTitle.toLowerCase().replace(/ /g, '-'), // FIXED: Added slug (auto-generate if empty)
                type: contentType,
                body: finalBody,
                data: { ...finalData, icon: selectedIcon },
                is_free: isFree
            }
            addLog("Guardando en DB: " + JSON.stringify(payload))

            let error = null
            if (editingContentId) {
                const res = await supabase.from("contents").update(payload).eq("id", editingContentId)
                error = res.error
            } else {
                const res = await supabase.from("contents").insert([{ ...payload, order_index: contents.length + 1 }])
                error = res.error
            }

            if (error) {
                addLog("Error DB: " + error.message + " | Details: " + JSON.stringify(error))
                throw error
            }

            addLog("Guardado DB OK. Recargando...")
            setIsContentDialogOpen(false)
            resetContentForm()
            fetchModuleData()

        } catch (error: any) {
            console.error("Error saving content:", error)
            addLog("EXCEPTION: " + error.message)
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleMoveContent = async (contentId: string, direction: 'up' | 'down') => {
        const content = contents.find(c => c.id === contentId)
        if (!content) return

        const unitContents = contents.filter(c => c.unit_id === content.unit_id)
        const currentIndex = unitContents.findIndex(c => c.id === contentId)
        if (currentIndex === -1) return

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        if (newIndex < 0 || newIndex >= unitContents.length) return

        const reordered = [...unitContents]
        const [movedItem] = reordered.splice(currentIndex, 1)
        reordered.splice(newIndex, 0, movedItem)

        const updates = reordered.map((c, index) => ({
            id: c.id,
            order_index: index + 1
        }))

        const newContentsState = contents.map(c => {
            const update = updates.find(u => u.id === c.id)
            return update ? { ...c, order_index: update.order_index } : c
        })

        newContentsState.sort((a, b) => {
            if (a.unit_id !== b.unit_id) return 0
            return a.order_index - b.order_index
        })

        setContents(newContentsState)

        await Promise.all(updates.map(u =>
            supabase.from("contents").update({ order_index: u.order_index }).eq("id", u.id)
        ))

        fetchModuleData()
    }

    const handleDeleteContent = async (contentId: string) => {
        if (!confirm("¿Borrar esta lección?")) return

        // 1. Check for file to delete
        const content = contents.find(c => c.id === contentId)
        if (content) {
            const pdfUrl = content.data?.pdfUrl || content.data?.url
            if (pdfUrl) {
                try {
                    // Extract path from URL: .../module_assets/moduleId/filename.pdf
                    // The path needed for remove() is just "moduleId/filename.pdf"
                    const urlObj = new URL(pdfUrl)
                    const pathParts = urlObj.pathname.split('/module_assets/')
                    if (pathParts.length > 1) {
                        const filePath = pathParts[1] // "moduleId/filename.pdf"
                        console.log("Deleting file from storage:", filePath)
                        await supabase.storage.from('module_assets').remove([filePath])
                    }
                } catch (e) {
                    console.error("Error parsing URL for file deletion:", e)
                }
            }
        }

        const { error } = await supabase.from("contents").delete().eq("id", contentId)
        if (error) alert("Error borrando: " + error.message)
        else fetchModuleData()
    }

    const resetContentForm = () => {
        setContentTitle("")
        setContentSlug("")
        setContentBody("")
        setSelectedIcon("BookOpen")
        setPdfFile(null)
        setExistingPdfUrl(null) // RESET
        setQuizQuestions([{ q: "", options: ["", ""], correct: 0 }])
        setIsFree(false)
    }

    const openContentDialog = (unitId: string, content?: Content) => {
        setSelectedUnitId(unitId)
        if (content) {
            setEditingContentId(content.id)
            setContentTitle(content.title)
            setContentSlug(content.slug)
            setContentBody(content.body || "")
            setContentType(content.type)
            setSelectedIcon(content.data?.icon || "BookOpen")
            setIsFree(content.is_free)

            // LOAD EXISTING PDF
            setExistingPdfUrl(content.data?.pdfUrl || content.data?.url || null)

            if (content.type === 'quiz' && content.data?.questions) {
                setQuizQuestions(content.data.questions)
            } else {
                setQuizQuestions([{ q: "", options: ["", ""], correct: 0 }])
            }
            // PDF file input cannot be pre-filled programmatically for security
            setPdfFile(null)
        } else {
            setEditingContentId(null)
            resetContentForm()
        }
        setIsContentDialogOpen(true)
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container py-8 pb-32">
            {/* DEBUG CONSOLE */}
            <div className="fixed bottom-0 left-0 w-full h-48 bg-black/90 text-green-400 font-mono text-xs p-4 overflow-y-auto z-50 border-t-2 border-green-500">
                <div className="flex justify-between font-bold mb-2">
                    <span>CONSOLE DEBUG SYSTEM (Captura este área si hay error)</span>
                    <button onClick={() => setDebugLogs([])} className="text-white bg-red-600 px-2 rounded">Clear</button>
                </div>
                {debugLogs.length === 0 && <span className="opacity-50">Esperando acciones... (Intenta guardar para ver logs aquí)</span>}
                {debugLogs.map((log, i) => (
                    <div key={i} className="border-b border-green-900/30 py-0.5">{log}</div>
                ))}
            </div>

            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Gestión: {moduleTitle}</h1>
                    <p className="text-muted-foreground">Organiza las unidades y lecciones.</p>
                </div>
                <div className="ml-auto">
                    <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => openUnitDialog()}><Plus className="h-4 w-4 mr-2" /> Nueva Unidad</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingUnitId ? "Editar Unidad" : "Crear Unidad"}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Título del Tema</Label>
                                    <Input value={newUnitTitle} onChange={e => setNewUnitTitle(e.target.value)} placeholder="Ej. Tema 1: Introducción" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mensaje de Aviso / Alerta (Opcional)</Label>
                                    <Textarea
                                        value={newUnitAlert}
                                        onChange={e => setNewUnitAlert(e.target.value)}
                                        placeholder="Ej. Este tema entra en el examen final..."
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">Este mensaje aparecerá destacado al ver cualquier lección de este tema.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSaveUnit}>Guardar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6">
                {units.map((unit) => (
                    <div key={unit.id} className="border rounded-lg p-6 bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Hash className="h-5 w-5 text-muted-foreground" />
                                {unit.title}
                            </h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openContentDialog(unit.id)}>
                                    <Plus className="h-3 w-3 mr-2" /> Añadir Lección
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openUnitDialog(unit)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUnit(unit.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2 pl-4 border-l-2 border-muted ml-2">
                            {contents.filter(c => c.unit_id === unit.id).length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No hay lecciones en este tema.</p>
                            )}
                            {contents.filter(c => c.unit_id === unit.id).map(content => (
                                <div key={content.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded hover:bg-muted/50 group gap-2">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="flex flex-col gap-1 mr-2 shrink-0">
                                            <button
                                                onClick={() => handleMoveContent(content.id, 'up')}
                                                className="hover:text-primary transition-colors disabled:opacity-30"
                                                disabled={contents.filter(c => c.unit_id === unit.id).indexOf(content) === 0}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveContent(content.id, 'down')}
                                                className="hover:text-primary transition-colors disabled:opacity-30"
                                                disabled={contents.filter(c => c.unit_id === unit.id).indexOf(content) === contents.filter(c => c.unit_id === unit.id).length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className={`p-1.5 rounded-md shrink-0 ${content.type === 'activity' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {getIconComponent(content.data?.icon)}
                                        </div>
                                        <span className="font-medium truncate">{content.title}</span>
                                        {content.is_free && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full shrink-0">Gratis</span>}
                                    </div>
                                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity justify-end">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openContentDialog(unit.id, content)}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteContent(content.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {units.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No hay unidades todavía. Crea la primera para empezar.
                    </div>
                )}
            </div>


            {/* Content Creation Dialog */}
            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingContentId ? "Editar Contenido" : "Añadir Contenido"}</DialogTitle>
                        <DialogDescription>Elige el tipo de contenido y rellena los datos.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">

                        <div className="space-y-2">
                            <Label>Icono</Label>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/20">
                                {ICONS.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => setSelectedIcon(item.name)}
                                        className={`p-2 rounded-md transition-all ${selectedIcon === item.name ? "bg-primary text-primary-foreground shadow-md scale-110" : "hover:bg-background text-muted-foreground"}`}
                                        title={item.name}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="Título de la lección" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (URL amigable)</Label>
                                <Input value={contentSlug} onChange={e => setContentSlug(e.target.value)} placeholder="titulo-leccion" />
                            </div>
                        </div>

                        <Tabs value={contentType} onValueChange={(v: any) => setContentType(v)}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="lesson">Lección</TabsTrigger>
                                <TabsTrigger value="activity">Actividad</TabsTrigger>
                                <TabsTrigger value="pdf">PDF</TabsTrigger>
                                <TabsTrigger value="quiz">Test</TabsTrigger>
                            </TabsList>

                            <TabsContent value="lesson" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Contenido de la Lección (Markdown Habilitado)</Label>
                                    <div className="text-xs text-muted-foreground mb-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-100 dark:border-blue-900">
                                        Tip: Puedes escribir texto normal, o usar bloques de código con ``` ... ```
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 p-1 bg-muted/50 rounded-md border">
                                        <div className="text-xs text-muted-foreground px-2">
                                            Editor Markdown
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <select
                                                className="h-7 text-xs rounded border border-input bg-background px-2"
                                                value={selectedLanguage}
                                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                            >
                                                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                            </select>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-xs gap-1"
                                                onClick={() => insertCodeBlock("lesson-body")}
                                            >
                                                <Code className="h-3 w-3" /> Insertar Código
                                            </Button>
                                        </div>
                                    </div>
                                    <Textarea
                                        id="lesson-body"
                                        className="min-h-[200px] font-mono"
                                        value={contentBody}
                                        onChange={e => setContentBody(e.target.value)}
                                        placeholder="Escribe aquí el contenido..."
                                    />
                                    <div className="space-y-2 border-t pt-4 mt-4">
                                        <Label>Adjuntar PDF (Material de Apoyo)</Label>

                                        {existingPdfUrl && (
                                            <div className="flex items-center justify-between p-2 mb-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-green-600" />
                                                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">Archivo actual adjunto</span>
                                                </div>
                                                <a href={existingPdfUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Ver PDF</a>
                                            </div>
                                        )}

                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer"
                                        />
                                        {pdfFile && <p className="text-sm text-green-600">Seleccionado: {pdfFile.name}</p>}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="activity" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Instrucciones de la Actividad (Markdown Habilitado)</Label>
                                    <div className="text-xs text-muted-foreground mb-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-100 dark:border-blue-900">
                                        Tip: Puedes pegar código dentro de bloques ``` para que se vea bien.
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 p-1 bg-muted/50 rounded-md border">
                                        <div className="text-xs text-muted-foreground px-2">
                                            Editor Markdown
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <select
                                                className="h-7 text-xs rounded border border-input bg-background px-2"
                                                value={selectedLanguage}
                                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                            >
                                                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                            </select>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-xs gap-1"
                                                onClick={() => insertCodeBlock("activity-body")}
                                            >
                                                <Code className="h-3 w-3" /> Insertar Código
                                            </Button>
                                        </div>
                                    </div>
                                    <Textarea
                                        id="activity-body"
                                        className="min-h-[200px] font-mono"
                                        value={contentBody}
                                        onChange={e => setContentBody(e.target.value)}
                                        placeholder="Describe la actividad..."
                                    />
                                    <div className="space-y-2 border-t pt-4 mt-4">
                                        <Label>Adjuntar Guía / PDF</Label>

                                        {existingPdfUrl && (
                                            <div className="flex items-center justify-between p-2 mb-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-green-600" />
                                                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">Archivo actual adjunto</span>
                                                </div>
                                                <a href={existingPdfUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Ver PDF</a>
                                            </div>
                                        )}

                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer"
                                        />
                                        {pdfFile && <p className="text-sm text-green-600">Seleccionado: {pdfFile.name}</p>}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="pdf" className="space-y-4 pt-4">
                                <div className="space-y-2 border-2 border-dashed rounded-lg p-8 text-center">
                                    <Label>Sube tu archivo PDF</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                        className="cursor-pointer"
                                    />
                                    {pdfFile && <p className="text-sm text-green-600 mt-2">Seleccionado: {pdfFile.name}</p>}
                                </div>
                            </TabsContent>

                            <TabsContent value="quiz" className="space-y-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <Label>Preguntas del Test</Label>
                                    <Button variant="outline" size="sm" onClick={() => setQuizQuestions([...quizQuestions, { q: "", options: ["", ""], correct: 0 }])}>
                                        + Añadir Pregunta
                                    </Button>
                                </div>
                                {quizQuestions.map((q, qIndex) => (
                                    <div key={qIndex} className="border p-4 rounded bg-muted/20 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder={`Pregunta ${qIndex + 1}`}
                                                value={q.q}
                                                onChange={e => {
                                                    const newQ = [...quizQuestions];
                                                    newQ[qIndex].q = e.target.value;
                                                    setQuizQuestions(newQ);
                                                }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive shrink-0"
                                                onClick={() => {
                                                    const newQ = [...quizQuestions];
                                                    newQ.splice(qIndex, 1);
                                                    setQuizQuestions(newQ);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="pl-4 space-y-2">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex gap-2 items-center">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qIndex}`}
                                                        checked={q.correct === oIndex}
                                                        onChange={() => {
                                                            const newQ = [...quizQuestions];
                                                            newQ[qIndex].correct = oIndex;
                                                            setQuizQuestions(newQ);
                                                        }}
                                                    />
                                                    <Input
                                                        className="h-8"
                                                        placeholder={`Opción ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={e => {
                                                            const newQ = [...quizQuestions];
                                                            newQ[qIndex].options[oIndex] = e.target.value;
                                                            setQuizQuestions(newQ);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="free" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
                            <Label htmlFor="free">Contenido Gratuito (Accesible sin login)</Label>
                        </div>



                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveContent} disabled={loading}>{loading ? "Guardando..." : "Guardar Contenido"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
