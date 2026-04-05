import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { getLesson, getQuiz, submitLesson } from '../api'

const FREE_LESSONS = 2

// TTS
function useSpeaker() {
  const [speaking, setSpeaking] = useState(null)
  const speak = (text, id) => {
    window.speechSynthesis.cancel()
    setSpeaking(id)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'; u.rate = 0.85
    u.onend = () => setSpeaking(null)
    u.onerror = () => setSpeaking(null)
    window.speechSynthesis.speak(u)
  }
  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(null) }
  return { speaking, speak, stop }
}

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { completeLesson, isPremium } = useStore()
  const { speaking, speak, stop } = useSpeaker()

  const [lesson, setLesson] = useState(null)
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [phase, setPhase] = useState('content') // content | quiz | result
  const [activeTab, setActiveTab] = useState('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)

  // Premium check
  const lessonNum = lessonId.startsWith('topik')
    ? parseInt(lessonId.split('-')[2])
    : parseInt(lessonId.replace(/[^0-9]/g, '')) || 1
  const needsPremium = lessonNum > FREE_LESSONS && !isPremium

  useEffect(() => {
    stop()
    setLesson(null)
    setLoading(true)
    setError(false)
    setPhase('content')
    setActiveTab('intro')
    scoreRef.current = 0

    const load = async () => {
      try {
        const [l, q] = await Promise.all([
          getLesson(lessonId),
          getQuiz(lessonId)
        ])
        if (l && l.title) {
          setLesson(l)
          setQuiz(q)
          setLoading(false)
        } else {
          setError(true)
          setLoading(false)
        }
      } catch {
        setError(true)
        setLoading(false)
      }
    }

    load()
  }, [lessonId])

  const handleAnswer = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const q = quiz[currentQ]
    const correct = idx === q.correct_index
    if (correct) scoreRef.current += 1
    setTimeout(() => {
      if (currentQ + 1 < quiz.length) {
        setCurrentQ(c => c + 1)
        setSelected(null)
        setRevealed(false)
      } else {
        const finalScore = Math.round((scoreRef.current / quiz.length) * 100)
        const passed = finalScore >= 60
        const track = lessonId.startsWith('topik') ? 'topik' : 'eps'
        if (passed) completeLesson(lessonId, finalScore, finalScore === 100)
        submitLesson(lessonId, finalScore, finalScore === 100, track)
        setScore(finalScore)
        setPhase('result')
      }
    }, 900)
  }

  // Loading
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', flexDirection: 'column', gap: 14, background: '#f5f3ff'
    }}>
      <div style={{ fontSize: 48 }}>📖</div>
      <div style={{ color: '#7c3aed', fontSize: 14, fontWeight: 700 }}>Dars yuklanmoqda...</div>
    </div>
  )

  // Error
  if (error || !lesson) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', flexDirection: 'column', gap: 14, background: '#f5f3ff', padding: 24
    }}>
      <div style={{ fontSize: 48 }}>❌</div>
      <div style={{ color: '#6b7280', fontSize: 15, textAlign: 'center' }}>Dars yuklanmadi</div>
      <button onClick={() => { setError(false); setLoading(true); getLesson(lessonId).then(l => { if(l&&l.title){setLesson(l);setLoading(false)}else{setError(true);setLoading(false)} }).catch(()=>{setError(true);setLoading(false)}) }} style={{
        padding: '11px 24px', borderRadius: 14,
        background: '#7c3aed', border: 'none', color: 'white',
        fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 8
      }}>🔄 Qayta urinish</button>
      <button onClick={() => navigate(-1)} style={{
        padding: '11px 24px', borderRadius: 14,
        background: 'white', border: '1px solid rgba(124,58,237,0.2)',
        color: '#7c3aed', fontSize: 14, fontWeight: 700, cursor: 'pointer'
      }}>← Orqaga</button>
    </div>
  )

  // Premium lock
  if (needsPremium) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', flexDirection: 'column', gap: 14, background: '#f5f3ff', padding: 24
    }}>
      <div style={{ fontSize: 60 }}>👑</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#1e1b4b' }}>Premium kerak</div>
      <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 1.7 }}>
        Bu darsni ko'rish uchun Premium obuna kerak
      </p>
      <button onClick={() => navigate('/premium')} style={{
        padding: '14px 32px', borderRadius: 14,
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        border: 'none', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer'
      }}>Premium olish →</button>
      <button onClick={() => navigate(-1)} style={{
        padding: '11px 24px', borderRadius: 14,
        background: 'white', border: '1px solid rgba(124,58,237,0.2)',
        color: '#7c3aed', fontSize: 14, fontWeight: 700, cursor: 'pointer'
      }}>← Orqaga</button>
    </div>
  )

  const content = lesson.content || {}
  const xp = lesson.xp_reward || lesson.xp || 20

  const TABS = [
    { key: 'intro', icon: '📖', name: 'Kirish' },
    { key: 'grammar', icon: '✏️', name: 'Grammatika' },
    { key: 'vocab', icon: '📝', name: "Lug'at" },
    ...(content.dialogues?.length ? [{ key: 'dialog', icon: '💬', name: 'Dialog' }] : []),
    { key: 'examples', icon: '🌟', name: 'Misollar' },
    { key: 'notes', icon: '📋', name: 'Eslatma' },
  ]

  // Quiz phase
  if (phase === 'quiz') {
    const q = quiz[currentQ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#f5f3ff' }}>
        <div style={{
          background: 'white', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '0.5px solid rgba(124,58,237,0.1)'
        }}>
          <button onClick={() => setPhase('content')} style={{
            width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
            border: '0.5px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>←</button>
          <div style={{ flex: 1, fontWeight: 800, color: '#1e1b4b' }}>🎯 Test</div>
          <div style={{
            background: '#ede9fe', color: '#7c3aed',
            fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20
          }}>{currentQ + 1}/{quiz.length}</div>
        </div>
        <div style={{ height: 4, background: '#ede9fe' }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
            width: `${(currentQ / quiz.length) * 100}%`, transition: 'width 0.4s'
          }} />
        </div>
        <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            borderRadius: 20, padding: '20px', marginBottom: 20
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.6 }}>{q?.question}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q?.options?.map((opt, i) => {
              const isCorrect = i === q.correct_index
              const isSelected = i === selected
              let bg = 'white', border = 'rgba(124,58,237,0.15)', color = '#1e1b4b'
              if (revealed) {
                if (isCorrect) { bg = '#dcfce7'; border = '#16a34a'; color = '#15803d' }
                else if (isSelected) { bg = '#fee2e2'; border = '#dc2626'; color = '#991b1b' }
              } else if (isSelected) { bg = '#ede9fe'; border = '#7c3aed' }
              return (
                <button key={i} onClick={() => handleAnswer(i)} style={{
                  padding: '14px 16px', borderRadius: 14, textAlign: 'left',
                  background: bg, border: `1.5px solid ${border}`, color,
                  fontSize: 14, fontWeight: 600, cursor: revealed ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}>
                  {revealed && isCorrect ? '✅ ' : revealed && isSelected ? '❌ ' : `${String.fromCharCode(65+i)}. `}
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Result phase
  if (phase === 'result') {
    const passed = score >= 60
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100dvh',
        background: '#f5f3ff', padding: '32px 24px', textAlign: 'center'
      }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>{passed ? '🎉' : '😔'}</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1e1b4b', marginBottom: 8 }}>
          {passed ? "Ajoyib! O'tdingiz!" : "Qayta urining!"}
        </h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(124,58,237,0.12)' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: passed ? '#15803d' : '#dc2626' }}>{score}%</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Natija</div>
          </div>
          {passed && (
            <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(124,58,237,0.12)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#7c3aed' }}>+{score === 100 ? 30 : 20}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>XP</div>
            </div>
          )}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {passed ? (
            <button onClick={() => navigate(-1)} style={{
              padding: '14px', borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer'
            }}>🚀 Davom etish →</button>
          ) : (
            <button onClick={() => { setPhase('content'); setCurrentQ(0); setSelected(null); setRevealed(false); scoreRef.current = 0 }} style={{
              padding: '14px', borderRadius: 14, background: '#f5f3ff',
              border: '1.5px solid rgba(124,58,237,0.3)',
              color: '#7c3aed', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}>🔄 Qayta urinish</button>
          )}
          <button onClick={() => navigate('/')} style={{
            padding: '14px', borderRadius: 14, background: 'white',
            border: '0.5px solid rgba(124,58,237,0.15)',
            color: '#9ca3af', fontSize: 14, cursor: 'pointer'
          }}>🏠 Bosh sahifaga</button>
        </div>
      </div>
    )
  }

  // Content phase
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#f5f3ff' }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)', flexShrink: 0
      }}>
        <button onClick={() => { stop(); navigate(-1) }} style={{
          width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
          border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16
        }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>
            {lessonId.startsWith('eps') || lessonId.startsWith('alpha') ? 'EPS-TOPIK' : `TOPIK`} · {lesson.lesson_number}-dars
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.title}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: 'white', fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20
        }}>+{xp} XP</div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white', padding: '8px 12px',
        display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)'
      }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { stop(); setActiveTab(t.key) }} style={{
            padding: '7px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', transition: 'all 0.2s',
            background: activeTab === t.key ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#f5f3ff',
            color: activeTab === t.key ? 'white' : '#6b7280'
          }}>{t.icon} {t.name}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>

        {/* INTRO */}
        {activeTab === 'intro' && (
          <div>
            {content.goals?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: '0.5px solid rgba(124,58,237,0.12)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', marginBottom: 10 }}>🎯 Bu darsda nima o'rganamiz?</div>
                {content.goals.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#7c3aed', fontWeight: 900 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{g}</span>
                  </div>
                ))}
              </div>
            )}
            {content.intro_kr && (
              <div style={{ background: '#f5f3ff', borderRadius: 14, padding: '14px', marginBottom: 10, border: '0.5px solid rgba(124,58,237,0.12)' }}>
                <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginBottom: 6 }}>🇰🇷 한국어</div>
                <p className="kr" style={{ fontSize: 13, lineHeight: 1.9, color: '#1e1b4b', whiteSpace: 'pre-line' }}>{content.intro_kr}</p>
              </div>
            )}
            {content.intro_uz && (
              <div style={{ background: 'white', borderRadius: 14, padding: '14px', border: '0.5px solid rgba(124,58,237,0.1)' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, marginBottom: 6 }}>🇺🇿 O'zbekcha</div>
                <p style={{ fontSize: 13, lineHeight: 1.9, color: '#374151', whiteSpace: 'pre-line' }}>{content.intro_uz}</p>
              </div>
            )}
          </div>
        )}

        {/* GRAMMAR */}
        {activeTab === 'grammar' && (
          <div>
            {Array.isArray(content.grammar) ? content.grammar.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 16 }}>
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 16, padding: '14px', marginBottom: 10 }}>
                  <div className="kr" style={{ fontSize: 15, fontWeight: 900, color: 'white', marginBottom: 4 }}>{g.title_kr}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{g.title_uz}</div>
                  <div style={{ height: 0.5, background: 'rgba(255,255,255,0.15)', margin: '10px 0' }} />
                  <p className="kr" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{g.explanation_kr}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginTop: 6, whiteSpace: 'pre-line' }}>{g.explanation_uz}</p>
                </div>
                {g.examples?.map((ex, ei) => (
                  <div key={ei} style={{
                    background: '#f5f3ff', borderRadius: 12, padding: '12px 14px',
                    marginBottom: 8, borderLeft: '3px solid #7c3aed'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div className="kr" style={{ fontSize: 15, fontWeight: 800, color: '#1e1b4b' }}>{ex.kr}</div>
                      <button onClick={() => speak(ex.kr, `gr-${gi}-${ei}`)} style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: speaking === `gr-${gi}-${ei}` ? '#7c3aed' : '#ede9fe',
                        border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0
                      }}>🔊</button>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginBottom: 4 }}>{ex.rom}</div>
                    <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>🇺🇿 {ex.uz}</div>
                  </div>
                ))}
              </div>
            )) : <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{content.grammar}</p>}
          </div>
        )}

        {/* VOCAB */}
        {activeTab === 'vocab' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {content.vocabulary?.map((v, i) => (
              <div key={i} style={{
                background: '#f5f3ff', borderRadius: 14, padding: '12px 14px',
                border: '1px solid rgba(124,58,237,0.12)',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: '#1e1b4b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: '#a3e635', flexShrink: 0
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="kr" style={{ fontSize: 18, fontWeight: 800, color: '#1e1b4b' }}>{v.korean}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>{v.romanization}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>{v.uzbek}</div>
                <button onClick={() => speak(v.korean, i)} style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: speaking === i ? '#7c3aed' : '#ede9fe',
                  border: 'none', cursor: 'pointer', fontSize: 16, flexShrink: 0
                }}>🔊</button>
              </div>
            ))}
          </div>
        )}

        {/* DIALOG */}
        {activeTab === 'dialog' && (
          <div>
            {content.dialogues?.map((dialog, di) => (
              <div key={di} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', marginBottom: 12 }}>{dialog.title}</div>
                {dialog.lines?.map((line, li) => {
                  const isA = line.speaker === 'A'
                  return (
                    <div key={li} style={{ display: 'flex', flexDirection: isA ? 'row' : 'row-reverse', gap: 8, marginBottom: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: isA ? '#ede9fe' : '#dcfce7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: isA ? '#7c3aed' : '#15803d'
                      }}>{line.speaker}</div>
                      <div style={{
                        maxWidth: '72%', background: isA ? 'white' : '#ede9fe',
                        borderRadius: isA ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                        padding: '10px 14px', border: '0.5px solid rgba(124,58,237,0.15)'
                      }}>
                        <div className="kr" style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', marginBottom: 3 }}>{line.kr}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic', marginBottom: 4 }}>{line.rom}</div>
                        <div style={{ fontSize: 12, color: '#374151' }}>🇺🇿 {line.uz}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* EXAMPLES */}
        {activeTab === 'examples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {content.examples?.map((ex, i) => (
              <div key={i} style={{ background: '#f5f3ff', borderRadius: 14, padding: '13px 14px', borderLeft: '3px solid #7c3aed' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <div className="kr" style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b', flex: 1 }}>{ex.korean}</div>
                  <button onClick={() => speak(ex.korean, `ex-${i}`)} style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: speaking === `ex-${i}` ? '#7c3aed' : '#ede9fe',
                    border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0
                  }}>🔊</button>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginBottom: 6 }}>{ex.romanization}</div>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>🇺🇿 {ex.uzbek}</div>
              </div>
            ))}
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div>
            {content.takenotes?.map((note, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, marginBottom: 8, padding: '10px 12px',
                background: 'white', borderRadius: 12, border: '0.5px solid rgba(124,58,237,0.12)'
              }}>
                <span style={{ color: '#7c3aed', fontWeight: 900 }}>•</span>
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{note}</span>
              </div>
            ))}
            {content.summary && (
              <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 16, padding: '14px 16px', marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>⚡ XULOSA</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.75 }}>{content.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, padding: '12px 16px 20px',
        background: 'white', borderTop: '0.5px solid rgba(124,58,237,0.1)'
      }}>
        {quiz.length > 0 ? (
          <button onClick={() => { stop(); setPhase('quiz') }} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer'
          }}>📝 Testni boshlash — {quiz.length} ta savol</button>
        ) : (
          <button onClick={() => navigate(-1)} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: '#f5f3ff', border: '1px solid rgba(124,58,237,0.2)',
            color: '#7c3aed', fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>← Orqaga</button>
        )}
      </div>
    </div>
  )
}
