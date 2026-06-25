import React, { useEffect, useState } from 'react'
import { supabase, ROLES, ROLE_LABELS } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'

function getAvatarStyle(role) {
  if (role === 'admin') return { background: 'rgba(108,99,255,0.2)', color: '#8b85ff' }
  if (role === 'member') return { background: 'rgba(62,207,142,0.2)', color: '#3ecf8e' }
  return { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
}

export default function Members() {
  const { profile } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const isAdmin = profile?.role === 'admin'

  useEffect(() => { loadMembers() }, [])

  async function loadMembers() {
    const { data } = await supabase.from('profiles').select('*').order('role').order('full_name')
    setMembers(data || [])
    setLoading(false)
  }

  async function updateRole(id, role) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    loadMembers()
  }

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '700px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>Team</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Alle Mitglieder und ihre Berechtigungen</p>
        </div>

        {/* Permission overview */}
        <div className="card card-pad" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text2)' }}>Berechtigungen</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text3)', fontWeight: 500 }}>Aktion</th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}><span className="badge badge-admin">Admin</span></th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}><span className="badge badge-member">Team</span></th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}><span className="badge badge-guest">Gast</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Kalender ansehen', true, true, true],
                ['Termine kommentieren', true, true, true],
                ['Termine erstellen', true, true, false],
                ['Termine vorschlagen', true, true, true],
                ['Termine bestätigen/löschen', true, false, false],
                ['Roadmap ansehen', true, true, true],
                ['Nutzer verwalten', true, false, false],
                ['Rollen ändern', true, false, false],
              ].map(([action, a, m, g]) => (
                <tr key={action} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--text2)' }}>{action}</td>
                  {[a, m, g].map((v, i) => (
                    <td key={i} style={{ textAlign: 'center', padding: '8px' }}>
                      <span style={{ color: v ? 'var(--green)' : 'var(--text3)', fontSize: '14px' }}>{v ? '✓' : '–'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Member list */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Mitglieder ({members.length})</h2>
          </div>
          {loading && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)' }}>Laden…</div>}
          {members.map(m => {
            const initials = (m.full_name || m.email || '?').slice(0, 2).toUpperCase()
            const isMe = m.id === profile?.id
            return (
              <div key={m.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar" style={{ ...getAvatarStyle(m.role), width: '38px', height: '38px' }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>
                    {m.full_name || m.email}
                    {isMe && <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: '8px' }}>Du</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{m.email}</div>
                </div>
                {isAdmin && !isMe ? (
                  <select value={m.role} onChange={e => updateRole(m.id, e.target.value)}
                    style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}>
                    {Object.values(ROLES).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                ) : (
                  <span className={`badge badge-${m.role}`}>{ROLE_LABELS[m.role]}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
