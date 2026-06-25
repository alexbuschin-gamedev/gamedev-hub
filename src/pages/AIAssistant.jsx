import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const PHASE_NAMES = [
  'Phase 0 — Vorbereitung & Lernen',
  'Phase 1 — Prototyp & Core-Systeme',
  'Phase 2 — Episode 1 vollständig',
  'Phase 3 — Episode 2 & Konsequenzen',
  'Phase 4 — Finales Ende & Release',
]

const SYSTEM_PROMPT = `Du bist Claude, KI-Assistent und offizielles Teammitglied des GameDev-Teams. Ihr entwickelt gemeinsam ein episodisches Entscheidungsspiel (ähnlich Heavy Rain / Until Dawn) mit Unreal Engine 5.

Du hast Zugriff auf den aktuellen Projektstand und kannst ihn aktualisieren. Antworte immer auf Deutsch, präzise und als echter Kollege — nicht förmlich, nicht übertrieben enthusiastisch.

Wenn du den Spielstand updaten möchtest, antworte mit einem JSON-Block am Ende deiner Nachricht in diesem exakten Format:
<status_update>
{
  "phase": 0,
  "phase_name": "Phase 0 — Vorbereitung & Lernen",
  "current_focus": "Was gerade im Fokus steht",
  "progress_notes": "Was bisher erreicht wurde",
  "blockers": "Was blockiert oder unklar ist (leer lassen wenn nichts)",
  "next_steps": "Was als nächstes ansteht"
}
</status_update>

Füge diesen Block NUR hinzu wenn du tatsächlich den Stand updaten willst, z.B. nach konkreten Fortschritts-Meldungen vom Team. Bei normalen Fragen oder Diskussionen lass ihn weg.`

export default function AIAssistant() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [gameStatus, setGameStatus] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusId, setStatusId] = useState(null)
  const [editingStatus, setEditingStatus] = useState(false)
  const [editForm, setEditForm] = useState({})
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { loadData() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadData() {
    const [{ data: msgs }, { data: status }] = await Promise.all([
      supabase.from('ai_messages').select('*').order('created_at').limit(100),
      supabase.from('game_status').select('*').order('updated_at', { ascending: false }).limit(1),
    ])
    setMessages(msgs || [])
    if (status?.[0]) {
      setGameStatus(status[0])
      setStatusId(status[0].id)
    }
  }

  async function saveMessage(role, content, author_name) {
    const { data } = await supabase.from('ai_messages').insert({ role, content, author_name }).select().single()
    return data
  }

  async function updateGameStatus(update) {
    setStatusLoading(true)
    const payload = { ...update, updated_by: 'claude', updated_at: new Date().toISOString() }
    if (statusId) {
      const { data } = await supabase.from('game_status').update(payload).eq('id', statusId).select().single()
      setGameStatus(data)
    } else {
      const { data } = await supabase.from('game_status').insert(payload).select().single()
      setGameStatus(data)
      setStatusId(data.id)
    }
    setStatusLoading(false)
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: userText, author_name: profile?.full_name || profile?.email }
    setMessages(prev => [...prev, { ...userMsg, id: 'tmp-' + Date.now(), created_at: new Date().toISOString() }])
    await saveMessage('user', userText, profile?.full_name || profile?.email)

    // Build context
    const statusContext = gameStatus ? `
Aktueller Projektstand:
- Phase: ${gameStatus.phase} — ${gameStatus.phase_name}
- Fokus: ${gameStatus.current_focus}
- Fortschritt: ${gameStatus.progress_notes}
- Blocker: ${gameStatus.blockers || 'keine'}
- Nächste Schritte: ${gameStatus.next_steps}
- Zuletzt aktualisiert: ${format(parseISO(gameStatus.updated_at), 'dd. MMMM yyyy, HH:mm', { locale: de })} von ${gameStatus.updated_by}
` : 'Noch kein Projektstand erfasst.'

    const historyForAPI = messages.slice(-12).map(m => ({ role: m.role, content: m.content }))
    historyForAPI.push({ role: 'user', content: `[Projektkontext]\n${statusContext}\n\n[Nachricht von ${profile?.full_name || 'Teammitglied'}]\n${userText}` })

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: historyForAPI,
        }),
      })
      const data = await response.json()
      const fullText = data.content?.map(b => b.text || '').join('') || 'Fehler beim Antworten.'

      // Parse status update if present
      const updateMatch = fullText.match(/<status_update>([\s\S]*?)<\/status_update>/)
      let displayText = fullText.replace(/<status_update>[\s\S]*?<\/status_update>/, '').trim()

      if (updateMatch) {
        try {
          const update = JSON.parse(updateMatch[1].trim())
          await updateGameStatus(update)
          displayText += '\n\n✅ *Spielstand wurde aktualisiert.*'
        } catch (err) {
          console.error('Status parse error', err)
        }
      }

      setMessages(prev => [...prev.filter(m => !m.id?.startsWith('tmp-')), { role: 'assistant', content: displayText, id: 'ai-' + Date.now(), created_at: new Date().toISOString() }])
      await saveMessage('assistant', displayText, 'Claude')
    } catch (err) {
      const errMsg = 'Verbindungsfehler. Bitte Anthropic API Key in der .env prüfen.'
      setMessages(prev => [...prev.filter(m => !m.id?.startsWith('tmp-')), { role: 'assistant', content: errMsg, id: 'err-' + Date.now(), created_at: new Date().toISOString() }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  async function handleManualStatusSave() {
    await updateGameStatus(editForm)
    setEditingStatus(false)
  }

  const phaseColor = ['#888780', '#1D9E75', '#185FA5', '#BA7517', '#993C1D'][gameStatus?.phase ?? 0]

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', height: '100vh', overflow: 'hidden' }}>

        {/* Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          {/* Chat header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Claude — KI-Assistent</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Teammitglied · kann Spielstand lesen & updaten</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="scrollbar">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>👾</div>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>Hallo Team!</div>
                <div style={{ color: 'var(--text2)', fontSize: '13px', maxWidth: '380px', margin: '0 auto' }}>
                  Ich bin Claude, euer KI-Teammitglied. Ich behalte den Überblick über den Spielstand, beantworte Fragen und kann den Projektstatus direkt aktualisieren.
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {[
                    'Wie ist der aktuelle Projektstand?',
                    'Was sollten wir als nächstes angehen?',
                    'Wir haben heute den Prototyp fertiggestellt!',
                    'Welche UE5 Blueprints brauchen wir für das Entscheidungssystem?',
                  ].map(s => (
                    <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }}
                      style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '99px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isAI = msg.role === 'assistant'
              return (
                <div key={msg.id || i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: isAI ? 'var(--accent-bg)' : 'var(--bg3)', border: `1px solid ${isAI ? 'var(--accent-border)' : 'var(--border)'}` }}>
                    {isAI ? '🤖' : (profile?.full_name?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{isAI ? 'Claude' : (msg.author_name || 'Du')}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                        {msg.created_at ? format(parseISO(msg.created_at), 'HH:mm') : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--text2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>🤖</div>
                <div style={{ paddingTop: '6px', display: 'flex', gap: '4px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent2)', animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', flexShrink: 0 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Schreib Claude eine Nachricht…" style={{ flex: 1 }} disabled={loading} />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Senden
            </button>
          </form>
        </div>

        {/* Status panel */}
        <div style={{ overflowY: 'auto', padding: '20px' }} className="scrollbar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600 }}>Aktueller Spielstand</h2>
            {!editingStatus && (
              <button onClick={() => { setEditForm({ ...gameStatus }); setEditingStatus(true) }} className="btn btn-ghost btn-sm" style={{ fontSize: '11px' }}>Bearbeiten</button>
            )}
          </div>

          {!gameStatus ? (
            <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Noch kein Stand erfasst.</div>
          ) : editingStatus ? (
            <div className="card card-pad fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">Phase</label>
                <select value={editForm.phase ?? 0} onChange={e => setEditForm(f => ({ ...f, phase: +e.target.value, phase_name: PHASE_NAMES[+e.target.value] }))}>
                  {PHASE_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
                </select>
              </div>
              {[
                ['current_focus', 'Aktueller Fokus'],
                ['progress_notes', 'Fortschritt'],
                ['blockers', 'Blocker'],
                ['next_steps', 'Nächste Schritte'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <textarea value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} style={{ minHeight: '60px', resize: 'vertical', fontSize: '12px' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleManualStatusSave} className="btn btn-primary btn-sm" disabled={statusLoading}>Speichern</button>
                <button onClick={() => setEditingStatus(false)} className="btn btn-ghost btn-sm">Abbrechen</button>
              </div>
            </div>
          ) : (
            <div className="fade-in">
              {/* Phase badge */}
              <div style={{ background: `${phaseColor}15`, border: `1px solid ${phaseColor}30`, borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: phaseColor, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>Aktuelle Phase</div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{gameStatus.phase_name}</div>
              </div>

              {[
                ['⚡ Fokus', gameStatus.current_focus],
                ['✅ Fortschritt', gameStatus.progress_notes],
                ['🚧 Blocker', gameStatus.blockers],
                ['➡️ Nächste Schritte', gameStatus.next_steps],
              ].map(([label, val]) => val ? (
                <div key={label} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>{val}</div>
                </div>
              ) : null)}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px', fontSize: '11px', color: 'var(--text3)' }}>
                Zuletzt aktualisiert von <strong style={{ color: 'var(--text2)' }}>{gameStatus.updated_by}</strong>
                <br />
                {gameStatus.updated_at && format(parseISO(gameStatus.updated_at), "dd. MMM yyyy 'um' HH:mm", { locale: de })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
      `}</style>
    </Layout>
  )
}
