-- 0. Asegurar que la función is_admin() existe
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar seguridad RL en tablas
ALTER TABLE IF EXISTS units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contents ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA UNITS (Unidades) --

DROP POLICY IF EXISTS "Units authed view" ON units;
DROP POLICY IF EXISTS "Units admin all" ON units;
DROP POLICY IF EXISTS "Public view units" ON units;
DROP POLICY IF EXISTS "Admin manage units" ON units;

-- 1. Todo el mundo puede VER las unidades
CREATE POLICY "Public view units" ON units FOR SELECT USING (true);

-- 2. Solo ADMINS pueden insertar/editar/borrar
CREATE POLICY "Admin manage units" ON units FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- POLÍTICAS PARA CONTENTS (Lecciones/Contenidos) --

DROP POLICY IF EXISTS "Contents authed view" ON contents;
DROP POLICY IF EXISTS "Contents admin all" ON contents;
DROP POLICY IF EXISTS "Public view contents" ON contents;
DROP POLICY IF EXISTS "Admin manage contents" ON contents;

-- 1. Todo el mundo puede VER los contenidos
CREATE POLICY "Public view contents" ON contents FOR SELECT USING (true);

-- 2. Solo ADMINS pueden insertar/editar/borrar
CREATE POLICY "Admin manage contents" ON contents FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
