import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { ChevronLeft } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

function getTgUserId() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null
  } catch { return null }
}

async function apiFetch(path) {
  const userId = getTgUserId()
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}${path}${sep}user_id=${userId}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { completeLesson } = useStore()

  const [lesson, setLesson] = useState(null)
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('content')
  const [activeTab, setActiveTab] = useState('intro')
  const [scrolled, setScrolled] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const contentRef = useRef(null)

  // ── Load lesson + quiz ──
  useEffect(() => {
    Promise.all([
      apiFetch(`/lessons/${lessonId}`),
      apiFetch(`/lessons/${lessonId}/quiz`)
    ]).then(([lessonData, quizData]) => {
      setLesson(lessonData)
      setQuiz(Array.isArray(quizData) ? quizData : [])
      setLoading(false)
    }).catch(err => {
      console.error('Lesson load error:', err)
      setLoading(false)
    })
  }, [lessonId])

  // ── Scroll tracker ──
  useEffect(() => {
    const el = contentRef.current
    if (!el || phase !== 'content') return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollHeight - scrollTop <= clientHeight + 80) setScrolled(true)
    }
    el.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [phase, loading, activeTab])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>📖</div>
      <div style={{ color: 'var(--text2)', fontSize: 15 }}>Dars yuklanmoqda...</div>
    </div>
  )

  if (!lesson) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
      <div style={{ color: 'var(--text2)' }}>Dars topilmadi</div>
      <button className="btn btn-secondary" style={{ marginTop: 20, maxWidth: 200, margin: '20px auto 0' }} onClick={() => navigate(-1)}>Orqaga</button>
    </div>
  )

  const content = lesson.content || {}
  const xp = lesson.xp_reward || lesson.xp || 10
  const currentQuestion = quiz[currentQ]

  // ── Quiz answer ──
  const handleAnswer = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === currentQuestion.correct_index
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
        if (passed) completeLesson(lessonId, finalScore, finalScore === 100)
        import('../api.js').then(({ submitLessonComplete, completeLesson1Referral }) => {
          submitLessonComplete(lessonId, finalScore, finalScore === 100, track).catch(() => {})
          const isLesson1 = lessonId === 'topik-1-1' || lessonId === 'eps-1'
          if (passed && isLesson1) completeLesson1Referral().catch(() => {})
        }).catch(() => {})
        setScore(finalScore)
        setPhase('result')
      }
    }, 900)
  }

  // ── Tab style ──
  const tabStyle = (active) => ({
    flex: 1,
    padding: '7px 2px',
    fontSize: 10,
    fontWeight: active ? 700 : 500,
    color: active ? 'var(--accent2)' : 'var(--text3)',
    background: active ? 'var(--bg3)' : 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s'
  })

  // ════════════════════════════
  // CONTENT PHASE
  // ════════════════════════════
  if (phase === 'content') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title" style={{ fontSize: 13 }}>{lesson.title}</div>
        <div className="badge badge-purple">+{xp} XP</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg3)' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: scrolled ? '100%' : '30%', transition: 'width 0.5s' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, padding: '8px 10px', background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
        {[
          { key: 'intro',    label: '📖 Kirish' },
          { key: 'grammar',  label: '✍️ Grammatika' },
          { key: 'vocab',    label: '📚 Lug\'at' },
          { key: 'examples', label: '💬 Misollar' },
          { key: 'notes',    label: '📝 Eslatma' },
        ].map(tab => (
          <button key={tab.key} style={tabStyle(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>

        {/* ── INTRO ── */}
        {activeTab === 'intro' && (
          <div>
            {content.goals?.length > 0 && (
              <div className="card" style={{ marginBottom: 14, background: 'linear-gradient(135deg, var(--bg3), var(--bg2))' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent2)', marginBottom: 8 }}>🎯 Maqsad</div>
                {content.goals.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{g}</span>
                  </div>
                ))}
              </div>
            )}
            {content.intro_kr && (
              <div className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span>🇰🇷</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)' }}>한국어</span>
                </div>
                <p className="kr" style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)' }}>{content.intro_kr}</p>
              </div>
            )}
            {content.intro_uz && (
              <div className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span>🇺🇿</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)' }}>O'zbekcha</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text2)' }}>{content.intro_uz}</p>
              </div>
            )}
            {content.summary && (
              <div style={{ background: 'var(--accent)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 6 }}>⚡ Qisqa xulosa</div>
                <p style={{ fontSize: 13, color: 'white', lineHeight: 1.6 }}>{content.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* ── GRAMMAR ── */}
        {activeTab === 'grammar' && (
          <div>
            {Array.isArray(content.grammar) ? content.grammar.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                    {gi + 1}
                  </div>
                  <div>
                    <div className="kr" style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent2)' }}>{g.title_kr}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{g.title_uz}</div>
                  </div>
                </div>
                <div className="card" style={{ marginBottom: 10, borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <span>🇰🇷</span>
                    <p className="kr" style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{g.explanation_kr}</p>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span>🇺🇿</span>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text2)' }}>{g.explanation_uz}</p>
                  </div>
                </div>
                {g.examples?.map((ex, ei) => (
                  <div key={ei} className="card-sm" style={{ marginBottom: 8, borderLeft: '3px solid var(--purple)', borderRadius: '0 10px 10px 0' }}>
                    <div className="kr" style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent2)', marginBottom: 2 }}>{ex.kr}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 2 }}>{ex.rom}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{ex.uz}</div>
                  </div>
                ))}
              </div>
            )) : (
              <div className="card">
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{content.grammar}</p>
              </div>
            )}
          </div>
        )}

        {/* ── VOCAB ── */}
        {activeTab === 'vocab' && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12, textAlign: 'center' }}>
              {content.vocabulary?.length || 0} ta so'z
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {content.vocabulary?.map((v, i) => (
                <div key={i} className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text3)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="kr" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent2)', lineHeight: 1.3 }}>{v.korean}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{v.romanization}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', textAlign: 'right', maxWidth: 120 }}>{v.uzbek}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXAMPLES ── */}
        {activeTab === 'examples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {content.examples?.map((ex, i) => (
              <div key={i} className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
                <div className="kr" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.5 }}>{ex.korean}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 6 }}>{ex.romanization}</div>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 8 }} />
                <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>🇺🇿 {ex.uzbek}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── NOTES ── */}
        {activeTab === 'notes' && (
          <div>
            <div className="card" style={{ marginBottom: 14, background: 'var(--bg3)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent2)', marginBottom: 10 }}>📝 Eslab qolish kerak</div>
              {content.takenotes?.map((note, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, padding: '8px 10px', background: 'var(--bg)', borderRadius: 10 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{note}</span>
                </div>
              ))}
            </div>
            {content.summary && (
              <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 8 }}>⚡ Qisqa xulosa</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>{content.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '12px 16px 20px', background: 'var(--bg)', borderTop: '0.5px solid var(--border)' }}>
        {quiz.length > 0 ? (
          <button className="btn btn-primary" onClick={() => setPhase('quiz')}>
            📝 Testni boshlash ({quiz.length} ta savol)
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Orqaga</button>
        )}
      </div>
    </div>
  )

  // ════════════════════════════
  // QUIZ PHASE
  // ════════════════════════════
  if (phase === 'quiz') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <button className="back-btn" onClick={() => setPhase('content')}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">Test</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 700 }}>{currentQ + 1}/{quiz.length}</div>
      </div>
      <div style={{ height: 4, background: 'var(--bg3)' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${(currentQ / quiz.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>
      <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div className="card" style={{ marginBottom: 24, minHeight: 80, display: 'flex', alignItems: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>{currentQuestion?.question}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQuestion?.options?.map((opt, i) => {
            let cls = 'quiz-option'
            if (revealed) {
              if (i === currentQuestion.correct_index) cls += ' correct'
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

  // ════════════════════════════
  // RESULT PHASE
  // ════════════════════════════
  const passed = score >= 60
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: '40px 24px 32px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }} className="pop-in">{passed ? '🎉' : '😔'}</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
        {passed ? "Ajoyib! O'tdingiz!" : "Muvaffaqiyatsiz"}
      </h2>
      <p style={{ color: 'var(--text2)', marginBottom: 24, fontSize: 15 }}>
        {passed ? 'Dars muvaffaqiyatli yakunlandi' : `Minimal ball: 60%. Siz: ${score}%`}
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
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>Barcha tablarni ko'rib chiqing va qayta urining. Kamida 3 ta to'g'ri javob kerak.</p>
        </div>
      )}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {passed ? (
          <button className="btn btn-success" onClick={() => navigate(-1)}>Davom etish →</button>
        ) : (
          <button className="btn btn-secondary" onClick={() => {
            setPhase('content'); setCurrentQ(0); setSelected(null)
            setRevealed(false); setScore(0); scoreRef.current = 0; setActiveTab('intro')
          }}>🔄 Qayta urinish</button>
        )}
        <button className="btn btn-ghost" onClick={() => navigate('/')}>🏠 Bosh sahifaga</button>
      </div>
    </div>
  )
}
