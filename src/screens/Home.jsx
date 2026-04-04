import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getTelegramUser, initTelegramApp } from '../store'
const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

function getTgUserId() {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null } catch { return null }
}

// ── Glassmorphism stat card ──────────────────────────────────────────
function StatCard({ value, label, accent }) {
  return (
    <div style={{
      flex: 1,
      background: 'white',
      borderRadius: 16,
      padding: '14px 10px',
      textAlign: 'center',
      border: '1px solid rgba(124,58,237,0.1)',
      boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: accent || '#1e1b4b' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  )
}

// ── Stacked track card ───────────────────────────────────────────────
function TrackCard({ emoji, title, sub, progress, total, done, active, onClick, dark }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div onClick={onClick} style={{
      borderRadius: 20,
      padding: '16px 18px',
      cursor: 'pointer',
      background: dark ? 'linear-gradient(135deg, #1e1b4b, #3730a3)' : '#f5f3ff',
      border: dark ? 'none' : `1.5px solid ${active ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.15)'}`,
      boxShadow: active && !dark ? '0 4px 16px rgba(124,58,237,0.15)' : 'none',
      transition: 'all 0.2s',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13,
            background: dark ? 'rgba(255,255,255,0.1)' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, border: dark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(124,58,237,0.15)'
          }}>{emoji}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: dark ? 'white' : '#1e1b4b' }}>{title}</div>
            <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : '#9ca3af', marginTop: 1 }}>{sub}</div>
          </div>
        </div>
        <div style={{
          background: dark ? '#a3e635' : active ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#ede9fe',
          color: dark ? '#1a2e05' : active ? 'white' : '#7c3aed',
          fontSize: 12, fontWeight: 800, padding: '4px 11px', borderRadius: 20
        }}>{pct}%</div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 5, background: dark ? 'rgba(255,255,255,0.12)' : '#ede9fe', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: dark ? '#a3e635' : 'linear-gradient(90deg,#7c3aed,#a855f7)',
          width: `${pct}%`, transition: 'width 0.5s'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}>
          {done}/{total} dars bajarildi
        </div>
        {active && (
          <div style={{ fontSize: 11, fontWeight: 700, color: dark ? '#a3e635' : '#7c3aed' }}>
            Davom etish →
          </div>
        )}
      </div>
    </div>
  )
}

// ── Quick action button ──────────────────────────────────────────────
function QuickBtn({ emoji, label, onClick, highlight }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, minWidth: 0,
      background: highlight ? 'linear-gradient(135deg,#1e1b4b,#3730a3)' : 'white',
      borderRadius: 16, padding: '14px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', transition: 'all 0.2s',
      border: highlight ? 'none' : '0.5px solid rgba(124,58,237,0.12)',
      boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 11, flexShrink: 0,
        background: highlight ? 'rgba(255,255,255,0.1)' : '#f5f3ff',
        border: highlight ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(124,58,237,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
      }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: highlight ? 'white' : '#1e1b4b', lineHeight: 1.2 }}>
        {label}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// MAIN HOME COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function Home() {
  const navigate = useNavigate()
  const {
    user, setUser, activeTrack, setActiveTrack,
    topikProgress, epsProgress, xp, streak,
    isPremium, referralCode, activatePremium
  } = useStore()

  const [leaderRank, setLeaderRank] = useState(null)
  const [totalLessons, setTotalLessons] = useState(97)
  const [doneLessons, setDoneLessons] = useState(0)
  const [isPremiumBackend, setIsPremiumBackend] = useState(false)
  const [greeting, setGreeting] = useState('Xush kelibsiz')

  useEffect(() => {
    initTelegramApp()
    const tgUser = getTelegramUser()
    if (tgUser.name) setUser(tgUser)

    // Greeting by time
    const h = new Date().getHours()
    if (h < 6)        setGreeting("Xayrli tun")
    else if (h < 12)  setGreeting("Xayrli tong")
    else if (h < 17)  setGreeting("Xayrli kun")
    else if (h < 21)  setGreeting("Xayrli kech")
    else              setGreeting("Xayrli tun")

    // Backend premium check
    const userId = getTgUserId()
    if (userId) {
      fetch(`${BASE}/payment/daily-check?user_id=${userId}`)
        .then(r => r.json())
        .then(data => {
          if (data.is_premium) {
            setIsPremiumBackend(true)
            activatePremium(-1)
          }
        }).catch(() => {})

      // Leaderboard rank
      fetch(`${BASE}/leaderboard?user_id=${userId}`)
        .then(r => r.json())
        .then(data => {
          const myRank = data?.myRank || data?.rank
          if (myRank) setLeaderRank(myRank)
        }).catch(() => {})
    }
  }, [])

  // Calc done lessons
  useEffect(() => {
    let done = 0
    for (let lvl = 1; lvl <= 6; lvl++) {
      done += Object.values(topikProgress[lvl]?.lessonProgress || {}).filter(s => s === 'done').length
    }
    done += Object.values(epsProgress.lessonProgress || {}).filter(s => s === 'done').length
    setDoneLessons(done)
  }, [topikProgress, epsProgress])

  // Topik stats
  const topikDone = Object.values(topikProgress).reduce((acc, lvl) =>
    acc + Object.values(lvl.lessonProgress || {}).filter(s => s === 'done').length, 0)
  const epsDone = Object.values(epsProgress.lessonProgress || {}).filter(s => s === 'done').length

  // Next lesson finder
  const findNextLesson = () => {
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
      const allEpsIds = [
        ...Array.from({ length: 7 }, (_, i) => `alpha-${i + 1}`),
        ...Array.from({ length: 30 }, (_, i) => `eps-${i + 1}`),
        ...Array.from({ length: 30 }, (_, i) => `eps2-${i + 11}`),
      ]
      for (const id of allEpsIds) {
        if (lp[id] === 'available') return id
      }
      return 'alpha-1'
    }
  }

  const currentPremium = isPremium || isPremiumBackend
  const userName = user?.name?.split(' ')[0] || 'O\'quvchi'

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#f5f3ff',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: 90,
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'white',
        padding: '16px 18px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '0.5px solid rgba(124,58,237,0.1)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'white', fontWeight: 900
          }}>K</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#1e1b4b', lineHeight: 1 }}>KoreysApp</div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>TOPIK · EPS</div>
          </div>
        </div>

        {/* Right: premium badge + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentPremium && (
            <div style={{
              background: '#a3e635', color: '#1a2e05',
              fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20
            }}>👑 Premium</div>
          )}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#a3e635',
            border: '2px solid rgba(163,230,53,0.3)',
            cursor: 'pointer'
          }} onClick={() => navigate('/profile')}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── WELCOME HERO ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 24, padding: '20px 20px 18px',
          margin: '14px 0 12px',
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 3 }}>
                {greeting}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{userName} 👋</div>
            </div>
            {streak > 0 && (
              <div style={{
                background: 'rgba(163,230,53,0.15)',
                border: '1px solid rgba(163,230,53,0.3)',
                borderRadius: 14, padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span style={{ fontSize: 16 }}>🔥</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#a3e635', lineHeight: 1 }}>{streak}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>KUN</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { val: xp, label: 'XP ball', color: '#a3e635' },
              { val: streak > 0 ? `${streak} 🔥` : '0', label: 'Kun streak', color: 'white' },
              { val: leaderRank ? `#${leaderRank}` : '—', label: 'Reyting', color: '#c4b5fd' },
              { val: `${doneLessons}/${totalLessons}`, label: 'Darslar', color: 'white' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: 'rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '10px 6px', textAlign: 'center',
                border: '0.5px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Continue button */}
          <button onClick={() => navigate(`/lesson/${findNextLesson()}`)} style={{
            width: '100%', padding: '13px',
            background: '#a3e635', border: 'none', borderRadius: 14,
            color: '#1a2e05', fontSize: 14, fontWeight: 900, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s'
          }}>
            ▶ Davom etish: {activeTrack === 'topik' ? 'TOPIK' : 'EPS-TOPIK'}
          </button>
        </div>

        {/* ── TRACK SWITCHER ── */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14,
          background: 'white', borderRadius: 16, padding: '5px',
          border: '0.5px solid rgba(124,58,237,0.12)'
        }}>
          {[
            { key: 'topik', label: '🎓 TOPIK' },
            { key: 'eps',   label: '🏭 EPS-TOPIK' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTrack(t.key)} style={{
              flex: 1, padding: '10px',
              borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 13, transition: 'all 0.2s',
              background: activeTrack === t.key
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'transparent',
              color: activeTrack === t.key ? 'white' : '#9ca3af',
              boxShadow: activeTrack === t.key ? '0 3px 10px rgba(124,58,237,0.3)' : 'none'
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── TRACK CARDS (stacked) ── */}
        {activeTrack === 'topik' ? (
          <div>
            {/* Current active level — dark card on top */}
            {[1,2,3,4,5,6].map(lvl => {
              const lp = topikProgress[lvl]?.lessonProgress || {}
              const done = Object.values(lp).filter(s => s === 'done').length
              const hasAvailable = Object.values(lp).some(s => s === 'available')
              if (!hasAvailable && done === 0 && lvl > 1) return null
              return (
                <TrackCard
                  key={lvl}
                  emoji={['📗','📘','📙','📕','📔','📒'][lvl-1]}
                  title={`${lvl}-daraja`}
                  sub={['Boshlang\'ich','Asosiy','O\'rta','Yuqori o\'rta','Ilg\'or','Ekspert'][lvl-1]}
                  done={done}
                  total={10}
                  active={hasAvailable}
                  dark={hasAvailable && lvl === ([1,2,3,4,5,6].find(l => {
                    const p = topikProgress[l]?.lessonProgress || {}
                    return Object.values(p).some(s => s === 'available')
                  }))}
                  onClick={() => navigate(`/learning-path?level=${lvl}`)}
                />
              )
            })}

            {/* TOPIK full path button */}
            <div onClick={() => navigate('/learning-path')} style={{
              background: 'white', borderRadius: 18, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              border: '0.5px solid rgba(124,58,237,0.12)',
              boxShadow: '0 2px 8px rgba(124,58,237,0.05)', marginBottom: 10
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>📚</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e1b4b' }}>Barcha darajalar</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                  {topikDone}/60 dars · {[1,2,3,4,5,6].filter(l => topikProgress[l]?.testStatus === 'done').length}/6 daraja
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 700 }}>→</div>
            </div>
          </div>
        ) : (
          <div>
            <TrackCard
              emoji="🏭"
              title="EPS-TOPIK"
              sub="Ish joyi koreys tili"
              done={epsDone}
              total={10}
              active={Object.values(epsProgress.lessonProgress || {}).some(s => s === 'available')}
              dark={true}
              onClick={() => navigate('/learning-path')}
            />
          </div>
        )}

        {/* ── QUICK ACTIONS ── */}
        <div style={{
          fontSize: 11, fontWeight: 800, color: '#9ca3af',
          letterSpacing: 1.5, marginBottom: 10, marginTop: 4
        }}>TEZKOR HARAKATLAR</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <QuickBtn emoji="📚" label="O'rganish yo'li" onClick={() => navigate('/learning-path')} />
          <QuickBtn emoji="🔄" label="Takrorlash" onClick={() => navigate('/learning-path')} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <QuickBtn emoji="🏆" label="Reyting" onClick={() => navigate('/leaderboard')} />
          <QuickBtn emoji="👤" label="Profil" onClick={() => navigate('/profile')} />
        </div>

        {/* ── PREMIUM BANNER ── */}
        {!currentPremium ? (
          <div onClick={() => navigate('/premium')} style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            borderRadius: 20, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', marginBottom: 10,
            border: '1px solid rgba(163,230,53,0.2)'
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'rgba(163,230,53,0.1)',
              border: '0.5px solid rgba(163,230,53,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
            }}>👑</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'white', marginBottom: 2 }}>
                Premium olish — 29 000 so'm
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                Barcha 60 ta darsni oching!
              </div>
            </div>
            <div style={{
              background: '#a3e635', color: '#1a2e05',
              fontSize: 13, fontWeight: 900, padding: '6px 14px', borderRadius: 12
            }}>→</div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            borderRadius: 20, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
            border: '1px solid rgba(163,230,53,0.25)'
          }}>
            <span style={{ fontSize: 24 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#a3e635' }}>Premium faol!</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
                Barcha darslar ochiq
              </div>
            </div>
            <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 12 }}>
              FAOL
            </div>
          </div>
        )}

        {/* ── REFERRAL BANNER ── */}
        <div onClick={() => navigate('/premium')} style={{
          background: 'white',
          borderRadius: 18, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', marginBottom: 4,
          border: '0.5px solid rgba(124,58,237,0.12)',
          boxShadow: '0 2px 8px rgba(124,58,237,0.05)'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
          }}>🎁</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b' }}>
              10 do'st = 30 kun Premium bepul
            </div>
            <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginTop: 2 }}>
              Do'stlarni taklif qiling →
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

