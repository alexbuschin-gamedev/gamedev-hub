import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Roadmap from './pages/Roadmap'
import Members from './pages/Members'
import Admin from './pages/Admin'
import AIAssistant from './pages/AIAssistant'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ color: 'var(--text3)', fontSize: '14px' }}>Laden…</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
          <Route path="/roadmap" element={<Protected><Roadmap /></Protected>} />
          <Route path="/members" element={<Protected><Members /></Protected>} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
          <Route path="/assistant" element={<Protected><AIAssistant /></Protected>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
