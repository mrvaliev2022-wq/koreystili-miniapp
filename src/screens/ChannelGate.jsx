import { useState } from 'react'
import { useStore } from '../store'

export default function ChannelGate() {
  const setSubscribed = useStore(s => s.setSubscribed)
  const [checking, setChecking] = useState(false)
  const [failed, setFailed] = useState(false)

  const handleJoin = () => {
    window.open('https://t.me/koreystili_topikk', '_blank')
  }

  const handleCheck = async () => {
    setChecking(true)
    setTimeout(() => {
      setSubscribed()
      setChecking(false)
    }, 1000)
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: 'var(--bg)' }}>

      {/* Logo area */}
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-bg)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, fontSize: 36 }} className="pop-in">
        🇰🇷
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
        Koreystili o'rganish
      </h1>
      <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
        Ilovadan foydalanish uchun avval rasmiy kanalimizga obuna bo'ling
      </p>

      {/* Channel card */}
      <div className="card" style={{ width: '100%', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #2AABEE, #229ED9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
          ✈️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Koreystili TOPIK</div>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>@koreystili_topikk</div>
        </div>
        <div className="badge badge-purple">Kanal</div>
      </div>

      {/* Steps */}
      <div style={{ width: '100%', marginBottom: 28 }}>
        {[
          "Quyidagi tugmani bosib kanalga o'ting",
          "\"Obuna bo'lish\" tugmasini bosing",
          "Qaytib kelib tekshiruv tugmasini bosing",
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-bg)', border: '1.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent2)', flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{step}</p>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary" onClick={handleJoin}>
          <span>📢</span> Kanalga o'tish
        </button>
        <button className="btn btn-secondary" onClick={handleCheck} disabled={checking}>
          {checking ? (
            <span>Tekshirilmoqda...</span>
          ) : (
            <span>✅ Obunani tekshirish</span>
          )}
        </button>
      </div>

      {failed && (
        <p style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', marginTop: 14 }}>
          Obuna topilmadi. Iltimos, avval kanalga obuna bo'ling.
        </p>
      )}

      <p style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
        Bu talab kanalimiz orqali yangiliklar va darslardan xabardor bo'lishingiz uchun
      </p>
    </div>
  )
}
