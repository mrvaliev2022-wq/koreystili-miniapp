import { useStore, TOPIK_LEVELS, EPS_LESSONS } from '../store'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const { user, xp, streak, weeklyXp, activeTrack, setActiveTrack, topikProgress, epsProgress, isPremium } = useStore()

  // Compute progress summary
  const getTopikSummary = () => {
    let done = 0, total = 60
    Object.values(topikProgress).forEach(lvl => {
      Object.values(lvl.lessonProgress).forEach(s => { if (s === 'done') done++ })
    })
    const currentLevel = TOPIK_LEVELS.find(l => {
      const lp = topikProgress[l.id]
      return lp.testStatus !== 'done'
    }) || TOPIK_LEVELS[5]
    const lvlDone = Object.values(topikProgress[currentLevel.id].lessonProgress).filter(s => s === 'done').length
    return { done, total, percent: Math.round(done / total * 100), currentLevel, lvlDone }
  }

  const getEpsSummary = () => {
    const lp = epsProgress.lessonProgress
    const done = Object.values(lp).filter(s => s === 'done').length
    return { done, total: 10, percent: Math.round(done / 10 * 100) }
  }

  const tSum = getTopikSummary()
  const eSum = getEpsSummary()

  const getNextAction = () => {
    if (activeTrack === 'topik') {
      // Priority: pending test > in-progress lesson > next available
      for (let li = 1; li <= 6; li++) {
        const lvl = topikProgress[li]
        if (lvl.testStatus === 'available') return { type: 'test', label: `${li}-daraja testini boshlash`, path: `/test/topik-test-${li}` }
      }
      for (let li = 1; li <= 6; li++) {
        const lvl = topikProgress[li]
        const avail = Object.entries(lvl.lessonProgress).find(([, s]) => s === 'available')
        if (avail) {
          const lesson = TOPIK_LEVELS[li - 1].lessons.find(l => l.id === avail[0])
          return { type: 'lesson', label: `Davom etish: ${lesson?.title}`, path: `/lesson/${avail[0]}` }
        }
      }
      return { type: 'done', label: 'TOPIK yakunlandi!', path: null }
    } else {
      if (epsProgress.finalTestStatus === 'available') return { type: 'test', label: 'EPS yakuniy testni boshlash', path: '/test/eps-final' }
      const avail = Object.entries(epsProgress.lessonProgress).find(([, s]) => s === 'available')
      if (avail) {
        const lesson = EPS_LESSONS.find(l => l.id === avail[0])
        return { type: 'lesson', label: `Davom etish: ${lesson?.title}`, path: `/lesson/${avail[0]}` }
      }
      return { type: 'done', label: 'EPS-TOPIK yakunlandi!', path: null }
    }
  }

  const next = getNextAction()
  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AB'

  return (
    <div className="page" style={{ padding: '0 0 90px' }}>

      {/* Top header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-bg)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: 'var(--accent2)', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>Xush kelibsiz</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{user.name || 'Foydalanuvchi'}</div>
          </div>
          {isPremium && <div className="badge badge-amber">⭐ Premium</div>}
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            { val: xp.toLocaleString(), lbl: 'XP ball' },
            { val: `${streak}`, lbl: streak === 1 ? '🔥 kun' : '🔥 kun' },
            { val: `#${Math.max(1, 50 - Math.floor(weeklyXp / 20))}`, lbl: 'Reyting' },
            { val: activeTrack === 'topik' ? `${tSum.done}/60` : `${eSum.done}/10`, lbl: 'Darslar' },
          ].map((s, i) => (
            <div className="stat-cell" key={i}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Track toggle */}
        <div className="track-toggle" style={{ marginBottom: 20 }}>
          <button className={`track-tab ${activeTrack === 'topik' ? 'active' : ''}`} onClick={() => setActiveTrack('topik')}>
            🎓 TOPIK
          </button>
          <button className={`track-tab ${activeTrack === 'eps' ? 'active' : ''}`} onClick={() => setActiveTrack('eps')}>
            🏭 EPS-TOPIK
          </button>
        </div>

        {/* Progress card */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                {activeTrack === 'topik' ? `${tSum.currentLevel.id}-daraja` : 'EPS-TOPIK'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {activeTrack === 'topik'
                  ? `${tSum.lvlDone}/10 dars bajarildi`
                  : `${eSum.done}/10 dars bajarildi`}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent2)' }}>
              {activeTrack === 'topik' ? tSum.percent : eSum.percent}%
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${activeTrack === 'topik' ? tSum.percent : eSum.percent}%` }} />
          </div>
        </div>

        {/* Continue button */}
        {next.path ? (
          <button
            className={`btn ${next.type === 'test' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => navigate(next.path)}
            style={{ marginBottom: 14 }}
          >
            {next.type === 'test' ? '📝' : '▶'} {next.label}
          </button>
        ) : (
          <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
            <div style={{ fontWeight: 800 }}>{next.label}</div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px' }}>
        <div className="section-title">Tezkor harakatlar</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { emoji: '📖', label: "O'rganish yo'li", path: '/path' },
            { emoji: '🔄', label: 'Takrorlash', path: '/review' },
            { emoji: '🏆', label: 'Reyting', path: '/leaderboard' },
            { emoji: '👤', label: 'Profil', path: '/profile' },
          ].map(item => (
            <button
              key={item.path}
              className="card-sm"
              onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: '0.5px solid var(--border)', background: 'var(--bg3)', width: '100%', textAlign: 'left' }}
            >
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Referral banner */}
        {!isPremium && (
          <button
            onClick={() => navigate('/referral')}
            style={{ width: '100%', background: 'var(--accent-bg)', border: '1px solid rgba(124,111,247,0.3)', borderRadius: 'var(--radius)', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>10 do'st = 30 kun Premium bepul</div>
              <div style={{ fontSize: 12, color: 'var(--accent2)', marginTop: 2 }}>Do'stlarni taklif qiling →</div>
            </div>
          </button>
        )}
      </div>

      {/* Level overview for TOPIK */}
      {activeTrack === 'topik' && (
        <div style={{ padding: '20px 20px 0' }}>
          <div className="section-title">Darajalar</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOPIK_LEVELS.map(level => {
              const lp = topikProgress[level.id]
              const doneLessons = Object.values(lp.lessonProgress).filter(s => s === 'done').length
              const isLocked = doneLessons === 0 && level.id > 1 && topikProgress[level.id - 1]?.testStatus !== 'done'
              const isDone = lp.testStatus === 'done'
              return (
                <button
                  key={level.id}
                  onClick={() => !isLocked && navigate(`/path?level=${level.id}`)}
                  style={{
                    background: 'var(--bg3)', border: `0.5px solid ${isDone ? 'var(--green)' : isLocked ? 'var(--border)' : 'var(--border2)'}`,
                    borderRadius: 'var(--radius-sm)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                    cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.5 : 1, width: '100%',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: isDone ? 'var(--green-bg)' : isLocked ? 'var(--bg)' : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {isDone ? '✅' : isLocked ? '🔒' : '📚'}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{level.id}-daraja — {level.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{doneLessons}/10 dars</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isDone ? 'var(--green)' : 'var(--text3)' }}>
                    {isDone ? 'Tugallandi' : `${Math.round(doneLessons / 10 * 100)}%`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
