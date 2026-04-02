import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ChevronLeft, Trophy, Users, Flame, Crown } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

function getTgUser() {
  try {
    const tg = window.Telegram?.WebApp
    const u = tg?.initDataUnsafe?.user
    if (u) return {
      user_id: String(u.id),
      username: u.username || '',
      first_name: u.first_name || 'Foydalanuvchi',
      avatar_url: u.photo_url || ''
    }
  } catch {}
  return null
}

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const navigate = useNavigate()
  const { xp, streak, referralCode } = useStore()
  const [tab, setTab] = useState('global')
  const [globalList, setGlobalList] = useState([])
  const [friendsList, setFriendsList] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const tgUser = getTgUser()

  // XP ni backendga sync qilish
  const syncXp = useCallback(async () => {
    if (!tgUser) return
    try {
      await fetch(`${BASE}/leaderboard/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tgUser, xp, streak })
      })
    } catch {}
  }, [tgUser, xp, streak])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      await syncXp()
      const userId = tgUser?.user_id || ''
      const [globalRes, friendsRes] = await Promise.all([
        fetch(`${BASE}/leaderboard/global?user_id=${userId}`).then(r => r.json()),
        userId ? fetch(`${BASE}/leaderboard/friends?user_id=${userId}`).then(r => r.json()) : Promise.resolve({ data: [] })
      ])
      if (globalRes.ok) {
        setGlobalList(globalRes.data || [])
        setMyRank(globalRes.myRank || null)
      }
      if (friendsRes.ok) setFriendsList(friendsRes.data || [])
    } catch {}
    setLoading(false)
  }, [syncXp, tgUser])

  useEffect(() => { fetchData() }, [fetchData])

  const list = tab === 'global' ? globalList : friendsList
  const myUserId = tgUser?.user_id

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f3ff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(124,58,237,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ width: 32, height: 32, borderRadius: 10, background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>🏆 Reyting</div>
        <button onClick={fetchData} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}>🔄</button>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* Mening o'rnim kartochkasi */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 20, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(163,230,53,0.2)', border: '2px solid #a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {tgUser?.avatar_url
              ? <img src={tgUser.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
              : '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>
              {tgUser?.first_name || 'Siz'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
              {myRank ? `#${myRank.rank} o'rin • Global` : 'Hali reytingda yo\'q'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#a3e635', fontWeight: 900, fontSize: 20 }}>{xp.toLocaleString()}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>XP</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 14, padding: 4, marginBottom: 14, border: '0.5px solid rgba(124,58,237,0.12)' }}>
          <button onClick={() => setTab('global')} style={{
            flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: tab === 'global' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
            color: tab === 'global' ? 'white' : '#6b7280', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <Trophy size={14} />Global
          </button>
          <button onClick={() => setTab('friends')} style={{
            flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: tab === 'friends' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
            color: tab === 'friends' ? 'white' : '#6b7280', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <Users size={14} />Do'stlar
          </button>
        </div>

        {/* Podium — Top 3 */}
        {!loading && list.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 20, padding: '0 8px' }}>
            {/* 2-o'rin */}
            <PodiumCard user={list[1]} rank={2} isMe={list[1]?.user_id === myUserId} />
            {/* 1-o'rin */}
            <PodiumCard user={list[0]} rank={1} isMe={list[0]?.user_id === myUserId} />
            {/* 3-o'rin */}
            <PodiumCard user={list[2]} rank={3} isMe={list[2]?.user_id === myUserId} />
          </div>
        )}

        {/* Ro'yxat */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div>Yuklanmoqda...</div>
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>
              {tab === 'friends' ? '👥' : '🏆'}
            </div>
            <div style={{ fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>
              {tab === 'friends' ? "Hali do'stlar yo'q" : 'Reyting bo\'sh'}
            </div>
            <div style={{ fontSize: 13 }}>
              {tab === 'friends' ? "Do'stlarni taklif qiling!" : 'Dars o\'qing va reytingda chiqing!'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.slice(tab === 'global' ? 3 : 0).map((user, i) => {
              const rank = tab === 'global' ? i + 4 : Number(user.rank)
              const isMe = user.user_id === myUserId
              return (
                <div key={user.user_id} style={{
                  background: isMe ? 'linear-gradient(135deg, #ede9fe, #f5f3ff)' : 'white',
                  border: `1px solid ${isMe ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.08)'}`,
                  borderRadius: 16, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: isMe ? '0 2px 12px rgba(124,58,237,0.12)' : 'none'
                }}>
                  {/* Rank */}
                  <div style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 13, color: rank <= 10 ? '#7c3aed' : '#9ca3af', flexShrink: 0 }}>
                    {MEDAL[rank] || `#${rank}`}
                  </div>

                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: isMe ? '#ede9fe' : '#f5f3ff', border: `1.5px solid ${isMe ? '#7c3aed' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : '👤'}
                  </div>

                  {/* Ism */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.first_name || 'Foydalanuvchi'}
                      </span>
                      {isMe && <span style={{ fontSize: 10, background: '#7c3aed', color: 'white', padding: '1px 6px', borderRadius: 6, flexShrink: 0 }}>Siz</span>}
                    </div>
                    {user.streak > 0 && (
                      <div style={{ fontSize: 11, color: '#f97316', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Flame size={10} />
                        {user.streak} kunlik streak
                      </div>
                    )}
                  </div>

                  {/* XP */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
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

        {/* Do'st taklif qilish banner */}
        {tab === 'friends' && (
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 18, padding: '14px 16px', marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>👥</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>Do'stlarni taklif qiling!</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>Referral kod: <strong style={{ color: '#a3e635' }}>{referralCode || '...'}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Podium kartochkasi
function PodiumCard({ user, rank, isMe }) {
  const heights = { 1: 100, 2: 80, 3: 65 }
  const sizes = { 1: 52, 2: 44, 3: 40 }
  const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <div style={{ width: sizes[rank], height: sizes[rank], borderRadius: '50%', background: '#f5f3ff', border: `3px solid ${colors[rank]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: rank === 1 ? 24 : 20, overflow: 'hidden', boxShadow: isMe ? '0 0 0 3px #7c3aed' : 'none' }}>
          {user?.avatar_url
            ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : '👤'}
        </div>
        {rank === 1 && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 20 }}>👑</div>}
      </div>

      {/* Ism */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1e1b4b', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user?.first_name || '—'}
        {isMe && ' (Siz)'}
      </div>

      {/* XP */}
      <div style={{ fontSize: 12, fontWeight: 900, color: colors[rank] }}>
        {user ? Number(user.xp).toLocaleString() : '—'} XP
      </div>

      {/* Podyum ustuni */}
      <div style={{ width: '100%', height: heights[rank], background: `linear-gradient(180deg, ${colors[rank]}33, ${colors[rank]}11)`, border: `1.5px solid ${colors[rank]}44`, borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: rank === 1 ? 22 : 18, fontWeight: 900, color: colors[rank] }}>{MEDAL[rank]}</span>
      </div>
    </div>
  )
}
