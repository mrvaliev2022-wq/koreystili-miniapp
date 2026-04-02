import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, TOPIK_LEVELS, EPS_LESSONS, ALPHA_LESSONS, EPS_LESSONS_2, TOPIK5_LESSONS } from '../store'
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

    // TOPIK 5 ni alohida ko'rsatamiz
    const renderTopik5Section = () => {
      const lp = topikProgress[5]
      const doneLessons = Object.values(lp.lessonProgress).filter(s => s === 'done').length
      const pct = Math.round((doneLessons / 10) * 100)
      return (
        <div key="topik-5-section" style={{ marginBottom: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ color: 'white', fontSize: 15, fontWeight: 900 }}>5-daraja — TOPIK II</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Ilg'or • Jamiyat, Ekologiya, Texnologiya...</div>
              </div>
              <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 13, fontWeight: 900, padding: '4px 12px', borderRadius: 20 }}>
                {doneLessons}/10
              </div>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#a3e635', width: `${pct}%`, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px' }}>
            {TOPIK5_LESSONS.map((lesson, i) => {
              const lessonNumber = i + 1
              const status = lp.lessonProgress[lesson.id] || 'locked'
              const needsPremium = lessonNumber > FREE_LESSONS && !isPremium
              return (
                <LessonRow key={lesson.id} lesson={lesson} status={status} number={lessonNumber}
                  needsPremium={needsPremium} dailyLimitReached={isPremium && !dailyInfo.can_study}
                  onClick={() => handleLessonClick(lesson, status, lessonNumber)} />
              )
            })}
            <div onClick={() => lp.testStatus === 'available' && navigate('/test/topik-test-5')} style={{
              background: lp.testStatus === 'done' ? '#dcfce7' : lp.testStatus === 'available' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'white',
              border: lp.testStatus === 'done' ? '1px solid rgba(21,128,61,0.3)' : lp.testStatus === 'available' ? 'none' : '0.5px solid rgba(124,58,237,0.12)',
              borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: lp.testStatus === 'available' ? 'pointer' : 'default',
              opacity: lp.testStatus === 'locked' ? 0.4 : 1, marginTop: 2
            }}>
              <div style={{ fontSize: 22 }}>{lp.testStatus === 'done' ? '🏅' : lp.testStatus === 'available' ? '📝' : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: lp.testStatus === 'available' ? 'white' : lp.testStatus === 'done' ? '#15803d' : '#1e1b4b' }}>
                  5-daraja testi
                </div>
                <div style={{ fontSize: 12, marginTop: 2, color: lp.testStatus === 'available' ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                  {lp.testStatus === 'done' ? `Natija: ${lp.testScore}%` : lp.testStatus === 'available' ? 'Testga tayyor!' : '10 ta darsni bajaring'}
                </div>
              </div>
              {lp.testStatus === 'available' && <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>Boshlash →</div>}
            </div>
          </div>
        </div>
      )
    }

    return levels.map(level => {
      // TOPIK 5 ni alohida render qilamiz
      if (level.id === 5) return renderTopik5Section()

      const lp = topikProgress[level.id]
      const doneLessons = Object.values(lp.lessonProgress).filter(s => s === 'done').length
      const pct = Math.round((doneLessons / 10) * 100)
      return (
        <div key={level.id} style={{ marginBottom: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px' }}>
            {level.lessons.map((lesson, i) => {
              const lessonNumber = i + 1
              const status = lp.lessonProgress[lesson.id] || 'locked'
              const needsPremium = lessonNumber > FREE_LESSONS && !isPremium
              return (
                <LessonRow key={lesson.id} lesson={lesson} status={status} number={lessonNumber}
                  needsPremium={needsPremium} dailyLimitReached={isPremium && !dailyInfo.can_study}
                  onClick={() => handleLessonClick(lesson, status, lessonNumber)} />
              )
            })}
            <div onClick={() => lp.testStatus === 'available' && navigate(`/test/${level.test.id}`)} style={{
              background: lp.testStatus === 'done' ? '#dcfce7' : lp.testStatus === 'available' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'white',
              border: lp.testStatus === 'done' ? '1px solid rgba(21,128,61,0.3)' : lp.testStatus === 'available' ? 'none' : '0.5px solid rgba(124,58,237,0.12)',
              borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: lp.testStatus === 'available' ? 'pointer' : 'default',
              opacity: lp.testStatus === 'locked' ? 0.4 : 1, marginTop: 2
            }}>
              <div style={{ fontSize: 22 }}>{lp.testStatus === 'done' ? '🏅' : lp.testStatus === 'available' ? '📝' : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: lp.testStatus === 'available' ? 'white' : lp.testStatus === 'done' ? '#15803d' : '#1e1b4b' }}>
                  {level.id}-daraja testi
                </div>
                <div style={{ fontSize: 12, marginTop: 2, color: lp.testStatus === 'available' ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                  {lp.testStatus === 'done' ? `Natija: ${lp.testScore}%` : lp.testStatus === 'available' ? 'Testga tayyor!' : '10 ta darsni bajaring'}
                </div>
              </div>
              {lp.testStatus === 'available' && <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>Boshlash →</div>}
            </div>
          </div>
        </div>
      )
    })
  }

  const renderEps = () => {
    const lp = epsProgress.lessonProgress
    const alphaDone = ALPHA_LESSONS.filter(l => lp[l.id] === 'done').length
    const epsDone = EPS_LESSONS.filter(l => lp[l.id] === 'done').length
    const totalDone = alphaDone + epsDone
    const totalAll = ALPHA_LESSONS.length + EPS_LESSONS.length
    const pct = Math.round((totalDone / totalAll) * 100)

    return (
      <div>
        {/* Umumiy header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 900 }}>EPS-TOPIK</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Koreys alifbosi + Ish joyi tili</div>
            </div>
            <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 13, fontWeight: 900, padding: '4px 12px', borderRadius: 20 }}>
              {totalDone}/{totalAll}
            </div>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#a3e635', width: `${pct}%`, borderRadius: 3, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* ALPHABET bo'limi */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 14, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 800 }}>🔤 Koreys Alifbosi (한글)</div>
          <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 12 }}>
            {alphaDone}/{ALPHA_LESSONS.length}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px', marginBottom: 16 }}>
          {ALPHA_LESSONS.map((lesson, i) => {
            const status = lp[lesson.id] || 'locked'
            return (
              <LessonRow key={lesson.id} lesson={lesson} status={status} number={i + 1}
                needsPremium={false} dailyLimitReached={false}
                onClick={() => { if (status !== 'locked') navigate(`/lesson/${lesson.id}`) }} />
            )
          })}
        </div>

        {/* EPS DARSLARI bo'limi */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 14, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 800 }}>🏭 EPS-TOPIK Darslari</div>
          <div style={{ background: 'rgba(163,230,53,0.2)', color: '#a3e635', fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 12 }}>
            {epsDone}/{EPS_LESSONS.length}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px' }}>
          {EPS_LESSONS.map((lesson, i) => {
            const lessonNumber = i + 1
            const status = lp[lesson.id] || 'locked'
            const needsPremium = lessonNumber > FREE_LESSONS && !isPremium
            return (
              <LessonRow key={lesson.id} lesson={lesson} status={status} number={lessonNumber}
                needsPremium={needsPremium} dailyLimitReached={isPremium && !dailyInfo.can_study}
                onClick={() => handleLessonClick(lesson, status, lessonNumber)} />
            )
          })}
{/* EPS-2 BO'LIMI */}
<div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 14, padding: '10px 14px', marginBottom: 8, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 800 }}>🏭 EPS-TOPIK 2 Darslari</div>
          <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 12 }}>
            {EPS_LESSONS_2.filter(l => lp[l.id] === 'done').length}/{EPS_LESSONS_2.length}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px', marginBottom: 16 }}>
          {EPS_LESSONS_2.map((lesson, i) => {
            const lessonNumber = i + 1
            const status = lp[lesson.id] || 'locked'
            const needsPremium = lessonNumber > FREE_LESSONS && !isPremium
            return (
              <LessonRow key={lesson.id} lesson={lesson} status={status} number={lesson.number}
                needsPremium={needsPremium} dailyLimitReached={isPremium && !dailyInfo.can_study}
                onClick={() => handleLessonClick(lesson, status, lessonNumber)} />
            )
          })}
        </div>
          {/* Yakuniy test */}
          <div onClick={() => epsProgress.finalTestStatus === 'available' && navigate('/test/eps-final')} style={{
            background: epsProgress.finalTestStatus === 'done' ? '#dcfce7' : epsProgress.finalTestStatus === 'available' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'white',
            border: epsProgress.finalTestStatus === 'done' ? '1px solid rgba(21,128,61,0.3)' : epsProgress.finalTestStatus === 'available' ? 'none' : '0.5px solid rgba(124,58,237,0.12)',
            borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: epsProgress.finalTestStatus === 'available' ? 'pointer' : 'default',
            opacity: epsProgress.finalTestStatus === 'locked' ? 0.4 : 1, marginTop: 2
          }}>
            <div style={{ fontSize: 22 }}>{epsProgress.finalTestStatus === 'done' ? '🏆' : epsProgress.finalTestStatus === 'available' ? '📝' : '🔒'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: epsProgress.finalTestStatus === 'available' ? 'white' : epsProgress.finalTestStatus === 'done' ? '#15803d' : '#1e1b4b' }}>
                EPS-TOPIK yakuniy testi
              </div>
              <div style={{ fontSize: 12, marginTop: 2, color: epsProgress.finalTestStatus === 'available' ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                {epsProgress.finalTestStatus === 'done' ? `Natija: ${epsProgress.finalTestScore}%` : epsProgress.finalTestStatus === 'available' ? 'Testga tayyor!' : '10 ta darsni bajaring'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(124,58,237,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ width: 32, height: 32, borderRadius: 10, background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>
          {activeTrack === 'topik' ? levelFilter ? `${levelFilter}-daraja darslari` : "O'rganish yo'li" : 'EPS-TOPIK yo\'li'}
        </div>
        {isPremium && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#a3e635', borderRadius: 20, padding: '3px 10px' }}>
            <Crown size={11} color="#1a2e05" />
            <span style={{ fontSize: 11, color: '#1a2e05', fontWeight: 800 }}>Premium</span>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px 100px' }}>
        {isPremium && !dailyInfo.can_study && (
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 18, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 24 }}>⏰</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#a3e635' }}>Kunlik limit tugadi!</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Bugun {dailyInfo.daily_limit} ta dars o'qidingiz. Ertaga davom eting!</div>
            </div>
          </div>
        )}

        {isPremium && dailyInfo.can_study && (
          <div style={{ background: 'white', borderRadius: 18, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, border: '0.5px solid rgba(124,58,237,0.12)' }}>
            <div style={{ fontSize: 13, color: '#374151' }}>Bugungi darslar: <strong style={{ color: '#7c3aed' }}>{dailyInfo.lessons_today}/{dailyInfo.daily_limit}</strong></div>
            <div style={{ display: 'flex', gap: 5 }}>
              {Array.from({ length: dailyInfo.daily_limit }).map((_, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i < dailyInfo.lessons_today ? '#7c3aed' : '#ede9fe' }} />
              ))}
            </div>
          </div>
        )}

        {!isPremium && !loading && (
          <div onClick={() => navigate('/premium')} style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 16, border: '1px solid rgba(163,230,53,0.2)' }}>
            <span style={{ fontSize: 26 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Premium — 29 000 so'm</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>3-darsdan barcha darslarni oching!</div>
            </div>
            <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 13, fontWeight: 900, padding: '5px 12px', borderRadius: 12 }}>→</div>
          </div>
        )}

        {activeTrack === 'topik' ? renderTopik() : renderEps()}
      </div>
    </div>
  )
}

function LessonRow({ lesson, status, number, needsPremium, dailyLimitReached, onClick }) {
  const isLocked = status === 'locked'
  const showPremiumLock = needsPremium && status !== 'done'
  const isDone = status === 'done'
  const isAvailable = status === 'available' && !showPremiumLock && !dailyLimitReached

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
      <div style={{
        width: 36, height: 36, borderRadius: 11, flexShrink: 0,
        background: isDone ? '#dcfce7' : showPremiumLock ? '#fef3c7' : isAvailable ? '#ede9fe' : '#f5f3ff',
        border: `1px solid ${isDone ? 'rgba(21,128,61,0.2)' : showPremiumLock ? 'rgba(234,179,8,0.3)' : isAvailable ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800,
        color: isDone ? '#15803d' : showPremiumLock ? '#d97706' : isAvailable ? '#7c3aed' : '#c4b5fd'
      }}>
        {isDone ? '✓' : showPremiumLock ? '👑' : isLocked ? '🔒' : number}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>{lesson.title}</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
          {showPremiumLock ? '👑 Premium kerak' : dailyLimitReached ? '⏰ Limit tugadi' : `+${lesson.xp || lesson.xp_reward || 10} XP`}
        </div>
      </div>
      {showPremiumLock && (
        <div style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 10, padding: '4px 10px' }}>
          <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>Premium</span>
        </div>
      )}
      {isAvailable && <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 800 }}>→</div>}
      {isDone && <div style={{ fontSize: 11, color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '3px 9px', borderRadius: 10 }}>✓</div>}
    </div>
  )
}
