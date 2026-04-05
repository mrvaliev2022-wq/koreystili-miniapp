import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeTrack, topikProgress, epsProgress } = useStore()
  const path = location.pathname

  // Next lesson finder
  const findNext = () => {
    if (activeTrack === 'topik') {
      for (let lvl = 1; lvl <= 6; lvl++) {
        const lp = topikProgress[lvl]?.lessonProgress || {}
        for (let n = 1; n <= 10; n++) {
          const id = `topik-${lvl}-${n}`
          if (lp[id] === 'available') return id
        }
      }
      return 'topik-1-1'
    } else {
      const lp = epsProgress.lessonProgress || {}
      const ids = [
        ...Array.from({ length: 7 }, (_, i) => `alpha-${i + 1}`),
        ...Array.from({ length: 30 }, (_, i) => `eps-${i + 1}`),
      ]
      for (const id of ids) {
        if (lp[id] === 'available') return id
      }
      return 'eps-1'
    }
  }

  const tabs = [
    { path: '/', icon: '🏠', label: 'Bosh sahifa' },
    { path: '/path', icon: '📚', label: "Yo'l" },
    { path: null, icon: null, label: null }, // FAB placeholder
    { path: '/leaderboard', icon: '🏆', label: 'Reyting' },
    { path: '/profile', icon: '👤', label: 'Profil' },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '0.5px solid rgba(124,58,237,0.15)',
      display: 'flex', alignItems: 'center', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 60
    }}>
      {tabs.map((tab, i) => {
        // FAB — o'rtadagi play tugmasi
        if (tab.path === null) {
          return (
            <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button onClick={() => navigate(`/lesson/${findNext()}`)} style={{
                width: 54, height: 54, borderRadius: '50%',
                background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                border: '3px solid white',
                boxShadow: '0 4px 16px rgba(163,230,53,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 22,
                marginBottom: 20
              }}>▶</button>
            </div>
          )
        }

        const active = path === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            flex: 1, padding: '8px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
          }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: active ? '#7c3aed' : '#9ca3af'
            }}>{tab.label}</span>
            {active && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed' }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
