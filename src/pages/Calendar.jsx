import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import EventModal from '../components/EventModal'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function Calendar() {
  const { profile } = useAuth()
  const [current, setCurrent] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const [editEvent, setEditEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
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

  function handleDayClick(day) {
    setSelected(day)
    setEditEvent(null)
  }

  function handleNewEvent(day) {
    setModalDate(day)
    setEditEvent(null)
    setShowModal(true)
  }

  const selectedEvents = selected ? eventsOn(selected) : []

  return (
    <Layout>
      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* Calendar */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px' }}>{format(current, 'MMMM yyyy', { locale: de })}</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setCurrent(subMonths(current, 1))} className="btn btn-ghost btn-sm">‹</button>
              <button onClick={() => setCurrent(new Date())} className="btn btn-ghost btn-sm">Heute</button>
              <button onClick={() => setCurrent(addMonths(current, 1))} className="btn btn-ghost btn-sm">›</button>
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
            {/* Days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {days.map((day, i) => {
                const evts = eventsOn(day)
                const isCurrentMonth = isSameMonth(day, current)
                const isSel = selected && isSameDay(day, selected)
                const today = isToday(day)
                return (
                  <div key={i} onClick={() => handleDayClick(day)}
                    style={{
                      minHeight: '88px', padding: '8px', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s',
                      background: isSel ? 'var(--accent-bg)' : 'transparent',
                      opacity: isCurrentMonth ? 1 : 0.35,
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '13px', fontWeight: today ? 700 : 400, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                        background: today ? 'var(--accent)' : 'transparent', color: today ? '#fff' : isSel ? 'var(--accent2)' : 'var(--text)',
                      }}>{format(day, 'd')}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {evts.slice(0, 3).map(ev => (
                        <div key={ev.id} onClick={e => { e.stopPropagation(); setEditEvent(ev); setSelected(day); setShowModal(true) }}
                          style={{ fontSize: '10px', fontWeight: 500, padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                          className={`tag tag-${ev.tag}`}>
                          {ev.status === 'pending' ? '⏳ ' : ''}{ev.title}
                        </div>
                      ))}
                      {evts.length > 3 && <div style={{ fontSize: '10px', color: 'var(--text3)', paddingLeft: '5px' }}>+{evts.length - 3} weitere</div>}
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
        </div>
      </div>

      {showModal && (
        <EventModal
          event={editEvent}
          date={modalDate}
          onClose={() => { setShowModal(false); setEditEvent(null) }}
          onSave={() => { setShowModal(false); setEditEvent(null); loadEvents() }}
        />
      )}
    </Layout>
  )
}
