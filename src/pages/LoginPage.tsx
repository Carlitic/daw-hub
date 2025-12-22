/**
 * LoginPage.tsx
 * 
 * PROPÓSITO:
 * Pantalla de Acceso y Registro (todo en uno).
 * 
 * FUNCIONAMIENTO:
 * - Detecta el modo (Login o Registro) por la URL o el estado.
 * - Usa supabase.auth.signInWithPassword para entrar.
 * - Usa supabase.auth.signUp para registrarse.
 * - Tiene animaciones chulas con Framer Motion para cambiar de modo.
 */

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, Monitor, Code2 } from "lucide-react"

export default function LoginPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignUp, setIsSignUp] = useState(false)
    const [fullName, setFullName] = useState("")
    const [error, setError] = useState<string | null>(null)

    const [searchParams] = useSearchParams()

    useEffect(() => {
        if (user) {
            navigate("/")
        }
        if (searchParams.get("mode") === "register") {
            setIsSignUp(true)
        }
    }, [user, navigate, searchParams])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (error) throw error
                alert("Registro exitoso! Por favor inicia sesión.")
                setIsSignUp(false)
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate("/")
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
            <motion.div
                className="absolute top-8 left-8 flex items-center gap-2 font-bold text-xl tracking-tighter"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Code2 className="h-8 w-8 text-primary" />
                DAW-Hub
            </motion.div>

            <motion.div
                className="w-full max-w-sm space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                        <Monitor className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isSignUp ? "signup" : "signin"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isSignUp ? "Crea tu cuenta" : "Bienvenido de nuevo"}
                            </motion.span>
                        </AnimatePresence>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isSignUp ? "signup-desc" : "signin-desc"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isSignUp
                                    ? "Rellena el formulario para comenzar"
                                    : "Introduce tus credenciales para acceder"}
                            </motion.span>
                        </AnimatePresence>
                    </p>
                </div>

                <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
                    <CardContent className="pt-6">
                        <form onSubmit={handleAuth} className="space-y-4">
                            <AnimatePresence>
                                {isSignUp && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div className="space-y-2 pb-4">
                                            <Label htmlFor="fullname">Nombre Completo</Label>
                                            <Input
                                                id="fullname"
                                                type="text"
                                                placeholder="Juan Pérez"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="bg-background/50"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={isSignUp ? "btn-signup" : "btn-signin"}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {isSignUp ? "Registrarse" : "Entrar"}
                                    </motion.span>
                                </AnimatePresence>
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 border-t bg-muted/20 py-4">
                        <div className="text-center text-sm text-muted-foreground">
                            {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
                            <Button
                                variant="link"
                                className="px-1 font-semibold text-primary underline-offset-4 hover:underline"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp ? "Inicia sesión" : "Regístrate"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
