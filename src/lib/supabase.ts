/**
 * supabase.ts
 * 
 * PROPÓSITO:
 * Configura e inicia la conexión con Supabase.
 * Lee las variables de entorno (URL y Key) y exporta el cliente 'supabase' listo para usar.
 * 
 * IMPORTANTE:
 * Si cambias de proyecto de Supabase, aquí SOLO tocas si cambian las variables de entorno,
 * pero normalmente solo cambias el archivo .env.local y esto funciona solo.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
