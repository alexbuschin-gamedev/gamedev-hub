import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import EventModal from '../components/EventModal'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const REMINDER_OPTIONS = [
  { value: '15min', label: '15 Minuten vorher' },
  { value: '1h', label: '1 Stunde vorher' },
  { value: '3h', label: '3 Stunden vorher' },
  { value: '1d', label: '1 Tag vorher' },
]

function NotificationSettings({ profile, onClose }) {
  const [prefs, setPrefs] = useState({ reminders: [], email: profile?.email || '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('notification_prefs').select('*').eq('user_id', profile.id).single()
      .then(({ data }) => {
        if (data) setPrefs({ reminders: data.reminders || [], email: data.email || profile?.email || '' })
        setLoading(false)
      })
  }, [])

  function toggleReminder(val) {
    setPrefs(p => ({
      ...p,
      reminders: p.reminders.includes(val) ? p.reminders.filter(r => r !== val) : [...p.reminders, val]
    }))
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('notification_prefs').upsert({
      user_id: profile.id,
      email: prefs.email,
      reminders: prefs.reminders,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h3 style={{ fontSize: '16px' }}>🔔 Email-Benachrichtigungen</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: '20px', padding: '4px' }}>×</button>
        </div>
        <div className="modal-body">
          {loading ? <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Laden…</div> : <>
            <div className="form-group">
              <label className="form-label">Email-Adresse</label>
              <input type="email" value={prefs.email} onChange={e => setPrefs(p => ({ ...p, email: e.target.value }))} placeholder="deine@email.de" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Erinnerungen — wann benachrichtigen?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {REMINDER_OPTIONS.map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius)', border: `1px solid ${prefs.reminders.includes(opt.value) ? 'var(--accent-border)' : 'var(--border)'}`, background: prefs.reminders.includes(opt.value) ? 'var(--accent-bg)' : 'transparent', transition: 'all .15s' }}>
                    <input type="checkbox" checked={prefs.reminders.includes(opt.value)} onChange={() => toggleReminder(opt.value)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '13px', color: prefs.reminders.includes(opt.value) ? 'var(--text)' : 'var(--text2)' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '14px', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--text3)' }}>
              Du erhältst Emails für alle bestätigten Termine im Kalender. Gast-Vorschläge lösen keine Benachrichtigung aus.
            </div>
          </>}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost btn-sm">Schließen</button>
          <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
            {saved ? '✓ Gespeichert' : saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const { profile } = useAuth()
  const [current, setCurrent] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const [editEvent, setEditEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showNotifSettings, setShowNotifSettings] = useState(false)
  const [modalDate, setModalDate] = useState(null)
  const isGuest = profile?.role === 'guest'
  const canEdit = profile?.role === 'admin' || profile?.role === 'member'

  useEffect(() => { loadEvents() }, [current])

  async function loadEvents() {
    const start = format(startOfMonth(current), 'yyyy-MM-dd')
    const end = format(endOfMonth(current), 'yyyy-MM-dd')
    const { data } = await supabase.from('events').select('*').gte('date', start).lte('date', end).order('time')
    setEvents(data || [])
  }

  const monthStart = startOfMonth(current)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(endOfMonth(current), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function eventsOn(day) {
    return events.filter(e => isSameDay(parseISO(e.date), day))
  }

  function handleDayClick(day) { setSelected(day); setEditEvent(null) }
  function handleNewEvent(day) { setModalDate(day); setEditEvent(null); setShowModal(true) }

  const selectedEvents = selected ? eventsOn(selected) : []

  return (
    <Layout>
      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px' }}>{format(current, 'MMMM yyyy', { locale: de })}</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setCurrent(subMonths(current, 1))} className="btn btn-ghost btn-sm">‹</button>
              <button onClick={() => setCurrent(new Date())} className="btn btn-ghost btn-sm">Heute</button>
              <button onClick={() => setCurrent(addMonths(current, 1))} className="btn btn-ghost btn-sm">›</button>
              <button onClick={() => setShowNotifSettings(true)} className="btn btn-ghost btn-sm" title="Email-Benachrichtigungen">🔔</button>
              <button onClick={() => handleNewEvent(selected || new Date())} className="btn btn-primary btn-sm">+ Termin</button>
            </div>
          </div>

          {/* Grid */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
              {DAYS.map(d => (
                <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{d}</div>
              ))}
            </div>
            {/* Days — 50% taller: 88px → 132px */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {days.map((day, i) => {
                const evts = eventsOn(day)
                const isCurrentMonth = isSameMonth(day, current)
                const isSel = selected && isSameDay(day, selected)
                const today = isToday(day)
                return (
                  <div key={i} onClick={() => handleDayClick(day)}
                    style={{
                      minHeight: '132px', padding: '10px', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s',
                      background: isSel ? 'var(--accent-bg)' : 'transparent',
                      opacity: isCurrentMonth ? 1 : 0.35,
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '13px', fontWeight: today ? 700 : 400, width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                        background: today ? 'var(--accent)' : 'transparent', color: today ? '#fff' : isSel ? 'var(--accent2)' : 'var(--text)',
                      }}>{format(day, 'd')}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {evts.slice(0, 4).map(ev => (
                        <div key={ev.id} onClick={e => { e.stopPropagation(); setEditEvent(ev); setSelected(day); setShowModal(true) }}
                          style={{ fontSize: '10px', fontWeight: 500, padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                          className={`tag tag-${ev.tag}`}>
                          {ev.status === 'pending' ? '⏳ ' : ''}{ev.title}
                        </div>
                      ))}
                      {evts.length > 4 && <div style={{ fontSize: '10px', color: 'var(--text3)', paddingLeft: '5px' }}>+{evts.length - 4} weitere</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div>
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600 }}>
                {selected ? format(selected, 'EEEE, d. MMMM', { locale: de }) : 'Tag wählen'}
              </h2>
            </div>
            <div style={{ padding: '8px 0' }}>
              {!selected && <div style={{ padding: '24px 20px', color: 'var(--text3)', fontSize: '13px' }}>Klicke auf einen Tag um Termine zu sehen.</div>}
              {selected && selectedEvents.length === 0 && (
                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '12px' }}>Keine Termine.</div>
                  <button onClick={() => handleNewEvent(selected)} className="btn btn-primary btn-sm">+ Termin erstellen</button>
                </div>
              )}
              {selectedEvents.map(ev => (
                <div key={ev.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', cursor: canEdit ? 'pointer' : 'default' }}
                  onClick={() => { if (canEdit || isGuest) { setEditEvent(ev); setShowModal(true) } }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`tag tag-${ev.tag}`}>{ev.tag}</span>
                    {ev.status === 'pending' && <span style={{ fontSize: '10px', color: 'var(--amber)' }}>⏳ ausstehend</span>}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{ev.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{ev.time}</div>
                  {ev.description && <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px' }}>{ev.description}</div>}
                </div>
              ))}
              {selected && selectedEvents.length > 0 && (
                <div style={{ padding: '12px 20px' }}>
                  <button onClick={() => handleNewEvent(selected)} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    {isGuest ? '+ Termin vorschlagen' : '+ Termin hinzufügen'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification hint */}
          <div style={{ marginTop: '12px', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => setShowNotifSettings(true)}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Email-Benachrichtigungen</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Erinnerungen für Termine einstellen</div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <EventModal event={editEvent} date={modalDate}
          onClose={() => { setShowModal(false); setEditEvent(null) }}
          onSave={() => { setShowModal(false); setEditEvent(null); loadEvents() }} />
      )}
      {showNotifSettings && <NotificationSettings profile={profile} onClose={() => setShowNotifSettings(false)} />}
    </Layout>
  )
}
