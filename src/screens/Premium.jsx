import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getTgUser } from '../store'
import { createInvoice } from '../api'

export default function Premium() {
  const navigate = useNavigate()
  const { isPremium } = useStore()
  const [loading, setLoading] = useState(false)
  const tgUser = getTgUser()

  const handleBuy = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await createInvoice('monthly')
      if (res?.invoice_url) {
        window.Telegram?.WebApp?.openInvoice(res.invoice_url, (status) => {
          if (status === 'paid') {
            navigate('/')
          }
        })
      } else if (res?.error) {
        alert(res.error)
      }
    } catch (e) {
      alert("Xatolik yuz berdi. Qayta urining.")
    }
    setLoading(false)
  }

  if (isPremium) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', flexDirection: 'column', gap: 14, background: '#f5f3ff', padding: 24
    }}>
      <div style={{ fontSize: 60 }}>👑</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#1e1b4b' }}>Premium faol!</div>
      <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>Barcha darslar ochiq</p>
      <button onClick={() => navigate('/')} style={{
        padding: '14px 32px', borderRadius: 14,
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        border: 'none', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer'
      }}>🏠 Bosh sahifaga</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff' }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)'
      }}>
        <button onClick={() => navigate(-1)} style={{
          width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
          border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16
        }}>←</button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>👑 Premium</div>
      </div>

      <div style={{ padding: '24px 20px' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 28, padding: '32px 24px', textAlign: 'center', marginBottom: 24
        }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>👑</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 8 }}>Premium olish</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Barcha 77+ ta darsga cheksiz kirish
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#a3e635', marginTop: 16 }}>
            29 000 so'm
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>oyiga</div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            { icon: '✅', text: 'Barcha TOPIK darslari (60 ta)' },
            { icon: '✅', text: 'Barcha EPS-TOPIK darslari (67 ta)' },
            { icon: '✅', text: 'Kuniga 6 ta dars o\'qish imkoniyati' },
            { icon: '✅', text: '❄️ Streak Freeze — 10 kun' },
            { icon: '✅', text: 'Barcha test va quizlar' },
          ].map((f, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 14, padding: '13px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              border: '0.5px solid rgba(124,58,237,0.12)'
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Buy button */}
        <button onClick={handleBuy} disabled={loading} style={{
          width: '100%', padding: '16px',
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #a3e635, #84cc16)',
          border: 'none', borderRadius: 16,
          color: '#1a2e05', fontSize: 16, fontWeight: 900,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 12
        }}>
          {loading ? '⏳ Yuklanmoqda...' : '⭐ Telegram Stars bilan to\'lash'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', lineHeight: 1.7 }}>
          To'lov Telegram Stars orqali amalga oshiriladi.{'\n'}
          Muammo bo'lsa: @topik_epstopik_bot ga yozing.
        </div>
      </div>
    </div>
  )
}
