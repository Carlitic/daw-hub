-- 1. Crear el 'Cubo' (Bucket) de almacenamiento para los archivos
INSERT INTO storage.buckets (id, name, public)
VALUES ('module_assets', 'module_assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Seguridad (RLS) - LIMPIEZA PREVIA

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 3. Crear Políticas Nuevas

-- Permitir que CUALQUIERA (público) pueda LEER/VER los archivos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'module_assets' );

-- Permitir SOLAMENTE a los ADMINS subir archivos
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'module_assets' AND public.is_admin() );

-- Permitir SOLAMENTE a los ADMINS actualizar archivos
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'module_assets' AND public.is_admin() );

-- Permitir SOLAMENTE a los ADMINS borrar archivos
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'module_assets' AND public.is_admin() );
