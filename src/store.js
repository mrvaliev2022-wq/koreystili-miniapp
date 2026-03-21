import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Telegram WebApp bootstrap ───────────────────────────────────────────────
export function initTelegramApp() {
  try {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#0f0f1a')
      tg.setBackgroundColor('#0f0f1a')
    }
  } catch (e) { /* runs outside Telegram in dev */ }
}

export function getTelegramUser() {
  try {
    const tg = window.Telegram?.WebApp
    const u = tg?.initDataUnsafe?.user
    if (u) return { name: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}`, avatar: u.photo_url || '', id: u.id }
  } catch (e) {}
  return { name: '', avatar: '', id: null }
}

// ─── CONTENT DATA ────────────────────────────────────────────────────────────

export const TOPIK_LEVELS = Array.from({ length: 6 }, (_, li) => ({
  id: li + 1,
  title: `${li + 1}-daraja`,
  description: ['Boshlang\'ich', 'Asosiy', 'O\'rta', 'Yuqori o\'rta', 'Ilg\'or', 'Ekspert'][li],
  lessons: Array.from({ length: 10 }, (_, i) => {
    const lessonIndex = li * 10 + i
    const lessonTitles = [
      'Koreyscha harflar: Hangul asoslari', 'Salom va tanishish', 'Raqamlar va hisoblash',
      'Ranglar va shakllar', 'Kundalik so\'zlar', 'Oila a\'zolari', 'Ovqat va ichimliklar',
      'Yo\'nalishlar va joy', 'Vaqt va kun tartibi', 'Hayvonlar va tabiat',
      'Bozor va xarid', 'Transport va sayohat', 'Kasb va ish', 'Sog\'liq va tana',
      'Ob-havo va fasil', 'Maktab va ta\'lim', 'Do\'stlik va muloqot', 'Uy va xona',
      'Sport va hobbi', 'Texnologiya va internet', 'Grammatika: Fe\'l nisbatlari',
      'Grammatika: Shart mayli', 'Grammatika: Zamon turlari', 'O\'qish: Qisqa matn',
      'Eshitish: Oddiy dialog', 'Yozish: Qisqa xat', 'So\'z boyligi: Antonimlar',
      'So\'z boyligi: Sinonimlar', 'Grammatika: Ko\'rsatish olmoshlari',
      'Grammatika: Bog\'lovchilar', 'Akademik lug\'at 1', 'Akademik lug\'at 2',
      'Qo\'shma gaplar', 'Murakkab nisbatlar', 'Rasmiy muloqot uslubi',
      'Qo\'shma ma\'noli so\'zlar', 'Idiomatic iboralar', 'Matbuot va ommaviy axborot',
      'Ilmiy matnlar uslubi', 'Adabiy uslub va she\'riyat',
      'TOPIK imtihon strategiyasi 1', 'TOPIK imtihon strategiyasi 2',
      'Aralash grammatika mashqi', 'Tinglab tushunish mashqi',
      'O\'qib tushunish: Uzoq matn', 'Yozma ifoda: Insho',
      'Yuqori darajali lug\'at', 'Murakkab grammatik tuzilmalar',
      'Madaniyat va an\'analar', 'Yakuniy takrorlash va mustahkamlash',
      'Murakkab lug\'at va iboralar', 'Nutq uslublari', 'Tahliliy o\'qish',
      'Tanqidiy fikrlash mashqlari', 'Ilmiy yozuv uslubi',
      'Adabiy tahlil', 'Ommaviy nutq', 'Munozara va bahs',
      'TOPIK 6 strategiya', 'Yakuniy kompleks takrorlash',
    ]
    return {
      id: `topik-${li + 1}-${i + 1}`,
      levelId: li + 1,
      number: i + 1,
      title: lessonTitles[lessonIndex] || `${li + 1}-daraja, ${i + 1}-dars`,
      xp: 10,
      content: generateLessonContent(li + 1, i + 1),
      quiz: generateQuiz(li + 1, i + 1),
    }
  }),
  test: {
    id: `topik-test-${li + 1}`,
    title: `${li + 1}-daraja yakuniy testi`,
    passMark: 60,
    questions: generateLevelTest(li + 1),
  },
}))

export const EPS_LESSONS = Array.from({ length: 10 }, (_, i) => {
  const epsTitles = [
    'Ish joyida salomlashish', 'Ish buyruqlari va ko\'rsatmalar',
    'Xavfsizlik qoidalari', 'Ish vaqti va navbatchilik',
    'Maosh va to\'lovlar', 'Kasallik va ta\'til', 'Ish asboblari nomlari',
    'Zavod va fabrika muhiti', 'Hamkasb bilan muloqot', 'Ish shartnomasi',
  ]
  return {
    id: `eps-${i + 1}`,
    number: i + 1,
    title: epsTitles[i],
    xp: 10,
    content: generateEpsContent(i + 1),
    quiz: generateQuiz(0, i + 1),
  }
})

export const EPS_FINAL_TEST = {
  id: 'eps-final',
  title: 'EPS-TOPIK yakuniy testi',
  passMark: 60,
  questions: generateLevelTest(0),
}

function generateLessonContent(level, lesson) {
  const vocab = [
    { korean: '안녕하세요', uzbek: 'Salom (rasmiy)', romanization: 'Annyeonghaseyo' },
    { korean: '감사합니다', uzbek: 'Rahmat', romanization: 'Gamsahamnida' },
    { korean: '네', uzbek: 'Ha', romanization: 'Ne' },
    { korean: '아니요', uzbek: "Yo'q", romanization: 'Aniyo' },
    { korean: '이름', uzbek: 'Ism', romanization: 'Ireum' },
    { korean: '학교', uzbek: 'Maktab', romanization: 'Hakgyo' },
    { korean: '선생님', uzbek: "O'qituvchi", romanization: 'Seonsaengnim' },
    { korean: '공부', uzbek: "O'qish", romanization: 'Gongbu' },
  ]
  return {
    intro: `Bu darsda ${level}-daraja, ${lesson}-dars mavzusini o'rganasiz.`,
    grammar: `Grammatika: Ushbu darsda asosiy grammatik tuzilmalar ko'rib chiqiladi.`,
    vocabulary: vocab.slice(0, 4 + (lesson % 4)),
    examples: [
      { korean: '저는 학생입니다.', uzbek: "Men talabaman.", romanization: 'Jeoneun haksaengimnida.' },
      { korean: '이름이 뭐예요?', uzbek: 'Ismingiz nima?', romanization: 'Ireumi mwoyeyo?' },
    ],
  }
}

function generateEpsContent(lesson) {
  return {
    intro: `EPS-TOPIK ${lesson}-dars: Ish joyi uchun muhim so'zlar va iboralar.`,
    grammar: `Ish muhitida qo'llaniladigan asosiy grammatik tuzilmalar.`,
    vocabulary: [
      { korean: '일', uzbek: 'Ish', romanization: 'Il' },
      { korean: '회사', uzbek: 'Kompaniya', romanization: 'Hoesa' },
      { korean: '월급', uzbek: 'Oylik maosh', romanization: 'Wolgeum' },
      { korean: '안전', uzbek: 'Xavfsizlik', romanization: 'Anjeon' },
    ],
    examples: [
      { korean: '안전모를 쓰세요.', uzbek: 'Xavfsizlik dubulg\'asini kiyib oling.', romanization: 'Anjeonmoreul sseuseyo.' },
    ],
  }
}

function generateQuiz(level, lesson) {
  const pool = [
    {
      question: '"안녕하세요" nimani anglatadi?',
      options: ['Salom (rasmiy)', 'Xayr', 'Rahmat', 'Kechirasiz'],
      correct: 0,
    },
    {
      question: '"감사합니다" qaysi so\'zning tarjimasi?',
      options: ['Ha', 'Yo\'q', 'Rahmat', 'Iltimos'],
      correct: 2,
    },
    {
      question: '"학교" nimani anglatadi?',
      options: ['Uy', 'Maktab', 'Bozor', 'Shifoxona'],
      correct: 1,
    },
    {
      question: '"선생님" kim?',
      options: ['Talaba', 'Do\'st', "O'qituvchi", 'Shifokor'],
      correct: 2,
    },
    {
      question: 'Koreyscha "Ha" qanday aytiladi?',
      options: ['아니요', '네', '왜', '뭐'],
      correct: 1,
    },
    {
      question: '"이름" nimani anglatadi?',
      options: ['Yosh', 'Ism', 'Manzil', 'Raqam'],
      correct: 1,
    },
  ]
  const seed = (level * 10 + lesson) % pool.length
  return pool.slice(seed, seed + 3).concat(pool.slice(0, Math.max(0, seed + 3 - pool.length)))
}

function generateLevelTest(level) {
  return Array.from({ length: 10 }, (_, i) => ({
    question: `${level > 0 ? level + '-daraja' : 'EPS'} test savoli ${i + 1}: To'g'ri javobni tanlang`,
    options: ['A variant', 'B variant', 'C variant', 'D variant'],
    correct: i % 4,
  }))
}

// ─── STORE ───────────────────────────────────────────────────────────────────

const initialState = {
  // onboarding
  isSubscribed: false,
  onboardingDone: false,
  selectedTrack: null, // 'topik' | 'eps'
  activeTrack: 'topik',

  // user
  user: { name: '', avatar: '' },

  // topik progress: { levelId: { lessonProgress: { lessonId: 'locked'|'available'|'done' }, testStatus: 'locked'|'available'|'done', testScore: null } }
  topikProgress: {
    1: {
      lessonProgress: { 'topik-1-1': 'available', ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`topik-1-${i + 2}`, 'locked'])) },
      testStatus: 'locked', testScore: null, testAttempts: [],
    },
    ...Object.fromEntries(Array.from({ length: 5 }, (_, li) => [li + 2, {
      lessonProgress: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`topik-${li + 2}-${i + 1}`, 'locked'])),
      testStatus: 'locked', testScore: null, testAttempts: [],
    }])),
  },

  // eps progress
  epsProgress: {
    lessonProgress: { 'eps-1': 'available', ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`eps-${i + 2}`, 'locked'])) },
    finalTestStatus: 'locked', finalTestScore: null, finalTestAttempts: [],
  },

  // gamification
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  weeklyXp: 0,
  weekStart: null,

  // quiz session
  activeQuiz: null, // { lessonId, answers, startedAt }
  activeTest: null, // { testId, answers, startedAt }

  // premium & referral
  isPremium: false,
  premiumExpiry: null,
  referralCode: null,
  referralCount: 0,
  referralDays: 0,
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Setup ──
      setUser: (user) => set({ user }),
      setSubscribed: () => set({ isSubscribed: true }),
      completeOnboarding: (track) => {
        const code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase()
        set({ onboardingDone: true, selectedTrack: track, activeTrack: track, referralCode: code })
      },
      setActiveTrack: (track) => set({ activeTrack: track }),

      // ── XP & Streak ──
      addXp: (amount, reason) => {
        const s = get()
        const today = getTodayUzb()
        let newStreak = s.streak
        let newWeeklyXp = s.weeklyXp
        const newWeekStart = getWeekStart()

        if (s.weekStart !== newWeekStart) newWeeklyXp = 0

        if (s.lastActiveDate !== today) {
          const yesterday = getYesterdayUzb()
          newStreak = s.lastActiveDate === yesterday ? s.streak + 1 : 1
        }

        set({
          xp: s.xp + amount,
          weeklyXp: newWeeklyXp + amount,
          weekStart: newWeekStart,
          streak: newStreak,
          lastActiveDate: today,
        })
      },

      // ── Lesson completion ──
      completeLesson: (lessonId, score, isPerfect) => {
        const s = get()
        const isTopik = lessonId.startsWith('topik')
        const isEps = lessonId.startsWith('eps-')

        let xpEarned = 20 // quiz passed
        if (isPerfect) xpEarned += 10
        get().addXp(xpEarned, 'lesson')

        if (isTopik) {
          const parts = lessonId.split('-')
          const levelId = parseInt(parts[1])
          const lessonNum = parseInt(parts[2])
          const lvl = { ...s.topikProgress[levelId] }
          const lp = { ...lvl.lessonProgress }
          lp[lessonId] = 'done'

          // unlock next lesson
          if (lessonNum < 10) {
            const nextId = `topik-${levelId}-${lessonNum + 1}`
            if (lp[nextId] === 'locked') lp[nextId] = 'available'
          }

          // check if all lessons done → unlock test
          const allDone = Array.from({ length: 10 }, (_, i) => `topik-${levelId}-${i + 1}`).every(id => lp[id] === 'done')
          const newTestStatus = allDone ? 'available' : lvl.testStatus

          set({
            topikProgress: {
              ...s.topikProgress,
              [levelId]: { ...lvl, lessonProgress: lp, testStatus: newTestStatus },
            },
          })
        }

        if (isEps) {
          const parts = lessonId.split('-')
          const lessonNum = parseInt(parts[1])
          const ep = { ...s.epsProgress }
          const lp = { ...ep.lessonProgress }
          lp[lessonId] = 'done'

          if (lessonNum < 10) {
            const nextId = `eps-${lessonNum + 1}`
            if (lp[nextId] === 'locked') lp[nextId] = 'available'
          }

          const allDone = Array.from({ length: 10 }, (_, i) => `eps-${i + 1}`).every(id => lp[id] === 'done')
          set({
            epsProgress: { ...ep, lessonProgress: lp, finalTestStatus: allDone ? 'available' : ep.finalTestStatus },
          })
        }
      },

      // ── Level/Final Test ──
      submitTest: (testId, score) => {
        const s = get()
        const passed = score >= 60

        if (testId.startsWith('topik-test-')) {
          const levelId = parseInt(testId.replace('topik-test-', ''))
          const lvl = { ...s.topikProgress[levelId] }
          const attempts = [...(lvl.testAttempts || []), { score, date: new Date().toISOString() }]
          const bestScore = Math.max(score, lvl.testScore || 0)

          if (passed) get().addXp(100, 'level_test')

          // unlock next level
          if (passed && levelId < 6) {
            const nextLvl = { ...s.topikProgress[levelId + 1] }
            const firstLessonId = `topik-${levelId + 1}-1`
            nextLvl.lessonProgress = { ...nextLvl.lessonProgress, [firstLessonId]: 'available' }
            set({
              topikProgress: {
                ...s.topikProgress,
                [levelId]: { ...lvl, testStatus: passed ? 'done' : 'available', testScore: bestScore, testAttempts: attempts },
                [levelId + 1]: nextLvl,
              },
            })
          } else {
            set({
              topikProgress: {
                ...s.topikProgress,
                [levelId]: { ...lvl, testStatus: passed ? 'done' : 'available', testScore: bestScore, testAttempts: attempts },
              },
            })
          }
        }

        if (testId === 'eps-final') {
          const ep = { ...s.epsProgress }
          const attempts = [...(ep.finalTestAttempts || []), { score, date: new Date().toISOString() }]
          if (passed) get().addXp(100, 'eps_final')
          set({
            epsProgress: { ...ep, finalTestStatus: passed ? 'done' : 'available', finalTestScore: Math.max(score, ep.finalTestScore || 0), finalTestAttempts: attempts },
          })
        }
      },

      // ── Premium ──
      activatePremium: (days = 30) => {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + days)
        set({ isPremium: true, premiumExpiry: expiry.toISOString() })
      },

      // ── Referral ──
      addReferral: () => {
        const s = get()
        const newCount = s.referralCount + 1
        const newDays = Math.floor(newCount / 10) * 30
        if (newDays > s.referralDays) get().activatePremium(newDays - s.referralDays)
        set({ referralCount: newCount, referralDays: newDays })
      },

      // ── Active quiz session ──
      startQuiz: (lessonId) => set({ activeQuiz: { lessonId, answers: [], startedAt: Date.now() } }),
      answerQuiz: (answerIndex) => {
        const aq = get().activeQuiz
        if (!aq) return
        set({ activeQuiz: { ...aq, answers: [...aq.answers, answerIndex] } })
      },
      clearQuiz: () => set({ activeQuiz: null, activeTest: null }),

      // ── Reset (dev) ──
      reset: () => set(initialState),
    }),
    { name: 'korean-app-state' }
  )
)

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getTodayUzb() {
  return new Date(new Date().toLocaleString('en', { timeZone: 'Asia/Tashkent' })).toDateString()
}
function getYesterdayUzb() {
  const d = new Date(new Date().toLocaleString('en', { timeZone: 'Asia/Tashkent' }))
  d.setDate(d.getDate() - 1)
  return d.toDateString()
}
function getWeekStart() {
  const d = new Date(new Date().toLocaleString('en', { timeZone: 'Asia/Tashkent' }))
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toDateString()
}

export const getLessonStatus = (state, lessonId) => {
  if (lessonId.startsWith('topik')) {
    const parts = lessonId.split('-')
    const levelId = parseInt(parts[1])
    return state.topikProgress[levelId]?.lessonProgress[lessonId] || 'locked'
  }
  return state.epsProgress.lessonProgress[lessonId] || 'locked'
}
