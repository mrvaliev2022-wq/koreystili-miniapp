/**
 * 🔥 STREAK WIDGET — Home.jsx ga qo'shiladi
 * import { StreakWidget } from './StreakWidget'
 * <StreakWidget userId={userId} isPremium={isPremium} />
 */
import { useState, useEffect } from 'react'
import { Flame, Snowflake, Trophy, Zap } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'
const MAX_FREEZE = 10

export function StreakWidget({ userId, isPremium, onStreakUpdate }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [freezeLoading, setFreezeLoading] = useState(false)
  const [showFreeze, setShowFreeze] = useState(false)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetch(`${BASE}/streak/info?user_id=${userId}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setInfo(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  const handleFreeze = async () => {
    if (!userId || freezeLoading) return
    setFreezeLoading(true)
    try {
      const res = await fetch(`${BASE}/streak/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      const data = await res.json()
      if (data.ok) {
        setInfo(prev => ({
          ...prev,
          freeze_used: data.freeze_used,
          freeze_remaining: data.freeze_remaining
        }))
        setShowFreeze(false)
        alert(data.message)
      } else {
        alert(data.error)
      }
    } catch {}
    setFreezeLoading(false)
  }

  if (loading || !info) return null

  const streak = info.streak || 0
  const longestStreak = info.longest_streak || 0
  const studiedToday = info.studied_today
  const freezeRemaining = info.freeze_remaining || 0
  const nextBonusIn = info.next_bonus_in || 5

  // Streak rangi
  const streakColor = streak >= 30 ? '#FFD700' : streak >= 7 ? '#f97316' : '#a3e635'

  return (
    <div style={{ marginBottom: 14 }}>

      {/* Asosiy streak karta */}
      <div style={{
        background: streak > 0
          ? 'linear-gradient(135deg, #1e1b4b, #3730a3)'
          : 'white',
        borderRadius: 20,
        padding: '16px 18px',
        border: streak > 0 ? 'none' : '1px solid rgba(124,58,237,0.12)',
        boxShadow: streak > 0 ? '0 4px 20px rgba(30,27,75,0.3)' : 'none'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          {/* Streak raqami */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 16,
              background: streak > 0 ? `${streakColor}22` : '#f5f3ff',
              border: `2px solid ${streak > 0 ? streakColor : 'rgba(124,58,237,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24
            }}>
              {streak > 0 ? '🔥' : '💤'}
            </div>
            <div>
              <div style={{
                fontSize: 28, fontWeight: 900,
                color: streak > 0 ? streakColor : '#1e1b4b',
                lineHeight: 1
              }}>
                {streak}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: streak > 0 ? 'rgba(255,255,255,0.5)' : '#9ca3af',
                marginTop: 2
              }}>
                {streak === 0 ? 'Streak yo\'q' : streak === 1 ? '1 kunlik streak' : `${streak} kunlik streak`}
              </div>
            </div>
          </div>

          {/* Rekord va bugun belgisi */}
          <div style={{ textAlign: 'right' }}>
            {studiedToday && (
              <div style={{
                background: '#a3e63522', border: '1px solid #a3e63544',
                borderRadius: 10, padding: '4px 10px',
                fontSize: 11, fontWeight: 700, color: '#a3e635',
                marginBottom: 4
              }}>
                ✅ Bugun o'qildi
              </div>
            )}
            {longestStreak > 0 && (
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: streak > 0 ? 'rgba(255,255,255,0.4)' : '#9ca3af'
              }}>
                🏆 Rekord: {longestStreak} kun
              </div>
            )}
          </div>
        </div>

        {/* Keyingi bonus progressi */}
        {streak > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                <Zap size={10} style={{ marginRight: 3 }} />
                Keyingi bonus uchun
              </div>
              <div style={{ fontSize: 11, color: '#a3e635', fontWeight: 700 }}>
                {nextBonusIn} kun → +50 XP
              </div>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: `linear-gradient(90deg, ${streakColor}, #a3e635)`,
                width: `${((5 - nextBonusIn) / 5) * 100}%`,
                borderRadius: 3, transition: 'width 0.5s'
              }} />
            </div>
          </div>
        )}

        {/* Freeze tugmasi — faqat Premium */}
        {isPremium && streak > 0 && (
          <div>
            {!showFreeze ? (
              <button
                onClick={() => setShowFreeze(true)}
                style={{
                  width: '100%', padding: '9px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                <Snowflake size={13} />
                ❄️ Freeze ishlatish ({freezeRemaining}/{MAX_FREEZE} qoldi)
              </button>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '12px',
                border: '1px solid rgba(99,179,237,0.3)'
              }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8, textAlign: 'center' }}>
                  ❄️ Freeze ishlatilsa, bugun o'qimagan bo'lsangiz ham streak saqlanadi
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowFreeze(false)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.6)', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer'
                    }}>
                    Bekor
                  </button>
                  <button
                    onClick={handleFreeze}
                    disabled={freezeLoading || freezeRemaining <= 0}
                    style={{
                      flex: 2, padding: '8px', borderRadius: 10,
                      background: freezeRemaining > 0 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#374151',
                      border: 'none',
                      color: 'white', fontSize: 12,
                      fontWeight: 700, cursor: freezeRemaining > 0 ? 'pointer' : 'not-allowed',
                      opacity: freezeLoading ? 0.7 : 1
                    }}>
                    {freezeLoading ? '...' : `❄️ Ha, Freeze qo'llayman`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Premium emas — freeze reklama */}
        {!isPremium && streak >= 3 && (
          <div style={{
            background: 'rgba(163,230,53,0.1)',
            border: '1px solid rgba(163,230,53,0.2)',
            borderRadius: 12, padding: '9px 12px',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 16 }}>❄️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#a3e635', fontWeight: 700 }}>Premium: 10 kun Freeze</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Streakingizni himoya qiling!</div>
            </div>
            <div style={{ fontSize: 10, color: '#a3e635', fontWeight: 700 }}>👑</div>
          </div>
        )}
      </div>

      {/* Streak yo'q bo'lsa motivatsiya */}
      {streak === 0 && (
        <div style={{
          marginTop: 8, background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 22 }}>🚀</span>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Streakni boshlang!</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1 }}>
              Bugun dars o'qing → 5 kunda +50 XP bonus!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
