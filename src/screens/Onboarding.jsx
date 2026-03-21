import { useState } from 'react'
import { useStore } from '../store'

export default function Onboarding() {
  const completeOnboarding = useStore(s => s.completeOnboarding)
  const [step, setStep] = useState(0)
  const [selectedTrack, setSelectedTrack] = useState(null)

  const steps = [
    {
      emoji: '👋',
      title: "Xush kelibsiz!",
      subtitle: "Koreystili o'rganish ilovasiga xush kelibsiz. Bu yerda siz koreys tilini bosqichma-bosqich o'rganasiz.",
      action: () => setStep(1),
      actionLabel: "Davom etish",
    },
    {
      emoji: '🎯',
      title: "Maqsadingizni tanlang",
      subtitle: "Qaysi yo'nalishda o'qishni xohlaysiz?",
      action: () => selectedTrack && completeOnboarding(selectedTrack),
      actionLabel: "Boshlash",
    },
  ]

  const current = steps[step]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '48px 24px 32px', background: 'var(--bg)' }}>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ height: 4, borderRadius: 100, background: i <= step ? 'var(--accent)' : 'var(--bg3)', flex: i === step ? 2 : 1, transition: 'flex 0.3s, background 0.3s' }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }} className="slide-up">{current.emoji}</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }} className="slide-up">
          {current.title}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }} className="slide-up">
          {current.subtitle}
        </p>

        {/* Track selection (step 1) */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="slide-up">
            {[
              {
                id: 'topik',
                emoji: '🎓',
                title: 'TOPIK yo\'nalishi',
                desc: 'Koreya universitetiga kirish va TOPIK imtihoniga tayyorgarlik. 6 daraja, 60 dars.',
                badge: '6 daraja',
                color: 'var(--accent)',
              },
              {
                id: 'eps',
                emoji: '🏭',
                title: 'EPS-TOPIK yo\'nalishi',
                desc: 'Koreyadagi ish uchun amaliy koreys tili. Ish muhiti uchun zarur so\'zlar.',
                badge: '10 dars',
                color: 'var(--green)',
              },
            ].map(track => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                style={{
                  background: selectedTrack === track.id ? `${track.color}18` : 'var(--bg3)',
                  border: `2px solid ${selectedTrack === track.id ? track.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', padding: 18, textAlign: 'left', cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s', width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{track.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', fontFamily: 'var(--font)' }}>{track.title}</div>
                    <div style={{ fontSize: 12, color: selectedTrack === track.id ? track.color : 'var(--text3)', fontWeight: 700 }}>{track.badge}</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selectedTrack === track.id ? track.color : 'var(--border2)'}`, background: selectedTrack === track.id ? track.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>
                    {selectedTrack === track.id && '✓'}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, fontFamily: 'var(--font)' }}>{track.desc}</p>
              </button>
            ))}

            <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', marginTop: 4 }}>
              Keyinchalik ikki yo'nalishni ham o'qishingiz mumkin
            </p>
          </div>
        )}
      </div>

      {/* Action */}
      <button
        className="btn btn-primary"
        onClick={current.action}
        disabled={step === 1 && !selectedTrack}
        style={{ marginTop: 24 }}
      >
        {current.actionLabel}
      </button>
    </div>
  )
}
