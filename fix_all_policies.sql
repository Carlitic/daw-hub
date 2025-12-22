-- SCRIPT DE REPARACIÓN TOTAL DE PERMISOS
-- Ejecutar en Supabase -> SQL Editor

-- 1. Asegurar función de admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS ( SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABLA PROFILES (Perfiles)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles view" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
-- Permitir que cada uno vea su perfil (necesario para auth) y admins todo
CREATE POLICY "Public profiles view" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. TABLA MODULES (Módulos)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public modules view" ON modules;
CREATE POLICY "Public modules view" ON modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage modules" ON modules;
CREATE POLICY "Admin manage modules" ON modules FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. TABLA UNITS (Unidades)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public units view" ON units;
CREATE POLICY "Public units view" ON units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage units" ON units;
CREATE POLICY "Admin manage units" ON units FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. TABLA CONTENTS (Contenidos)
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public contents view" ON contents;
CREATE POLICY "Public contents view" ON contents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage contents" ON contents;
CREATE POLICY "Admin manage contents" ON contents FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. STORAGE (Archivos)
INSERT INTO storage.buckets (id, name, public) VALUES ('module_assets', 'module_assets', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'module_assets');

DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'module_assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'module_assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'module_assets' AND public.is_admin());
