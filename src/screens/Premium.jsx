import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Clock, ChevronLeft } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'
const BOT_USERNAME = 'topik_epstopik_bot'

function getTgUserId() {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null } catch { return null }
}

async function apiFetch(path, opts = {}) {
  const userId = getTgUserId()
  const sep = path.includes('?') ? '&' : '?'
  const url = `${BASE}${path}${(!opts.method || opts.method === 'GET') ? `${sep}user_id=${userId}` : ''}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify({ ...opts.body, user_id: userId }) : undefined
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export default function Premium() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('uzcard')
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/payment/info').then(data => {
      setInfo(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const copyCard = () => {
    const cardNum = info?.card_number?.replace(/\s/g, '') || ''
    navigator.clipboard.writeText(cardNum).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Bot ga o'tish — user o'zi screenshot yuboradi
  const goToBot = () => {
    const userId = getTgUserId()
    // Mini App ni yopib, bot ga deep link bilan o'tish
    window.Telegram?.WebApp?.openTelegramLink(
      `https://t.me/${BOT_USERNAME}?start=pay_${userId}`
    )
  }

  const payWithStars = async () => {
    try {
      setSending(true)
      setError('')
      const data = await apiFetch('/payment/create-invoice', {
        method: 'POST',
        body: { plan: '1month' }
      })
      if (data.invoiceLink) {
        window.Telegram?.WebApp?.openInvoice(data.invoiceLink, (status) => {
          if (status === 'paid') navigate('/')
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const checkReferral = async () => {
    try {
      setSending(true)
      setError('')
      const data = await apiFetch('/payment/referral-check', { method: 'POST', body: {} })
      if (data.premium_granted) {
        alert('🎉 ' + data.message)
        navigate('/')
      } else {
        setError(`Hali ${data.needed} ta do'st kerak!`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>👑</div>
      <div style={{ color: 'var(--text2)' }}>Yuklanmoqda...</div>
    </div>
  )

  // Allaqachon premium
  if (info?.is_premium) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">💎 Premium</div>
        <div />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>👑</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: 'var(--accent2)' }}>Siz Premium!</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 16 }}>Barcha darslar ochiq</p>
        <div style={{ background: 'var(--bg3)', borderRadius: 14, padding: '12px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Bugun: <strong style={{ color: 'var(--accent2)' }}>{info?.lessons_today}/{info?.daily_limit}</strong> ta dars
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>← Darslarni davom ettirish</button>
      </div>
    </div>
  )

  // Pending to'lov
  if (info?.pending_payment) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">⏳ Kutilmoqda</div>
        <div />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>To'lovingiz tekshirilmoqda</h2>
        <div style={{ background: '#fff3cd', borderRadius: 16, padding: '16px 20px', marginBottom: 20, maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={18} color="#856404" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#856404' }}>Ish vaqti</span>
          </div>
          <p style={{ fontSize: 13, color: '#856404', lineHeight: 1.6, margin: 0 }}>
            Admin <strong>07:00 – 22:00</strong> (Toshkent vaqti) orasida tasdiqlaydi.
          </p>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Tasdiqlangandan keyin bot orqali xabar olasiz! 🎉
        </p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Orqaga</button>
      </div>
    </div>
  )

  const tabBtn = (key, icon, label) => (
    <button onClick={() => { setTab(key); setError('') }}
      style={{
        flex: 1, padding: '10px 4px',
        fontSize: 12, fontWeight: tab === key ? 800 : 500,
        color: tab === key ? 'white' : 'var(--text3)',
        background: tab === key
          ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
          : 'var(--bg3)',
        border: 'none', borderRadius: 12, cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
      }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} color="var(--text)" />
        </button>
        <div className="header-title">👑 Premium olish</div>
        <div />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 40px' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2), #c084fc)', borderRadius: 20, padding: '20px', marginBottom: 18, textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 6 }}>👑</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Koreystili Premium</h2>
          <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5, marginBottom: 12 }}>
            Barcha darslarni oching, koreys tilini tez o'rganing!
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 16px', display: 'inline-block' }}>
            <span style={{ fontSize: 26, fontWeight: 900 }}>{info?.price_som?.toLocaleString() || '29 000'}</span>
            <span style={{ fontSize: 14, marginLeft: 4 }}>so'm</span>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>bir martalik • cheksiz foydalanish</div>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {[
            { icon: '📚', text: 'Barcha darslar' },
            { icon: '⏰', text: 'Kuniga 6 ta dars' },
            { icon: '🔊', text: 'Audio talaffuz' },
            { icon: '♾️', text: 'Cheksiz kirish' },
          ].map((b, i) => (
            <div key={i} style={{ background: 'var(--card)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: 20 }}>{b.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {tabBtn('uzcard', '💳', 'Uzcard')}
          {tabBtn('stars', '⭐', 'Stars')}
          {tabBtn('referral', '👥', 'Referral')}
        </div>

        {error && (
          <div style={{ background: '#f8d7da', borderRadius: 12, padding: '12px 16px', marginBottom: 14, color: '#721c24', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── UZCARD TAB ── */}
        {tab === 'uzcard' && (
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
              💳 Uzcard orqali to'lash
            </div>

            {/* Karta */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', borderRadius: 16, padding: '18px', marginBottom: 16, position: 'relative' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: 2 }}>UZCARD</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: 3, marginBottom: 10, fontFamily: 'monospace' }}>
                {info?.card_number || '8600 XXXX XXXX XXXX'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{info?.card_name || 'Koreystili'}</div>
              <button onClick={copyCard} style={{
                position: 'absolute', top: 14, right: 14,
                background: copied ? '#28a745' : 'rgba(255,255,255,0.15)',
                border: 'none', borderRadius: 8, padding: '6px 10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                color: 'white', fontSize: 12, transition: 'all 0.2s'
              }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Nusxalandi!' : 'Nusxalash'}
              </button>
            </div>

            {/* Qadamlar */}
            <div style={{ marginBottom: 16 }}>
              {[
                { n: '1', emoji: '💸', text: `${info?.price_som?.toLocaleString() || '29 000'} so'm yuqoridagi kartaga o'tkazing` },
                { n: '2', emoji: '📸', text: 'To\'lov screenshotini oling' },
                { n: '3', emoji: '🤖', text: 'Quyidagi tugmani bosing — bot ochiladi' },
                { n: '4', emoji: '📤', text: 'Botga screenshotni yuboring' },
                { n: '5', emoji: '✅', text: 'Admin 07:00-22:00 (Toshkent) tasdiqlaydi' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {s.n}
                  </div>
                  <div style={{ display: 'flex', gap: 6, paddingTop: 3 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{s.emoji}</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{s.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Vaqt eslatmasi */}
            <div style={{ background: '#fff3cd', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8 }}>
              <Clock size={16} color="#856404" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: '#856404', lineHeight: 1.5, margin: 0 }}>
                Ish vaqti: <strong>07:00 – 22:00</strong> (GMT+5 Toshkent).<br />
                Tasdiqlanguncha iltimos kuting! ⏳
              </p>
            </div>

            {/* Bot ga o'tish tugmasi */}
            <button
              onClick={goToBot}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              🤖 Botga o'tish — Screenshot yuborish
            </button>

            <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              Bot ochiladi → Screenshotni yuboring → Avtomatik qabul qilinadi
            </p>
          </div>
        )}

        {/* ── STARS TAB ── */}
        {tab === 'stars' && (
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
              ⭐ Telegram Stars orqali to'lash
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ffd700, #ffa500)', borderRadius: 16, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>⭐</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'white' }}>{info?.price_stars || 150} Stars</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                ≈ {info?.price_som?.toLocaleString() || '29 000'} so'm
              </div>
            </div>
            {[
              { icon: '⚡', text: 'Avtomatik — admin kutilmaydi!' },
              { icon: '🔒', text: 'Telegram tomonidan himoyalangan' },
              { icon: '💎', text: 'To\'lov darhol aktivlanadi' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{item.text}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14, lineHeight: 1.5 }}>
              💡 Stars yo'q bo'lsa: Telegram → Settings → Telegram Stars → Sotib olish
            </p>
            <button onClick={payWithStars} disabled={sending} className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #ffd700, #ffa500)', border: 'none' }}>
              {sending ? '⏳ Ochilmoqda...' : `⭐ ${info?.price_stars || 150} Stars bilan to'lash`}
            </button>
          </div>
        )}

        {/* ── REFERRAL TAB ── */}
        {tab === 'referral' && (
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
              👥 Do'stlarni taklif qilish
            </div>
            <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)', borderRadius: 16, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#2e7d32', marginBottom: 10, fontWeight: 600 }}>
                To'lov qilgan do'stlar
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
                {Array.from({ length: info?.referrals_needed || 3 }).map((_, i) => (
                  <div key={i} style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: i < (info?.paid_referrals || 0) ? '#4caf50' : '#e0e0e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, transition: 'all 0.3s',
                    boxShadow: i < (info?.paid_referrals || 0) ? '0 4px 12px rgba(76,175,80,0.4)' : 'none'
                  }}>
                    {i < (info?.paid_referrals || 0) ? '✅' : '👤'}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#2e7d32' }}>
                {info?.paid_referrals || 0} / {info?.referrals_needed || 3}
              </div>
              <div style={{ fontSize: 13, color: '#388e3c', marginTop: 4 }}>
                {(info?.paid_referrals || 0) >= (info?.referrals_needed || 3)
                  ? '🎉 Bajarildi! Quyidagi tugmani bosing!'
                  : `Yana ${(info?.referrals_needed || 3) - (info?.paid_referrals || 0)} ta do'st kerak`}
              </div>
            </div>
            {[
              { n: '1', text: 'Do\'stingizga havolangizni yuboring' },
              { n: '2', text: 'Do\'stingiz ro\'yxatdan o\'tadi va to\'lov qiladi' },
              { n: '3', text: '3 ta do\'st to\'lov qilsa → 1 oy bepul Premium! 🎁' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {s.n}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, paddingTop: 3 }}>{s.text}</span>
              </div>
            ))}
            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 14px', margin: '14px 0' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Sizning havolangiz:</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent2)', wordBreak: 'break-all' }}>
                https://t.me/{BOT_USERNAME}?start=ref_{getTgUserId()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  const link = `https://t.me/${BOT_USERNAME}?start=ref_${getTgUserId()}`
                  const text = `🌟 Koreys tilini o'rganmoqchimisiz? Koreystili ilovasi juda qulay!\n\n${link}`
                  window.Telegram?.WebApp?.openTelegramLink(
                    `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
                  )
                }}
                className="btn btn-primary"
                style={{ flex: 1, background: 'linear-gradient(135deg, #4caf50, #2e7d32)' }}>
                📤 Ulashish
              </button>
              {(info?.paid_referrals || 0) >= (info?.referrals_needed || 3) && (
                <button onClick={checkReferral} disabled={sending} className="btn btn-primary" style={{ flex: 1 }}>
                  {sending ? '⏳' : '🎁 Premium olish'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
