import { useNavigate } from 'react-router-dom'
import { useStore, getTgUser } from '../store'

export default function Profile() {
  const navigate = useNavigate()
  const { xp, streak, isPremium, topikProgress, epsProgress } = useStore()
  const tgUser = getTgUser()

  const topikDone = Object.values(topikProgress).reduce((acc, lvl) =>
    acc + Object.values(lvl.lessonProgress || {}).filter(s => s === 'done').length, 0)
  const epsDone = Object.values(epsProgress.lessonProgress || {}).filter(s => s === 'done').length
  const totalDone = topikDone + epsDone

  const userName = tgUser?.name || "O'quvchi"

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)'
      }}>
        <button onClick={() => navigate('/')} style={{
          width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
          border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16
        }}>←</button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>👤 Profil</div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Avatar card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 24, padding: '24px', marginBottom: 16, textAlign: 'center'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
            background: 'rgba(163,230,53,0.2)', border: '3px solid #a3e635',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#a3e635'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 4 }}>{userName}</div>
          {tgUser?.username && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>@{tgUser.username}</div>
          )}
          {isPremium && (
            <div style={{
              display: 'inline-block', marginTop: 8,
              background: '#a3e635', color: '#1a2e05',
              fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20
            }}>👑 Premium</div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '⚡', label: 'XP ball', value: xp, color: '#7c3aed' },
            { icon: '🔥', label: 'Streak', value: `${streak} kun`, color: '#f97316' },
            { icon: '📚', label: 'TOPIK darslar', value: `${topikDone}/60`, color: '#3b82f6' },
            { icon: '🏭', label: 'EPS darslar', value: `${epsDone}/67`, color: '#10b981' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 16, padding: '14px',
              border: '0.5px solid rgba(124,58,237,0.12)'
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <div style={{ background: 'white', borderRadius: 20, padding: '16px', marginBottom: 16, border: '0.5px solid rgba(124,58,237,0.12)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', marginBottom: 14 }}>📊 Progress</div>
          {[
            { label: 'TOPIK', done: topikDone, total: 60, color: '#7c3aed' },
            { label: 'EPS-TOPIK', done: epsDone, total: 67, color: '#10b981' },
          ].map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{p.label}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{p.done}/{p.total}</span>
              </div>
              <div style={{ height: 8, background: '#f5f3ff', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: `linear-gradient(90deg, ${p.color}, ${p.color}99)`,
                  width: `${(p.done / p.total) * 100}%`, transition: 'width 0.5s'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Premium banner */}
        {!isPremium && (
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
            <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 13, fontWeight: 900, padding: '6px 14px', borderRadius: 12 }}>→</div>
          </div>
        )}
      </div>
    </div>
  )
}
