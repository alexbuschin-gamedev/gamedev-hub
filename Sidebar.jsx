import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../lib/supabase'

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/calendar', icon: '◷', label: 'Kalender' },
  { to: '/roadmap', icon: '◈', label: 'Roadmap' },
  { to: '/members', icon: '◉', label: 'Team' },
  { to: '/wiki', icon: '📖', label: 'Wiki' },
  { to: '/assistant', icon: '🤖', label: 'KI-Assistent' },
]

function getAvatarColor(role) {
  if (role === 'admin') return { bg: 'rgba(108,99,255,0.2)', color: '#8b85ff' }
  if (role === 'member') return { bg: 'rgba(62,207,142,0.2)', color: '#3ecf8e' }
  return { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'admin'
  const colors = getAvatarColor(profile?.role)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside style={{ width: '220px', minHeight: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🎮</div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>GameDev Hub</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(({ to, icon, label, adminOnly }) => {
          if (adminOnly && !isAdmin) return null
          return (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500, marginBottom: '2px', transition: 'all .12s',
              color: isActive ? 'var(--text)' : 'var(--text2)',
              background: isActive ? 'var(--bg3)' : 'transparent',
            })}>
              <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          )
        })}

        {isAdmin && (
          <>
            <div style={{ height: '1px', background: 'var(--border)', margin: '10px 4px' }} />
            <NavLink to="/admin" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'all .12s',
              color: isActive ? 'var(--accent2)' : 'var(--text3)',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
            })}>
              <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>⚙</span>
              Admin
            </NavLink>
          </>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div className="avatar" style={{ ...colors, width: '32px', height: '32px', fontSize: '11px' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || profile?.email}</div>
            <span className={`badge badge-${profile?.role}`} style={{ fontSize: '10px', padding: '1px 7px' }}>{ROLE_LABELS[profile?.role] ?? ''}</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}>
          Abmelden
        </button>
      </div>
    </aside>
  )
}
