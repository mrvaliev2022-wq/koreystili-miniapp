import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getTgUser } from '../store'
import { getLeaderboard, syncXp } from '../api'

export default function Leaderboard() {
  const navigate = useNavigate()
  const { xp, streak } = useStore()
  const [list, setList] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const tgUser = getTgUser()

  useEffect(() => {
    const load = async () => {
      await syncXp(xp, streak).catch(() => {})
      const res = await getLeaderboard()
      if (res.ok) {
        setList(res.data || [])
        setMyRank(res.myRank || null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const myId = tgUser?.id || '0'
  const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '0.5px solid rgba(124,58,237,0.1)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <button onClick={() => navigate('/')} style={{
          width: 32, height: 32, borderRadius: 10, background: '#f5f3ff',
          border: '0.5px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16
        }}>←</button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>🏆 Reyting</div>
        <button onClick={() => { setLoading(true); getLeaderboard().then(r => { if(r.ok){setList(r.data||[]);setMyRank(r.myRank||null)} setLoading(false) }) }} style={{
          background: 'none', border: 'none', fontSize: 18, cursor: 'pointer'
        }}>🔄</button>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* My rank card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          borderRadius: 20, padding: '16px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: 'rgba(163,230,53,0.2)', border: '2px solid #a3e635',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0
          }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>
              {tgUser?.name || "Siz"}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
              {myRank ? `#${myRank.rank} o'rin` : 'Hali reytingda yo\'q'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#a3e635', fontWeight: 900, fontSize: 20 }}>{xp}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>XP</div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && list.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            {[list[1], list[0], list[2]].map((user, i) => {
              const rank = [2, 1, 3][i]
              const heights = { 1: 100, 2: 80, 3: 65 }
              const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }
              const sizes = { 1: 52, 2: 44, 3: 40 }
              const isMe = user?.user_id === myId
              return (
                <div key={rank} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  {rank === 1 && <div style={{ fontSize: 20 }}>👑</div>}
                  <div style={{
                    width: sizes[rank], height: sizes[rank], borderRadius: '50%',
                    background: '#f5f3ff', border: `3px solid ${colors[rank]}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: rank === 1 ? 22 : 18, overflow: 'hidden',
                    boxShadow: isMe ? `0 0 0 3px #7c3aed` : 'none'
                  }}>
                    {user?.avatar_url
                      ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : '👤'}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1e1b4b', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.first_name || '—'}{isMe ? ' (Siz)' : ''}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: colors[rank] }}>
                    {user ? Number(user.xp).toLocaleString() : '—'} XP
                  </div>
                  <div style={{
                    width: '100%', height: heights[rank],
                    background: `${colors[rank]}22`,
                    border: `1.5px solid ${colors[rank]}44`,
                    borderRadius: '10px 10px 0 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: rank === 1 ? 22 : 18, fontWeight: 900, color: colors[rank]
                  }}>{MEDAL[rank]}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div>Yuklanmoqda...</div>
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <div style={{ fontWeight: 700, color: '#6b7280' }}>Reyting bo'sh</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Dars o'qing va reytingda chiqing!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.slice(3).map((user, i) => {
              const rank = i + 4
              const isMe = user.user_id === myId
              return (
                <div key={user.user_id} style={{
                  background: isMe ? 'linear-gradient(135deg, #ede9fe, #f5f3ff)' : 'white',
                  border: `1px solid ${isMe ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.08)'}`,
                  borderRadius: 16, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <div style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 13, color: '#9ca3af' }}>
                    #{rank}
                  </div>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: '#f5f3ff', border: '1.5px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, overflow: 'hidden', flexShrink: 0
                  }}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>
                      {user.first_name || 'Foydalanuvchi'}
                      {isMe && <span style={{ fontSize: 10, background: '#7c3aed', color: 'white', padding: '1px 6px', borderRadius: 6, marginLeft: 6 }}>Siz</span>}
                    </div>
                    {user.streak > 0 && (
                      <div style={{ fontSize: 11, color: '#f97316', marginTop: 2 }}>
                        🔥 {user.streak} kunlik streak
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: 15, color: isMe ? '#7c3aed' : '#1e1b4b' }}>
                      {Number(user.xp).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>XP</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
