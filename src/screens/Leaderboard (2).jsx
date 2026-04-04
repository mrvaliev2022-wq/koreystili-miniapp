import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

function getTgUserId() {
  try {
    const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    return id ? String(id) : null
  } catch { return null }
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const { xp } = useStore()
  const [leaders, setLeaders] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = getTgUserId()
    const url = uid
      ? `${BASE}/leaderboard?user_id=${uid}`
      : `${BASE}/leaderboard`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data?.leaders) ? data.leaders
          : Array.isArray(data) ? data : []
        setLeaders(list.slice(0, 20))
        if (data?.myRank) setMyRank(data.myRank)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{
      minHeight: '100dvh', background: '#f5f3ff',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: 80
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
        padding: '20px 20px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'white', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>←</button>
          <div>
            <div style={{ color: '#a3e635', fontSize: 11, fontWeight: 700 }}>리더보드</div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 900 }}>Reyting</div>
          </div>
        </div>

        {myRank && (
          <div style={{
            background: 'rgba(163,230,53,0.15)', border: '1px solid rgba(163,230,53,0.3)',
            borderRadius: 12, padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ color: '#a3e635', fontSize: 13, fontWeight: 700 }}>
              Sizning o'rningiz
            </span>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 900 }}>
              #{myRank}
            </span>
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#7c3aed' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 14 }}>Yuklanmoqda...</div>
          </div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <div style={{ color: '#6b7280', fontSize: 15 }}>Hali ma'lumot yo'q</div>
            <div style={{ color: '#a78bfa', fontSize: 12, marginTop: 6 }}>
              Darslarni o'qib XP yig'ing!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaders.map((item, i) => (
              <div key={i} style={{
                background: i < 3 ? 'linear-gradient(135deg, #1e1b4b, #3730a3)' : 'white',
                borderRadius: 14, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                border: i < 3 ? '1px solid rgba(163,230,53,0.2)' : '0.5px solid rgba(124,58,237,0.12)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i < 3 ? 'rgba(163,230,53,0.2)' : '#f5f3ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < 3 ? 18 : 13, fontWeight: 700,
                  color: i < 3 ? '#a3e635' : '#7c3aed'
                }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: i < 3 ? 'white' : '#1e1b4b'
                  }}>
                    {item.first_name || item.name || 'Foydalanuvchi'}
                  </div>
                  <div style={{
                    fontSize: 11, marginTop: 1,
                    color: i < 3 ? 'rgba(255,255,255,0.5)' : '#9ca3af'
                  }}>
                    {item.lessons_done || 0} dars tugallandi
                  </div>
                </div>
                <div style={{
                  fontWeight: 900, fontSize: 15,
                  color: i < 3 ? '#a3e635' : '#7c3aed'
                }}>
                  {item.xp || item.total_xp || 0} XP
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My XP */}
        <div style={{
          marginTop: 16, background: 'white', borderRadius: 14,
          padding: '14px 16px', border: '1.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700 }}>Mening XP im</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#7c3aed' }}>{xp} XP</div>
          </div>
          <div style={{ fontSize: 32 }}>⭐</div>
        </div>
      </div>
    </div>
  )
}
