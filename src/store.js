import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Telegram WebApp bootstrap ─────────────────────────────────────
export function initTelegramApp() {
  try {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#0f0f1a')
      tg.setBackgroundColor('#0f0f1a')
    }
  } catch (e) {}
}

export function getTelegramUser() {
  try {
    const tg = window.Telegram?.WebApp
    const u = tg?.initDataUnsafe?.user
    if (u) return { name: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}`, avatar: u.photo_url || '', id: u.id }
  } catch (e) {}
  return { name: '', avatar: '', id: null }
}

// ── Helper: barcha darslarni available qilish ─────────────────────
function makeAllAvailable(levelId) {
  return Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [`topik-${levelId}-${i + 1}`, 'available'])
  )
}

function makeFirstAvailable(levelId) {
  return {
    [`topik-${levelId}-1`]: 'available',
    ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`topik-${levelId}-${i + 2}`, 'locked']))
  }
}

// ── Initial topik progress ────────────────────────────────────────
const initialTopikProgress = {
  1: {
    lessonProgress: makeFirstAvailable(1),
    testStatus: 'locked', testScore: null, testAttempts: [],
  },
  ...Object.fromEntries(Array.from({ length: 5 }, (_, li) => [li + 2, {
    lessonProgress: Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`topik-${li + 2}-${i + 1}`, 'locked'])
    ),
    testStatus: 'locked', testScore: null, testAttempts: [],
  }])),
}

// ── STORE ─────────────────────────────────────────────────────────
const initialState = {
  isSubscribed: false,
  onboardingDone: false,
  selectedTrack: null,
  activeTrack: 'topik',
  user: { name: '', avatar: '' },
  topikProgress: initialTopikProgress,
  epsProgress: {
    lessonProgress: {
      'eps-1': 'available',
      ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`eps-${i + 2}`, 'locked']))
    },
    finalTestStatus: 'locked', finalTestScore: null, finalTestAttempts: [],
  },
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  weeklyXp: 0,
  weekStart: null,
  activeQuiz: null,
  activeTest: null,
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

      // ── Premium aktivlashtirish ──
      // Premium bo'lsa TOPIK 2 darslarini ham 'available' qilamiz
      activatePremium: (days = -1) => {
        const s = get()
        let expiry = null
        if (days > 0) {
          const d = new Date()
          d.setDate(d.getDate() + days)
          expiry = d.toISOString()
        }

        // TOPIK 2 barcha darslarini unlock qilamiz
        const updatedTopik = { ...s.topikProgress }
        for (let lvl = 2; lvl <= 6; lvl++) {
          const current = updatedTopik[lvl]
          // Faqat hali hech biri available/done bo'lmagan bo'lsa unlock qilamiz
          const hasProgress = Object.values(current.lessonProgress).some(v => v !== 'locked')
          if (!hasProgress) {
            updatedTopik[lvl] = {
              ...current,
              lessonProgress: makeFirstAvailable(lvl)
            }
          }
        }

        set({
          isPremium: true,
          premiumExpiry: expiry,
          topikProgress: updatedTopik
        })
      },

      // ── EPS barcha darslarini unlock (Premium) ──
      unlockEpsForPremium: () => {
        const s = get()
        const hasEpsProgress = Object.values(s.epsProgress.lessonProgress).some(v => v !== 'locked')
        if (!hasEpsProgress) {
          set({
            epsProgress: {
              ...s.epsProgress,
              lessonProgress: Object.fromEntries(
                Array.from({ length: 10 }, (_, i) => [`eps-${i + 1}`, 'available'])
              )
            }
          })
        }
      },

      // ── XP & Streak ──
      addXp: (amount) => {
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
        let xpEarned = 20
        if (isPerfect) xpEarned += 10
        get().addXp(xpEarned)

        if (isTopik) {
          const parts = lessonId.split('-')
          const levelId = parseInt(parts[1])
          const lessonNum = parseInt(parts[2])
          const lvl = { ...s.topikProgress[levelId] }
          const lp = { ...lvl.lessonProgress }
          lp[lessonId] = 'done'
          if (lessonNum < 10) {
            const nextId = `topik-${levelId}-${lessonNum + 1}`
            if (lp[nextId] === 'locked') lp[nextId] = 'available'
          }
          const allDone = Array.from({ length: 10 }, (_, i) => `topik-${levelId}-${i + 1}`).every(id => lp[id] === 'done')
          set({
            topikProgress: {
              ...s.topikProgress,
              [levelId]: { ...lvl, lessonProgress: lp, testStatus: allDone ? 'available' : lvl.testStatus },
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

      // ── Level Test ──
      submitTest: (testId, score) => {
        const s = get()
        const passed = score >= 60
        if (testId.startsWith('topik-test-')) {
          const levelId = parseInt(testId.replace('topik-test-', ''))
          const lvl = { ...s.topikProgress[levelId] }
          const attempts = [...(lvl.testAttempts || []), { score, date: new Date().toISOString() }]
          const bestScore = Math.max(score, lvl.testScore || 0)
          if (passed) get().addXp(100)
          if (passed && levelId < 6) {
            const nextLvl = { ...s.topikProgress[levelId + 1] }
            const firstId = `topik-${levelId + 1}-1`
            nextLvl.lessonProgress = { ...nextLvl.lessonProgress, [firstId]: 'available' }
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
          if (passed) get().addXp(100)
          set({
            epsProgress: { ...ep, finalTestStatus: passed ? 'done' : 'available', finalTestScore: Math.max(score, ep.finalTestScore || 0), finalTestAttempts: attempts },
          })
        }
      },

      // ── Referral ──
      addReferral: () => {
        const s = get()
        const newCount = s.referralCount + 1
        const newDays = Math.floor(newCount / 10) * 30
        if (newDays > s.referralDays) get().activatePremium(newDays - s.referralDays)
        set({ referralCount: newCount, referralDays: newDays })
      },

      // ── Quiz session ──
      startQuiz: (lessonId) => set({ activeQuiz: { lessonId, answers: [], startedAt: Date.now() } }),
      answerQuiz: (answerIndex) => {
        const aq = get().activeQuiz
        if (!aq) return
        set({ activeQuiz: { ...aq, answers: [...aq.answers, answerIndex] } })
      },
      clearQuiz: () => set({ activeQuiz: null, activeTest: null }),

      // ── Reset ──
      reset: () => set(initialState),
    }),
    { name: 'korean-app-state' }
  )
)

// ── Helpers ───────────────────────────────────────────────────────
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

// ── TOPIK_LEVELS, EPS_LESSONS, EPS_FINAL_TEST ─────────────────────
// Bu ma'lumotlar Home.jsx, LearningPath.jsx, TestScreen.jsx da ishlatiladi

export const TOPIK_LEVELS = Array.from({ length: 6 }, (_, li) => ({
  id: li + 1,
  title: `${li + 1}-daraja`,
  description: ['Boshlang\'ich', 'Asosiy', 'O\'rta', 'Yuqori o\'rta', 'Ilg\'or', 'Ekspert'][li],
  lessons: Array.from({ length: 10 }, (_, i) => ({
    id: `topik-${li + 1}-${i + 1}`,
    levelId: li + 1,
    number: i + 1,
    title: `${li + 1}-daraja, ${i + 1}-dars`,
    xp: 10,
  })),
  test: {
    id: `topik-test-${li + 1}`,
    title: `${li + 1}-daraja yakuniy testi`,
    passMark: 60,
    questions: Array.from({ length: 10 }, (_, i) => ({
      question: `${li + 1}-daraja test savoli ${i + 1}`,
      options: ['A variant', 'B variant', 'C variant', 'D variant'],
      correct: i % 4,
    })),
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
  }
})

export const EPS_FINAL_TEST = {
  id: 'eps-final',
  title: 'EPS-TOPIK yakuniy testi',
  passMark: 60,
  questions: Array.from({ length: 10 }, (_, i) => ({
    question: `EPS test savoli ${i + 1}`,
    options: ['A variant', 'B variant', 'C variant', 'D variant'],
    correct: i % 4,
  })),
}
