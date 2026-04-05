import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { ChevronLeft, Volume2 } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

// ── Helpers ──────────────────────────────────────────────────────────
function getTgUserId() {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '0' } catch { return '0' }
}

async function apiFetch(path) {
  const userId = getTgUserId()
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}${path}${sep}user_id=${userId}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

// ── Korean TTS ───────────────────────────────────────────────────────
function useSpeaker() {
  const [speakingId, setSpeakingId] = useState(null)

  const speak = (text, id) => {
    window.speechSynthesis.cancel()
    setSpeakingId(id)
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'ko-KR'
    utt.rate = 0.85
    utt.pitch = 1.0
    utt.onend = () => setSpeakingId(null)
    utt.onerror = () => setSpeakingId(null)
    window.speechSynthesis.speak(utt)
  }

  const speakAll = (items, getTextFn) => {
    let i = 0
    const next = () => {
      if (i >= items.length) { setSpeakingId(null); return }
      setSpeakingId(`all-${i}`)
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(getTextFn(items[i]))
      utt.lang = 'ko-KR'
      utt.rate = 0.8
      utt.onend = () => { i++; setTimeout(next, 700) }
      utt.onerror = () => { i++; setTimeout(next, 300) }
      window.speechSynthesis.speak(utt)
    }
    next()
  }

  const stop = () => { window.speechSynthesis.cancel(); setSpeakingId(null) }
  return { speakingId, speak, speakAll, stop }
}

// ── Audio Button (Light Mode) ────────────────────────────────────────
function AudioBtn({ isPlaying, onPress, size = 36 }) {
  return (
    <button
      onClick={onPress}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: isPlaying
          ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
          : '#ede9fe',
        border: isPlaying ? 'none' : '0.5px solid rgba(124,58,237,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'all 0.2s',
        transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isPlaying ? '0 4px 12px rgba(124,58,237,0.35)' : 'none'
      }}>
      <Volume2 size={size * 0.38} color={isPlaying ? 'white' : '#7c3aed'} />
    </button>
  )
}

// ── Match Pairs Game (Light Mode) ────────────────────────────────────
function MatchPairsGame({ pairs }) {
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState([])
  const [matched, setMatched] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [finished, setFinished] = useState(false)
  const [shaking, setShaking] = useState([])

  useEffect(() => {
  const uid = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '0'
  const load = async () => {
    try {
      const [l, q] = await Promise.all([
        fetch(`${BASE}/lessons/${lessonId}?user_id=${uid}`).then(r => r.json()),
        fetch(`${BASE}/lessons/${lessonId}/quiz?user_id=${uid}`).then(r => r.json())
      ])
      setLesson(l)
      setQuiz(Array.isArray(q) ? q : [])
    } catch(e) {
      console.error(e)
    }
    setLoading(false)
  }
  setTimeout(load, 300)
}, [lessonId])

  const handleSelect = (card) => {
    if (matched.includes(card.id)) return
    if (selected.find(c => c.id === card.id)) return
    if (selected.length === 2) return
    const newSel = [...selected, card]
    setSelected(newSel)
    if (newSel.length === 2) {
      const [a, b] = newSel
      if (a.pairId === b.pairId && a.type !== b.type) {
        setTimeout(() => {
          setMatched(m => [...m, a.id, b.id])
          setSelected([])
          if (matched.length + 2 === cards.length) setFinished(true)
        }, 400)
      } else {
        setMistakes(m => m + 1)
        setShaking([a.id, b.id])
        setTimeout(() => { setSelected([]); setShaking([]) }, 700)
      }
    }
  }

  const restart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled); setSelected([]); setMatched([])
    setMistakes(0); setFinished(false); setShaking([])
  }

  const isSelected = (id) => selected.find(c => c.id === id)
  const isMatched  = (id) => matched.includes(id)
  const isShaking  = (id) => shaking.includes(id)
  const totalPairs  = pairs.length
  const matchedPairs = matched.length / 2
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: '#1e1b4b', marginBottom: 4 }}>
          🃏 Juftlikni toping!
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>
          Koreys so'zini o'zbek ma'nosi bilan toping
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, background: '#ede9fe', borderRadius: 3, margin: '0 8px 8px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
            width: `${progress}%`,
            borderRadius: 3, transition: 'width 0.4s'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12 }}>
          <span style={{ color: '#15803d', fontWeight: 700 }}>✅ {matchedPairs}/{totalPairs}</span>
          <span style={{ color: mistakes > 3 ? '#dc2626' : '#9ca3af', fontWeight: 700 }}>❌ {mistakes} xato</span>
        </div>
      </div>

      {/* Finished */}
      {finished ? (
        <div style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 60, marginBottom: 10 }}>
            {mistakes === 0 ? '🏆' : mistakes <= 2 ? '🌟' : '🎉'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#1e1b4b', marginBottom: 6 }}>
            {mistakes === 0 ? 'Mukammal! Hech xato yo\'q!' : mistakes <= 2 ? 'Juda yaxshi!' : 'Barakalla!'}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            {totalPairs} ta juftlik | {mistakes} ta xato
          </div>
          <div style={{ fontSize: 28, marginBottom: 18 }}>
            {mistakes === 0 ? '⭐⭐⭐' : mistakes <= 2 ? '⭐⭐' : '⭐'}
          </div>
          <button onClick={restart} style={{
            padding: '11px 26px', borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>
            🔄 Qayta o'ynash
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {cards.map(card => {
            const sel  = isSelected(card.id)
            const mat  = isMatched(card.id)
            const shak = isShaking(card.id)
            const isKr = card.type === 'korean'
            let bg     = isKr ? '#ede9fe' : '#f0fdf4'
            let border = isKr ? 'rgba(124,58,237,0.2)' : 'rgba(21,128,61,0.2)'
            let color  = isKr ? '#1e1b4b' : '#15803d'
            if (mat)  { bg = '#dcfce7'; border = '#16a34a'; color = '#15803d' }
            if (shak) { bg = '#fee2e2'; border = '#dc2626'; color = '#991b1b' }
            if (sel && !mat) { bg = '#ddd6fe'; border = '#7c3aed'; color = '#1e1b4b' }
            return (
              <div
                key={card.id}
                onClick={() => handleSelect(card)}
                style={{
                  background: bg, border: `1.5px solid ${border}`,
                  borderRadius: 14, padding: '13px 10px',
                  textAlign: 'center', cursor: mat ? 'default' : 'pointer',
                  transition: 'all 0.2s', minHeight: 68,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3, opacity: mat ? 0.7 : 1,
                  transform: sel ? 'scale(1.04)' : shak ? 'scale(0.97)' : 'scale(1)',
                  animation: shak ? 'shake 0.5s' : 'none'
                }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: mat ? '#15803d' : sel ? '#7c3aed' : '#9ca3af', letterSpacing: 0.5 }}>
                  {mat ? '✓ Topildi' : isKr ? '🇰🇷 KR' : '🇺🇿 UZ'}
                </div>
                <div style={{
                  fontSize: isKr ? 15 : 12, fontWeight: 800, color, lineHeight: 1.3
                }} className={isKr ? 'kr' : ''}>
                  {card.text}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// MAIN LESSON COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { completeLesson } = useStore()

  const [lesson, setLesson] = useState(null)
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('content')
  const [activeTab, setActiveTab] = useState('intro')
  const [doneTabs, setDoneTabs] = useState(new Set())
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const contentRef = useRef(null)
  const { speakingId, speak, speakAll, stop } = useSpeaker()

  // Load
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10

    const tryLoad = () => {
      const uid = getTgUserId()
      if (!uid && attempts < maxAttempts) {
        attempts++
        setTimeout(tryLoad, 500)
        return
      }
      Promise.all([
        apiFetch(`/lessons/${lessonId}`),
        apiFetch(`/lessons/${lessonId}/quiz`)
      ]).then(([lessonData, quizData]) => {
        setLesson(lessonData)
        setQuiz(Array.isArray(quizData) ? quizData : [])
        setLoading(false)
      }).catch((err) => {
        console.error('Lesson error:', err)
        setLoading(false)
      })
    }

    setTimeout(tryLoad, 500)
  }, [lessonId])

  useEffect(() => { stop() }, [activeTab])

  // ── Tab change ──────────────────────────────────────────────────────
  const handleTabClick = (key) => {
    setDoneTabs(prev => new Set([...prev, activeTab]))
    setActiveTab(key)
    if (contentRef.current) contentRef.current.scrollTop = 0
  }

  // ── Quiz answer ─────────────────────────────────────────────────────
  const handleAnswer = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === currentQuestion.correct_index
    if (correct) scoreRef.current += 1
    setTimeout(() => {
      if (currentQ + 1 < quiz.length) {
        setCurrentQ(q => q + 1); setSelected(null); setRevealed(false)
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
        setScore(finalScore); setPhase('result')
      }
    }, 900)
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', flexDirection: 'column', gap: 14,
      background: '#f5f3ff'
    }}>
      <div style={{ fontSize: 48 }}>📖</div>
      <div style={{ color: '#7c3aed', fontSize: 14, fontWeight: 700 }}>Dars yuklanmoqda...</div>
    </div>
  )

  if (!lesson) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80, background: '#f5f3ff', minHeight: '100dvh' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
      <div style={{ color: '#6b7280', fontSize: 15, marginBottom: 20 }}>Dars topilmadi</div>
      <button onClick={() => navigate(-1)} style={{
        padding: '11px 24px', borderRadius: 14,
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer'
      }}>← Orqaga</button>
    </div>
  )

  const content = lesson.content || {}
  const xp = lesson.xp_reward || lesson.xp || 10
  const currentQuestion = quiz[currentQ]
  const hasDialogues = content.dialogues?.length > 0
  const hasMatchPairs = content.match_pairs?.length > 0

  const TABS = [
    { key: 'intro',     icon: '📖', name: 'Kirish',     sub: 'Dars haqida' },
    { key: 'grammar',   icon: '✍️', name: 'Grammatika', sub: `${content.grammar?.length || 0} ta qoida` },
    { key: 'vocab',     icon: '🔊', name: "Lug'at",     sub: `${content.vocabulary?.length || 0} ta so'z` },
    ...(hasDialogues ? [{ key: 'dialogues', icon: '💬', name: 'Dialog',    sub: `${content.dialogues?.length} ta suhbat` }] : []),
    { key: 'examples',  icon: '🌟', name: 'Misollar',   sub: 'Mashq qiling' },
    ...(hasMatchPairs ? [{ key: 'match',    icon: '🃏', name: "O'yin",     sub: 'Match pairs' }] : []),
    { key: 'notes',     icon: '📝', name: 'Eslatma',    sub: 'Xulosa' },
  ]

  const progressPct = Math.round(((TABS.findIndex(t => t.key === activeTab) + 1) / TABS.length) * 100)

  // ════════════════════════════════════════════════════════════════════
  // CONTENT PHASE
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'content') return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh',
      background: '#f5f3ff', fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'white', padding: '14px 16px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)',
        flexShrink: 0
      }}>
        <button onClick={() => { stop(); navigate(-1) }} style={{
          width: 32, height: 32, borderRadius: 10,
          background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0
        }}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            {lessonId.startsWith('eps') ? 'EPS-TOPIK' : `TOPIK ${lessonId.split('-')[1] || '1'}`} · {lesson.lesson_number || 1}-dars
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.title}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: 'white', fontSize: 12, fontWeight: 800,
          padding: '4px 12px', borderRadius: 20, flexShrink: 0
        }}>+{xp} XP</div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={{ height: 4, background: '#ede9fe', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
          width: `${progressPct}%`, transition: 'width 0.4s'
        }} />
      </div>

      {/* ── PROGRESS DOTS ── */}
      <div style={{
        display: 'flex', gap: 5, padding: '8px 16px 0',
        background: 'white', flexShrink: 0, alignItems: 'center', justifyContent: 'center'
      }}>
        {TABS.map(t => (
          <div key={t.key} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: t.key === activeTab ? '#7c3aed' : doneTabs.has(t.key) ? '#a3e635' : '#ddd6fe',
            transition: 'background 0.3s'
          }} />
        ))}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginLeft: 6 }}>
          {TABS.findIndex(t => t.key === activeTab) + 1}/{TABS.length}
        </div>
      </div>

      {/* ── BODY: TAB LIST + CONTENT ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* TAB CARDS (stacked style) */}
        <div style={{ padding: '10px 14px 6px', background: 'white', flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {TABS.map((t) => {
              const isActive = activeTab === t.key
              const isDone   = doneTabs.has(t.key)
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabClick(t.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 4px', borderRadius: 12, flexShrink: 0,
                    background: isActive
                      ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                      : isDone ? '#f0fdf4' : '#f5f3ff',
                    border: isActive
                      ? 'none'
                      : isDone ? '1px solid rgba(21,128,61,0.3)' : '0.5px solid rgba(124,58,237,0.2)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.3)' : 'none'
                  }}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 800,
                    color: isActive ? 'white' : isDone ? '#15803d' : '#7c3aed'
                  }}>{t.name}</span>
                  {isDone && !isActive && (
                    <span style={{ fontSize: 10, color: '#15803d', fontWeight: 800 }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div
          ref={contentRef}
          style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>

          {/* ── ACTIVE TAB CARD HEADER ── */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            border: '1px solid rgba(124,58,237,0.12)',
            overflow: 'hidden',
            marginBottom: 12
          }}>
            {/* Card top strip */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18
                }}>
                  {TABS.find(t => t.key === activeTab)?.icon}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: 14, fontWeight: 900 }}>
                    {TABS.find(t => t.key === activeTab)?.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                    {TABS.find(t => t.key === activeTab)?.sub}
                  </div>
                </div>
              </div>
              {doneTabs.has(activeTab) && (
                <div style={{
                  background: '#a3e635', color: '#1a2e05',
                  fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20
                }}>✓ Ko'rildi</div>
              )}
            </div>

            {/* Card content */}
            <div style={{ padding: '16px' }}>

              {/* ── INTRO ── */}
              {activeTab === 'intro' && (
                <div>
                  {content.goals?.length > 0 && (
                    <div style={{
                      background: '#f5f3ff', borderRadius: 14, padding: '12px 14px',
                      marginBottom: 14, border: '0.5px solid rgba(124,58,237,0.15)'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', marginBottom: 10 }}>
                        🎯 Bu darsda nima o'rganamiz?
                      </div>
                      {content.goals.map((g, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                          <span style={{ color: '#a3e635', fontWeight: 900, fontSize: 14, flexShrink: 0,
                            background: '#1e1b4b', width: 18, height: 18, borderRadius: '50%',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</span>
                          <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{g}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {content.intro_kr && (
                    <div style={{ background: '#f5f3ff', borderRadius: 14, padding: '13px 14px', marginBottom: 10, border: '0.5px solid rgba(124,58,237,0.12)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>🇰🇷</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5 }}>한국어</span>
                      </div>
                      <p className="kr" style={{ fontSize: 13, lineHeight: 1.9, color: '#1e1b4b', whiteSpace: 'pre-line' }}>{content.intro_kr}</p>
                    </div>
                  )}
                  {content.intro_uz && (
                    <div style={{ background: 'white', borderRadius: 14, padding: '13px 14px', marginBottom: 10, border: '0.5px solid rgba(124,58,237,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>🇺🇿</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5 }}>O'zbekcha</span>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.9, color: '#374151', whiteSpace: 'pre-line' }}>{content.intro_uz}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── GRAMMAR ── */}
              {activeTab === 'grammar' && (
                <div>
                  {Array.isArray(content.grammar) ? content.grammar.map((g, gi) => (
                    <div key={gi} style={{ marginBottom: 20 }}>
                      {/* Grammar rule card - dark */}
                      <div style={{
                        background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
                        borderRadius: 16, padding: '14px 16px', marginBottom: 12
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: '#a3e635',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1a2e05', fontSize: 13, fontWeight: 900, flexShrink: 0
                          }}>{gi + 1}</div>
                          <div>
                            <div className="kr" style={{ fontSize: 15, fontWeight: 900, color: 'white' }}>{g.title_kr}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{g.title_uz}</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>🇰🇷</span>
                            <p className="kr" style={{ fontSize: 12, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line' }}>{g.explanation_kr}</p>
                          </div>
                          <div style={{ height: 0.5, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>🇺🇿</span>
                            <p style={{ fontSize: 12, lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', whiteSpace: 'pre-line' }}>{g.explanation_uz}</p>
                          </div>
                        </div>
                      </div>
                      {/* Examples */}
                      {g.examples?.map((ex, ei) => (
                        <div key={ei} style={{
                          background: '#f5f3ff', borderRadius: 14, padding: '12px 14px', marginBottom: 8,
                          borderLeft: '3px solid #7c3aed'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                            <div className="kr" style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.4, flex: 1 }}>{ex.kr}</div>
                            <AudioBtn isPlaying={speakingId === `gr-${gi}-${ei}`} onPress={() => speak(ex.kr, `gr-${gi}-${ei}`)} size={34} />
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginBottom: 5 }}>{ex.rom}</div>
                          <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>🇺🇿 {ex.uz}</div>
                        </div>
                      ))}
                    </div>
                  )) : (
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{content.grammar}</p>
                  )}
                </div>
              )}

              {/* ── VOCAB ── */}
              {activeTab === 'vocab' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
                      📚 {content.vocabulary?.length || 0} ta so'z
                    </div>
                    <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Volume2 size={12} color="#7c3aed" /> Bosib eshiting!
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {content.vocabulary?.map((v, i) => (
                      <div key={i} style={{
                        background: speakingId === i ? '#ede9fe' : '#f5f3ff',
                        borderRadius: 14, padding: '12px 14px',
                        border: `1px solid ${speakingId === i ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.12)'}`,
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: '#1e1b4b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color: '#a3e635', flexShrink: 0
                          }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div className="kr" style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.2 }}>{v.korean}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: 2 }}>{v.romanization}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', textAlign: 'right', maxWidth: 100 }}>{v.uzbek}</div>
                          <AudioBtn isPlaying={speakingId === i} onPress={() => speak(v.korean, i)} size={38} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => speakAll(content.vocabulary || [], v => v.korean)}
                    style={{
                      width: '100%', marginTop: 14, padding: '13px',
                      borderRadius: 14,
                      border: `1.5px solid #7c3aed`,
                      background: speakingId?.toString().startsWith('all') ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'transparent',
                      color: speakingId?.toString().startsWith('all') ? 'white' : '#7c3aed',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
                    }}>
                    <Volume2 size={16} color={speakingId?.toString().startsWith('all') ? 'white' : '#7c3aed'} />
                    {speakingId?.toString().startsWith('all') ? '⏹️ To\'xtatish' : '▶️ Hammasini eshitish'}
                  </button>
                </div>
              )}

              {/* ── DIALOGUES ── */}
              {activeTab === 'dialogues' && (
                <div>
                  {content.dialogues?.map((dialog, di) => (
                    <div key={di} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b' }}>{dialog.title}</div>
                        <button onClick={() => {
                          if (speakingId === `dialog-all-${di}`) stop()
                          else speakAll(dialog.lines, l => l.kr)
                        }} style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '5px 11px', borderRadius: 20,
                          border: '1px solid rgba(124,58,237,0.3)',
                          background: speakingId === `dialog-all-${di}` ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#f5f3ff',
                          color: speakingId === `dialog-all-${di}` ? 'white' : '#7c3aed',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                          <Volume2 size={11} color={speakingId === `dialog-all-${di}` ? 'white' : '#7c3aed'} />
                          {speakingId === `dialog-all-${di}` ? 'To\'xtat' : 'Ijro et'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {dialog.lines?.map((line, li) => {
                          const isA = line.speaker === 'A'
                          const lineId = `dlg-${di}-${li}`
                          const isPlaying = speakingId === lineId
                          return (
                            <div key={li} style={{ display: 'flex', flexDirection: isA ? 'row' : 'row-reverse', alignItems: 'flex-end', gap: 8 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                background: isA ? '#ede9fe' : '#dcfce7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800,
                                color: isA ? '#7c3aed' : '#15803d'
                              }}>{line.speaker}</div>
                              <div style={{
                                maxWidth: '72%',
                                background: isA ? 'white' : '#ede9fe',
                                borderRadius: isA ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                                padding: '10px 14px',
                                border: isPlaying
                                  ? '1.5px solid #7c3aed'
                                  : `0.5px solid ${isA ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.2)'}`,
                                transition: 'all 0.2s'
                              }}>
                                <div className="kr" style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', lineHeight: 1.4, marginBottom: 3 }}>{line.kr}</div>
                                <div style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic', marginBottom: 4 }}>{line.rom}</div>
                                <div style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>🇺🇿 {line.uz}</div>
                                <div style={{ marginTop: 6 }}>
                                  <button onClick={() => speak(line.kr, lineId)} style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 0
                                  }}>
                                    <div style={{
                                      width: 22, height: 22, borderRadius: '50%',
                                      background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.2)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                      <Volume2 size={10} color="#7c3aed" />
                                    </div>
                                    <span style={{ fontSize: 10, color: '#9ca3af' }}>Tinglash</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {di < (content.dialogues?.length || 0) - 1 && (
                        <div style={{ height: 0.5, background: 'rgba(124,58,237,0.1)', margin: '16px 0 0' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── EXAMPLES ── */}
              {activeTab === 'examples' && (
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
                    🌟 Asosiy jumlalar — 🔊 bosib eshiting!
                  </div>
                  {content.examples?.map((ex, i) => (
                    <div key={i} style={{
                      background: '#f5f3ff', borderRadius: 16, padding: '13px 14px',
                      marginBottom: 10, borderLeft: '3px solid #7c3aed'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                        <div className="kr" style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.5, flex: 1 }}>{ex.korean}</div>
                        <AudioBtn isPlaying={speakingId === `ex-${i}`} onPress={() => speak(ex.korean, `ex-${i}`)} size={34} />
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginBottom: 6 }}>{ex.romanization}</div>
                      <div style={{ height: 0.5, background: 'rgba(124,58,237,0.1)', marginBottom: 6 }} />
                      <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>🇺🇿 {ex.uzbek}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── MATCH PAIRS ── */}
              {activeTab === 'match' && (
                <MatchPairsGame pairs={content.match_pairs || []} />
              )}

              {/* ── NOTES ── */}
              {activeTab === 'notes' && (
                <div>
                  {content.takenotes?.map((note, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      marginBottom: 8, padding: '10px 12px',
                      background: 'white', borderRadius: 12,
                      border: '0.5px solid rgba(124,58,237,0.12)'
                    }}>
                      <span style={{ color: '#7c3aed', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{note}</span>
                    </div>
                  ))}
                  {content.summary && (
                    <div style={{
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      borderRadius: 16, padding: '14px 16px', marginTop: 8
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 6, letterSpacing: 1 }}>
                        ⚡ QISQA XULOSA
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.75 }}>{content.summary}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BUTTON ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        padding: '12px 16px 20px',
        background: 'white', borderTop: '0.5px solid rgba(124,58,237,0.1)'
      }}>
        {quiz.length > 0 ? (
          <button onClick={() => { stop(); setPhase('quiz') }} style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none', borderRadius: 14,
            color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer'
          }}>
            📝 Testni boshlash — {quiz.length} ta savol
          </button>
        ) : (
          <button onClick={() => navigate(-1)} style={{
            width: '100%', padding: '14px',
            background: '#f5f3ff',
            border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14,
            color: '#7c3aed', fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>← Orqaga</button>
        )}
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════
  // QUIZ PHASE
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'quiz') return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh',
      background: '#f5f3ff'
    }}>
      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)'
      }}>
        <button onClick={() => setPhase('content')} style={{
          width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
          border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 14, color: '#1e1b4b' }}>🎯 Mini Test</div>
        <div style={{
          background: '#ede9fe', color: '#7c3aed',
          fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20
        }}>{currentQ + 1} / {quiz.length}</div>
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: '#ede9fe' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
          width: `${(currentQ / quiz.length) * 100}%`,
          transition: 'width 0.4s'
        }} />
      </div>

      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Question */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 20, padding: '20px 18px', marginBottom: 20
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
            SAVOL {currentQ + 1}
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.65, color: 'white' }}>
            {currentQuestion?.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQuestion?.options?.map((opt, i) => {
            const isCorrect  = i === currentQuestion.correct_index
            const isSelected = i === selected
            let bg     = 'white'
            let border = 'rgba(124,58,237,0.15)'
            let color  = '#1e1b4b'
            if (revealed) {
              if (isCorrect)        { bg = '#dcfce7'; border = '#16a34a'; color = '#15803d' }
              else if (isSelected)  { bg = '#fee2e2'; border = '#dc2626'; color = '#991b1b' }
            } else if (isSelected) { bg = '#ede9fe'; border = '#7c3aed' }
            return (
              <button key={i} onClick={() => handleAnswer(i)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 14,
                background: bg, border: `1.5px solid ${border}`, color,
                fontSize: 14, fontWeight: 600, cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all 0.2s'
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: revealed
                    ? (isCorrect ? '#16a34a' : isSelected ? '#dc2626' : '#f5f3ff')
                    : (isSelected ? '#7c3aed' : '#f5f3ff'),
                  border: `1.5px solid ${revealed
                    ? (isCorrect ? '#16a34a' : isSelected ? '#dc2626' : 'rgba(124,58,237,0.15)')
                    : (isSelected ? '#7c3aed' : 'rgba(124,58,237,0.15)')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                  color: (revealed && (isCorrect || isSelected)) ? 'white' : isSelected ? 'white' : '#9ca3af',
                  transition: 'all 0.2s'
                }}>
                  {revealed && isCorrect ? '✓' : revealed && isSelected ? '✗' : String.fromCharCode(65 + i)}
                </div>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════
  // RESULT PHASE
  // ════════════════════════════════════════════════════════════════════
  const passed = score >= 60
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh',
      background: '#f5f3ff',
      padding: '40px 24px 32px', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
    }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>
        {passed ? '🎉' : '😔'}
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#1e1b4b' }}>
        {passed ? "Ajoyib! O'tdingiz! 🌟" : "Qayta urining! 💪"}
      </h2>
      <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
        {passed
          ? 'Tabriklaymiz! Dars muvaffaqiyatli yakunlandi!'
          : `Minimal ball: 60%. Sizning ballingiz: ${score}%\nBarcha tablarni ko'rib chiqing!`}
      </p>

      {/* Score cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(124,58,237,0.12)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: passed ? '#15803d' : '#dc2626' }}>{score}%</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Natija</div>
        </div>
        {passed && (
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(124,58,237,0.12)' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c3aed' }}>+{score === 100 ? 30 : 20}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>XP ball</div>
          </div>
        )}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(124,58,237,0.12)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1e1b4b' }}>{quiz.length}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Savol</div>
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {passed ? (
          <button onClick={() => navigate(-1)} style={{
            padding: '14px', borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer'
          }}>🚀 Davom etish →</button>
        ) : (
          <button onClick={() => {
            setPhase('content'); setCurrentQ(0); setSelected(null)
            setRevealed(false); setScore(0); scoreRef.current = 0; setActiveTab('intro')
          }} style={{
            padding: '14px', borderRadius: 14,
            background: '#f5f3ff', border: '1.5px solid rgba(124,58,237,0.3)',
            color: '#7c3aed', fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>🔄 Qayta urinish</button>
        )}
        <button onClick={() => navigate('/')} style={{
          padding: '14px', borderRadius: 14,
          background: 'white', border: '0.5px solid rgba(124,58,237,0.15)',
          color: '#9ca3af', fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>🏠 Bosh sahifaga</button>
      </div>
    </div>
  )
}


