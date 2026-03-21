import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, TOPIK_LEVELS, EPS_LESSONS } from '../store'
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react'

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { completeLesson } = useStore()
  const [phase, setPhase] = useState('content') // content | quiz | result
  const [scrolled, setScrolled] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const contentRef = useRef(null)

  // Find lesson
  const lesson = (() => {
    if (lessonId?.startsWith('topik')) {
      const parts = lessonId.split('-')
      const li = parseInt(parts[1])
      return TOPIK_LEVELS[li - 1]?.lessons.find(l => l.id === lessonId)
    }
    return EPS_LESSONS.find(l => l.id === lessonId)
  })()

  useEffect(() => {
    const el = contentRef.current
    if (!el || phase !== 'content') return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollHeight - scrollTop <= clientHeight + 60) setScrolled(true)
    }
    el.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [phase])

  if (!lesson) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
      <div style={{ color: 'var(--text2)' }}>Dars topilmadi</div>
      <button className="btn btn-secondary" style={{ marginTop: 20, maxWidth: 200, margin: '20px auto 0' }} onClick={() => navigate(-1)}>Orqaga</button>
    </div>
  )

  const quiz = lesson.quiz || []
  const currentQuestion = quiz[currentQ]

  const handleAnswer = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === currentQuestion.correct
    if (correct) scoreRef.current += 1
    setTimeout(() => {
      if (currentQ + 1 < quiz.length) {
        setCurrentQ(q => q + 1)
        setSelected(null)
        setRevealed(false)
      } else {
        const finalScore = Math.round((scoreRef.current / quiz.length) * 100)
        const passed = finalScore >= 60
        const track = lessonId.startsWith('topik') ? 'topik' : 'eps'

        // Update local state immediately
        if (passed) completeLesson(lessonId, finalScore, finalScore === 100)

        // Sync to backend (non-blocking)
        import('../api.js').then(({ submitLessonComplete, completeLesson1Referral }) => {
          submitLessonComplete(lessonId, finalScore, finalScore === 100, track).catch(() => {})
          // Trigger referral check if this is lesson 1 in any track
          const isLesson1 = lessonId === 'topik-1-1' || lessonId === 'eps-1'
          if (passed && isLesson1) completeLesson1Referral().catch(() => {})
        }).catch(() => {})

        setScore(finalScore)
        setPhase('result')
      }
    }, 900)
  }

  // ── CONTENT PHASE ──
  if (phase === 'content') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">{lesson.title}</div>
        <div className="badge badge-purple">+{lesson.xp} XP</div>
      </div>

      {/* Scroll progress */}
      <div style={{ height: 3, background: 'var(--bg3)' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: scrolled ? '100%' : '40%', transition: 'width 0.5s' }} />
      </div>

      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>

        {/* Vocab */}
        <div className="section-title">So'z boyligi</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {lesson.content?.vocabulary?.map((v, i) => (
            <div key={i} className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="kr" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent2)', lineHeight: 1.3 }}>{v.korean}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{v.romanization}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>{v.uzbek}</div>
            </div>
          ))}
        </div>

        {/* Grammar */}
        <div className="section-title">Grammatika</div>
        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{lesson.content?.grammar}</p>
        </div>

        {/* Examples */}
        <div className="section-title">Misollar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {lesson.content?.examples?.map((ex, i) => (
            <div key={i} className="card-sm" style={{ borderLeft: '3px solid var(--accent)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
              <div className="kr" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{ex.korean}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{ex.uzbek}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, fontStyle: 'italic' }}>{ex.romanization}</div>
            </div>
          ))}
        </div>

        {!scrolled && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '8px 0' }}>
            ↓ Davom etish uchun pastga aylantiring
          </div>
        )}
      </div>

      {/* Quiz start button — locked until scrolled */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '16px 20px', background: 'var(--bg)', borderTop: '0.5px solid var(--border)' }}>
        <button
          className="btn btn-primary"
          disabled={!scrolled}
          onClick={() => setPhase('quiz')}
        >
          {scrolled ? '📝 Testni boshlash' : '↓ Avval darsni o\'qing'}
        </button>
      </div>
    </div>
  )

  // ── QUIZ PHASE ──
  if (phase === 'quiz') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <button className="back-btn" onClick={() => setPhase('content')}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">Test</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 700 }}>{currentQ + 1}/{quiz.length}</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--bg3)' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${((currentQ) / quiz.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div className="card" style={{ marginBottom: 28, minHeight: 80, display: 'flex', alignItems: 'center' }}>
          <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5 }}>{currentQuestion?.question}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQuestion?.options.map((opt, i) => {
            let cls = 'quiz-option'
            if (revealed) {
              if (i === currentQuestion.correct) cls += ' correct'
              else if (i === selected) cls += ' wrong'
            } else if (i === selected) cls += ' selected'
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg)', border: '1.5px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {String.fromCharCode(65 + i)}
                </div>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── RESULT PHASE ──
  const passed = score >= 60
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: '40px 24px 32px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }} className="pop-in">
        {passed ? '🎉' : '😔'}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
        {passed ? "Ajoyib! O'tdingiz!" : "Muvaffaqiyatsiz"}
      </h2>
      <p style={{ color: 'var(--text2)', marginBottom: 24, fontSize: 15 }}>
        {passed ? `Dars muvaffaqiyatli yakunlandi` : `Minimal ball: 60%. Siz: ${score}%`}
      </p>

      <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
        <div className="stat-cell" style={{ minWidth: 90 }}>
          <div className="stat-val" style={{ color: passed ? 'var(--green)' : 'var(--red)' }}>{score}%</div>
          <div className="stat-lbl">Natija</div>
        </div>
        {passed && (
          <div className="stat-cell" style={{ minWidth: 90 }}>
            <div className="stat-val" style={{ color: 'var(--amber)' }}>+{score === 100 ? 30 : 20}</div>
            <div className="stat-lbl">XP ball</div>
          </div>
        )}
      </div>

      {!passed && (
        <div className="card" style={{ width: '100%', marginBottom: 24, background: 'var(--red-bg)', border: '1px solid var(--red)' }}>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>
            Takrorlash bo'limiga o'ting va mavzuni qaytadan ko'rib chiqing, so'ngra qayta urining.
          </p>
        </div>
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {passed ? (
          <button className="btn btn-success" onClick={() => navigate(-1)}>Davom etish →</button>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={() => { setPhase('content'); setCurrentQ(0); setSelected(null); setRevealed(false); setScore(0); scoreRef.current = 0 }}>
              🔄 Qayta urinish
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/review')}>📖 Takrorlash</button>
          </>
        )}
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Bosh sahifaga</button>
      </div>
    </div>
  )
}
