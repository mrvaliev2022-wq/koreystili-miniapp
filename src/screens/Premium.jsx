import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getTgUser } from '../store'
import { createInvoice } from '../api'

const CARD_NUMBER = '5614 6812 6402 9681' // O'zgartiring
const CARD_NAME = 'V****** O****'         // O'zgartiring
const PRICE = '29 000 so\'m'

export default function Premium() {
  const navigate = useNavigate()
  const { isPremium } = useStore()
  const tgUser = getTgUser()
  const [method, setMethod] = useState(null) // 'card' | 'stars' | 'referral'
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState('')

  const botUsername = 'topik_epstopik_bot'
  const userId = tgUser?.id || '0'
  const refLink = `https://t.me/${botUsername}?start=ref_${userId}`

  const copyCard = () => {
    navigator.clipboard?.writeText(CARD_NUMBER.replace(/\s/g, ''))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
      .catch(() => {})
  }

  const handleStars = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await createInvoice('monthly')
      if (res?.invoice_url) {
        window.Telegram?.WebApp?.openInvoice(res.invoice_url, (status) => {
          if (status === 'paid') navigate('/')
        })
      } else {
        alert('Xatolik yuz berdi. Qayta urining.')
      }
    } catch {
      alert('Xatolik yuz berdi.')
    }
    setLoading(false)
  }

  const sendScreenshot = () => {
    window.Telegram?.WebApp?.close()
    setTimeout(() => {
      window.open(`https://t.me/${botUsername}`, '_blank')
    }, 300)
  }

  if (isPremium) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', flexDirection: 'column', gap: 14,
      background: '#f5f3ff', padding: 24
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
        borderBottom: '0.5px solid rgba(124,58,237,0.1)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <button onClick={() => method ? setMethod(null) : navigate(-1)} style={{
          width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
          border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16
        }}>←</button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>
          {method === 'card' ? '💳 Karta orqali to\'lash' :
           method === 'stars' ? '⭐ Telegram Stars' :
           method === 'referral' ? '👥 Do\'stlarni taklif qilish' :
           '👑 Premium'}
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* Asosiy ekran */}
        {!method && (
          <>
            {/* Hero */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
              borderRadius: 24, padding: '28px 24px', textAlign: 'center', marginBottom: 20
            }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>👑</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 8 }}>Premium</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#a3e635' }}>{PRICE}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>oyiga</div>
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                '✅ Barcha TOPIK darslari (60 ta)',
                '✅ Barcha EPS-TOPIK darslari (67 ta)',
                '✅ Kuniga 6 ta dars',
                '✅ ❄️ Streak Freeze — 10 kun',
                '✅ Barcha test va quizlar',
              ].map((f, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: 12, padding: '11px 14px',
                  fontSize: 13, fontWeight: 600, color: '#1e1b4b',
                  border: '0.5px solid rgba(124,58,237,0.12)'
                }}>{f}</div>
              ))}
            </div>

            {/* To'lov usullari */}
            <div style={{ fontSize: 12, fontWeight: 800, color: '#9ca3af', letterSpacing: 1, marginBottom: 10 }}>
              TO'LOV USULINI TANLANG
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* 1. Karta */}
              <div onClick={() => setMethod('card')} style={{
                background: 'white', borderRadius: 18, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                border: '1.5px solid rgba(124,58,237,0.2)',
                boxShadow: '0 2px 12px rgba(124,58,237,0.08)'
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>💳</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1e1b4b' }}>Karta orqali</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    Uzcard / Humo — {PRICE}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#7c3aed', fontWeight: 700 }}>→</div>
              </div>

              {/* 2. Telegram Stars */}
              <div onClick={() => setMethod('stars')} style={{
                background: 'white', borderRadius: 18, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                border: '1.5px solid rgba(124,58,237,0.2)',
                boxShadow: '0 2px 12px rgba(124,58,237,0.08)'
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>⭐</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1e1b4b' }}>Telegram Stars</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>150 Stars</div>
                </div>
                <div style={{ fontSize: 14, color: '#7c3aed', fontWeight: 700 }}>→</div>
              </div>

              {/* 3. Referral */}
              <div onClick={() => setMethod('referral')} style={{
                background: 'white', borderRadius: 18, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                border: '1.5px solid rgba(163,230,53,0.4)',
                boxShadow: '0 2px 12px rgba(163,230,53,0.1)'
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>👥</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1e1b4b' }}>Do'stlarni taklif qil</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    3 do'st Premium olsa — siz ham bepul!
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#7c3aed', fontWeight: 700 }}>→</div>
              </div>

            </div>
          </>
        )}

        {/* KARTA TO'LOV */}
        {method === 'card' && (
          <div>
            <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 20, textAlign: 'center' }}>
              Quyidagi karta raqamiga <strong>{PRICE}</strong> o'tkazing, keyin chekni botga yuboring
            </div>

            {/* Karta */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
              borderRadius: 20, padding: '24px', marginBottom: 16
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>KARTA RAQAMI</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: 2, marginBottom: 16 }}>
                {CARD_NUMBER}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{CARD_NAME}</div>
                <div style={{ fontSize: 20 }}>💳</div>
              </div>
            </div>

            {/* Copy button */}
            <button onClick={copyCard} style={{
              width: '100%', padding: '14px', borderRadius: 14, marginBottom: 12,
              background: copied ? '#a3e635' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: 'none', color: copied ? '#1a2e05' : 'white',
              fontSize: 15, fontWeight: 800, cursor: 'pointer'
            }}>
              {copied ? '✅ Nusxalandi!' : '📋 Karta raqamini nusxalash'}
            </button>

            {/* Steps */}
            <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 16, border: '0.5px solid rgba(124,58,237,0.12)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', marginBottom: 12 }}>📋 Qadamlar:</div>
              {[
                `1. Karta raqamini nusxalang`,
                `2. Bank ilovasida ${PRICE} o'tkazing`,
                `3. To'lov chekini saqlang (screenshot)`,
                `4. Botga chekni yuboring`,
                `5. Admin 07:00-22:00 orasida tasdiqlaydi`,
              ].map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 6, lineHeight: 1.6 }}>{s}</div>
              ))}
            </div>

            {/* Send screenshot button */}
            <button onClick={sendScreenshot} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: 'linear-gradient(135deg, #a3e635, #84cc16)',
              border: 'none', color: '#1a2e05', fontSize: 15, fontWeight: 800, cursor: 'pointer'
            }}>
              📸 Chekni botga yuborish
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
              To'lov tasdiqlanishi 07:00-22:00 orasida amalga oshiriladi
            </div>
          </div>
        )}

        {/* TELEGRAM STARS */}
        {method === 'stars' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: 24, padding: '28px', textAlign: 'center', marginBottom: 20
            }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>⭐</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 4 }}>Telegram Stars</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'white' }}>150 ⭐</div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 20, border: '0.5px solid rgba(124,58,237,0.12)' }}>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
                ✅ Darhol avtomatik aktivatsiya<br/>
                ✅ Xavfsiz to'lov<br/>
                ✅ Barcha darslar ochildi
              </div>
            </div>

            <button onClick={handleStars} disabled={loading} style={{
              width: '100%', padding: '16px', borderRadius: 14,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none', color: 'white', fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? '⏳ Yuklanmoqda...' : '⭐ 150 Stars bilan to\'lash'}
            </button>
          </div>
        )}

        {/* REFERRAL */}
        {method === 'referral' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
              borderRadius: 24, padding: '28px 24px', textAlign: 'center', marginBottom: 20
            }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 8 }}>
                3 do'st = 1 oy Premium
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Do'stlaringiz sizning havolangiz orqali Premium sotib olsa — siz ham 1 oy bepul Premium olasiz!
              </div>
            </div>

            {/* Qadamlar */}
            <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 16, border: '0.5px solid rgba(124,58,237,0.12)' }}>
              {[
                { num: '1', text: 'Havolani nusxalab do\'stlarga yuboring' },
                { num: '2', text: 'Do\'stlar Premium sotib oladi' },
                { num: '3', text: '3 ta do\'st sotib olgandan keyin Premium ochiladi' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 900, color: 'white'
                  }}>{s.num}</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, paddingTop: 4 }}>{s.text}</div>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <div style={{
              background: '#f5f3ff', borderRadius: 14, padding: '14px',
              marginBottom: 12, border: '1px solid rgba(124,58,237,0.2)',
              wordBreak: 'break-all', fontSize: 12, color: '#7c3aed', fontWeight: 600
            }}>
              {refLink}
            </div>

            <button onClick={() => {
              navigator.clipboard?.writeText(refLink)
                .then(() => alert('✅ Havola nusxalandi!'))
                .catch(() => alert(refLink))
            }} style={{
              width: '100%', padding: '14px', borderRadius: 14, marginBottom: 10,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: 'none', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer'
            }}>
              📋 Havolani nusxalash
            </button>

            <button onClick={() => {
              const msg = encodeURIComponent(`Koreys tilini o'rganmoqchimisiz? 🇰🇷\n\nMen bu ilova orqali o'rganmoqdaman:\n${refLink}\n\nBepul boshlash mumkin!`)
              window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${msg}`)
            }} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: 'linear-gradient(135deg, #a3e635, #84cc16)',
              border: 'none', color: '#1a2e05', fontSize: 15, fontWeight: 800, cursor: 'pointer'
            }}>
              📤 Telegram orqali ulashish
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
