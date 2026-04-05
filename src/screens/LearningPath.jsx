import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import { checkPremium } from '../api'

const FREE_LESSONS = 2

export default function LearningPath() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const levelParam = parseInt(searchParams.get('level')) || null

  const { activeTrack, setActiveTrack, topikProgress, epsProgress, isPremium, activatePremium } = useStore()
  const [isPremiumBackend, setIsPremiumBackend] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(levelParam || 1)

  useEffect(() => {
    checkPremium().then(p => { if (p) { setIsPremiumBackend(true); activatePremium(-1) } })
  }, [])

  const currentPremium = isPremium || isPremiumBackend

  const handleLesson = (lessonId, lessonNum) => {
    if (lessonNum > FREE_LESSONS && !currentPremium) {
      navigate('/premium')
      return
    }
    navigate(`/lesson/${lessonId}`)
  }

  // EPS lessons list
  const EPS_LESSONS = [
    ...Array.from({ length: 7 }, (_, i) => ({ id: `alpha-${i+1}`, num: i+1, title: `Alifbo ${i+1}`, track: 'eps' })),
    ...Array.from({ length: 30 }, (_, i) => ({ id: `eps-${i+1}`, num: i+8, title: `EPS ${i+1}-dars`, track: 'eps' })),
  ]

  const TOPIK_LEVELS = [
    { lvl: 1, name: "Boshlang'ich", emoji: '📗' },
    { lvl: 2, name: 'Asosiy', emoji: '📘' },
    { lvl: 3, name: "O'rta", emoji: '📙' },
    { lvl: 4, name: "Yuqori o'rta", emoji: '📕' },
    { lvl: 5, name: "Ilg'or", emoji: '📔' },
    { lvl: 6, name: 'Ekspert', emoji: '📒' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <button onClick={() => navigate('/')} style={{
          width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
          border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16
        }}>←</button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>
          📚 O'rganish yo'li
        </div>
        {!currentPremium && (
          <button onClick={() => navigate('/premium')} style={{
            background: '#a3e635', color: '#1a2e05',
            fontSize: 11, fontWeight: 800, padding: '4px 10px',
            borderRadius: 20, border: 'none', cursor: 'pointer'
          }}>👑 Premium</button>
        )}
      </div>

      <div style={{ padding: '14px 16px' }}>

        {/* Track switcher */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
          background: 'white', borderRadius: 16, padding: '5px',
          border: '0.5px solid rgba(124,58,237,0.12)'
        }}>
          {[
            { key: 'topik', label: '🎓 TOPIK' },
            { key: 'eps', label: '🏭 EPS-TOPIK' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTrack(t.key)} style={{
              flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 13,
              background: activeTrack === t.key ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
              color: activeTrack === t.key ? 'white' : '#9ca3af'
            }}>{t.label}</button>
          ))}
        </div>

        {/* TOPIK */}
        {activeTrack === 'topik' && (
          <div>
            {/* Level tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
              {TOPIK_LEVELS.map(({ lvl, name, emoji }) => {
                const lp = topikProgress[lvl]?.lessonProgress || {}
                const done = Object.values(lp).filter(s => s === 'done').length
                const active = selectedLevel === lvl
                return (
                  <button key={lvl} onClick={() => setSelectedLevel(lvl)} style={{
                    padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
                    background: active ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'white',
                    color: active ? 'white' : '#6b7280',
                    border: active ? 'none' : '0.5px solid rgba(124,58,237,0.2)'
                  }}>
                    {emoji} {lvl}-daraja ({done}/10)
                  </button>
                )
              })}
            </div>

            {/* Lessons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 10 }, (_, i) => {
                const lessonId = `topik-${selectedLevel}-${i + 1}`
                const lp = topikProgress[selectedLevel]?.lessonProgress || {}
                const status = lp[lessonId] || 'locked'
                const isDone = status === 'done'
                const isAvailable = status === 'available'
                const isLocked = status === 'locked'
                const needPrem = (i + 1) > FREE_LESSONS && !currentPremium

                return (
                  <div key={lessonId} onClick={() => {
                    if (!isLocked || isDone) handleLesson(lessonId, i + 1)
                  }} style={{
                    background: isDone ? '#f0fdf4' : isAvailable ? 'white' : '#f9fafb',
                    borderRadius: 16, padding: '14px 16px',
                    border: `1px solid ${isDone ? 'rgba(21,128,61,0.25)' : isAvailable ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.08)'}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: (!isLocked || isDone) ? 'pointer' : 'not-allowed',
                    opacity: isLocked && !isDone ? 0.5 : 1
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: isDone ? '#dcfce7' : isAvailable ? '#ede9fe' : '#f5f3ff',
                      border: `1px solid ${isDone ? 'rgba(21,128,61,0.2)' : isAvailable ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800,
                      color: isDone ? '#15803d' : isAvailable ? '#7c3aed' : '#c4b5fd'
                    }}>
                      {isDone ? '✓' : needPrem ? '👑' : isLocked ? '🔒' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>
                        {selectedLevel}-daraja, {i + 1}-dars
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {isDone ? '✅ Bajarildi' : needPrem ? '👑 Premium kerak' : isAvailable ? '▶ Davom etish' : '🔒 Qulfli'}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isDone ? '#15803d' : '#a78bfa' }}>
                      +20 XP
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* EPS */}
        {activeTrack === 'eps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EPS_LESSONS.map(({ id, num, title }, i) => {
              const lp = epsProgress.lessonProgress || {}
              const status = lp[id] || (i === 0 ? 'available' : 'locked')
              const isDone = status === 'done'
              const isAvailable = status === 'available'
              const isLocked = status === 'locked'
              const needPrem = num > FREE_LESSONS && !currentPremium

              return (
                <div key={id} onClick={() => {
                  if (!isLocked || isDone) handleLesson(id, num)
                }} style={{
                  background: isDone ? '#f0fdf4' : isAvailable ? 'white' : '#f9fafb',
                  borderRadius: 16, padding: '14px 16px',
                  border: `1px solid ${isDone ? 'rgba(21,128,61,0.25)' : isAvailable ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.08)'}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: (!isLocked || isDone) ? 'pointer' : 'not-allowed',
                  opacity: isLocked && !isDone ? 0.5 : 1
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: isDone ? '#dcfce7' : isAvailable ? '#ede9fe' : '#f5f3ff',
                    border: `1px solid ${isDone ? 'rgba(21,128,61,0.2)' : isAvailable ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800,
                    color: isDone ? '#15803d' : isAvailable ? '#7c3aed' : '#c4b5fd'
                  }}>
                    {isDone ? '✓' : needPrem ? '👑' : isLocked ? '🔒' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      {isDone ? '✅ Bajarildi' : needPrem ? '👑 Premium kerak' : isAvailable ? '▶ Davom etish' : '🔒 Qulfli'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isDone ? '#15803d' : '#a78bfa' }}>
                    +20 XP
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
