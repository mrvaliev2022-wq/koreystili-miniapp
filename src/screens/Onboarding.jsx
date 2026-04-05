import { useState } from 'react'
import { useStore } from '../store'

export default function Onboarding() {
  const { completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [selectedTrack, setSelectedTrack] = useState(null)

  if (step === 0) return (
    <div style={{
      minHeight: '100dvh', background: '#f5f3ff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
        borderRadius: 28, padding: '32px 24px',
        width: '100%', maxWidth: 380, textAlign: 'center',
        marginBottom: 24
      }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>👋</div>
        <div style={{ fontSize: 13, color: '#a3e635', fontWeight: 700, marginBottom: 8 }}>
          환영합니다!
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 12 }}>
          Xush kelibsiz!
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          Koreystili — koreys tilini o'rganish ilovasi. Har kuni 10 daqiqa bilan koreys tilini o'rganing!
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {[
          { icon: '🎓', text: 'TOPIK imtihoniga tayyorlanish — 6 daraja' },
          { icon: '🏭', text: 'EPS-TOPIK — Koreyada ishlash uchun' },
          { icon: '🎮', text: "O'yin, test va audio bilan o'rganish" },
          { icon: '🏆', text: 'Reyting va XP ball tizimi' },
        ].map((f, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 14, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            border: '0.5px solid rgba(124,58,237,0.12)'
          }}>
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b' }}>{f.text}</span>
          </div>
        ))}
      </div>

      <button onClick={() => setStep(1)} style={{
        width: '100%', maxWidth: 380, padding: '15px',
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        border: 'none', borderRadius: 16,
        color: 'white', fontSize: 16, fontWeight: 900, cursor: 'pointer'
      }}>
        Boshlash →
      </button>
    </div>
  )

  return (
    <div style={{
      minHeight: '100dvh', background: '#f5f3ff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', marginBottom: 8 }}>
        QAYSIni O'RGANMOQCHISIZ?
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#1e1b4b', marginBottom: 8, textAlign: 'center' }}>
        Yo'nalishni tanlang
      </div>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28, textAlign: 'center' }}>
        Keyinroq o'zgartira olasiz
      </p>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {[
          {
            key: 'topik',
            icon: '🎓',
            title: 'TOPIK',
            sub: 'Koreyada o\'qish uchun imtihon',
            levels: '6 daraja • 60 ta dars'
          },
          {
            key: 'eps',
            icon: '🏭',
            title: 'EPS-TOPIK',
            sub: 'Koreyada ishlash uchun til',
            levels: '67 ta dars'
          },
        ].map(t => (
          <div key={t.key} onClick={() => setSelectedTrack(t.key)} style={{
            background: selectedTrack === t.key
              ? 'linear-gradient(135deg, #1e1b4b, #3730a3)'
              : 'white',
            borderRadius: 20, padding: '18px 20px',
            border: selectedTrack === t.key
              ? 'none'
              : '1.5px solid rgba(124,58,237,0.2)',
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: selectedTrack === t.key ? 'rgba(255,255,255,0.1)' : '#f5f3ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0
            }}>{t.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 18, fontWeight: 900,
                color: selectedTrack === t.key ? 'white' : '#1e1b4b',
                marginBottom: 4
              }}>{t.title}</div>
              <div style={{
                fontSize: 12,
                color: selectedTrack === t.key ? 'rgba(255,255,255,0.6)' : '#9ca3af'
              }}>{t.sub}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, marginTop: 4,
                color: selectedTrack === t.key ? '#a3e635' : '#7c3aed'
              }}>{t.levels}</div>
            </div>
            {selectedTrack === t.key && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#a3e635',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#1a2e05', fontWeight: 900
              }}>✓</div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => { if (selectedTrack) completeOnboarding(selectedTrack) }}
        disabled={!selectedTrack}
        style={{
          width: '100%', maxWidth: 380, padding: '15px',
          background: selectedTrack
            ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
            : '#e5e7eb',
          border: 'none', borderRadius: 16,
          color: selectedTrack ? 'white' : '#9ca3af',
          fontSize: 16, fontWeight: 900,
          cursor: selectedTrack ? 'pointer' : 'not-allowed'
        }}>
        Davom etish →
      </button>
    </div>
  )
}
