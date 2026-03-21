import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, TOPIK_LEVELS, EPS_FINAL_TEST } from '../store'
import { ChevronLeft } from 'lucide-react'

export default function TestScreen() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { submitTest } = useStore()
  const [phase, setPhase] = useState('intro') // intro | quiz | result
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const correctRef = useRef(0)

  // Find test
  const test = (() => {
    if (testId === 'eps-final') return EPS_FINAL_TEST
    const lvl = testId?.replace('topik-test-', '')
    const level = TOPIK_LEVELS.find(l => l.id === parseInt(lvl))
    return level?.test
  })()

  if (!test) return (
    <div style={{ padding: 24, paddingTop: 80, textAlign: 'center' }}>
      <div>Test topilmadi</div>
      <button className="btn btn-secondary" style={{ marginTop: 20, maxWidth: 200, margin: '20px auto 0' }} onClick={() => navigate(-1)}>Orqaga</button>
    </div>
  )

  const questions = test.questions || []
  const currentQuestion = questions[currentQ]

  const handleAnswer = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === currentQuestion.correct
    if (correct) correctRef.current += 1
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1)
        setSelected(null)
        setRevealed(false)
      } else {
        const score = Math.round((correctRef.current / questions.length) * 100)
        setFinalScore(score)

        // Update local state immediately
        submitTest(testId, score)

        // Sync to backend (non-blocking)
        const track = testId.startsWith('topik') ? 'topik' : 'eps'
        import('../api.js').then(({ submitTestResult }) => {
          submitTestResult(testId, score, track).catch(() => {})
        }).catch(() => {})

        setPhase('result')
      }
    }, 900)
  }

  // ── INTRO ──
  if (phase === 'intro') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">{test.title}</div>
      </div>
      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📝</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{test.title}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
          Bu test barcha savollarga javob berishni talab qiladi. O'tish uchun minimal ball 60%.
        </p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
          {[
            { val: questions.length, lbl: 'Savollar' },
            { val: '60%', lbl: "O'tish bali" },
            { val: '+100', lbl: 'XP ball' },
          ].map((s, i) => (
            <div className="stat-cell" key={i} style={{ minWidth: 80 }}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ maxWidth: 300 }} onClick={() => setPhase('quiz')}>
          Testni boshlash →
        </button>
      </div>
    </div>
  )

  // ── QUIZ ──
  if (phase === 'quiz') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <div className="header-title">{test.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 700 }}>{currentQ + 1}/{questions.length}</div>
      </div>

      <div style={{ height: 4, background: 'var(--bg3)' }}>
        <div style={{ height: '100%', background: 'var(--amber)', width: `${(currentQ / questions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < currentQ ? 'var(--green)' : i === currentQ ? 'var(--amber)' : 'var(--bg3)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div className="card" style={{ marginBottom: 28, minHeight: 80, display: 'flex', alignItems: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>{currentQuestion?.question}</p>
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

  // ── RESULT ──
  const passed = finalScore >= 60
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: '48px 24px 32px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }} className="pop-in">
        {passed ? '🏆' : '😔'}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
        {passed ? 'Tabriklaymiz!' : "Muvaffaqiyatsiz"}
      </h2>
      <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 24 }}>
        {passed ? `Keyingi daraja ochildi!` : `Minimal ball: 60%. Siz: ${finalScore}%`}
      </p>

      {/* Score ring */}
      <div style={{ width: 120, height: 120, borderRadius: '50%', border: `6px solid ${passed ? 'var(--green)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, color: passed ? 'var(--green)' : 'var(--red)' }}>{finalScore}%</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Natija</div>
        </div>
      </div>

      {passed && (
        <div className="card" style={{ width: '100%', marginBottom: 24, background: 'var(--green-bg)', border: '1px solid var(--green)', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>+100 XP qo'shildi</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Daraja muvaffaqiyatli yakunlandi</div>
            </div>
          </div>
        </div>
      )}

      {!passed && (
        <div className="card" style={{ width: '100%', marginBottom: 24, background: 'var(--red-bg)', border: '1px solid var(--red)' }}>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>
            Takrorlash bo'limiga o'ting, darslarni qaytadan ko'rib chiqing va 1 soatdan so'ng qayta urining.
          </p>
        </div>
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {passed ? (
          <button className="btn btn-success" onClick={() => navigate('/')}>
            Davom etish →
          </button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/review')}>📖 Takrorlash</button>
            <button className="btn btn-secondary" onClick={() => { setPhase('intro'); setCurrentQ(0); setSelected(null); setRevealed(false); correctRef.current = 0 }}>
              🔄 Qayta urinish
            </button>
          </>
        )}
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Bosh sahifaga</button>
      </div>
    </div>
  )
}
