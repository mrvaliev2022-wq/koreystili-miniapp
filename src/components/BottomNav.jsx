import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const tabs = [
    { path: '/', icon: '🏠', label: 'Bosh sahifa' },
    { path: '/path', icon: '📚', label: "Yo'l" },
    { path: '/leaderboard', icon: '🏆', label: 'Reyting' },
    { path: '/profile', icon: '👤', label: 'Profil' },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '0.5px solid rgba(124,58,237,0.15)',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {tabs.map(tab => {
        const active = path === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            flex: 1, padding: '10px 0 8px',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
          }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: active ? '#7c3aed' : '#9ca3af'
            }}>{tab.label}</span>
            {active && (
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: '#7c3aed', marginTop: 1
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
