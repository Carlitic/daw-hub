/**
 * AboutPage.tsx
 * 
 * PROPÓSITO:
 * Página estática de "Acerca de".
 * Explica qué es el proyecto, quién lo ha hecho y tecnologías usadas.
 * Puramente informativa.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Server } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="container py-12 max-w-4xl">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                    DAW <span className="text-primary">Hub</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                    Tu plataforma de aprendizaje para Sistemas Microinformáticos y Redes.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Profile Card */}
                <Card className="h-full border-2 border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            El Autor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold">Carlos Javier Castaños Blanco</h2>
                            <Badge variant="secondary" className="w-fit">Estudiante DAW</Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Soy un estudiante apasionado por el Desarrollo de Aplicaciones Web (DAW).
                            He creado esta aplicación como un proyecto personal para combinar mis conocimientos de programación
                            con el material educativo de Desarrollo de Aplicaciones Web (DAW).
                        </p>
                    </CardContent>
                </Card>

                {/* Project Purpose Card */}
                <Card className="h-full border-2 border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-6 w-6 text-primary" />
                            El Proyecto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                            DAW Hub nace con el objetivo de:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Exponer cursos y módulos creados por mí.</li>
                            <li>Ofrecer explicaciones claras sobre administración de sistemas.</li>
                            <li>Proporcionar exámenes y tests de autoevaluación.</li>
                            <li>Servir de ayuda para cualquiera que quiera aprender más sobre informática.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground">
                <p>Hecho con ❤️ y mucho código.</p>
            </div>
        </div>
    )
}
