import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { ChevronLeft, Volume2 } from 'lucide-react'

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

// ── Korean TTS ──────────────────────────────────────────────────────
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

// ── Audio button ────────────────────────────────────────────────────
function AudioBtn({ isPlaying, onPress, size = 38 }) {
  return (
    <button
      onClick={onPress}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: isPlaying
          ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
          : 'var(--bg3)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'all 0.2s',
        transform: isPlaying ? 'scale(1.12)' : 'scale(1)',
        boxShadow: isPlaying ? '0 4px 12px rgba(244,114,182,0.4)' : 'none'
      }}>
      <Volume2 size={size * 0.42} color={isPlaying ? 'white' : 'var(--accent)'} />
    </button>
  )
}

// ════════════════════════════════════════════════════════
// 🃏 MATCH PAIRS GAME
// ════════════════════════════════════════════════════════
function MatchPairsGame({ pairs }) {
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState([])
  const [matched, setMatched] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [finished, setFinished] = useState(false)
  const [shaking, setShaking] = useState([])

  // Init: shuffle korean + uzbek cards
  useEffect(() => {
    if (!pairs?.length) return
    const korCards = pairs.map((p, i) => ({ id: `k-${i}`, text: p.korean, pairId: i, type: 'korean' }))
    const uzCards  = pairs.map((p, i) => ({ id: `u-${i}`, text: p.uzbek,  pairId: i, type: 'uzbek'  }))
    const all = [...korCards, ...uzCards].sort(() => Math.random() - 0.5)
    setCards(all)
    setSelected([])
    setMatched([])
    setMistakes(0)
    setFinished(false)
  }, [pairs])

  const handleSelect = (card) => {
    if (matched.includes(card.id)) return
    if (selected.find(c => c.id === card.id)) return
    if (selected.length === 2) return

    const newSel = [...selected, card]
    setSelected(newSel)

    if (newSel.length === 2) {
      const [a, b] = newSel
      if (a.pairId === b.pairId && a.type !== b.type) {
        // ✅ Match!
        setTimeout(() => {
          setMatched(m => [...m, a.id, b.id])
          setSelected([])
          if (matched.length + 2 === cards.length) setFinished(true)
        }, 400)
      } else {
        // ❌ No match — shake and reset
        setMistakes(m => m + 1)
        setShaking([a.id, b.id])
        setTimeout(() => {
          setSelected([])
          setShaking([])
        }, 700)
      }
    }
  }

  const restart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setSelected([])
    setMatched([])
    setMistakes(0)
    setFinished(false)
    setShaking([])
  }

  const isSelected = (id) => selected.find(c => c.id === id)
  const isMatched  = (id) => matched.includes(id)
  const isShaking  = (id) => shaking.includes(id)

  const totalPairs = pairs.length
  const matchedPairs = matched.length / 2
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent2)', marginBottom: 6 }}>
          🃏 Juftlikni toping!
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>
          Koreys so'zini o'zbek ma'nosi bilan toping
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, margin: '0 8px 8px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            width: `${progress}%`,
            borderRadius: 4,
            transition: 'width 0.4s'
          }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13 }}>
          <span style={{ color: '#28a745', fontWeight: 700 }}>✅ {matchedPairs}/{totalPairs}</span>
          <span style={{ color: mistakes > 3 ? '#dc3545' : 'var(--text3)', fontWeight: 700 }}>
            ❌ {mistakes} xato
          </span>
        </div>
      </div>

      {/* Finished state */}
      {finished ? (
        <div style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>
            {mistakes === 0 ? '🏆' : mistakes <= 2 ? '🌟' : '🎉'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent2)', marginBottom: 8 }}>
            {mistakes === 0 ? 'MUKAMMAL! Hech xato yo\'q!' :
             mistakes <= 2 ? 'Juda yaxshi!' : 'Barakalla!'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
            {totalPairs} ta juftlik | {mistakes} ta xato
          </div>
          {/* Stars rating */}
          <div style={{ fontSize: 32, marginBottom: 20 }}>
            {mistakes === 0 ? '⭐⭐⭐' : mistakes <= 2 ? '⭐⭐' : '⭐'}
          </div>
          <button
            onClick={restart}
            style={{
              padding: '12px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
              cursor: 'pointer'
            }}>
            🔄 Qayta o'ynash
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {cards.map(card => {
            const sel  = isSelected(card.id)
            const mat  = isMatched(card.id)
            const shak = isShaking(card.id)
            const isKr = card.type === 'korean'

            let bg = 'var(--card)'
            let border = 'var(--border)'
            let color = 'var(--text)'
            let shadow = '0 2px 8px rgba(0,0,0,0.06)'

            if (mat) {
              bg = 'linear-gradient(135deg, #d4edda, #c3e6cb)'
              border = '#28a745'
              color = '#155724'
            } else if (shak) {
              bg = '#f8d7da'
              border = '#dc3545'
              color = '#721c24'
            } else if (sel) {
              bg = 'linear-gradient(135deg, var(--bg3), #fce4ec)'
              border = 'var(--accent)'
              color = 'var(--accent2)'
              shadow = '0 4px 14px rgba(244,114,182,0.3)'
            }

            return (
              <div
                key={card.id}
                onClick={() => handleSelect(card)}
                style={{
                  background: bg,
                  border: `2px solid ${border}`,
                  borderRadius: 14,
                  padding: '14px 10px',
                  textAlign: 'center',
                  cursor: mat ? 'default' : 'pointer',
                  boxShadow: shadow,
                  transition: 'all 0.2s',
                  minHeight: 70,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 4,
                  animation: shak ? 'shake 0.5s' : 'none',
                  opacity: mat ? 0.75 : 1,
                  transform: sel ? 'scale(1.04)' : shak ? 'scale(0.97)' : 'scale(1)'
                }}>
                {/* Type badge */}
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: mat ? '#28a745' : sel ? 'var(--accent)' : 'var(--text3)',
                  letterSpacing: 0.5,
                  marginBottom: 2
                }}>
                  {mat ? '✓ Topildi' : isKr ? '🇰🇷 KR' : '🇺🇿 UZ'}
                </div>
                {/* Card text */}
                <div style={{
                  fontSize: isKr ? 16 : 13,
                  fontWeight: isKr ? 700 : 600,
                  color,
                  lineHeight: 1.3,
                  fontFamily: isKr ? 'inherit' : 'inherit'
                }} className={isKr ? 'kr' : ''}>
                  {card.text}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
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
  const [openDialog, setOpenDialog] = useState(null)
  const scoreRef = useRef(0)
  const contentRef = useRef(null)
  const { speakingId, speak, speakAll, stop } = useSpeaker()

  // ── Load lesson + quiz ─────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      apiFetch(`/lessons/${lessonId}`),
      apiFetch(`/lessons/${lessonId}/quiz`)
    ]).then(([lessonData, quizData]) => {
      setLesson(lessonData)
      setQuiz(Array.isArray(quizData) ? quizData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [lessonId])

  // ── Scroll tracker ─────────────────────────────────────────────────
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

  // ── Stop audio on tab change ───────────────────────────────────────
  useEffect(() => { stop() }, [activeTab])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48, animation: 'pulse 1s infinite' }}>📖</div>
      <div style={{ color: 'var(--text2)', fontSize: 15, fontWeight: 600 }}>Dars yuklanmoqda...</div>
    </div>
  )

  if (!lesson) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
      <div style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 20 }}>Dars topilmadi</div>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Orqaga</button>
    </div>
  )

  const content = lesson.content || {}
  const xp = lesson.xp_reward || lesson.xp || 10
  const currentQuestion = quiz[currentQ]
  const hasDialogues = content.dialogues?.length > 0

  // ── Tabs config ────────────────────────────────────────────────────
  const hasMatchPairs = content.match_pairs?.length > 0
  const tabs = [
    { key: 'intro',    label: '📖 Kirish' },
    { key: 'grammar',  label: '✍️ Grammatika' },
    { key: 'vocab',    label: '🔊 Lug\'at' },
    ...(hasDialogues ? [{ key: 'dialogues', label: '💬 Dialog' }] : []),
    { key: 'examples', label: '🌟 Misollar' },
    ...(hasMatchPairs ? [{ key: 'match', label: '🃏 O\'yin' }] : []),
    { key: 'notes',    label: '📝 Eslatma' },
  ]

  const tabStyle = (active) => ({
    flex: 1,
    padding: '7px 2px',
    fontSize: 10,
    fontWeight: active ? 800 : 500,
    color: active ? 'var(--accent2)' : 'var(--text3)',
    background: active ? 'var(--bg3)' : 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  })

  // ── Quiz answer ────────────────────────────────────────────────────
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

  // ════════════════════════════════════════════════════════
  // CONTENT PHASE
  // ════════════════════════════════════════════════════════
  if (phase === 'content') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={() => { stop(); navigate(-1) }}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title" style={{ fontSize: 12 }}>{lesson.title}</div>
        <div className="badge badge-purple">+{xp} XP</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg3)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent2))', width: scrolled ? '100%' : '30%', transition: 'width 0.5s' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, padding: '7px 8px', background: 'var(--bg)', borderBottom: '0.5px solid var(--border)', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.key} style={tabStyle(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 100px' }}>

        {/* ── INTRO TAB ── */}
        {activeTab === 'intro' && (
          <div>
            {content.goals?.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #fce4ec, #fdf2f8)', borderRadius: 16, padding: '14px 16px', marginBottom: 14, border: '1px solid #f8bbd0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent2)', marginBottom: 10 }}>🎯 Bu darsda nima o'rganamiz?</div>
                {content.goals.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{g}</span>
                  </div>
                ))}
              </div>
            )}
            {content.intro_kr && (
              <div className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🇰🇷</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 0.5 }}>한국어</span>
                </div>
                <p className="kr" style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text)' }}>{content.intro_kr}</p>
              </div>
            )}
            {content.intro_uz && (
              <div className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🇺🇿</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 0.5 }}>O'zbekcha</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text2)' }}>{content.intro_uz}</p>
              </div>
            )}
            {content.summary && (
              <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 14, padding: '14px 16px', marginTop: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: 0.5 }}>⚡ QISQA XULOSA</div>
                <p style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>{content.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* ── GRAMMAR TAB ── */}
        {activeTab === 'grammar' && (
          <div>
            {Array.isArray(content.grammar) ? content.grammar.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900, flexShrink: 0 }}>
                    {gi + 1}
                  </div>
                  <div>
                    <div className="kr" style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent2)', lineHeight: 1.2 }}>{g.title_kr}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{g.title_uz}</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 14, padding: '12px 14px', marginBottom: 12, borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>🇰🇷</span>
                    <p className="kr" style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-line' }}>{g.explanation_kr}</p>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🇺🇿</span>
                    <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text2)', whiteSpace: 'pre-line' }}>{g.explanation_uz}</p>
                  </div>
                </div>
                {g.examples?.map((ex, ei) => (
                  <div key={ei} style={{ background: 'var(--card)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, borderLeft: '3px solid var(--purple)', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div className="kr" style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent2)', lineHeight: 1.4, flex: 1 }}>{ex.kr}</div>
                      <AudioBtn isPlaying={speakingId === `gr-${gi}-${ei}`} onPress={() => speak(ex.kr, `gr-${gi}-${ei}`)} size={34} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', margin: '4px 0' }}>{ex.rom}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{ex.uz}</div>
                  </div>
                ))}
              </div>
            )) : (
              <div className="card"><p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{content.grammar}</p></div>
            )}
          </div>
        )}

        {/* ── VOCAB TAB with AUDIO ── */}
        {activeTab === 'vocab' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>
                📚 {content.vocabulary?.length || 0} ta so'z
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
                <Volume2 size={14} color="var(--accent)" />
                Bosib eshiting!
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {content.vocabulary?.map((v, i) => (
                <div key={i} style={{
                  background: 'var(--card)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                  border: speakingId === i ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text3)', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="kr" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent2)', lineHeight: 1.2 }}>{v.korean}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, fontStyle: 'italic' }}>{v.romanization}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', textAlign: 'right', maxWidth: 110 }}>{v.uzbek}</div>
                    <AudioBtn isPlaying={speakingId === i} onPress={() => speak(v.korean, i)} size={40} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => speakAll(content.vocabulary || [], v => v.korean)}
              style={{ width: '100%', marginTop: 18, padding: '14px', borderRadius: 14, border: '2px solid var(--accent)', background: speakingId?.toString().startsWith('all') ? 'var(--accent)' : 'transparent', color: speakingId?.toString().startsWith('all') ? 'white' : 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
              <Volume2 size={18} color={speakingId?.toString().startsWith('all') ? 'white' : 'var(--accent)'} />
              {speakingId?.toString().startsWith('all') ? '⏹️ To\'xtatish' : '▶️ Hammasini eshitish'}
            </button>
          </div>
        )}

        {/* ── DIALOGUES TAB ── */}
        {activeTab === 'dialogues' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>
                💬 {content.dialogues?.length || 0} ta dialog — bosib eshiting!
              </div>
            </div>

            {content.dialogues?.map((dialog, di) => (
              <div key={di} style={{ marginBottom: 20 }}>
                {/* Dialog header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent2)' }}>
                    {dialog.title}
                  </div>
                  {/* Play all button for this dialog */}
                  <button
                    onClick={() => {
                      if (speakingId === `dialog-all-${di}`) {
                        stop()
                      } else {
                        speakAll(dialog.lines, l => l.kr)
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: '1.5px solid var(--accent)',
                      background: speakingId === `dialog-all-${di}` ? 'var(--accent)' : 'transparent',
                      color: speakingId === `dialog-all-${di}` ? 'white' : 'var(--accent)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                    <Volume2 size={13} color={speakingId === `dialog-all-${di}` ? 'white' : 'var(--accent)'} />
                    {speakingId === `dialog-all-${di}` ? 'To\'xtat' : 'Ijro et'}
                  </button>
                </div>

                {/* Chat bubbles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {dialog.lines?.map((line, li) => {
                    const isA = line.speaker === 'A'
                    const lineId = `dlg-${di}-${li}`
                    const isPlaying = speakingId === lineId

                    return (
                      <div key={li} style={{
                        display: 'flex',
                        flexDirection: isA ? 'row' : 'row-reverse',
                        alignItems: 'flex-end',
                        gap: 8
                      }}>
                        {/* Avatar */}
                        <div style={{
                          width: 32, height: 32,
                          borderRadius: '50%',
                          background: isA
                            ? 'linear-gradient(135deg, #f472b6, #ec4899)'
                            : 'linear-gradient(135deg, #c084fc, #a855f7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 13, fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {line.speaker}
                        </div>

                        {/* Bubble */}
                        <div style={{
                          maxWidth: '72%',
                          background: isA ? 'var(--card)' : 'linear-gradient(135deg, #fce4ec, #fdf2f8)',
                          borderRadius: isA
                            ? '18px 18px 18px 4px'
                            : '18px 18px 4px 18px',
                          padding: '10px 14px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          border: isPlaying
                            ? '1.5px solid var(--accent)'
                            : `1.5px solid ${isA ? 'var(--border)' : '#f8bbd0'}`,
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}>
                          {/* Korean text */}
                          <div className="kr" style={{
                            fontSize: 16, fontWeight: 700,
                            color: isA ? 'var(--text)' : 'var(--accent2)',
                            lineHeight: 1.4, marginBottom: 4
                          }}>
                            {line.kr}
                          </div>

                          {/* Romanization */}
                          <div style={{
                            fontSize: 11, color: 'var(--text3)',
                            fontStyle: 'italic', marginBottom: 5,
                            lineHeight: 1.4
                          }}>
                            {line.rom}
                          </div>

                          {/* Uzbek translation */}
                          <div style={{
                            fontSize: 13, color: 'var(--text2)',
                            fontWeight: 500, lineHeight: 1.4
                          }}>
                            🇺🇿 {line.uz}
                          </div>
                        </div>

                        {/* Audio button */}
                        <AudioBtn
                          isPlaying={isPlaying}
                          onPress={() => speak(line.kr, lineId)}
                          size={34}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Divider between dialogs */}
                {di < (content.dialogues?.length || 0) - 1 && (
                  <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 0' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── EXAMPLES TAB ── */}
        {activeTab === 'examples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>
              🌟 Asosiy jumlalar — 🔊 bosib eshiting!
            </div>
            {content.examples?.map((ex, i) => (
              <div key={i} style={{ background: 'var(--card)', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div className="kr" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5, flex: 1 }}>{ex.korean}</div>
                  <AudioBtn isPlaying={speakingId === `ex-${i}`} onPress={() => speak(ex.korean, `ex-${i}`)} size={36} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 8 }}>{ex.romanization}</div>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 8 }} />
                <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>🇺🇿 {ex.uzbek}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── MATCH PAIRS TAB ── */}
        {activeTab === 'match' && (
          <MatchPairsGame pairs={content.match_pairs || []} />
        )}

        {/* ── NOTES TAB ── */}
        {activeTab === 'notes' && (
          <div>
            <div style={{ background: 'var(--bg3)', borderRadius: 16, padding: '16px', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent2)', marginBottom: 12 }}>
                📝 Eslab qolish kerak!
              </div>
              {content.takenotes?.map((note, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{note}</span>
                </div>
              ))}
            </div>
            {content.summary && (
              <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 16, padding: '16px' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: 0.5 }}>⚡ QISQA XULOSA</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)', lineHeight: 1.8 }}>{content.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '12px 16px 20px', background: 'var(--bg)', borderTop: '0.5px solid var(--border)' }}>
        {quiz.length > 0 ? (
          <button className="btn btn-primary" onClick={() => { stop(); setPhase('quiz') }}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', border: 'none' }}>
            📝 Testni boshlash — {quiz.length} ta savol
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Orqaga</button>
        )}
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════
  // QUIZ PHASE
  // ════════════════════════════════════════════════════════
  if (phase === 'quiz') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <button className="back-btn" onClick={() => setPhase('content')}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">🎯 Test</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 700 }}>
          {currentQ + 1} / {quiz.length}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
          width: `${((currentQ) / quiz.length) * 100}%`,
          transition: 'width 0.4s',
          borderRadius: 3
        }} />
      </div>

      <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Question */}
        <div style={{ background: 'var(--card)', borderRadius: 20, padding: '20px 18px', marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6, color: 'var(--text)' }}>
            {currentQuestion?.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQuestion?.options?.map((opt, i) => {
            const isCorrect = i === currentQuestion.correct_index
            const isSelected = i === selected
            let bg = 'var(--card)'
            let border = 'var(--border)'
            let color = 'var(--text)'
            if (revealed) {
              if (isCorrect) { bg = '#d4edda'; border = '#28a745'; color = '#155724' }
              else if (isSelected) { bg = '#f8d7da'; border = '#dc3545'; color = '#721c24' }
            } else if (isSelected) { bg = 'var(--bg3)'; border = 'var(--accent)' }

            return (
              <button key={i} onClick={() => handleAnswer(i)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 14,
                background: bg, border: `1.5px solid ${border}`,
                color, fontSize: 14, fontWeight: 600,
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all 0.2s',
                boxShadow: isSelected && !revealed ? '0 2px 8px rgba(244,114,182,0.3)' : 'none'
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: revealed
                    ? (isCorrect ? '#28a745' : isSelected ? '#dc3545' : 'var(--bg)')
                    : (isSelected ? 'var(--accent)' : 'var(--bg)'),
                  border: `1.5px solid ${revealed ? (isCorrect ? '#28a745' : isSelected ? '#dc3545' : 'var(--border2)') : (isSelected ? 'var(--accent)' : 'var(--border2)')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, flexShrink: 0,
                  color: (revealed && (isCorrect || isSelected)) ? 'white' : isSelected ? 'white' : 'var(--text3)',
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

  // ════════════════════════════════════════════════════════
  // RESULT PHASE
  // ════════════════════════════════════════════════════════
  const passed = score >= 60
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: '40px 24px 32px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 16 }} className="pop-in">
        {passed ? '🎉' : '😔'}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: 'var(--text)' }}>
        {passed ? "Ajoyib! O'tdingiz! 🌟" : "Qayta urining! 💪"}
      </h2>
      <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
        {passed
          ? `Tabriklaymiz! Dars muvaffaqiyatli yakunlandi!`
          : `Minimal ball: 60%. Sizning ballingiz: ${score}%\nBarcha tablarni ko'rib chiqing!`}
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: passed ? '#28a745' : '#dc3545' }}>{score}%</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Natija</div>
        </div>
        {passed && (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>+{score === 100 ? 30 : 20}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>XP ball</div>
          </div>
        )}
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent2)' }}>{quiz.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Savol</div>
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {passed ? (
          <button className="btn btn-success" onClick={() => navigate(-1)}
            style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
            🚀 Davom etish →
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => {
            setPhase('content'); setCurrentQ(0); setSelected(null)
            setRevealed(false); setScore(0); scoreRef.current = 0; setActiveTab('intro')
          }}>
            🔄 Qayta urinish
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => navigate('/')}>🏠 Bosh sahifaga</button>
      </div>
    </div>
  )
}
