-- ESQUEMA COMPLETO DE BASE DE DATOS PARA DAW-HUB
-- Ejecuta este script todo junto en el Editor SQL de Supabase para configurar tu nueva base de datos.
-- Incluye tablas, seguridad (RLS), funciones y almacenamiento.

-- 1. TABLA: PROFILES (Perfiles de Usuario)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table profiles enable row level security;

-- 2. TABLA: MODULES (Módulos)
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  icon text, -- Nombre del icono de LucideReact
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table modules enable row level security;

-- 3. TABLA: UNITS (Unidades/Temas dentro de Módulos)
create table public.units (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table units enable row level security;

-- 4. TABLA: CONTENTS (Contenido real: texto, quiz, vídeo...)
create table public.contents (
  id uuid default gen_random_uuid() primary key,
  unit_id uuid references public.units(id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('markdown', 'quiz', 'video')),
  data jsonb default '{}'::jsonb, -- Contenido del markdown o preguntas del quiz
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table contents enable row level security;

-- 5. TABLA: USER_PROGRESS (Progreso del alumno)
create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.contents(id) on delete cascade not null,
  completed boolean default false,
  score numeric, -- Nota (0-10) si es un quiz
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, content_id)
);
alter table user_progress enable row level security;

-- 6. FUNCIÓN HELPER: IS_ADMIN
-- Verifica si el usuario actual es admin
create or replace function public.is_admin() returns boolean as $$
begin
  return exists ( select 1 from public.profiles where id = auth.uid() and role = 'admin' );
end;
$$ language plpgsql security definer;

-- 7. POLÍTICAS DE SEGURIDAD (RLS)

-- Profiles
create policy "Public profiles view" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
-- Trigger para crear profile automágicamente al registrarse
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student');
  return new;
end;
$$ language plpgsql security definer;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Modules
create policy "Public modules view" on modules for select using (true);
create policy "Admin manage modules" on modules for all using (public.is_admin()) with check (public.is_admin());

-- Units
create policy "Public units view" on units for select using (true);
create policy "Admin manage units" on units for all using (public.is_admin()) with check (public.is_admin());

-- Contents
create policy "Public contents view" on contents for select using (true);
create policy "Admin manage contents" on contents for all using (public.is_admin()) with check (public.is_admin());

-- User Progress
create policy "Users view own progress" on user_progress for select using (auth.uid() = user_id);
create policy "Users manage own progress" on user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 8. ALMACENAMIENTO (Storage)
insert into storage.buckets (id, name, public) values ('module_assets', 'module_assets', true) on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using (bucket_id = 'module_assets');
create policy "Admin Upload" on storage.objects for insert with check (bucket_id = 'module_assets' and public.is_admin());
create policy "Admin Update" on storage.objects for update using (bucket_id = 'module_assets' and public.is_admin());
create policy "Admin Delete" on storage.objects for delete using (bucket_id = 'module_assets' and public.is_admin());

-- FINALIZADO
