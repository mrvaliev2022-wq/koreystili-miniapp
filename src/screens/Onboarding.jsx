import { useState } from 'react'
import { useStore } from '../store'

export default function Onboarding() {
  const { completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [selectedTrack, setSelectedTrack] = useState(null)

  const handleStart = () => {
    if (step === 0) { setStep(1); return }
    if (step === 1 && selectedTrack) completeOnboarding(selectedTrack)
  }

  // ── STEP 0: Xush kelibsiz ─────────────────────────────────────────
  if (step === 0) return (
    <div style={{
      minHeight: '100dvh', background: '#f5f3ff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        <div style={{ width: 32, height: 5, borderRadius: 3, background: 'linear-gradient(90deg,#7c3aed,#a855f7)' }} />
        <div style={{ width: 12, height: 5, borderRadius: 3, background: '#ddd6fe' }} />
      </div>

      {/* Hero dark card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
        borderRadius: 28, padding: '32px 28px',
        width: '100%', maxWidth: 380,
        textAlign: 'center', marginBottom: 20,
        border: '1px solid rgba(163,230,53,0.15)'
      }}>
        <div style={{ fontSize: 64, marginBottom: 18 }}>👋</div>

        {/* Korean subtitle */}
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: '#a3e635',
          marginBottom: 6, letterSpacing: 0.5
        }}>환영합니다!</div>

        {/* Uzbek main title */}
        <div style={{
          fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 10
        }}>Xush kelibsiz!</div>

        <div style={{
          width: 48, height: 3, borderRadius: 2,
          background: '#a3e635', margin: '0 auto 16px'
        }} />

        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.75, margin: 0
        }}>
          Koreystili — koreys tilini o'rganish ilovasiga xush kelibsiz. Bu yerda siz koreys tilini bosqichma-bosqich o'rganasiz.
        </p>
      </div>

      {/* Feature list */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {[
          { icon: '🎓', kr: 'TOPIK 시험 준비', uz: 'TOPIK imtihoniga tayyorlanish — 6 daraja' },
          { icon: '🏭', kr: 'EPS-TOPIK 취업 준비', uz: 'EPS-TOPIK — ish uchun koreys tili' },
          { icon: '🎮', kr: '재미있는 학습', uz: "O'yin, test va audio bilan o'rganish" },
          { icon: '🏆', kr: '경쟁 학습 시스템', uz: 'Reyting va XP ball tizimi' },
        ].map((f, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 16, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            border: '0.5px solid rgba(124,58,237,0.12)',
            boxShadow: '0 2px 8px rgba(124,58,237,0.05)'
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700, marginBottom: 2 }}>{f.kr}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>{f.uz}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button onClick={handleStart} style={{
        width: '100%', maxWidth: 380, padding: '15px',
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        border: 'none', borderRadius: 16,
        color: 'white', fontSize: 16, fontWeight: 900,
        cursor: 'pointer'
      }}>Boshlash →</button>

      <div style={{ fontSize: 11, color: '#a78bfa', marginTop: 12, fontWeight: 600 }}>
        시작하겠습니다 · Keling boshlaylik!
      </div>
    </div>
  )

  // ── STEP 1: Maqsadni tanlash ──────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh', background: '#f5f3ff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        <div style={{ width: 12, height: 5, borderRadius: 3, background: '#ddd6fe' }} />
        <div style={{ width: 32, height: 5, borderRadius: 3, background: 'linear-gradient(90deg,#7c3aed,#a855f7)' }} />
      </div>

      {/* Hero dark card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
        borderRadius: 28, padding: '28px 28px 22px',
        width: '100%', maxWidth: 380,
        textAlign: 'center', marginBottom: 18,
        border: '1px solid rgba(163,230,53,0.15)'
      }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🎯</div>

        {/* Korean subtitle */}
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: '#a3e635', marginBottom: 6, letterSpacing: 0.5
        }}>목표를 선택하세요</div>

        {/* Uzbek main title */}
        <div style={{
          fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 8
        }}>Maqsadingizni tanlang!</div>

        <div style={{
          width: 48, height: 3, borderRadius: 2,
          background: '#a3e635', margin: '0 auto 12px'
        }} />

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
          Qaysi yo'nalishda o'qishni xohlaysiz?
        </p>
      </div>

      {/* Track cards */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>

        {/* TOPIK card */}
        <div onClick={() => setSelectedTrack('topik')} style={{
          borderRadius: 20, padding: '18px',
          cursor: 'pointer', transition: 'all 0.25s',
          background: selectedTrack === 'topik' ? 'linear-gradient(135deg, #1e1b4b, #3730a3)' : 'white',
          border: selectedTrack === 'topik' ? '2px solid #a3e635' : '1.5px solid rgba(124,58,237,0.15)',
          boxShadow: selectedTrack === 'topik' ? '0 6px 20px rgba(124,58,237,0.25)' : '0 2px 10px rgba(124,58,237,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: selectedTrack === 'topik' ? 'rgba(255,255,255,0.1)' : '#f5f3ff',
              border: selectedTrack === 'topik' ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(124,58,237,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
            }}>🎓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2,
                color: selectedTrack === 'topik' ? '#a3e635' : '#a78bfa' }}>TOPIK 시험 준비</div>
              <div style={{ fontSize: 15, fontWeight: 900,
                color: selectedTrack === 'topik' ? 'white' : '#1e1b4b' }}>TOPIK yo'nalishi</div>
              <div style={{ fontSize: 12, marginTop: 2,
                color: selectedTrack === 'topik' ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>
                6 daraja · 60 dars · Koreya universiteti
              </div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${selectedTrack === 'topik' ? '#a3e635' : 'rgba(124,58,237,0.2)'}`,
              background: selectedTrack === 'topik' ? '#a3e635' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {selectedTrack === 'topik' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a2e05' }} />}
            </div>
          </div>
          {selectedTrack === 'topik' && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {['📗 1-daraja', '📘 2-daraja', '📙 3-daraja', '📕 4-6 daraja'].map((t, i) => (
                <div key={i} style={{
                  background: 'rgba(163,230,53,0.15)', border: '0.5px solid rgba(163,230,53,0.3)',
                  borderRadius: 8, padding: '3px 9px', fontSize: 11, color: '#a3e635', fontWeight: 700
                }}>{t}</div>
              ))}
            </div>
          )}
        </div>

        {/* EPS-TOPIK card */}
        <div onClick={() => setSelectedTrack('eps')} style={{
          borderRadius: 20, padding: '18px',
          cursor: 'pointer', transition: 'all 0.25s',
          background: selectedTrack === 'eps' ? 'linear-gradient(135deg, #1e1b4b, #3730a3)' : 'white',
          border: selectedTrack === 'eps' ? '2px solid #a3e635' : '1.5px solid rgba(124,58,237,0.15)',
          boxShadow: selectedTrack === 'eps' ? '0 6px 20px rgba(124,58,237,0.25)' : '0 2px 10px rgba(124,58,237,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: selectedTrack === 'eps' ? 'rgba(255,255,255,0.1)' : '#f5f3ff',
              border: selectedTrack === 'eps' ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(124,58,237,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
            }}>🏭</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2,
                color: selectedTrack === 'eps' ? '#a3e635' : '#a78bfa' }}>EPS-TOPIK 취업 준비</div>
              <div style={{ fontSize: 15, fontWeight: 900,
                color: selectedTrack === 'eps' ? 'white' : '#1e1b4b' }}>EPS-TOPIK yo'nalishi</div>
              <div style={{ fontSize: 12, marginTop: 2,
                color: selectedTrack === 'eps' ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>
                10 dars · Koreya ish uchun · Amaliy til
              </div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${selectedTrack === 'eps' ? '#a3e635' : 'rgba(124,58,237,0.2)'}`,
              background: selectedTrack === 'eps' ? '#a3e635' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {selectedTrack === 'eps' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a2e05' }} />}
            </div>
          </div>
          {selectedTrack === 'eps' && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {['🏭 Zavod', '💼 Ish joyi', '🔧 Asboblar', '👷 Xavfsizlik'].map((t, i) => (
                <div key={i} style={{
                  background: 'rgba(163,230,53,0.15)', border: '0.5px solid rgba(163,230,53,0.3)',
                  borderRadius: 8, padding: '3px 9px', fontSize: 11, color: '#a3e635', fontWeight: 700
                }}>{t}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hint */}
      <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginBottom: 18, lineHeight: 1.7 }}>
        나중에 두 가지를 모두 공부할 수 있습니다<br/>
        <span style={{ color: '#c4b5fd', fontWeight: 600 }}>Keyinchalik ikki yo'nalishni ham o'qishingiz mumkin</span>
      </div>

      {/* CTA Button */}
      <button onClick={handleStart} disabled={!selectedTrack} style={{
        width: '100%', maxWidth: 380, padding: '15px',
        background: selectedTrack ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#e5e7eb',
        border: 'none', borderRadius: 16,
        color: selectedTrack ? 'white' : '#9ca3af',
        fontSize: 16, fontWeight: 900,
        cursor: selectedTrack ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s'
      }}>
        {selectedTrack ? '시작! Boshlash →' : "Yo'nalishni tanlang"}
      </button>
    </div>
  )
}
