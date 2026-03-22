import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, TOPIK_LEVELS, EPS_LESSONS } from '../store'
import { ChevronLeft, Crown, Lock } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

function getTgUserId() {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null } catch { return null }
}

// Dars raqami 3 dan katta = premium kerak
const FREE_LESSONS = 2

export default function LearningPath() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const levelFilter = params.get('level') ? parseInt(params.get('level')) : null
  const { activeTrack, topikProgress, epsProgress } = useStore()
  const [isPremium, setIsPremium] = useState(false)
  const [dailyInfo, setDailyInfo] = useState({ lessons_today: 0, daily_limit: 6, can_study: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = getTgUserId()
    if (!userId) { setLoading(false); return }
    fetch(`${BASE}/payment/daily-check?user_id=${userId}`)
      .then(r => r.json())
      .then(data => {
        setIsPremium(data.is_premium || false)
        setDailyInfo({
          lessons_today: data.lessons_today || 0,
          daily_limit: data.daily_limit || 6,
          can_study: data.can_study !== false
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLessonClick = (lesson, status, lessonNumber) => {
    if (status === 'locked') return

    // Premium tekshiruv (dars 3 dan)
    if (lessonNumber > FREE_LESSONS && !isPremium) {
      navigate('/premium')
      return
    }

    // Kunlik limit tekshiruv
    if (isPremium && !dailyInfo.can_study) {
      return // Ko'rsatiladi pastda
    }

    navigate(`/lesson/${lesson.id}`)
  }

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
              const lessonNumber = i + 1
              const status = lp.lessonProgress[lesson.id] || 'locked'
              const needsPremium = lessonNumber > FREE_LESSONS && !isPremium
              return (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  status={status}
                  number={lessonNumber}
                  needsPremium={needsPremium}
                  dailyLimitReached={isPremium && !dailyInfo.can_study}
                  onClick={() => handleLessonClick(lesson, status, lessonNumber)}
                />
              )
            })}
            {/* Level test */}
            <div
              onClick={() => lp.testStatus === 'available' && navigate(`/test/${level.test.id}`)}
              style={{
                background: lp.testStatus === 'done' ? 'var(--green-bg)' : lp.testStatus === 'available' ? 'var(--accent-bg)' : 'var(--bg3)',
                border: `1.5px solid ${lp.testStatus === 'done' ? 'var(--green)' : lp.testStatus === 'available' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: lp.testStatus === 'available' ? 'pointer' : 'default',
                opacity: lp.testStatus === 'locked' ? 0.4 : 1, marginTop: 4,
              }}>
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
            const lessonNumber = i + 1
            const status = lp[lesson.id] || 'locked'
            const needsPremium = lessonNumber > FREE_LESSONS && !isPremium
            return (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                status={status}
                number={lessonNumber}
                needsPremium={needsPremium}
                dailyLimitReached={isPremium && !dailyInfo.can_study}
                onClick={() => handleLessonClick(lesson, status, lessonNumber)}
              />
            )
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
            }}>
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
        {/* Premium badge */}
        {isPremium && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 20, padding: '4px 10px' }}>
            <Crown size={12} color="white" />
            <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>Premium</span>
          </div>
        )}
      </div>

      {/* Kunlik limit banner */}
      {isPremium && !dailyInfo.can_study && (
        <div style={{ margin: '0 16px 12px', background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>⏰</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#856404' }}>Kunlik limit tugadi!</div>
            <div style={{ fontSize: 12, color: '#856404', marginTop: 2 }}>
              Bugun {dailyInfo.daily_limit} ta dars o'qidingiz. Ertaga davom eting! 💪
            </div>
          </div>
        </div>
      )}

      {/* Dars progress banner (premium uchun) */}
      {isPremium && dailyInfo.can_study && (
        <div style={{ margin: '0 16px 12px', background: 'var(--bg3)', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Bugungi darslar: <strong style={{ color: 'var(--accent2)' }}>{dailyInfo.lessons_today}/{dailyInfo.daily_limit}</strong>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: dailyInfo.daily_limit }).map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < dailyInfo.lessons_today ? 'var(--accent)' : 'var(--border)' }} />
            ))}
          </div>
        </div>
      )}

      {/* Bepul foydalanuvchi uchun premium banner */}
      {!isPremium && !loading && (
        <div
          onClick={() => navigate('/premium')}
          style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, var(--accent), var(--accent2), #c084fc)', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>👑</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Premium olish — 29 000 so'm</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              3-darsdan barcha darslarni oching!
            </div>
          </div>
          <div style={{ fontSize: 18 }}>→</div>
        </div>
      )}

      <div style={{ paddingTop: 4, paddingBottom: 80 }}>
        {activeTrack === 'topik' ? renderTopik() : renderEps()}
      </div>
    </div>
  )
}

function LessonRow({ lesson, status, number, needsPremium, dailyLimitReached, onClick }) {
  const isLocked = status === 'locked'
  const showPremiumLock = needsPremium && status !== 'done'
  const showDailyLimit = dailyLimitReached && !needsPremium && status === 'available'

  let borderColor = 'var(--border)'
  let bg = 'var(--bg3)'
  if (status === 'done') { borderColor = 'var(--green)'; bg = 'var(--green-bg)' }
  else if (showPremiumLock) { borderColor = '#f59e0b'; bg = '#fffbeb' }
  else if (status === 'available' && !dailyLimitReached) { borderColor = 'var(--accent)'; bg = 'var(--card)' }

  return (
    <div
      onClick={onClick}
      style={{
        background: bg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-sm)',
        padding: '13px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked && !showPremiumLock ? 0.5 : 1,
        transition: 'all 0.2s'
      }}>
      {/* Status icon */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: status === 'done' ? 'var(--green-bg)' : showPremiumLock ? '#fef3c7' : status === 'available' ? 'var(--accent-bg)' : 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
        border: `1.5px solid ${status === 'done' ? 'var(--green)' : showPremiumLock ? '#f59e0b' : status === 'available' ? 'var(--accent)' : 'var(--border)'}`,
        fontWeight: 700,
      }}>
        {status === 'done' ? '✓' : showPremiumLock ? <Crown size={16} color="#f59e0b" /> : isLocked ? '🔒' : number}
      </div>

      {/* Lesson info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{lesson.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
          {showPremiumLock ? '👑 Premium kerak' : showDailyLimit ? '⏰ Limit tugadi' : `+${lesson.xp || lesson.xp_reward || 10} XP`}
        </div>
      </div>

      {/* Right arrow / premium badge */}
      {showPremiumLock && (
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 8, padding: '4px 8px' }}>
          <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>👑 Premium</span>
        </div>
      )}
      {status === 'available' && !showPremiumLock && !showDailyLimit && (
        <div style={{ fontSize: 13, color: 'var(--accent2)', fontWeight: 700 }}>→</div>
      )}
    </div>
  )
}
