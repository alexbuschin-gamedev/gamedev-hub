import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import EventModal from '../components/EventModal'
import { format, parseISO, isToday, isFuture, differenceInDays } from 'date-fns'
import { de } from 'date-fns/locale'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const isGuest = profile?.role === 'guest'

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: evts } = await supabase.from('events').select('*').order('date', { ascending: true })
    const { data: mems } = await supabase.from('profiles').select('*').order('full_name')
    setEvents(evts || [])
    setMembers(mems || [])
  }

  const upcoming = events.filter(e => e.status === 'confirmed' && (isToday(parseISO(e.date)) || isFuture(parseISO(e.date)))).slice(0, 5)
  const pending = events.filter(e => e.status === 'pending')
  const totalConfirmed = events.filter(e => e.status === 'confirmed').length

  function getAvatarStyle(role) {
    if (role === 'admin') return { background: 'rgba(108,99,255,0.2)', color: '#8b85ff' }
    if (role === 'member') return { background: 'rgba(62,207,142,0.2)', color: '#3ecf8e' }
    return { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
  }

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>
            Guten Tag, {profile?.full_name?.split(' ')[0] ?? 'Team'} 👾
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Hier ist ein Überblick über euer Projekt.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Bestätigte Termine', value: totalConfirmed, color: 'var(--green)' },
            { label: 'Ausstehend', value: pending.length, color: 'var(--amber)' },
            { label: 'Teammitglieder', value: members.length, color: 'var(--accent2)' },
          ].map(s => (
            <div key={s.label} className="card card-pad" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
          {/* Upcoming events */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Nächste Termine</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => navigate('/calendar')} className="btn btn-ghost btn-sm">Kalender</button>
                {!isGuest && <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">+ Neu</button>}
                {isGuest && <button onClick={() => setShowModal(true)} className="btn btn-ghost btn-sm">Vorschlagen</button>}
              </div>
            </div>
            <div>
              {upcoming.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>Keine bevorstehenden Termine.</div>
              )}
              {upcoming.map((ev, i) => {
                const d = parseISO(ev.date)
                const diff = differenceInDays(d, new Date())
                return (
                  <div key={ev.id} style={{ padding: '14px 20px', borderBottom: i < upcoming.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'center', minWidth: '40px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: isToday(d) ? 'var(--accent2)' : 'var(--text)' }}>{format(d, 'd')}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>{format(d, 'MMM', { locale: de })}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '3px' }}>{ev.title}</div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className={`tag tag-${ev.tag}`}>{ev.tag}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{ev.time}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: isToday(d) ? 'var(--green)' : 'var(--text3)', fontWeight: isToday(d) ? 600 : 400 }}>
                      {isToday(d) ? 'Heute' : `in ${diff}d`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Team */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Team</h2>
              {profile?.role === 'admin' && <button onClick={() => navigate('/members')} className="btn btn-ghost btn-sm">Verwalten</button>}
            </div>
            <div style={{ padding: '8px 0' }}>
              {members.map(m => (
                <div key={m.id} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar" style={getAvatarStyle(m.role)}>
                    {(m.full_name || m.email || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.full_name || m.email}</div>
                    <span className={`badge badge-${m.role}`} style={{ fontSize: '10px', padding: '1px 6px' }}>{m.role === 'admin' ? 'Admin' : m.role === 'member' ? 'Team' : 'Gast'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending suggestions (admin only) */}
        {profile?.role === 'admin' && pending.length > 0 && (
          <div className="card" style={{ marginTop: '16px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Ausstehende Vorschläge <span style={{ color: 'var(--amber)', fontSize: '12px', fontWeight: 400, marginLeft: '6px' }}>{pending.length} offen</span></h2>
            </div>
            {pending.map(ev => (
              <div key={ev.id} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500, fontSize: '13px' }}>{ev.title}</span>
                  <span style={{ color: 'var(--text3)', fontSize: '12px', marginLeft: '10px' }}>{ev.date} · {ev.time}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(62,207,142,0.2)' }}
                    onClick={async () => { await supabase.from('events').update({ status: 'confirmed' }).eq('id', ev.id); loadData() }}>
                    ✓ Bestätigen
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={async () => { await supabase.from('events').delete().eq('id', ev.id); loadData() }}>
                    Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <EventModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); loadData() }} />}
    </Layout>
  )
}
