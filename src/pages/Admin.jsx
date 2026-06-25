import React, { useState } from 'react'
import { supabase, ROLES, ROLE_LABELS } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'member' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  if (profile?.role !== 'admin') {
    navigate('/dashboard')
    return null
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true); setStatus(null)
    const { data, error } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true,
      user_metadata: { full_name: form.full_name },
    })
    if (error) {
      setStatus({ type: 'error', msg: error.message })
      setLoading(false)
      return
    }
    if (data?.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email: form.email, full_name: form.full_name, role: form.role })
    }
    setStatus({ type: 'success', msg: `Nutzer "${form.full_name || form.email}" wurde erstellt.` })
    setForm({ email: '', password: '', full_name: '', role: 'member' })
    setLoading(false)
  }

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '560px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>Admin-Bereich</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Nutzer erstellen und verwalten.</p>
        </div>

        <div className="card card-pad">
          <h2 style={{ fontSize: '15px', marginBottom: '20px' }}>Neuen Nutzer erstellen</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Vollständiger Name</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Max Mustermann" />
            </div>
            <div className="form-group">
              <label className="form-label">E-Mail *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="nutzer@email.de" required />
            </div>
            <div className="form-group">
              <label className="form-label">Passwort *</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mindestens 8 Zeichen" minLength={8} required />
            </div>
            <div className="form-group">
              <label className="form-label">Rolle</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}>
                {Object.values(ROLES).map(r => <option key={r} value={r}>{ROLE_LABELS[r]} — {r === 'admin' ? 'Vollzugriff' : r === 'member' ? 'Termine erstellen & bearbeiten' : 'Ansehen & vorschlagen'}</option>)}
              </select>
            </div>

            {status && (
              <div style={{ background: status.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', border: `1px solid ${status.type === 'success' ? 'rgba(62,207,142,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: status.type === 'success' ? 'var(--green)' : 'var(--red)', fontSize: '13px' }}>
                {status.msg}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Erstelle Nutzer…' : 'Nutzer erstellen'}
            </button>
          </form>
        </div>

        <div className="card card-pad" style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Hinweise</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Erstelle die Logins für dein Team direkt hier — kein Registrierungsformular nötig.',
              'Gäste können Termine nur ansehen, kommentieren und vorschlagen.',
              'Vorschläge von Gästen müssen von einem Admin bestätigt werden.',
              'Rollen können jederzeit unter "Team" geändert werden.',
            ].map((t, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--text2)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent2)', flexShrink: 0, marginTop: '1px' }}>→</span>{t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  )
}
