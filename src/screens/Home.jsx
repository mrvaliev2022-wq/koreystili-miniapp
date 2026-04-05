import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getTgUser } from '../store'
import { checkPremium, syncXp } from '../api'

const FREE_LESSONS = 2

export default function Home() {
  const navigate = useNavigate()
  const {
    user, setUser, activeTrack, setActiveTrack,
    topikProgress, epsProgress, xp, streak,
    isPremium, activatePremium
  } = useStore()

  const [greeting, setGreeting] = useState('Xush kelibsiz')
  const [isPremiumBackend, setIsPremiumBackend] = useState(false)

  useEffect(() => {
    // Greeting
    const h = new Date().getHours()
    if (h < 6) setGreeting('Xayrli tun')
    else if (h < 12) setGreeting('Xayrli tong')
    else if (h < 17) setGreeting('Xayrli kun')
    else if (h < 21) setGreeting('Xayrli kech')
    else setGreeting('Xayrli tun')

    // User va premium
    const tgUser = getTgUser()
    if (tgUser.name) setUser(tgUser)

    checkPremium().then(isPrem => {
      if (isPrem) { setIsPremiumBackend(true); activatePremium(-1) }
    })

    syncXp(xp, streak)
  }, [])

  const currentPremium = isPremium || isPremiumBackend
  const userName = user?.name?.split(' ')[0] || "O'quvchi"

  // Done lessons
  const topikDone = Object.values(topikProgress).reduce((acc, lvl) =>
    acc + Object.values(lvl.lessonProgress || {}).filter(s => s === 'done').length, 0)
  const epsDone = Object.values(epsProgress.lessonProgress || {}).filter(s => s === 'done').length
  const totalDone = topikDone + epsDone

  // Next lesson
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

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '0.5px solid rgba(124,58,237,0.1)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'white', fontWeight: 900
          }}>K</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#1e1b4b' }}>KoreysApp</div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>TOPIK · EPS</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentPremium && (
            <div style={{
              background: '#a3e635', color: '#1a2e05',
              fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20
            }}>👑 Premium</div>
          )}
          <div onClick={() => navigate('/profile')} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#a3e635', cursor: 'pointer'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 24, padding: '20px', margin: '14px 0 12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{greeting}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{userName} 👋</div>
            </div>
            {streak > 0 && (
              <div style={{
                background: 'rgba(163,230,53,0.15)', border: '1px solid rgba(163,230,53,0.3)',
                borderRadius: 14, padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span style={{ fontSize: 16 }}>🔥</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#a3e635' }}>{streak}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>KUN</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { val: xp, label: 'XP ball', color: '#a3e635' },
              { val: streak > 0 ? `${streak} 🔥` : '0', label: 'Streak', color: 'white' },
              { val: `${totalDone}/77`, label: 'Darslar', color: 'white' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: 'rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '10px 6px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => navigate(`/lesson/${findNext()}`)} style={{
            width: '100%', padding: '13px',
            background: '#a3e635', border: 'none', borderRadius: 14,
            color: '#1a2e05', fontSize: 14, fontWeight: 900, cursor: 'pointer'
          }}>
            ▶ Davom etish: {activeTrack === 'topik' ? 'TOPIK' : 'EPS-TOPIK'}
          </button>
        </div>

        {/* Track switcher */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14,
          background: 'white', borderRadius: 16, padding: '5px',
          border: '0.5px solid rgba(124,58,237,0.12)'
        }}>
          {[
            { key: 'topik', label: '🎓 TOPIK' },
            { key: 'eps', label: '🏭 EPS-TOPIK' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTrack(t.key)} style={{
              flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 13, transition: 'all 0.2s',
              background: activeTrack === t.key ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
              color: activeTrack === t.key ? 'white' : '#9ca3af'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Track info */}
        <div onClick={() => navigate('/path')} style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 20, padding: '16px 18px', marginBottom: 14,
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>
              {activeTrack === 'topik' ? '🎓 TOPIK' : '🏭 EPS-TOPIK'}
            </div>
            <div style={{
              background: '#a3e635', color: '#1a2e05',
              fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 20
            }}>
              {activeTrack === 'topik' ? `${topikDone}/60` : `${epsDone}/67`} dars
            </div>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
            <div style={{
              height: '100%', borderRadius: 3, background: '#a3e635',
              width: `${activeTrack === 'topik' ? (topikDone/60)*100 : (epsDone/67)*100}%`,
              transition: 'width 0.5s'
            }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 8 }}>
            Barcha darslarni ko'rish →
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { icon: '📚', label: "O'rganish yo'li", path: '/path' },
            { icon: '🏆', label: 'Reyting', path: '/leaderboard' },
          ].map(a => (
            <div key={a.path} onClick={() => navigate(a.path)} style={{
              background: 'white', borderRadius: 16, padding: '14px',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              border: '0.5px solid rgba(124,58,237,0.12)'
            }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Premium banner */}
        {!currentPremium && (
          <div onClick={() => navigate('/premium')} style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            borderRadius: 20, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            border: '1px solid rgba(163,230,53,0.2)'
          }}>
            <span style={{ fontSize: 28 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'white' }}>Premium — 29 000 so'm</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Barcha darslarni oching!</div>
            </div>
            <div style={{
              background: '#a3e635', color: '#1a2e05',
              fontSize: 13, fontWeight: 900, padding: '6px 14px', borderRadius: 12
            }}>→</div>
          </div>
        )}
      </div>
    </div>
  )
}
