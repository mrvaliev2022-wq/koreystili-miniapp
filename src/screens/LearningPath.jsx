import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, TOPIK_LEVELS, EPS_LESSONS } from '../store'
import { ChevronLeft } from 'lucide-react'

export default function LearningPath() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const levelFilter = params.get('level') ? parseInt(params.get('level')) : null
  const { activeTrack, topikProgress, epsProgress } = useStore()

  const renderTopik = () => {
    const levels = levelFilter ? TOPIK_LEVELS.filter(l => l.id === levelFilter) : TOPIK_LEVELS
    return levels.map(level => {
      const lp = topikProgress[level.id]
      const doneLessons = Object.values(lp.lessonProgress).filter(s => s === 'done').length
      return (
        <div key={level.id} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{level.id}-daraja</div>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{doneLessons}/10</div>
          </div>

          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {level.lessons.map((lesson, i) => {
              const status = lp.lessonProgress[lesson.id] || 'locked'
              return <LessonRow key={lesson.id} lesson={lesson} status={status} number={i + 1} onClick={() => status !== 'locked' && navigate(`/lesson/${lesson.id}`)} />
            })}

            {/* Level test */}
            <div
              onClick={() => lp.testStatus === 'available' && navigate(`/test/${level.test.id}`)}
              style={{
                background: lp.testStatus === 'done' ? 'var(--green-bg)' : lp.testStatus === 'available' ? 'var(--accent-bg)' : 'var(--bg3)',
                border: `1.5px solid ${lp.testStatus === 'done' ? 'var(--green)' : lp.testStatus === 'available' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: lp.testStatus === 'available' ? 'pointer' : 'default',
                opacity: lp.testStatus === 'locked' ? 0.4 : 1,
                marginTop: 4,
              }}
            >
              <div style={{ fontSize: 20 }}>
                {lp.testStatus === 'done' ? '🏅' : lp.testStatus === 'available' ? '📝' : '🔒'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{level.id}-daraja testi</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                  {lp.testStatus === 'done' ? `Natija: ${lp.testScore}%` : lp.testStatus === 'available' ? 'Testga tayyor! Boshlang' : '10 ta darsni bajaring'}
                </div>
              </div>
              {lp.testStatus === 'available' && (
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)' }}>Boshlash →</div>
              )}
            </div>
          </div>
        </div>
      )
    })
  }

  const renderEps = () => {
    const lp = epsProgress.lessonProgress
    return (
      <div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {EPS_LESSONS.map((lesson, i) => {
            const status = lp[lesson.id] || 'locked'
            return <LessonRow key={lesson.id} lesson={lesson} status={status} number={i + 1} onClick={() => status !== 'locked' && navigate(`/lesson/${lesson.id}`)} />
          })}

          {/* Final test */}
          <div
            onClick={() => epsProgress.finalTestStatus === 'available' && navigate('/test/eps-final')}
            style={{
              background: epsProgress.finalTestStatus === 'done' ? 'var(--green-bg)' : epsProgress.finalTestStatus === 'available' ? 'var(--accent-bg)' : 'var(--bg3)',
              border: `1.5px solid ${epsProgress.finalTestStatus === 'done' ? 'var(--green)' : epsProgress.finalTestStatus === 'available' ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: epsProgress.finalTestStatus === 'available' ? 'pointer' : 'default',
              opacity: epsProgress.finalTestStatus === 'locked' ? 0.4 : 1, marginTop: 4,
            }}
          >
            <div style={{ fontSize: 20 }}>
              {epsProgress.finalTestStatus === 'done' ? '🏆' : epsProgress.finalTestStatus === 'available' ? '📝' : '🔒'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>EPS-TOPIK yakuniy testi</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {epsProgress.finalTestStatus === 'done' ? `Natija: ${epsProgress.finalTestScore}%` : epsProgress.finalTestStatus === 'available' ? "Testga tayyor! Boshlang" : '10 ta darsni bajaring'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">
          {activeTrack === 'topik' ? levelFilter ? `${levelFilter}-daraja` : "O'rganish yo'li" : 'EPS-TOPIK yo\'li'}
        </div>
      </div>
      <div style={{ paddingTop: 16 }}>
        {activeTrack === 'topik' ? renderTopik() : renderEps()}
      </div>
    </div>
  )
}

function LessonRow({ lesson, status, number, onClick }) {
  return (
    <div
      onClick={onClick}
      className={status === 'locked' ? 'lesson-locked' : ''}
      style={{
        background: 'var(--bg3)',
        border: `0.5px solid ${status === 'done' ? 'var(--green)' : status === 'available' ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12,
        cursor: status === 'locked' ? 'not-allowed' : 'pointer',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: status === 'done' ? 'var(--green-bg)' : status === 'available' ? 'var(--accent-bg)' : 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
        border: `1px solid ${status === 'done' ? 'var(--green)' : status === 'available' ? 'var(--accent)' : 'var(--border)'}`,
        fontWeight: 700, color: status === 'done' ? 'var(--green)' : 'var(--text3)',
      }}>
        {status === 'done' ? '✓' : status === 'locked' ? '🔒' : number}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{lesson.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>+{lesson.xp} XP</div>
      </div>
      {status === 'available' && <div style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 700 }}>→</div>}
    </div>
  )
}
