import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError('E-Mail oder Passwort falsch.')
    else navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="fade-in">
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '22px' }}>🎮</div>
          <h1 style={{ fontSize: '24px', marginBottom: '6px', color: 'var(--text)' }}>GameDev Hub</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Anmelden um fortzufahren</p>
        </div>

        <div className="card card-pad">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input type="email" placeholder="deine@email.de" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Passwort</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: 'var(--red)', fontSize: '13px' }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
              {loading ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '12px', marginTop: '20px' }}>
          Kein Konto? Wende dich an einen Admin des Teams.
        </p>
      </div>
    </div>
  )
}
