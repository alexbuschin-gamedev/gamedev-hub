# PROJEKT.md — GameDev Hub Gedächtnis
> Diese Datei wird von Claude nach jeder Session aktualisiert.
> Zu Beginn jeder neuen Session: Diese Datei Claude zeigen — er ist dann sofort auf dem aktuellen Stand.

---

## 🎮 Das Spiel

**Genre:** Episodisches Entscheidungsspiel
**Stil:** Heavy Rain / Until Dawn
**Engine:** Unreal Engine 5 + Blueprints
**Plattform:** PC (Steam / Itch.io)
**Zeitplan:** ~22 Monate, 5 Phasen
**Aktueller Stand:** Phase 0 — Vorbereitung & Lernen

---

## 👥 Das Team

| Name | Rolle | Rechte |
|------|-------|--------|
| ElBarto1337 | Game Director + Programmer | Admin |
| Dokuro | Artist / Level Designer | Admin |
| Claude (KI) | Assistent, Planung, Code, Story | Fest eingebunden |

**Wichtig:** Claude ist fester Bestandteil der Planung — nicht nur ein Tool.

---

## 🌐 Infrastruktur

| Was | Wo |
|-----|----|
| Web-App (GameDev Hub) | https://gamedev-hub-liart.vercel.app |
| GitHub Repository | https://github.com/alexbuschin-gamedev/gamedev-hub |
| Datenbank | Supabase — https://cdbusassekgdyjqdjhml.supabase.co |
| Hosting | Vercel (kostenlos) |
| Deploy-Befehl | `vercel --prod` im Terminal |
| Projektordner lokal | `C:\Users\Alex\Desktop\h9rfdx556ti1\gamedev-hub` |

**Deploy-Workflow:**
```cmd
git add -A
git commit -m "Beschreibung"
git push
vercel --prod
```

---

## 🗃️ Supabase Tabellen (bereits angelegt)

- `profiles` — Nutzer & Rollen
- `events` — Kalender-Termine
- `ai_messages` — KI-Assistent Chat-Verlauf
- `game_status` — Aktueller Spielstand (KI-Assistent)
- `characters` — Wiki: Charaktere
- `story_paths` — Wiki: Storypfade
- `locations` — Wiki: Spielorte
- `scenes` — Wiki: Szenensequenzen
- `phase_notes` — Wiki: Phasennotizen
- `notification_prefs` — Email-Benachrichtigungseinstellungen

---

## 🧠 Core Design-Prinzipien
> Diese Prinzipien gelten für ALLE zukünftigen Story- und Design-Entscheidungen.

### Das Drei-Pfad-System (FUNDAMENTAL)
Jede Hauptentscheidung hat genau drei Pfade:
- 🔴 **Pfad A — Impulsiv:** Sofortiges Handeln, hohes Risiko, schnelles Tempo
- 🔵 **Pfad B — Rational:** Recherche, Planung, langsameres Tempo, tiefere Einblicke
- ⚪ **Pfad C — Realistisch:** Der "vernünftige" Weg (z.B. Behörden), vollwertig, nicht bestraft

### Hard-Force Mechanic (CORE)
- Klare Richtungsentscheidungen schließen spätere Optionen **dauerhaft**
- Wer Pfad A einschlägt, kann Pfad C nicht mehr wählen
- Verhindert dass Spieler alle Pfade "sammeln"

### Davids Innere Stimme (CORE)
- Meldet sich **ausschließlich in ruhigen Momenten** (keine unmittelbare Gefahr)
- Beeinflusst den Spieler, zwingt aber nicht
- In Drucksituationen: David ist fokussiert, aktionsorientiert (fast Actionfilm-Modus)
- In Ruhe: David hadert, zweifelt, ändert Meinung im Kopf
- Dieser Kontrast macht ihn **menschlich und unvorhersehbar**

### Entscheidungen nicht vorhersehbar & nicht repetitiv
- Situationen sollen sich frisch anfühlen
- Keine erkennbaren Muster die der Spieler "durchschaut"

### Emotionale Fallhöhe
- Vor jedem großen negativen Wendepunkt kommt ein positiver Moment
- Spieler soll sich fast schuldig fühlen dass er David den Glücksmoment gegönnt hat

---

## 👤 Hauptcharakter: David

| Eigenschaft | Detail |
|-------------|--------|
| Beruf | Hausmeister in einer großen Tech- / AI-Firma |
| Schicht | Mittelschicht, bodenständig |
| Schwäche | Wird im Alltag schnell müde, unterschwellige Melancholie |
| Stärke | Hochkonzentriert unter Druck, zielstrebig wenn nötig |
| Unter Druck | Fokussierter Aktionsmodus — fast wie Actionfilm |
| In Ruhe | Hadert mit sich, innere Zweifel, spontane Sinneswandel |
| Emotionaler Anker | Haustier (kann als Schicksalsschlag verloren werden) |
| Traum | Jahrelang gespartes Geld für einen großen Traum |
| Avatar-Farbe | Dunkelblau (#3b5bdb) |

**Wichtig:** David ist **nicht perfekt**. Er ist authentisch und nachvollziehbar — der Spieler soll sofort eine Bindung aufbauen.

---

## 📖 Story-Übersicht

### Prolog
- Davids Alltag: Morgenroutine, Arbeit, fester Tagesablauf
- Alles steht immer am gleichen Platz
- Einführung des Entscheidungssystems mit kleinen Stakes
  - Kleidungswahl (kein Story-Impact, aber visuelles Detail durch ganzes Spiel)
  - Innere Stimme: "Soll ich heute was anderes essen? — Ne, lieber nicht"
- Musik: Melancholisch, driftet in Traurigkeit
- Spielorte: Davids Wohnung + NovaTech Gebäude

### Episode 1: "Der Einbruch"
**Doppeldeutigkeit des Titels:**
- Einbruch in seine Wohnung
- Einbruch seines Lebens das zum Scherbenhaufen wird

**Struktur:**
1. Prolog (Alltag, Routine)
2. **Unerwarteter Glücksmoment** kurz vor dem Einbruch — emotionale Fallhöhe
3. David kommt nach Hause — Wohnung verwüstet, Ersparnisse weg, Haustier tot
4. Hinweis auf Täter (kleiner Fisch einer Kriminellen-Bande, auf eigene Faust)
5. **Erste große Entscheidung — drei Pfade:**
   - 🔴 Impulsiv: Sofort handeln, direkt zum Täter
   - 🔵 Rational: Recherchieren, Informationen sammeln
   - ⚪ Realistisch: Behörden einschalten (System lässt ihn später im Stich)

### Weiterer Plot
- David arbeitet sich durch die Hierarchie einer Kriminellen-Bande bis zum Big Boss
- Permanente Konsequenzen: Verlust von Arm, Auge oder Zunge möglich — beeinflusst Gameplay UND Story
- Keine Quick-Time-Events

---

## 🗺️ Spielorte (bisher)

| Ort | Typ | Phase | Rolle |
|-----|-----|-------|-------|
| Davids Wohnung | Innen | 0 | Prolog + Tatort Einbruch |
| NovaTech Gebäude | Innen/Öffentlich | 0 | Arbeitsplatz, David ist "unsichtbar" |

---

## 🎬 Szenensequenzen (bisher)

| # | Titel | Typ | Ort |
|---|-------|-----|-----|
| 1 | Morgenroutine — Ein Tag wie jeder andere | Intro | Davids Wohnung |
| 2 | Der Weg zur Arbeit — Unsichtbar | Ruhig | NovaTech Gebäude |
| 3 | TBD — Unerwarteter Glücksmoment | Wendepunkt | TBD |
| 4 | TBD — Der Einbruch | Wendepunkt | Davids Wohnung |

---

## 💻 Technischer Stand der Web-App

### Fertige Features
- ✅ Login-System (Admin erstellt Accounts, kein öffentliches Register)
- ✅ Dashboard mit Übersicht
- ✅ Kalender mit Monatsansicht (größere Kacheln, Timezone-Fix)
- ✅ Email-Benachrichtigungen (Einstellungen pro Nutzer, 🔔 Button im Kalender)
- ✅ Roadmap mit Gantt-Diagramm (5 Phasen, interaktiv)
- ✅ Wiki mit 5 Reitern: Charaktere, Storypfade, Spielorte, Szenensequenzen, Phasennotizen
- ✅ KI-Assistent (Claude als Teammitglied, liest & updated Spielstand)
- ✅ Team-Verwaltung mit Rollen (Admin / Member / Gast)
- ✅ Admin-Bereich (Nutzer erstellen)
- ✅ Rollen-System: Gäste können nur ansehen & vorschlagen

### Bekannte Eigenheiten
- Deploy läuft über `vercel --prod` direkt, nicht über GitHub Auto-Deploy
- `.env` Datei ist lokal, nicht auf GitHub (bewusst, Sicherheit)
- Neue Dateien müssen lokal erstellt und dann gepusht werden

---

## 📋 Offene TODOs

- [ ] Szene 3: Unerwarteter Glücksmoment ausarbeiten
- [ ] Szene 4: "Der Einbruch" detailliert ausschreiben
- [ ] Zweiten Charakter definieren (Bester Freund / weiterer NPC)
- [ ] UE5 installieren (Phase 0 Start)
- [ ] Ersten Blueprint-Kurs beginnen
- [ ] Anthropic API Key Kosten im Blick behalten

---

## 📌 Wichtige Entscheidungen & Notizen

- **Dokuro** hat Fragen zu draw.io (Flowcharts) und API-Integration gestellt — beide beantwortet
- **Kleidungswahl** in Prolog: kein Story-Impact aber visuelles Detail durch ganzes Spiel
- **Haustier** ist zentraler emotionaler Anker — Tod beim Einbruch optional/fix noch offen
- **Musik** Prolog: Melancholisch, driftet in Traurigkeit — keine konkreten Tracks noch
- **NovaTech** als Firmenname festgelegt (vorläufig)
- **David trägt seinen Traum buchstäblich bei sich** — ausgeschnittenes Bild in der Jackentasche

---

## 🔄 Session-Log

| Datum | Was wurde gemacht |
|-------|------------------|
| 25.06.2026 | Hub aufgesetzt, Supabase, Vercel Deploy, Wiki mit 5 Reitern, KI-Assistent, Kalender-Fix, David etabliert, Episode 1 Struktur, Spielorte & Szenen 1-2 |

---

> **Für Claude:** Diese Datei nach jeder Session mit neuen Fortschritten, Entscheidungen und TODOs aktualisieren. Besonders: neue Design-Entscheidungen unter "Core Design-Prinzipien", neue Charaktere/Orte/Szenen in die jeweiligen Tabellen, und den Session-Log ergänzen.
