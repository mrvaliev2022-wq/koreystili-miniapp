import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { topikProgress, epsProgress, activeTrack } = useStore()

  const findNext = () => {
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

  const ic = (active) => active ? '#7c3aed' : '#9ca3af'

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'white',
      borderTop: '0.5px solid rgba(124,58,237,0.12)',
      height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 8px', zIndex: 1000
    }}>
      <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ic(pathname === '/')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, color: ic(pathname === '/') }}>Bosh sahifa</span>
      </div>
      <div onClick={() => navigate('/learning-path')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ic(pathname === '/learning-path')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, color: ic(pathname === '/learning-path') }}>Yo'l</span>
      </div>
      <div onClick={() => navigate(`/lesson/${findNext()}`)} style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 20, fontWeight: 900,
        marginTop: -20, cursor: 'pointer', flexShrink: 0,
        boxShadow: '0 4px 16px rgba(124,58,237,0.4)'
      }}>&#9654;</div>
      <div onClick={() => navigate('/leaderboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ic(pathname === '/leaderboard')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8 6 2 6 2 12"/><polyline points="16 6 22 6 22 12"/><path d="M2 12a10 10 0 0 0 20 0"/><path d="M12 22v-4"/><path d="M9 22h6"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, color: ic(pathname === '/leaderboard') }}>Reyting</span>
      </div>
      <div onClick={() => navigate('/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ic(pathname === '/profile')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, color: ic(pathname === '/profile') }}>Profil</span>
      </div>
    </div>
  )
}
