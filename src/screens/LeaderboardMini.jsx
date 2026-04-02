/**
 * 🏆 LeaderboardMini — Home.jsx ga qo'shiladi
 * 
 * 1. Bu faylni Home.jsx ga import qiling YOKI
 *    Home.jsx ichida pastga qo'shing
 * 
 * 2. Home.jsx ichida quyidagicha ishlating:
 *    <LeaderboardMini xp={xp} userId={userId} />
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Flame } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'
const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function LeaderboardMini({ xp, userId }) {
  const navigate = useNavigate()
  const [top3, setTop3] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE}/leaderboard/global?user_id=${userId || ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setTop3(data.data.slice(0, 3))
          setMyRank(data.myRank)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={16} color="#7c3aed" />
          <span style={{ fontWeight: 800, fontSize: 14, color: '#1e1b4b' }}>Top Reyting</span>
        </div>
        <button onClick={() => navigate('/leaderboard')} style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
          Hammasi →
        </button>
      </div>

      {/* Mini karta */}
      <div style={{ background: 'white', borderRadius: 18, border: '0.5px solid rgba(124,58,237,0.12)', overflow: 'hidden' }}>

        {/* Mening reytingim */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20 }}>🏅</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Mening o'rnim</div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 15 }}>
              {myRank ? `#${myRank.rank} o'rin` : 'Hali yo\'q'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#a3e635', fontWeight: 900, fontSize: 18 }}>{(xp || 0).toLocaleString()}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>XP</div>
          </div>
        </div>

        {/* Top 3 */}
        {loading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Yuklanmoqda...</div>
        ) : top3.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Hali reyting yo'q</div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {top3.map((user, i) => {
              const rank = i + 1
              const isMe = user.user_id === userId
              return (
                <div key={user.user_id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px',
                  background: isMe ? 'rgba(124,58,237,0.05)' : 'transparent',
                  borderLeft: isMe ? '3px solid #7c3aed' : '3px solid transparent'
                }}>
                  <div style={{ width: 24, textAlign: 'center', fontSize: 16, flexShrink: 0 }}>
                    {MEDAL[rank]}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f3ff', border: '1.5px solid #ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, overflow: 'hidden', flexShrink: 0 }}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : '👤'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.first_name || 'Foydalanuvchi'}{isMe ? ' (Siz)' : ''}
                    </div>
                    {user.streak > 0 && (
                      <div style={{ fontSize: 11, color: '#f97316', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Flame size={9} />{user.streak} kun
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: rank === 1 ? '#f59e0b' : '#6b7280' }}>
                    {Number(user.xp).toLocaleString()} XP
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Ko'proq ko'rish */}
        <div onClick={() => navigate('/leaderboard')} style={{ padding: '10px 14px', textAlign: 'center', borderTop: '0.5px solid rgba(124,58,237,0.08)', cursor: 'pointer', color: '#7c3aed', fontWeight: 700, fontSize: 13 }}>
          To'liq reytingni ko'rish 🏆
        </div>
      </div>
    </div>
  )
}
