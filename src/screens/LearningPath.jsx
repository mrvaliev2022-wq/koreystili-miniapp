import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, TOPIK_LEVELS, EPS_LESSONS } from '../store'
import { ChevronLeft, Crown } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

function getTgUserId() {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null } catch { return null }
}

const FREE_LESSONS = 2

export default function LearningPath() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const levelFilter = params.get('level') ? parseInt(params.get('level')) : null
  const { activeTrack, topikProgress, epsProgress, activatePremium } = useStore()
  const [isPremium, setIsPremium] = useState(false)
  const [dailyInfo, setDailyInfo] = useState({ lessons_today: 0, daily_limit: 6, can_study: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = getTgUserId()
    if (!userId) { setLoading(false); return }
    fetch(`${BASE}/payment/daily-check?user_id=${userId}`)
      .then(r => r.json())
      .then(data => {
        const premium = data.is_premium || false
        setIsPremium(premium)
        setDailyInfo({
          lessons_today: data.lessons_today || 0,
          daily_limit: data.daily_limit || 6,
          can_study: data.can_study !== false
        })
        if (premium) activatePremium(-1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLessonClick = (lesson, status, lessonNumber) => {
    if (status === 'locked') return
    if (lessonNumber > FREE_LESSONS && !isPremium) { navigate('/premium'); return }
    if (isPremium && !dailyInfo.can_study) return
    navigate(`/lesson/${lesson.id}`)
  }

  const renderTopik = () => {
    const levels = levelFilter ? TOPIK_LEVELS.filter(l => l.id === levelFilter) : TOPIK_LEVELS
    return levels.map(level => {
      const lp = topikProgress[level.id]
      const doneLessons = Object.values(lp.lessonProgress).filter(s => s === 'done').length
      const pct = Math.round((doneLessons / 10) * 100)
      return (
        <div key={level.id} style={{ marginBottom: 20 }}>
          {/* Level header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            borderRadius: 18, padding: '14px 16px', marginBottom: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ color: 'white', fontSize: 15, fontWeight: 900 }}>{level.id}-daraja</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                  {['Boshlang\'ich','Asosiy','O\'rta','Yuqori o\'rta','Ilg\'or','Ekspert'][level.id - 1]}
                </div>
              </div>
              <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 13, fontWeight: 900, padding: '4px 12px', borderRadius: 20 }}>
                {doneLessons}/10
              </div>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#a3e635', width: `${pct}%`, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>

          {/* Lesson rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px' }}>
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
            <div onClick={() => lp.testStatus === 'available' && navigate(`/test/${level.test.id}`)} style={{
              background: lp.testStatus === 'done'
                ? '#dcfce7'
                : lp.testStatus === 'available'
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'white',
              border: lp.testStatus === 'done'
                ? '1px solid rgba(21,128,61,0.3)'
                : lp.testStatus === 'available'
                ? 'none'
                : '0.5px solid rgba(124,58,237,0.12)',
              borderRadius: 16, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: lp.testStatus === 'available' ? 'pointer' : 'default',
              opacity: lp.testStatus === 'locked' ? 0.4 : 1, marginTop: 2
            }}>
              <div style={{ fontSize: 22 }}>
                {lp.testStatus === 'done' ? '🏅' : lp.testStatus === 'available' ? '📝' : '🔒'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 800, fontSize: 14,
                  color: lp.testStatus === 'available' ? 'white' : lp.testStatus === 'done' ? '#15803d' : '#1e1b4b'
                }}>{level.id}-daraja testi</div>
                <div style={{
                  fontSize: 12, marginTop: 2,
                  color: lp.testStatus === 'available' ? 'rgba(255,255,255,0.7)' : '#9ca3af'
                }}>
                  {lp.testStatus === 'done' ? `Natija: ${lp.testScore}%` : lp.testStatus === 'available' ? 'Testga tayyor!' : '10 ta darsni bajaring'}
                </div>
              </div>
              {lp.testStatus === 'available' && (
                <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>Boshlash →</div>
              )}
            </div>
          </div>
        </div>
      )
    })
  }

  const renderEps = () => {
    const lp = epsProgress.lessonProgress
    const epsDone = Object.values(lp).filter(s => s === 'done').length
    const pct = Math.round((epsDone / 10) * 100)
    return (
      <div>
        {/* EPS header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 18, padding: '14px 16px', marginBottom: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 900 }}>EPS-TOPIK</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Ish joyi koreys tili</div>
            </div>
            <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 13, fontWeight: 900, padding: '4px 12px', borderRadius: 20 }}>
              {epsDone}/10
            </div>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#a3e635', width: `${pct}%`, borderRadius: 3, transition: 'width 0.5s' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px' }}>
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
          <div onClick={() => epsProgress.finalTestStatus === 'available' && navigate('/test/eps-final')} style={{
            background: epsProgress.finalTestStatus === 'done'
              ? '#dcfce7'
              : epsProgress.finalTestStatus === 'available'
              ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
              : 'white',
            border: epsProgress.finalTestStatus === 'done'
              ? '1px solid rgba(21,128,61,0.3)'
              : epsProgress.finalTestStatus === 'available'
              ? 'none'
              : '0.5px solid rgba(124,58,237,0.12)',
            borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: epsProgress.finalTestStatus === 'available' ? 'pointer' : 'default',
            opacity: epsProgress.finalTestStatus === 'locked' ? 0.4 : 1, marginTop: 2
          }}>
            <div style={{ fontSize: 22 }}>
              {epsProgress.finalTestStatus === 'done' ? '🏆' : epsProgress.finalTestStatus === 'available' ? '📝' : '🔒'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 800, fontSize: 14,
                color: epsProgress.finalTestStatus === 'available' ? 'white' : epsProgress.finalTestStatus === 'done' ? '#15803d' : '#1e1b4b'
              }}>EPS-TOPIK yakuniy testi</div>
              <div style={{
                fontSize: 12, marginTop: 2,
                color: epsProgress.finalTestStatus === 'available' ? 'rgba(255,255,255,0.7)' : '#9ca3af'
              }}>
                {epsProgress.finalTestStatus === 'done'
                  ? `Natija: ${epsProgress.finalTestScore}%`
                  : epsProgress.finalTestStatus === 'available'
                  ? 'Testga tayyor!'
                  : '10 ta darsni bajaring'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'white', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <button onClick={() => navigate(-1)} style={{
          width: 32, height: 32, borderRadius: 10,
          background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>
          {activeTrack === 'topik'
            ? levelFilter ? `${levelFilter}-daraja darslari` : "O'rganish yo'li"
            : 'EPS-TOPIK yo\'li'}
        </div>
        {isPremium && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#a3e635', borderRadius: 20, padding: '3px 10px'
          }}>
            <Crown size={11} color="#1a2e05" />
            <span style={{ fontSize: 11, color: '#1a2e05', fontWeight: 800 }}>Premium</span>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px 100px' }}>

        {/* Kunlik limit banner */}
        {isPremium && !dailyInfo.can_study && (
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            borderRadius: 18, padding: '13px 16px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14
          }}>
            <span style={{ fontSize: 24 }}>⏰</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#a3e635' }}>Kunlik limit tugadi!</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                Bugun {dailyInfo.daily_limit} ta dars o'qidingiz. Ertaga davom eting!
              </div>
            </div>
          </div>
        )}

        {/* Kunlik progress (premium) */}
        {isPremium && dailyInfo.can_study && (
          <div style={{
            background: 'white', borderRadius: 18, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14, border: '0.5px solid rgba(124,58,237,0.12)'
          }}>
            <div style={{ fontSize: 13, color: '#374151' }}>
              Bugungi darslar: <strong style={{ color: '#7c3aed' }}>{dailyInfo.lessons_today}/{dailyInfo.daily_limit}</strong>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {Array.from({ length: dailyInfo.daily_limit }).map((_, i) => (
                <div key={i} style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: i < dailyInfo.lessons_today ? '#7c3aed' : '#ede9fe'
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Premium banner (bepul) */}
        {!isPremium && !loading && (
          <div onClick={() => navigate('/premium')} style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            borderRadius: 18, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', marginBottom: 16,
            border: '1px solid rgba(163,230,53,0.2)'
          }}>
            <span style={{ fontSize: 26 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Premium — 29 000 so'm</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                3-darsdan barcha darslarni oching!
              </div>
            </div>
            <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 13, fontWeight: 900, padding: '5px 12px', borderRadius: 12 }}>→</div>
          </div>
        )}

        {activeTrack === 'topik' ? renderTopik() : renderEps()}
      </div>
    </div>
  )
}

// ── Lesson Row ───────────────────────────────────────────────────────
function LessonRow({ lesson, status, number, needsPremium, dailyLimitReached, onClick }) {
  const isLocked = status === 'locked'
  const showPremiumLock = needsPremium && status !== 'done'
  const showDailyLimit = dailyLimitReached && !needsPremium && status === 'available'
  const isDone = status === 'done'
  const isAvailable = status === 'available' && !showPremiumLock && !showDailyLimit

  return (
    <div onClick={onClick} style={{
      background: isDone ? '#f0fdf4' : showPremiumLock ? '#fffbeb' : isAvailable ? 'white' : 'white',
      border: `1px solid ${isDone ? 'rgba(21,128,61,0.25)' : showPremiumLock ? 'rgba(234,179,8,0.3)' : isAvailable ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.08)'}`,
      borderRadius: 16, padding: '13px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: isLocked && !showPremiumLock ? 'not-allowed' : 'pointer',
      opacity: isLocked && !showPremiumLock ? 0.45 : 1,
      transition: 'all 0.2s',
      boxShadow: isAvailable ? '0 2px 10px rgba(124,58,237,0.08)' : 'none'
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 11, flexShrink: 0,
        background: isDone ? '#dcfce7' : showPremiumLock ? '#fef3c7' : isAvailable ? '#ede9fe' : '#f5f3ff',
        border: `1px solid ${isDone ? 'rgba(21,128,61,0.2)' : showPremiumLock ? 'rgba(234,179,8,0.3)' : isAvailable ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isDone ? 16 : showPremiumLock ? 14 : isLocked ? 14 : 14, fontWeight: 800,
        color: isDone ? '#15803d' : showPremiumLock ? '#d97706' : isAvailable ? '#7c3aed' : '#c4b5fd'
      }}>
        {isDone ? '✓' : showPremiumLock ? <Crown size={15} color="#d97706" /> : isLocked ? '🔒' : number}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>{lesson.title}</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
          {showPremiumLock ? '👑 Premium kerak' : showDailyLimit ? '⏰ Limit tugadi' : `+${lesson.xp || lesson.xp_reward || 10} XP`}
        </div>
      </div>

      {/* Right badge */}
      {showPremiumLock && (
        <div style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 10, padding: '4px 10px' }}>
          <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>Premium</span>
        </div>
      )}
      {isAvailable && (
        <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 800 }}>→</div>
      )}
      {isDone && (
        <div style={{ fontSize: 11, color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '3px 9px', borderRadius: 10 }}>
          ✓ Tugadi
        </div>
      )}
    </div>
  )
}
