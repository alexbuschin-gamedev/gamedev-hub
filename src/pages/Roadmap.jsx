import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'

const PHASES = [
  {
    id: 0, name: 'Vorbereitung & Lernen', months: 'Monat 1–2', color: '#9b9792',
    icon: '📚', duration: '2 Monate',
    tasks: [
      { cat: 'Engine',  text: 'UE5 installieren & UI kennenlernen' },
      { cat: 'Lernen',  text: 'Blueprint-Kurs (Unreal Sensei)' },
      { cat: 'Konzept', text: 'Spielidee & Charaktere dokumentieren' },
      { cat: 'Tool',    text: 'Twine / Articy für Handlungsstränge' },
      { cat: 'Tech',    text: 'Git Versionskontrolle einrichten' },
    ],
    milestone: 'Blueprint-Prototyp: Eine Tür öffnet sich durch Entscheidung',
    deliverable: 'Erstes spielbares Blueprint-Experiment',
  },
  {
    id: 1, name: 'Prototyp & Core-Systeme', months: 'Monat 3–5', color: '#1D9E75',
    icon: '⚙️', duration: '3 Monate',
    tasks: [
      { cat: 'Code',   text: 'Entscheidungssystem als Blueprint-Baum' },
      { cat: 'Code',   text: 'Save / Load-System' },
      { cat: 'Code',   text: 'Variablen-Tracking (Beziehungen, Moral)' },
      { cat: 'Design', text: '1 spielbarer Raum mit Atmosphäre' },
      { cat: 'Story',  text: 'Dialog-Szene mit 2 Ausgängen' },
    ],
    milestone: 'Vertical Slice — 10 Min. Spielzeit, 2 Enden, Save funktioniert',
    deliverable: 'Spielbarer Prototyp für interne Tests',
  },
  {
    id: 2, name: 'Episode 1 vollständig', months: 'Monat 6–10', color: '#185FA5',
    icon: '🎬', duration: '5 Monate',
    tasks: [
      { cat: 'Story',  text: '5–8 Szenen, 3–4 Handlungsstränge' },
      { cat: 'Code',   text: 'Cutscene-System (UE5 Sequencer)' },
      { cat: 'Art',    text: 'Charaktere via MetaHuman' },
      { cat: 'Audio',  text: 'Musik, Atmosphären-Sound, Voice Acting' },
      { cat: 'QA',     text: 'Playtesting aller Pfade' },
    ],
    milestone: 'Episode 1 fertig — 45–90 Min. Spielzeit, poliert',
    deliverable: 'Fertige Episode 1 für Early-Access oder Feedback',
  },
  {
    id: 3, name: 'Episode 2 & Konsequenzen', months: 'Monat 11–16', color: '#BA7517',
    icon: '🔀', duration: '6 Monate',
    tasks: [
      { cat: 'Code',   text: 'Konsequenz-System: Ep.1 → Ep.2' },
      { cat: 'Story',  text: 'Episode 2 schreiben & einbauen' },
      { cat: 'Design', text: '3+ neue Locations' },
      { cat: 'Tech',   text: 'Performance & Level-Streaming' },
      { cat: 'QA',     text: 'Cross-Episode Playtesting' },
    ],
    milestone: 'Episode 2 fertig — Entscheidungen aus Ep.1 wirken sich spürbar aus',
    deliverable: 'Vollständige zweite Episode mit verzweigter Story',
  },
  {
    id: 4, name: 'Finale & Release', months: 'Monat 17–22', color: '#b94a2c',
    icon: '🚀', duration: '6 Monate',
    tasks: [
      { cat: 'Story',     text: '3–5 verschiedene Enden' },
      { cat: 'Marketing', text: 'Steam-Seite, Screenshots, Trailer' },
      { cat: 'QA',        text: 'Beta-Test mit externen Spielern' },
      { cat: 'Release',   text: 'Presskit & Social Media' },
      { cat: 'Release',   text: 'Launch auf Steam / Itch.io' },
    ],
    milestone: '🚀 Veröffentlichung auf Steam / Itch.io',
    deliverable: 'Veröffentlichtes episodisches Spiel',
  },
]

const CAT_COLORS = {
  Engine: { bg: 'rgba(108,99,255,0.12)', color: '#8b85ff' },
  Lernen: { bg: 'rgba(108,99,255,0.12)', color: '#8b85ff' },
  Konzept: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Tool: { bg: 'rgba(62,207,142,0.1)', color: '#3ecf8e' },
  Tech: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
  Code: { bg: 'rgba(108,99,255,0.12)', color: '#8b85ff' },
  Design: { bg: 'rgba(62,207,142,0.1)', color: '#3ecf8e' },
  Story: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Art: { bg: 'rgba(236,72,153,0.1)', color: '#f472b6' },
  Audio: { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
  QA: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  Marketing: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Release: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
}

export default function Roadmap() {
  const [activePhase, setActivePhase] = useState(0)
  const [events, setEvents] = useState([])
  const phase = PHASES[activePhase]

  useEffect(() => {
    supabase.from('events').select('*').order('date').then(({ data }) => setEvents(data || []))
  }, [])

  const totalMonths = 22
  const phaseWidths = [2, 3, 5, 6, 6]

  return (
    <Layout>
      <div style={{ padding: '32px 36px', maxWidth: '1100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', marginBottom: '5px' }}>Roadmap</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
            Episodisches Entscheidungsspiel · 5 Phasen · ~22 Monate
          </p>
        </div>

        {/* Gantt-style timeline */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '16px' }}>
            Zeitplan
          </div>

          {/* Month ruler */}
          <div style={{ display: 'flex', marginBottom: '12px', paddingLeft: '160px' }}>
            {Array.from({ length: 11 }, (_, i) => i * 2 + 1).map(m => (
              <div key={m} style={{ flex: 2, fontSize: '10px', color: 'var(--text3)', textAlign: 'left' }}>
                M{m}
              </div>
            ))}
          </div>

          {/* Phase rows */}
          {PHASES.map((p, i) => {
            const startMonth = phaseWidths.slice(0, i).reduce((a, b) => a + b, 0)
            const leftPct = (startMonth / totalMonths) * 100
            const widthPct = (phaseWidths[i] / totalMonths) * 100
            const isActive = activePhase === i

            return (
              <button key={p.id} onClick={() => setActivePhase(i)}
                style={{ display: 'flex', alignItems: 'center', width: '100%', background: isActive ? 'var(--bg3)' : 'transparent', border: 'none', borderRadius: '8px', padding: '7px 8px', cursor: 'pointer', marginBottom: '4px', transition: 'background .15s', textAlign: 'left' }}>
                {/* Label */}
                <div style={{ width: '152px', flexShrink: 0, paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text)' : 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Phase {i} — {p.icon}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', paddingLeft: '15px', marginTop: '1px' }}>{p.months}</div>
                </div>

                {/* Bar track */}
                <div style={{ flex: 1, height: '28px', position: 'relative', background: 'var(--bg4)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`, height: '100%',
                    background: isActive ? p.color : `${p.color}80`,
                    borderRadius: '6px', transition: 'background .2s',
                    display: 'flex', alignItems: 'center', paddingLeft: '10px',
                  }}>
                    <span style={{ fontSize: '11px', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: isActive ? 1 : 0.85 }}>
                      {p.name}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Phase detail — full width */}
        <div className="fade-in" key={activePhase} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

          {/* Left: Tasks */}
          <div>
            <div className="card" style={{ marginBottom: '14px' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{phase.icon}</span>
                <div>
                  <h2 style={{ fontSize: '16px', marginBottom: '2px' }}>Phase {activePhase} — {phase.name}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{phase.months} · {phase.duration}</span>
                </div>
              </div>
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {phase.tasks.map((t, i) => {
                  const style = CAT_COLORS[t.cat] || { bg: 'var(--bg4)', color: 'var(--text3)' }
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '1px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600, width: '14px', textAlign: 'right' }}>{i + 1}</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '99px', background: style.bg, color: style.color, whiteSpace: 'nowrap' }}>{t.cat}</span>
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5, paddingTop: '1px' }}>{t.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Milestone */}
            <div style={{ background: `${phase.color}12`, border: `1px solid ${phase.color}35`, borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: phase.color, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '7px' }}>🎯 Meilenstein</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{phase.milestone}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{phase.deliverable}</div>
            </div>
          </div>

          {/* Right: All phases overview + progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Phase list */}
            <div className="card">
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Alle Phasen</h3>
              </div>
              {PHASES.map((p, i) => (
                <button key={p.id} onClick={() => setActivePhase(i)}
                  style={{ width: '100%', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '14px', background: activePhase === i ? `${p.color}0e` : 'transparent', border: 'none', borderBottom: i < PHASES.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: activePhase === i ? `${p.color}25` : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, transition: 'background .15s' }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: activePhase === i ? 600 : 400, color: activePhase === i ? 'var(--text)' : 'var(--text2)', marginBottom: '2px' }}>
                      Phase {i} — {p.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{p.months} · {p.tasks.length} Aufgaben</div>
                  </div>
                  {activePhase === i && (
                    <div style={{ width: '4px', height: '24px', borderRadius: '99px', background: p.color, flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="card card-pad">
              <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '14px' }}>Gesamtfortschritt</h3>

              {/* Segmented bar */}
              <div style={{ display: 'flex', gap: '3px', height: '10px', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                {PHASES.map((p, i) => (
                  <div key={i} style={{
                    flex: phaseWidths[i],
                    background: i < activePhase ? p.color : i === activePhase ? p.color : 'var(--bg4)',
                    opacity: i < activePhase ? 0.5 : i === activePhase ? 1 : 1,
                    transition: 'background .3s',
                  }} />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', marginBottom: '16px' }}>
                <span>Phase {activePhase + 1} von 5 aktiv</span>
                <span>~{phaseWidths.slice(0, activePhase).reduce((a, b) => a + b, 0)} / {totalMonths} Monate</span>
              </div>

              {/* Phase dots */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '9px', left: '9px', right: '9px', height: '2px', background: 'var(--bg4)', zIndex: 0 }} />
                {PHASES.map((p, i) => (
                  <div key={i} onClick={() => setActivePhase(i)}
                    style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: i <= activePhase ? p.color : 'var(--bg4)',
                      border: `2px solid ${i === activePhase ? p.color : 'transparent'}`,
                      boxShadow: i === activePhase ? `0 0 0 3px ${p.color}30` : 'none',
                      transition: 'all .2s',
                    }} />
                    <span style={{ fontSize: '10px', color: i === activePhase ? 'var(--text)' : 'var(--text3)', fontWeight: i === activePhase ? 600 : 400 }}>{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
