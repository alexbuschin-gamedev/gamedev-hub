# GameDev Hub — Setup Anleitung

Eine Team-Plattform für euer episodisches Spiel-Projekt.  
Login-System · Kalender · Roadmap · Rollen-Verwaltung

---

## Schritt 1 — Supabase Projekt erstellen

1. Gehe auf **https://supabase.com** → kostenlos registrieren
2. Klicke **"New project"** → Name: `gamedev-hub`
3. Warte bis das Projekt bereit ist (~2 Minuten)

## Schritt 2 — Datenbank einrichten

1. Im Supabase-Dashboard → **"SQL Editor"** öffnen
2. Inhalt der Datei `supabase_setup.sql` komplett reinkopieren
3. Auf **"Run"** klicken → alle Tabellen und Regeln werden erstellt

## Schritt 3 — API-Keys kopieren

1. Im Supabase-Dashboard → **"Settings"** → **"API"**
2. Kopiere:
   - **Project URL** (z.B. `https://abc123.supabase.co`)
   - **anon public key** (der lange JWT-Token)

## Schritt 4 — .env Datei erstellen

```bash
cp .env.example .env
```

Öffne `.env` und fülle deine Daten ein:
```
VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=DEIN-ANON-KEY
```

## Schritt 5 — Ersten Admin-Nutzer erstellen

1. Im Supabase-Dashboard → **"Authentication"** → **"Users"**
2. Klicke **"Add user"** → E-Mail + Passwort eingeben
3. Danach im **"SQL Editor"** ausführen:
```sql
update public.profiles 
set role = 'admin', full_name = 'Dein Name'
where email = 'deine@email.de';
```

## Schritt 6 — Lokal starten

```bash
npm install
npm run dev
```

Öffne http://localhost:5173 → anmelden mit dem Admin-Account.

## Schritt 7 — Team-Mitglieder erstellen

1. Als Admin anmelden
2. Linke Sidebar → **"Admin"**
3. Nutzer mit E-Mail, Passwort und Rolle erstellen
4. Zugangsdaten per Discord/Signal an dein Team schicken

## Schritt 8 — Auf Vercel deployen (kostenlos)

```bash
npm install -g vercel
vercel
```

Oder: Auf **vercel.com** → "Import Git Repository" → Repo verbinden  
→ Environment Variables (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) setzen  
→ Deploy!

---

## Rollen-Übersicht

| Aktion | Admin | Team | Gast |
|--------|-------|------|------|
| Kalender ansehen | ✓ | ✓ | ✓ |
| Termine kommentieren | ✓ | ✓ | ✓ |
| Termine erstellen | ✓ | ✓ | – |
| Termine vorschlagen | ✓ | ✓ | ✓ |
| Vorschläge bestätigen | ✓ | – | – |
| Nutzer erstellen | ✓ | – | – |
| Rollen ändern | ✓ | – | – |

---

## Projektstruktur

```
src/
├── components/
│   ├── Layout.jsx       — Haupt-Layout mit Sidebar
│   ├── Sidebar.jsx      — Navigation & User-Profil
│   └── EventModal.jsx   — Termin erstellen/bearbeiten
├── hooks/
│   └── useAuth.jsx      — Auth Context & Session
├── lib/
│   └── supabase.js      — Supabase Client & Konstanten
├── pages/
│   ├── Login.jsx        — Anmeldeseite
│   ├── Dashboard.jsx    — Übersicht
│   ├── Calendar.jsx     — Monatskalender
│   ├── Roadmap.jsx      — Projektphasen
│   ├── Members.jsx      — Team-Übersicht
│   └── Admin.jsx        — Nutzer erstellen (Admin only)
└── index.css            — Globale Styles
```
