import React from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="scrollbar">
        {children}
      </main>
    </div>
  )
}
