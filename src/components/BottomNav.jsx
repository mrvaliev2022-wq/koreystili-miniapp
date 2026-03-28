import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'

function findNextLesson(topikProgress, epsProgress, activeTrack) {
  if (activeTrack === 'eps') {
    const lp = epsProgress.lessonProgress || {}
    for (let n = 1; n <= 10; n++) {
      if (lp[`eps-${n}`] === 'available') return `eps-${n}`
    }
    return 'eps-1'
  }
  for (let lvl = 1; lvl <= 6; lvl++) {
    const lp = topikProgress[lvl]?.lessonProgress || {}
    for (let n = 1; n <= 10; n++) {
      if (lp[`topik-${lvl}-${n}`] === 'available') return `topik-${lvl}-${n}`
    }
  }
  return 'topik-1-1'
}

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { topikProgress, epsProgress, activeTrack } = useStore()

  const navItems = [
    { path: '/',            label: 'Bosh sahifa', icon: <HomeIcon /> },
    { path: '/learning-path', label: "Yo'l",      icon: <PathIcon /> },
    null,
    { path: '/leaderboard', label: 'Reyting',     icon: <TrophyIcon /> },
    { path: '/profile',     label: 'Profil',       icon: <UserIcon /> },
  ]

  const nextLesson = findNextLesson(topikProgress, epsProgress, activeTrack)

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'white',
      borderTop: '0.5px solid rgba(124,58,237,0.12)',
      height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 8px', zIndex: 100
    }}>
      {navItems.map((item, i) => {
        if (item === null) return (
          <div
            key="fab"
            onClick={() => navigate(`/lesson/${nextLesson}`)}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'white', fontWeight: 900,
              marginTop: -20, cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)'
            }}>▶</div>
        )
        const isActive = pathname === item.path
        return (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, cursor: 'pointer', flex: 1,
              color: isActive ? '#7c3aed' : '#9ca3af'
            }}>
            <div style={{ width: 22, height: 22 }}>{item.icon}</div>
            <div style={{ fontSize: 10, fontWeight: isActive ? 800 : 600 }}>{item.label}</div>
          </div>
        )
      })}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function PathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <polyline points="8 6 2 6 2 12"/>
      <polyline points="16 6 22 6 22 12"/>
      <path d="M2 12a10 10 0 0 0 20 0"/>
      <path d="M12 22v-4"/>
      <path d="M9 22h6"/>
    </svg>
  )
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
