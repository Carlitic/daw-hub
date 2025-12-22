/**
 * auth-provider.tsx
 * 
 * PROPÓSITO:
 * Es el "cerebro" que sabe quién está conectado. Envuelve a toda la app.
 * Proveé el contexto de autenticación (usuario actual, sesión, función de cerrar sesión) a cualquier componente que lo pida.
 * 
 * ¿CÓMO SE USA?:
 * En cualquier archivo: import { useAuth } from "@/components/auth-provider"
 * const { user } = useAuth() -> Y ya tienes el usuario.
 */

import { createContext, useContext, useEffect, useState } from "react"
import { type User, type Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type AuthContextType = {
    session: Session | null
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
