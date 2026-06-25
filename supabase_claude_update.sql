-- GameDev Hub — Claude AI Erweiterung
-- Im Supabase SQL Editor ausführen

-- 1. Spielstand-Tabelle
create table if not exists public.game_status (
  id uuid default gen_random_uuid() primary key,
  phase integer default 0,
  phase_name text default 'Phase 0 — Vorbereitung',
  current_focus text default '',
  progress_notes text default '',
  blockers text default '',
  next_steps text default '',
  updated_by text default 'claude',
  updated_at timestamptz default now()
);

-- 2. KI-Chat-Verlauf
create table if not exists public.ai_messages (
  id uuid default gen_random_uuid() primary key,
  role text check (role in ('user', 'assistant')),
  content text not null,
  author_name text,
  created_at timestamptz default now()
);

-- 3. RLS für beide Tabellen
alter table public.game_status enable row level security;
alter table public.ai_messages enable row level security;

create policy "game_status lesbar für alle"
  on public.game_status for select using (auth.role() = 'authenticated');

create policy "game_status schreibbar für alle"
  on public.game_status for all using (auth.role() = 'authenticated');

create policy "ai_messages lesbar für alle"
  on public.ai_messages for select using (auth.role() = 'authenticated');

create policy "ai_messages schreibbar für alle"
  on public.ai_messages for insert with check (auth.role() = 'authenticated');

-- 4. Initialen Spielstand einfügen
insert into public.game_status (phase, phase_name, current_focus, progress_notes, next_steps)
values (
  0,
  'Phase 0 — Vorbereitung & Lernen',
  'Projekt-Setup und Lernphase',
  'Projekt gestartet. Team-Hub eingerichtet. Supabase-Datenbank läuft.',
  'UE5 installieren, ersten Blueprint-Kurs beginnen, Spielkonzept dokumentieren.'
)
on conflict do nothing;

