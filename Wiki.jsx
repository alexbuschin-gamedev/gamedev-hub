import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

const PHASE_NAMES = [
  'Phase 0 — Vorbereitung',
  'Phase 1 — Prototyp & Core',
  'Phase 2 — Episode 1',
  'Phase 3 — Episode 2',
  'Phase 4 — Release',
]

const AVATAR_COLORS = ['#6c63ff','#1D9E75','#185FA5','#BA7517','#993C1D','#e91e8c','#00bcd4']

const TABS = ['Charaktere', 'Storypfade', 'Phasennotizen']

// ─── Charakter Modal ───────────────────────────────────────────────
function CharModal({ char, onClose, onSave, profile }) {
  const isGuest = profile?.role === 'guest'
  const [form, setForm] = useState({
    name: char?.name || '',
    role: char?.role || '',
    description: char?.description || '',
    traits: char?.traits || '',
    phase_introduced: char?.phase_introduced ?? 0,
    avatar_color: char?.avatar_color || '#6c63ff',
  })
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    const payload = { ...form, created_by: profile.id, updated_at: new Date().toISOString() }
    if (char?.id) {
      await supabase.from('characters').update(payload).eq('id', char.id)
    } else {
      await supabase.from('characters').insert(payload)
    }
    setLoading(false)
    onSave()
  }

  async function handleDelete() {
    if (!char?.id) return
    await supabase.from('characters').delete().eq('id', char.id)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h3 style={{ fontSize: '16px' }}>{char?.id ? 'Charakter bearbeiten' : 'Neuer Charakter'}</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: '20px', padding: '4px' }}>×</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Avatar preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: form.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {form.name ? form.name[0].toUpperCase() : '?'}
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: '6px' }}>Farbe</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {AVATAR_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('avatar_color', c)}
                      style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: form.avatar_color === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: form.avatar_color === c ? `0 0 0 2px ${c}` : 'none' }} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="z.B. Anna" autoFocus required disabled={isGuest} />
              </div>
              <div className="form-group">
                <label className="form-label">Rolle</label>
                <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="z.B. Protagonist" disabled={isGuest} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Beschreibung</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Wer ist dieser Charakter?" style={{ minHeight: '70px', resize: 'vertical' }} disabled={isGuest} />
            </div>

            <div className="form-group">
              <label className="form-label">Eigenschaften / Traits</label>
              <input value={form.traits} onChange={e => set('traits', e.target.value)} placeholder="z.B. mutig, misstrauisch, loyal" disabled={isGuest} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Eingeführt in</label>
              <select value={form.phase_introduced} onChange={e => set('phase_introduced', +e.target.value)} disabled={isGuest}>
                {PHASE_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            {char?.id && profile?.role !== 'guest' && (
              <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm" style={{ marginRight: 'auto' }}>Löschen</button>
            )}
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Abbrechen</button>
            {!isGuest && <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? 'Speichern…' : 'Speichern'}</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Storypfad Modal ───────────────────────────────────────────────
function PathModal({ path, onClose, onSave, profile }) {
  const isGuest = profile?.role === 'guest'
  const [form, setForm] = useState({
    title: path?.title || '',
    description: path?.description || '',
    trigger_condition: path?.trigger_condition || '',
    outcome: path?.outcome || '',
    phase: path?.phase ?? 0,
  })
  const [loading, setLoading] = useState(false)
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    const payload = { ...form, created_by: profile.id, updated_at: new Date().toISOString() }
    if (path?.id) {
      await supabase.from('story_paths').update(payload).eq('id', path.id)
    } else {
      await supabase.from('story_paths').insert(payload)
    }
    setLoading(false)
    onSave()
  }

  async function handleDelete() {
    await supabase.from('story_paths').delete().eq('id', path.id)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h3 style={{ fontSize: '16px' }}>{path?.id ? 'Storypfad bearbeiten' : 'Neuer Storypfad'}</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: '20px', padding: '4px' }}>×</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Titel *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="z.B. Anna vertraut Marcus" autoFocus required disabled={isGuest} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phase</label>
              <select value={form.phase} onChange={e => set('phase', +e.target.value)} disabled={isGuest}>
                {PHASE_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Beschreibung</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Worum geht es in diesem Pfad?" style={{ minHeight: '60px', resize: 'vertical' }} disabled={isGuest} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Auslöser / Bedingung</label>
              <input value={form.trigger_condition} onChange={e => set('trigger_condition', e.target.value)} placeholder="z.B. Spieler wählt 'Vertrauen' in Szene 2" disabled={isGuest} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Konsequenz / Ausgang</label>
              <textarea value={form.outcome} onChange={e => set('outcome', e.target.value)} placeholder="Was passiert als Folge dieser Entscheidung?" style={{ minHeight: '60px', resize: 'vertical' }} disabled={isGuest} />
            </div>
          </div>
          <div className="modal-footer">
            {path?.id && profile?.role !== 'guest' && (
              <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm" style={{ marginRight: 'auto' }}>Löschen</button>
            )}
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Abbrechen</button>
            {!isGuest && <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? 'Speichern…' : 'Speichern'}</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Hauptseite ────────────────────────────────────────────────────
export default function Wiki() {
  const { profile } = useAuth()
  const [tab, setTab] = useState(0)
  const [characters, setCharacters] = useState([])
  const [paths, setPaths] = useState([])
  const [phaseNotes, setPhaseNotes] = useState({})
  const [activePhaseNote, setActivePhaseNote] = useState(0)
  const [noteText, setNoteText] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [charModal, setCharModal] = useState(null)
  const [pathModal, setPathModal] = useState(null)
  const isGuest = profile?.role === 'guest'

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: chars }, { data: sp }, { data: notes }] = await Promise.all([
      supabase.from('characters').select('*').order('created_at'),
      supabase.from('story_paths').select('*').order('phase').order('created_at'),
      supabase.from('phase_notes').select('*'),
    ])
    setCharacters(chars || [])
    setPaths(sp || [])
    const notesMap = {}
    ;(notes || []).forEach(n => { notesMap[n.phase] = n })
    setPhaseNotes(notesMap)
    setNoteText(notesMap[activePhaseNote]?.notes || '')
  }

  async function saveNote() {
    setNoteSaving(true)
    const existing = phaseNotes[activePhaseNote]
    if (existing) {
      await supabase.from('phase_notes').update({ notes: noteText, updated_by: profile.id, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('phase_notes').insert({ phase: activePhaseNote, notes: noteText, updated_by: profile.id })
    }
    await loadAll()
    setNoteSaving(false)
  }

  function switchPhaseNote(i) {
    setActivePhaseNote(i)
    setNoteText(phaseNotes[i]?.notes || '')
  }

  const phaseColors = ['#9b9792','#1D9E75','#185FA5','#BA7517','#b94a2c']

  return (
    <Layout>
      <div style={{ padding: '32px 36px', maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Projekt-Wiki</h1>
            <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Charaktere, Storypfade & Phasennotizen eures Spiels</p>
          </div>
          {!isGuest && tab === 0 && (
            <button onClick={() => setCharModal({})} className="btn btn-primary">+ Charakter</button>
          )}
          {!isGuest && tab === 1 && (
            <button onClick={() => setPathModal({})} className="btn btn-primary">+ Storypfad</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all .15s', background: tab === i ? 'var(--bg4)' : 'transparent', color: tab === i ? 'var(--text)' : 'var(--text3)' }}>
              {t === 'Charaktere' ? `👤 ${t}` : t === 'Storypfade' ? `🌿 ${t}` : `📝 ${t}`}
            </button>
          ))}
        </div>

        {/* ── CHARAKTERE ── */}
        {tab === 0 && (
          <div className="fade-in">
            {characters.length === 0 ? (
              <div className="card card-pad" style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>Noch keine Charaktere</div>
                <div style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '20px' }}>Füge die Protagonisten und wichtigen NPCs eures Spiels hinzu.</div>
                {!isGuest && <button onClick={() => setCharModal({})} className="btn btn-primary">+ Ersten Charakter erstellen</button>}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {characters.map(c => (
                  <div key={c.id} className="card" style={{ cursor: 'pointer', transition: 'border-color .15s' }}
                    onClick={() => setCharModal(c)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: c.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>{c.name}</div>
                          {c.role && <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{c.role}</div>}
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '11px', background: `${phaseColors[c.phase_introduced]}20`, color: phaseColors[c.phase_introduced], padding: '3px 8px', borderRadius: '99px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          Ph. {c.phase_introduced}
                        </div>
                      </div>
                      {c.description && <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.55, marginBottom: '10px' }}>{c.description}</p>}
                      {c.traits && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {c.traits.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                            <span key={t} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: 'var(--bg4)', color: 'var(--text3)' }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!isGuest && (
                  <div className="card" style={{ cursor: 'pointer', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}
                    onClick={() => setCharModal({})}>
                    <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>+</div>
                      <div style={{ fontSize: '13px' }}>Charakter hinzufügen</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STORYPFADE ── */}
        {tab === 1 && (
          <div className="fade-in">
            {paths.length === 0 ? (
              <div className="card card-pad" style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌿</div>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>Noch keine Storypfade</div>
                <div style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '20px' }}>Dokumentiere Entscheidungen, Auslöser und Konsequenzen eures Spiels.</div>
                {!isGuest && <button onClick={() => setPathModal({})} className="btn btn-primary">+ Ersten Storypfad erstellen</button>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PHASE_NAMES.map((pname, pi) => {
                  const phasePaths = paths.filter(p => p.phase === pi)
                  if (phasePaths.length === 0) return null
                  return (
                    <div key={pi}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: pi > 0 ? '8px' : 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: phaseColors[pi] }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)' }}>{pname}</span>
                      </div>
                      {phasePaths.map(p => (
                        <div key={p.id} className="card" style={{ marginBottom: '8px', cursor: 'pointer' }} onClick={() => setPathModal(p)}>
                          <div style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: p.description ? '8px' : 0 }}>
                              <div style={{ fontWeight: 500, fontSize: '14px' }}>🌿 {p.title}</div>
                              <span style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>bearbeiten →</span>
                            </div>
                            {p.description && <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '10px', lineHeight: 1.5 }}>{p.description}</p>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              {p.trigger_condition && (
                                <div style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', padding: '8px 12px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--amber)', marginBottom: '3px', textTransform: 'uppercase' }}>⚡ Auslöser</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{p.trigger_condition}</div>
                                </div>
                              )}
                              {p.outcome && (
                                <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(62,207,142,0.15)', borderRadius: '8px', padding: '8px 12px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--green)', marginBottom: '3px', textTransform: 'uppercase' }}>→ Konsequenz</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{p.outcome}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
                {!isGuest && (
                  <button onClick={() => setPathModal({})} className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>+ Storypfad hinzufügen</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PHASENNOTIZEN ── */}
        {tab === 2 && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', alignItems: 'start' }}>
            {/* Phase selector */}
            <div className="card">
              {PHASE_NAMES.map((n, i) => (
                <button key={i} onClick={() => switchPhaseNote(i)}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: activePhaseNote === i ? `${phaseColors[i]}12` : 'transparent', border: 'none', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: phaseColors[i], flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: activePhaseNote === i ? 600 : 400, color: activePhaseNote === i ? 'var(--text)' : 'var(--text2)', lineHeight: 1.3 }}>Phase {i}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{phaseNotes[i] ? '● Notizen vorhanden' : '○ Leer'}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Note editor */}
            <div className="card card-pad">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '15px', marginBottom: '2px' }}>{PHASE_NAMES[activePhaseNote]}</h2>
                  {phaseNotes[activePhaseNote]?.updated_at && (
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                      Zuletzt bearbeitet: {format(parseISO(phaseNotes[activePhaseNote].updated_at), "dd. MMM, HH:mm", { locale: de })}
                    </div>
                  )}
                </div>
                {!isGuest && (
                  <button onClick={saveNote} className="btn btn-primary btn-sm" disabled={noteSaving}>
                    {noteSaving ? 'Speichern…' : 'Speichern'}
                  </button>
                )}
              </div>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder={isGuest ? 'Keine Berechtigung zum Bearbeiten.' : `Notizen zu ${PHASE_NAMES[activePhaseNote]}...\n\nZ.B. was bereits erreicht wurde, offene Fragen, Ideen, Links...`}
                disabled={isGuest}
                style={{ width: '100%', minHeight: '320px', resize: 'vertical', fontSize: '13px', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
        )}
      </div>

      {charModal !== null && (
        <CharModal char={charModal} profile={profile} onClose={() => setCharModal(null)} onSave={() => { setCharModal(null); loadAll() }} />
      )}
      {pathModal !== null && (
        <PathModal path={pathModal} profile={profile} onClose={() => setPathModal(null)} onSave={() => { setPathModal(null); loadAll() }} />
      )}
    </Layout>
  )
}
