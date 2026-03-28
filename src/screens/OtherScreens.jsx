import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const MOCK_USERS = [
  { name: "Sardor T.", xp: 2840 }, { name: "Malika R.", xp: 2610 },
  { name: "Jasur K.", xp: 2400 }, { name: "Nilufar A.", xp: 2180 },
  { name: "Bobur M.", xp: 1950 }, { name: "Zulfiya S.", xp: 1720 },
  { name: "Ulugbek N.", xp: 1540 }, { name: "Dilorom H.", xp: 1380 },
  { name: "Sherzod I.", xp: 1200 }, { name: "Kamola Y.", xp: 980 },
]
const medals = ['🥇', '🥈', '🥉']

const S = {
  page: { minHeight: '100dvh', background: '#f5f3ff', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 },
  header: { background: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(124,58,237,0.1)', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { width: 32, height: 32, borderRadius: 10, background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  title: { fontSize: 16, fontWeight: 900, color: '#1e1b4b', flex: 1 },
  card: { background: 'white', borderRadius: 18, padding: '16px', border: '0.5px solid rgba(124,58,237,0.12)', marginBottom: 12 },
  darkCard: { background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', borderRadius: 18, padding: '16px', marginBottom: 12, border: '1px solid rgba(163,230,53,0.15)' },
  sectionTitle: { fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: 1.5, marginBottom: 10, marginTop: 4 },
}

// ── LEADERBOARD ───────────────────────────────────────────────────────
export function Leaderboard() {
  const navigate = useNavigate()
  const { weeklyXp, user } = useStore()
  const [liveBoard, setLiveBoard] = useState(null)
  const [myLiveRank, setMyLiveRank] = useState(null)

  useEffect(() => {
    import('../api.js').then(({ fetchLeaderboard }) => {
      fetchLeaderboard().then(data => {
        setLiveBoard(data.leaderboard)
        setMyLiveRank(data.myRank)
      }).catch(() => {})
    }).catch(() => {})
  }, [])

  const allUsers = liveBoard
    ? liveBoard.map(u => ({ name: u.name, xp: u.weeklyXp, isMe: u.userId === window.Telegram?.WebApp?.initDataUnsafe?.user?.id }))
    : [...MOCK_USERS, { name: user.name || 'Siz', xp: weeklyXp, isMe: true }].sort((a, b) => b.xp - a.xp)

  const myRank = myLiveRank || (allUsers.findIndex(u => u.isMe) + 1) || allUsers.length + 1
  const myWeeklyXp = liveBoard ? (liveBoard.find(u => u.isMe)?.weeklyXp ?? weeklyXp) : weeklyXp

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={S.title}>Reyting jadvali</div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Top 3 podium */}
        <div style={{ ...S.darkCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'center' }}>
            {[1, 0, 2].map(pos => {
              const u = allUsers[pos]; if (!u) return null
              const h = [80, 110, 60][[1, 0, 2].indexOf(pos)]
              return (
                <div key={pos} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>{u.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 22 }}>{medals[pos]}</div>
                  <div style={{
                    width: '100%', borderRadius: '8px 8px 0 0', height: h,
                    background: pos === 0 ? 'rgba(163,230,53,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `0.5px solid ${pos === 0 ? 'rgba(163,230,53,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: pos === 0 ? '#a3e635' : 'white' }}>{u.xp.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>XP</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* My rank */}
        <div style={{ ...S.card, background: '#ede9fe', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14 }}>{myRank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#1e1b4b' }}>Sizning o'rningiz</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Haftalik reyting</div>
            </div>
            <div style={{ fontWeight: 800, color: '#7c3aed' }}>{myWeeklyXp} XP</div>
          </div>
        </div>

        {/* All users */}
        <div style={S.sectionTitle}>BARCHA ISHTIROKCHILAR</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {allUsers.slice(0, 15).map((u, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderRadius: 14,
              background: u.isMe ? '#ede9fe' : 'white',
              border: `0.5px solid ${u.isMe ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.1)'}`
            }}>
              <div style={{ width: 28, fontWeight: 700, fontSize: 14, color: i < 3 ? '#d97706' : '#9ca3af', textAlign: 'center' }}>{medals[i] || i + 1}</div>
              <div style={{ flex: 1, fontWeight: u.isMe ? 700 : 500, color: '#1e1b4b' }}>{u.name}</div>
              <div style={{ fontWeight: 700, color: u.isMe ? '#7c3aed' : '#6b7280' }}>{u.xp.toLocaleString()} XP</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', paddingBottom: 8 }}>Har dushanba 00:00 da (Toshkent vaqti) yangilanadi</p>
      </div>
    </div>
  )
}

// ── PROFILE ───────────────────────────────────────────────────────────
export function Profile() {
  const navigate = useNavigate()
  const { xp, streak, weeklyXp, user, topikProgress, epsProgress, isPremium, premiumExpiry, referralCount } = useStore()
  const topikDone = Object.values(topikProgress).reduce((acc, lvl) => acc + Object.values(lvl.lessonProgress).filter(s => s === 'done').length, 0)
  const epsDone = Object.values(epsProgress.lessonProgress).filter(s => s === 'done').length
  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AB'

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={S.title}>Profil</div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Avatar */}
        <div style={{ ...S.darkCard, textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '3px solid #a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#a3e635', margin: '0 auto 12px' }}>{initials}</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'white' }}>{user.name || 'Foydalanuvchi'}</div>
          {isPremium && <div style={{ background: '#a3e635', color: '#1a2e05', fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20, display: 'inline-block', marginTop: 8 }}>⭐ Premium a'zo</div>}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { val: xp.toLocaleString(), lbl: 'Jami XP' },
            { val: weeklyXp, lbl: 'Haftalik XP' },
            { val: `${streak} kun`, lbl: 'Seria' },
            { val: referralCount, lbl: 'Taklif qildi' }
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '12px 8px', textAlign: 'center', border: '0.5px solid rgba(124,58,237,0.12)' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1e1b4b' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div style={S.sectionTitle}>YO'NALISHLAR</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'TOPIK', done: topikDone, total: 60, color: '#7c3aed' },
            { label: 'EPS-TOPIK', done: epsDone, total: 10, color: '#a3e635' }
          ].map(t => (
            <div key={t.label} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: '#1e1b4b' }}>{t.label}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{t.done}/{t.total} dars</span>
              </div>
              <div style={{ height: 5, background: '#ede9fe', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(t.done / t.total * 100)}%`, background: t.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Premium */}
        <div style={S.sectionTitle}>PREMIUM HOLATI</div>
        <div style={{ ...S.darkCard, marginBottom: 16 }}>
          {isPremium ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>👑</span>
              <div>
                <div style={{ fontWeight: 800, color: '#a3e635' }}>Premium faol!</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Muddati: {premiumExpiry ? new Date(premiumExpiry).toLocaleDateString('uz-UZ') : '—'}</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#a3e635', color: '#1a2e05', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12 }}>FAOL</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>👑</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: 'white' }}>Premium emas</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Premium imkoniyatlarni oching</div>
              </div>
              <button onClick={() => navigate('/premium')} style={{ background: '#a3e635', border: 'none', borderRadius: 12, padding: '8px 16px', color: '#1a2e05', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Xarid</button>
            </div>
          )}
        </div>

        {/* Test results */}
        <div style={S.sectionTitle}>TEST NATIJALARI</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(topikProgress).map(([lvlId, lvl]) => {
            if (!lvl.testScore && lvl.testStatus === 'locked') return null
            return (
              <div key={lvlId} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: 14, color: '#1e1b4b' }}>{lvlId}-daraja testi</div>
                <div style={{ fontWeight: 700, color: lvl.testScore >= 60 ? '#15803d' : lvl.testScore ? '#dc2626' : '#9ca3af' }}>
                  {lvl.testScore ? `${lvl.testScore}%` : '—'}
                </div>
              </div>
            )
          })}
          {epsProgress.finalTestScore && (
            <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, fontSize: 14, color: '#1e1b4b' }}>EPS yakuniy testi</div>
              <div style={{ fontWeight: 700, color: epsProgress.finalTestScore >= 60 ? '#15803d' : '#dc2626' }}>{epsProgress.finalTestScore}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── REVIEW ────────────────────────────────────────────────────────────
export function Review() {
  const navigate = useNavigate()
  const { topikProgress, epsProgress } = useStore()
  const failedItems = []
  Object.entries(topikProgress).forEach(([lvlId, lvl]) => {
    if (lvl.testScore !== null && lvl.testScore < 60 && lvl.testAttempts?.length > 0)
      failedItems.push({ label: `${lvlId}-daraja testi`, score: lvl.testScore })
  })
  if (epsProgress.finalTestScore !== null && epsProgress.finalTestScore < 60)
    failedItems.push({ label: 'EPS yakuniy testi', score: epsProgress.finalTestScore })

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={S.title}>Takrorlash</div>
      </div>
      <div style={{ padding: '16px' }}>
        {failedItems.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1e1b4b' }}>Ajoyib!</div>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Hozircha takrorlash zarur bo'lgan mavzular yo'q.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>Quyidagi mavzularni takrorlash tavsiya etiladi:</p>
            {failedItems.map((item, i) => (
              <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 20 }}>📖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1e1b4b' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#dc2626' }}>Natija: {item.score}%</div>
                </div>
                <button style={{ background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>Takrorla</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── REFERRAL ──────────────────────────────────────────────────────────
export function Referral() {
  const navigate = useNavigate()
  const { referralCode, referralCount } = useStore()
  const link = `https://t.me/topik_epstopik_bot?start=${referralCode}`
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { navigator.clipboard.writeText(link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const progressVal = referralCount % 10 || 0

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} color="#7c3aed" />
        </button>
        <div style={S.title}>Do'st taklif qilish</div>
      </div>
      <div style={{ padding: '16px' }}>
        {/* Hero */}
        <div style={{ ...S.darkCard, textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🎁</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'white', marginBottom: 6 }}>10 do'st = 30 kun Premium</div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Har bir do'stingiz birinchi darsni tugatsa, siz 1 premium ball olasiz</p>
        </div>

        {/* Progress */}
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: '#1e1b4b' }}>Joriy progress</span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{progressVal}/10</span>
          </div>
          <div style={{ height: 6, background: '#ede9fe', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${progressVal * 10}%`, background: 'linear-gradient(90deg,#7c3aed,#a855f7)', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Jami taklif: {referralCount}</span>
            <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>{10 - progressVal} ta qoldi</span>
          </div>
        </div>

        {/* Link */}
        <div style={S.sectionTitle}>SIZNING HAVOLANGIZ</div>
        <div style={{ background: '#f5f3ff', border: '0.5px solid rgba(124,58,237,0.15)', borderRadius: 14, padding: '13px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 12, color: '#7c3aed', wordBreak: 'break-all', fontFamily: 'monospace' }}>{link}</div>
          <button onClick={handleCopy} style={{ background: copied ? '#dcfce7' : '#ede9fe', border: `1px solid ${copied ? 'rgba(21,128,61,0.3)' : 'rgba(124,58,237,0.2)'}`, borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: copied ? '#15803d' : '#7c3aed', whiteSpace: 'nowrap' }}>
            {copied ? '✓ Nusxalandi' : 'Nusxalash'}
          </button>
        </div>

        <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Koreystili o'rganish ilovasida men bilan qo'shiling!")}`, '_blank')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 14, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 20 }}>
          📤 Do'stlarga yuborish
        </button>

        {/* Rules */}
        <div style={S.sectionTitle}>QOIDALAR</div>
        <div style={S.card}>
          {["Do'stingiz havola orqali ro'yxatdan o'tishi kerak", "Do'stingiz @koreystili_topikk kanaliga obuna bo'lishi kerak", "30 kun ichida birinchi darsni tugatishi kerak", "Har 10 ta to'g'ri taklif = 30 kun Premium bepul", "Premium kunlar yig'ilib boradi"].map((r, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < arr.length - 1 ? 10 : 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', marginTop: 6, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}>{r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
