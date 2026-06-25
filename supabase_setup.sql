-- ============================================================
-- GameDev Hub — Supabase Setup
-- Dieses Script einmal im Supabase SQL Editor ausführen
-- ============================================================

-- 1. Profiles Tabelle
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'member' check (role in ('admin', 'member', 'guest')),
  created_at timestamptz default now()
);

-- 2. Events Tabelle
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date date not null,
  time text default '10:00',
  tag text default 'general' check (tag in ('code', 'design', 'story', 'art', 'audio', 'release', 'general')),
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  phase_id integer,
  created_at timestamptz default now()
);

-- 3. Row Level Security aktivieren
alter table public.profiles enable row level security;
alter table public.events enable row level security;

-- 4. Profiles Policies
create policy "Profiles lesbar für alle authentifizierten Nutzer"
  on public.profiles for select using (auth.role() = 'authenticated');

create policy "Nutzer kann eigenes Profil updaten"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins können alle Profile updaten"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 5. Events Policies
create policy "Events lesbar für alle authentifizierten Nutzer"
  on public.events for select using (auth.role() = 'authenticated');

create policy "Member und Admin können Events erstellen"
  on public.events for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'member'))
    or (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'guest')
      and status = 'pending'
    )
  );

create policy "Admin kann alle Events updaten"
  on public.events for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Member kann eigene Events updaten"
  on public.events for update using (
    created_by = auth.uid()
  );

create policy "Admin kann Events löschen"
  on public.events for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. Trigger: Profil automatisch bei Registrierung erstellen
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Beispiel-Termine einfügen (optional)
-- insert into public.events (title, date, time, tag, status, description) values
--   ('Kickoff-Meeting', current_date + 1, '10:00', 'general', 'confirmed', 'Erstes Team-Meeting'),
--   ('UE5 Setup', current_date + 3, '14:00', 'code', 'confirmed', 'Engine installieren und einrichten'),
--   ('Story-Brainstorming', current_date + 7, '15:00', 'story', 'confirmed', 'Charaktere und Entscheidungsbäume planen');

-- ============================================================
-- FERTIG! Jetzt .env Datei mit deinen Supabase-Daten befüllen.
-- ============================================================
