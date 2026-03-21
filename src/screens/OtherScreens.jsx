import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const MOCK_USERS = [
  { name: "Sardor T.", xp: 2840 },{ name: "Malika R.", xp: 2610 },
  { name: "Jasur K.", xp: 2400 },{ name: "Nilufar A.", xp: 2180 },
  { name: "Bobur M.", xp: 1950 },{ name: "Zulfiya S.", xp: 1720 },
  { name: "Ulugbek N.", xp: 1540 },{ name: "Dilorom H.", xp: 1380 },
  { name: "Sherzod I.", xp: 1200 },{ name: "Kamola Y.", xp: 980 },
]
const medals = ['🥇','🥈','🥉']

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
    ? liveBoard.map((u, i) => ({ name: u.name, xp: u.weeklyXp, isMe: u.userId === window.Telegram?.WebApp?.initDataUnsafe?.user?.id }))
    : [...MOCK_USERS, { name: user.name || 'Siz', xp: weeklyXp, isMe: true }].sort((a,b)=>b.xp-a.xp)

  const myRank = myLiveRank || (allUsers.findIndex(u=>u.isMe)+1) || allUsers.length+1
  const myWeeklyXp = liveBoard ? (liveBoard.find(u=>u.isMe)?.weeklyXp ?? weeklyXp) : weeklyXp
  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={()=>navigate(-1)}><ChevronLeft size={18} color="var(--text)"/></button>
        <div className="header-title">Reyting jadvali</div>
      </div>
      <div style={{padding:'20px 20px 0'}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:8,justifyContent:'center',marginBottom:24}}>
          {[1,0,2].map(pos=>{
            const u=allUsers[pos]; if(!u) return null
            const h=[80,110,60][[1,0,2].indexOf(pos)]
            return (
              <div key={pos} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text2)',textAlign:'center'}}>{u.name.split(' ')[0]}</div>
                <div style={{fontSize:20}}>{medals[pos]||pos+1}</div>
                <div style={{width:'100%',background:pos===0?'#fbbf2430':'var(--bg3)',borderRadius:'8px 8px 0 0',height:h,border:`0.5px solid ${pos===0?'var(--amber)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontWeight:800,fontSize:14,color:pos===0?'var(--amber)':'var(--text)'}}>{u.xp.toLocaleString()}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>XP</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="card" style={{marginBottom:16,background:'var(--accent-bg)',border:'1px solid rgba(124,111,247,0.3)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff'}}>{myRank}</div>
            <div style={{flex:1}}><div style={{fontWeight:700}}>Sizning o'rningiz</div><div style={{fontSize:12,color:'var(--text3)'}}>Haftalik reyting</div></div>
            <div style={{fontWeight:800,color:'var(--accent2)'}}>{myWeeklyXp} XP</div>
          </div>
        </div>
        <div className="section-title">Barcha ishtirokchilar</div>
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
          {allUsers.slice(0,15).map((u,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:'var(--radius-sm)',background:u.isMe?'var(--accent-bg)':'var(--bg3)',border:`0.5px solid ${u.isMe?'rgba(124,111,247,0.3)':'var(--border)'}`}}>
              <div style={{width:28,fontWeight:700,fontSize:14,color:i<3?'var(--amber)':'var(--text3)',textAlign:'center'}}>{medals[i]||i+1}</div>
              <div style={{flex:1,fontWeight:u.isMe?700:500}}>{u.name}</div>
              <div style={{fontWeight:700,color:u.isMe?'var(--accent2)':'var(--text2)'}}>{u.xp.toLocaleString()} XP</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text3)',textAlign:'center',paddingBottom:8}}>Har dushanba 00:00 da (Toshkent vaqti) yangilanadi</p>
      </div>
    </div>
  )
}

export function Profile() {
  const navigate = useNavigate()
  const { xp, streak, weeklyXp, user, topikProgress, epsProgress, isPremium, premiumExpiry, referralCount } = useStore()
  const topikDone = Object.values(topikProgress).reduce((acc,lvl)=>acc+Object.values(lvl.lessonProgress).filter(s=>s==='done').length,0)
  const epsDone = Object.values(epsProgress.lessonProgress).filter(s=>s==='done').length
  const initials = user.name?user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase():'AB'
  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={()=>navigate(-1)}><ChevronLeft size={18} color="var(--text)"/></button>
        <div className="header-title">Profil</div>
      </div>
      <div style={{padding:'20px 20px 0'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'var(--accent-bg)',border:'3px solid var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:24,color:'var(--accent2)',marginBottom:10}}>{initials}</div>
          <div style={{fontWeight:800,fontSize:18}}>{user.name||'Foydalanuvchi'}</div>
          {isPremium&&<div className="badge badge-amber" style={{marginTop:6}}>⭐ Premium a'zo</div>}
        </div>
        <div className="stat-grid" style={{marginBottom:20}}>
          {[{val:xp.toLocaleString(),lbl:'Jami XP'},{val:weeklyXp,lbl:'Haftalik XP'},{val:`${streak} kun`,lbl:'Seria'},{val:referralCount,lbl:'Taklif qildi'}].map((s,i)=>(
            <div className="stat-cell" key={i}><div className="stat-val">{s.val}</div><div className="stat-lbl">{s.lbl}</div></div>
          ))}
        </div>
        <div className="section-title">Yo'nalishlar</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
          {[{label:'TOPIK',done:topikDone,total:60,color:'var(--accent)'},{label:'EPS-TOPIK',done:epsDone,total:10,color:'var(--green)'}].map(t=>(
            <div key={t.label} className="card-sm">
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontWeight:700}}>{t.label}</span><span style={{fontSize:12,color:'var(--text3)'}}>{t.done}/{t.total} dars</span></div>
              <div className="progress-track"><div className="progress-fill" style={{width:`${Math.round(t.done/t.total*100)}%`,background:t.color}}/></div>
            </div>
          ))}
        </div>
        <div className="section-title">Premium holati</div>
        <div className={`card ${isPremium?'premium-shine':''}`} style={{marginBottom:20,border:isPremium?'1px solid var(--amber)':'0.5px solid var(--border)'}}>
          {isPremium?(
            <div><div style={{fontWeight:700,color:'var(--amber)',marginBottom:4}}>⭐ Premium faol</div><div style={{fontSize:13,color:'var(--text2)'}}>Muddati: {premiumExpiry?new Date(premiumExpiry).toLocaleDateString('uz-UZ'):'—'}</div></div>
          ):(
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{flex:1}}><div style={{fontWeight:700}}>Premium emas</div><div style={{fontSize:13,color:'var(--text2)',marginTop:4}}>Premium imkoniyatlarni oching</div></div>
              <button className="btn btn-ghost" style={{width:'auto',padding:'8px 16px'}} onClick={()=>navigate('/premium')}>Xarid qilish</button>
            </div>
          )}
        </div>
        <div className="section-title">Test natijalari</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {Object.entries(topikProgress).map(([lvlId,lvl])=>{
            if(!lvl.testScore&&lvl.testStatus==='locked') return null
            return (
              <div key={lvlId} className="card-sm" style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,fontSize:14}}>{lvlId}-daraja testi</div>
                <div style={{fontWeight:700,color:lvl.testScore>=60?'var(--green)':lvl.testScore?'var(--red)':'var(--text3)'}}>{lvl.testScore?`${lvl.testScore}%`:'—'}</div>
              </div>
            )
          })}
          {epsProgress.finalTestScore&&(
            <div className="card-sm" style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1,fontSize:14}}>EPS yakuniy testi</div>
              <div style={{fontWeight:700,color:epsProgress.finalTestScore>=60?'var(--green)':'var(--red)'}}>{epsProgress.finalTestScore}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Review() {
  const navigate = useNavigate()
  const { topikProgress, epsProgress } = useStore()
  const failedItems = []
  Object.entries(topikProgress).forEach(([lvlId,lvl])=>{
    if(lvl.testScore!==null&&lvl.testScore<60&&lvl.testAttempts?.length>0)
      failedItems.push({label:`${lvlId}-daraja testi`,score:lvl.testScore})
  })
  if(epsProgress.finalTestScore!==null&&epsProgress.finalTestScore<60)
    failedItems.push({label:'EPS yakuniy testi',score:epsProgress.finalTestScore})
  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={()=>navigate(-1)}><ChevronLeft size={18} color="var(--text)"/></button>
        <div className="header-title">Takrorlash</div>
      </div>
      <div style={{padding:'20px'}}>
        {failedItems.length===0?(
          <div style={{textAlign:'center',paddingTop:60}}>
            <div style={{fontSize:48,marginBottom:12}}>🎯</div>
            <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>Ajoyib!</div>
            <p style={{color:'var(--text2)',fontSize:14}}>Hozircha takrorlash zarur bo'lgan mavzular yo'q.</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <p style={{color:'var(--text2)',fontSize:14,marginBottom:8}}>Quyidagi mavzularni takrorlash tavsiya etiladi:</p>
            {failedItems.map((item,i)=>(
              <div key={i} className="card-sm" style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{fontSize:20}}>📖</div>
                <div style={{flex:1}}><div style={{fontWeight:700}}>{item.label}</div><div style={{fontSize:12,color:'var(--red)'}}>Natija: {item.score}%</div></div>
                <button className="btn btn-ghost" style={{width:'auto',padding:'6px 14px',fontSize:13}}>Takrorla</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Premium() {
  const navigate = useNavigate()
  const { activatePremium, isPremium } = useStore()
  const [purchasing, setPurchasing] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [msg, setMsg] = useState('')

  const handlePurchase = async (plan) => {
    setPurchasing(plan.planKey)
    try {
      const { createPaymentInvoice } = await import('../api.js')
      const data = await createPaymentInvoice(plan.planKey)
      if (data.invoiceLink) {
        // Open Telegram payment sheet
        window.Telegram?.WebApp?.openInvoice(data.invoiceLink, (status) => {
          if (status === 'paid') {
            activatePremium(plan.days)
            setMsg('⭐ Premium muvaffaqiyatli faollashtirildi!')
          }
        })
      }
    } catch {
      // Fallback for dev/demo
      if (import.meta.env.DEV) {
        activatePremium(plan.days)
        setMsg('⭐ Demo: Premium faollashtirildi!')
      } else {
        setMsg('To\'lov yaratishda xato. Qayta urining.')
      }
    } finally {
      setPurchasing(null)
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const { verifyPayment } = await import('../api.js')
      const chargeId = window.Telegram?.WebApp?.initDataUnsafe?.payment?.charge_id
      if (chargeId) {
        const data = await verifyPayment(chargeId)
        if (data.verified) { activatePremium(data.days); setMsg('✅ Premium tasdiqlandi!') }
        else setMsg("To'lov topilmadi. Qo'llab-quvvatlash bilan bog'laning.")
      }
    } catch { setMsg('Tekshirib bo\'lmadi.') }
    finally { setVerifying(false) }
  }
  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={()=>navigate(-1)}><ChevronLeft size={18} color="var(--text)"/></button>
        <div className="header-title">Premium</div>
      </div>
      <div style={{padding:'20px'}}>
        <div className="card premium-shine" style={{textAlign:'center',marginBottom:24,border:'1px solid var(--amber)'}}>
          <div style={{fontSize:48,marginBottom:8}}>⭐</div>
          <div style={{fontWeight:800,fontSize:20,color:'var(--amber)',marginBottom:6}}>Premium a'zolik</div>
          <div style={{fontSize:14,color:'var(--text2)'}}>To'liq imkoniyatlarni oching</div>
        </div>
        <div className="section-title">Premium afzalliklari</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
          {[{emoji:'📚',title:'Barcha darslar',desc:"Barcha darslarga to'liq kirish"},{emoji:'🔄',title:'Kengaytirilgan takrorlash',desc:'Kuchsiz tomonlarni aniq belgilash'},{emoji:'📊',title:'Batafsil tahlil',desc:'Progress va natijalar statistikasi'},{emoji:'🎯',title:'Maxsus mashqlar',desc:"Premium foydalanuvchilar uchun qo'shimcha mashqlar"}].map((f,i)=>(
            <div key={i} className="card-sm" style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontSize:20}}>{f.emoji}</span>
              <div><div style={{fontWeight:700,fontSize:14}}>{f.title}</div><div style={{fontSize:13,color:'var(--text2)',marginTop:3}}>{f.desc}</div></div>
            </div>
          ))}
        </div>
        <div className="section-title">Narxlar</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
          {[{period:'1 oy',price:'⭐ 150 Stars',days:30,planKey:'1month',popular:false},{period:'3 oy',price:'⭐ 400 Stars',days:90,planKey:'3month',popular:true,badge:'Eng foydali'},{period:'12 oy',price:'⭐ 1200 Stars',days:365,planKey:'12month',popular:false}].map((plan,i)=>(
            <div key={i} className="card-sm" style={{border:plan.popular?'1.5px solid var(--amber)':'0.5px solid var(--border)',position:'relative'}}>
              {plan.popular&&<div className="badge badge-amber" style={{position:'absolute',top:-10,right:14}}>{plan.badge}</div>}
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{flex:1}}><div style={{fontWeight:700}}>{plan.period}</div><div style={{fontSize:13,color:'var(--amber)',fontWeight:600,marginTop:3}}>{plan.price}</div></div>
                <button className="btn btn-primary" style={{width:'auto',padding:'8px 18px'}} disabled={purchasing===plan.planKey} onClick={()=>handlePurchase(plan)}>
                  {purchasing===plan.planKey?'...':'Xarid'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="card-sm" style={{textAlign:'center',border:'1px solid rgba(124,111,247,0.3)'}}>
          <p style={{fontSize:13,color:'var(--text2)'}}>💡 10 ta do'stni taklif qilsangiz — 30 kun Premium bepul!</p>
          <button className="btn btn-ghost" style={{marginTop:10}} onClick={()=>navigate('/referral')}>Do'st taklif qilish →</button>
        </div>
        {msg&&<div style={{marginTop:14,padding:'12px 14px',borderRadius:'var(--radius-sm)',background:'var(--green-bg)',border:'1px solid var(--green)',fontSize:13,color:'var(--green)',textAlign:'center'}}>{msg}</div>}
        <button className="btn btn-secondary" style={{marginTop:12,fontSize:13}} onClick={handleVerify} disabled={verifying}>
          {verifying?'Tekshirilmoqda...':'🔄 To\'lovni tekshirish'}
        </button>
      </div>
    </div>
  )
}

export function Referral() {
  const navigate = useNavigate()
  const { referralCode, referralCount } = useStore()
  const link = `https://t.me/KoreysBot?start=${referralCode}`
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { navigator.clipboard.writeText(link).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  const progressVal = referralCount%10||0
  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={()=>navigate(-1)}><ChevronLeft size={18} color="var(--text)"/></button>
        <div className="header-title">Do'st taklif qilish</div>
      </div>
      <div style={{padding:'20px'}}>
        <div className="card" style={{textAlign:'center',marginBottom:20,background:'var(--accent-bg)',border:'1px solid rgba(124,111,247,0.3)'}}>
          <div style={{fontSize:48,marginBottom:8}}>🎁</div>
          <div style={{fontWeight:800,fontSize:18,marginBottom:6}}>10 do'st = 30 kun Premium</div>
          <p style={{color:'var(--text2)',fontSize:14}}>Har bir do'stingiz birinchi darsni tugatsa, siz 1 premium ball olasiz</p>
        </div>
        <div className="card-sm" style={{marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontWeight:700}}>Joriy progress</span>
            <span style={{fontSize:13,color:'var(--text3)'}}>{progressVal}/10</span>
          </div>
          <div className="progress-track" style={{marginBottom:10}}>
            <div className="progress-fill" style={{width:`${progressVal*10}%`}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:12,color:'var(--text3)'}}>Jami taklif: {referralCount}</span>
            <span style={{fontSize:12,color:'var(--accent2)'}}>{10-progressVal} ta qoldi</span>
          </div>
        </div>
        <div className="section-title">Sizning havolangiz</div>
        <div style={{background:'var(--bg3)',border:'0.5px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'13px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
          <div style={{flex:1,fontSize:13,color:'var(--accent2)',wordBreak:'break-all'}}>{link}</div>
          <button onClick={handleCopy} style={{background:copied?'var(--green-bg)':'var(--accent-bg)',border:`1px solid ${copied?'var(--green)':'rgba(124,111,247,0.3)'}`,borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:13,fontWeight:700,color:copied?'var(--green)':'var(--accent2)',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>
            {copied?'✓ Nusxalandi':'Nusxalash'}
          </button>
        </div>
        <button className="btn btn-primary" style={{marginBottom:20}} onClick={()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Koreystili o'rganish ilovasida men bilan qo'shiling!")}`, '_blank')}>
          📤 Do'stlarga yuborish
        </button>
        <div className="section-title">Qoidalar</div>
        <div className="card-sm">
          {["Do'stingiz havola orqali ro'yxatdan o'tishi kerak","Do'stingiz @koreystili_topikk kanaliga obuna bo'lishi kerak","30 kun ichida birinchi darsni tugatishi kerak","Har 10 ta to'g'ri taklif = 30 kun Premium bepul","Premium kunlar yig'ilib boradi"].map((r,i,arr)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:i<arr.length-1?10:0}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',marginTop:6,flexShrink:0}}/>
              <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.5}}>{r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
