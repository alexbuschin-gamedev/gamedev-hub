import React, { useState, useEffect } from 'react'
import { supabase, TAGS } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function EventModal({ event, date, onClose, onSave }) {
  const { profile } = useAuth()
  const isGuest = profile?.role === 'guest'
  const isNew = !event?.id

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` : `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`,
    time: '10:00',
    tag: 'general',
    status: isGuest ? 'pending' : 'confirmed',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '10:00',
        tag: event.tag || 'general',
        status: event.status || 'confirmed',
      })
    }
  }, [event])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Titel ist erforderlich.'); return }
    setLoading(true); setError('')
    const payload = { ...form, created_by: profile.id }

    let err
    if (isNew) {
      const { error: e } = await supabase.from('events').insert(payload)
      err = e
    } else {
      const { error: e } = await supabase.from('events').update(payload).eq('id', event.id)
      err = e
    }
    setLoading(false)
    if (err) { setError('Fehler beim Speichern.'); return }
    onSave()
  }

  async function handleDelete() {
    if (!event?.id) return
    setLoading(true)
    await supabase.from('events').delete().eq('id', event.id)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h3 style={{ fontSize: '16px' }}>{isGuest ? 'Termin vorschlagen' : isNew ? 'Neuer Termin' : 'Termin bearbeiten'}</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: '20px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {isGuest && (
              <div style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: 'var(--amber)', fontSize: '12px' }}>
                Als Gast wird dein Vorschlag zunächst von einem Admin bestätigt.
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Titel *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="z.B. Playtesting Session" autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Datum</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Uhrzeit</label>
                <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Kategorie</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {TAGS.map(t => (
                  <button key={t} type="button" onClick={() => set('tag', t)}
                    className={`tag tag-${t}`}
                    style={{ cursor: 'pointer', padding: '5px 11px', opacity: form.tag === t ? 1 : 0.45, transform: form.tag === t ? 'scale(1.05)' : 'scale(1)', transition: 'all .12s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Beschreibung</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Was soll passieren?" style={{ minHeight: '80px', resize: 'vertical' }} />
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
          </div>
          <div className="modal-footer">
            {!isNew && profile?.role === 'admin' && (
              <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm" style={{ marginRight: 'auto' }} disabled={loading}>Löschen</button>
            )}
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Abbrechen</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Speichern…' : isGuest ? 'Vorschlagen' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
