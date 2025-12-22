/**
 * HomePage.tsx
 * 
 * PROPÓSITO:
 * Página de aterrizaje (Landing Page) que ve todo el mundo al entrar.
 * 
 * CONTENIDO:
 * - Sección Hero: Título grande, botones de llamada a la acción.
 * - Grid de Módulos (Cards): Resumen visual de los módulos.
 * - Sección "Por qué elegirnos": Marketing.
 * 
 * ESTILO:
 * Usa muchas clases de Tailwind para diseño responsivo y efectos visuales (fondos, gradientes).
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield, Server, Cpu, Wifi, Terminal, CheckCircle2, Database } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden bg-background">
                {/* Minimalist Background - removed noise and complex gradients */}
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-background"></div>
                </div>

                <div className="container relative z-10 flex flex-col items-center text-center gap-8">
                    <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors border-border bg-muted/50 text-foreground">
                        DAW
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl">
                        Tu Camino al Éxito <br />
                        en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">DAW</span>
                    </h1>

                    <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                        Domina el montaje de equipos, redes, seguridad y sistemas operativos.
                        Una plataforma integral diseñada por y para estudiantes.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link to="/modulos">
                            <Button size="lg" className="h-12 px-8 text-lg font-medium shadow-sm hover:shadow-md transition-all">
                                Empezar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button variant="ghost" size="lg" className="h-12 px-8 text-lg">
                                Saber más
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-16 w-full max-w-3xl rounded-lg border bg-card shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
                            <div className="flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                            </div>
                            <div className="mx-auto text-xs font-mono text-muted-foreground">learning_path.ts</div>
                        </div>
                        <div className="p-6 text-left font-mono text-sm leading-relaxed overflow-x-auto">
                            <div className="text-purple-400">import <span className="text-foreground">Skills</span> from <span className="text-green-400">'./DAW-Hub'</span></div>
                            <br />
                            <div className="text-blue-400">const <span className="text-yellow-400">student</span> = <span className="text-purple-400">await</span> Skills.learn({'{'}</div>
                            <div className="pl-4 text-foreground">modules: [<span className="text-green-400">'Despliegue'</span>, <span className="text-green-400">'Diseño'</span>, <span className="text-green-400">'Cliente'</span>, <span className="text-green-400">'Servidor'</span>],</div>
                            <div className="pl-4 text-foreground">stack: [<span className="text-green-400">'React'</span>, <span className="text-green-400">'Node'</span>, <span className="text-green-400">'SQL'</span>]</div>
                            <div className="text-foreground">{'}'})</div>
                            <br />
                            <div className="text-foreground"><span className="text-blue-400">console</span>.log(<span className="text-green-400">"¡Full Stack Dev!"</span>)</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Todo lo que necesitas aprender</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Estructurado en módulos oficiales para cubrir todo el currículo formativo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="group border shadow-sm hover:shadow-md transition-all cursor-default bg-card">
                            <CardHeader>
                                <Cpu className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                <CardTitle className="text-xl">Despliegue</CardTitle>
                                <CardDescription>Aplicaciones Web</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Configuración de servidores web, DNS, y despliegue de aplicaciones en entornos de producción.
                            </CardContent>
                        </Card>

                        <Card className="group border shadow-sm hover:shadow-md transition-all cursor-default bg-card">
                            <CardHeader>
                                <Server className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                                <CardTitle className="text-xl">Servidor</CardTitle>
                                <CardDescription>Backend con PHP/Node</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Desarrollo de lógica de negocio, bases de datos y APIs RESTful.
                            </CardContent>
                        </Card>

                        <Card className="group border shadow-sm hover:shadow-md transition-all cursor-default bg-card">
                            <CardHeader>
                                <Wifi className="h-8 w-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                                <CardTitle className="text-xl">Cliente</CardTitle>
                                <CardDescription>Frontend Moderno</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Creación de interfaces dinámicas con HTML5, CSS3, JavaScript y React.
                            </CardContent>
                        </Card>

                        <Card className="group border shadow-sm hover:shadow-md transition-all cursor-default bg-card">
                            <CardHeader>
                                <Shield className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                <CardTitle className="text-xl">Diseño</CardTitle>
                                <CardDescription>UX/UI</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Prototipado, diseño de interfaces y experiencia de usuario.
                            </CardContent>
                        </Card>

                        <Card className="group border shadow-sm hover:shadow-md transition-all cursor-default bg-card">
                            <CardHeader>
                                <Database className="h-8 w-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                                <CardTitle className="text-xl">Bases de Datos</CardTitle>
                                <CardDescription>SQL y NoSQL</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Diseño, gestión y optimización de bases de datos relacionales y no relacionales.
                            </CardContent>
                        </Card>

                        <Card className="group border shadow-sm hover:shadow-md transition-all cursor-default bg-card">
                            <CardHeader>
                                <Terminal className="h-8 w-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                                <CardTitle className="text-xl">Libre Config.</CardTitle>
                                <CardDescription>Frameworks JS</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Profundización en tecnologías como React, Vue, Angular o Svelte.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 border-t">
                <div className="container md:flex items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">¿Por qué DAW-Hub?</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Actualizado al día</h3>
                                    <p className="text-muted-foreground text-sm">Contenidos revisados y adaptados a las tecnologías actuales del mercado.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Práctica Interactiva</h3>
                                    <p className="text-muted-foreground text-sm">Tests y actividades prácticas para reforzar lo aprendido, no solo teoría.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Gratis y Accesible</h3>
                                    <p className="text-muted-foreground text-sm">Plataforma Open Source pensada para ayudar a la comunidad educativa.</p>
                                </div>
                            </li>
                        </ul>
                        <div className="pt-4">
                            <Button onClick={() => window.location.href = "/login?mode=register"}>Únete a la Comunidad</Button>
                        </div>
                    </div>
                    <div className="flex-1 mt-10 md:mt-0 relative">
                        <div className="aspect-square rounded-full bg-primary/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-3xl -z-10"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-8">
                                <div className="rounded-xl bg-card border p-4 shadow-xl -rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="h-20 w-full bg-muted rounded-md mb-3 animate-pulse"></div>
                                    <div className="h-4 w-2/3 bg-muted rounded mb-2"></div>
                                    <div className="h-4 w-1/2 bg-muted rounded"></div>
                                </div>
                                <div className="rounded-xl bg-card border p-4 shadow-xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="h-4 w-full bg-muted rounded mb-3"></div>
                                    <div className="h-4 w-full bg-muted rounded mb-3"></div>
                                    <div className="h-20 w-full bg-muted rounded-md animate-pulse"></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-xl bg-card border p-4 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 mb-3"></div>
                                    <div className="h-4 w-full bg-muted rounded mb-2"></div>
                                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                                </div>
                                <div className="rounded-xl bg-card border p-4 shadow-xl -rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="h-20 w-full bg-primary/10 rounded-md mb-3 flex items-center justify-center text-primary font-bold">100%</div>
                                    <div className="h-4 w-full bg-muted rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
