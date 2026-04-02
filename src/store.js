import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Telegram WebApp bootstrap ─────────────────────────────────────
export function initTelegramApp() {
  try {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#f5f3ff')
      tg.setBackgroundColor('#f5f3ff')
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

// ── Helper: topik darslar ─────────────────────────────────────────
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

// ── Initial EPS progress (alpha 7ta + eps 30ta) ───────────────────
const initialEpsProgress = {
  lessonProgress: {
    'alpha-1': 'available',
    'alpha-2': 'locked',
    'alpha-3': 'locked',
    'alpha-4': 'locked',
    'alpha-5': 'locked',
    'alpha-6': 'locked',
    'alpha-7': 'locked',
    'eps-1':  'locked', 'eps-2':  'locked', 'eps-3':  'locked', 'eps-4':  'locked', 'eps-5':  'locked',
    'eps-6':  'locked', 'eps-7':  'locked', 'eps-8':  'locked', 'eps-9':  'locked', 'eps-10': 'locked',
    'eps-11': 'locked', 'eps-12': 'locked', 'eps-13': 'locked', 'eps-14': 'locked', 'eps-15': 'locked',
    'eps-16': 'locked', 'eps-17': 'locked', 'eps-18': 'locked', 'eps-19': 'locked', 'eps-20': 'locked',
    'eps-21': 'locked', 'eps-22': 'locked', 'eps-23': 'locked', 'eps-24': 'locked', 'eps-25': 'locked',
    'eps-26': 'locked', 'eps-27': 'locked', 'eps-28': 'locked', 'eps-29': 'locked', 'eps-30': 'locked',
    'eps2-11': 'locked', 'eps2-12': 'locked', 'eps2-13': 'locked', 'eps2-14': 'locked', 'eps2-15': 'locked',
    'eps2-16': 'locked', 'eps2-17': 'locked', 'eps2-18': 'locked', 'eps2-19': 'locked', 'eps2-20': 'locked',
    'eps2-21': 'locked', 'eps2-22': 'locked', 'eps2-23': 'locked', 'eps2-24': 'locked', 'eps2-25': 'locked',
    'eps2-26': 'locked', 'eps2-27': 'locked', 'eps2-28': 'locked', 'eps2-29': 'locked', 'eps2-30': 'locked',
    'eps2-31': 'locked', 'eps2-32': 'locked', 'eps2-33': 'locked', 'eps2-34': 'locked', 'eps2-35': 'locked',
    'eps2-36': 'locked', 'eps2-37': 'locked', 'eps2-38': 'locked', 'eps2-39': 'locked', 'eps2-40': 'locked',
  },
  finalTestStatus: 'locked',
  finalTestScore: null,
  finalTestAttempts: [],
}

// ── STORE ─────────────────────────────────────────────────────────
const initialState = {
  isSubscribed: false,
  onboardingDone: false,
  selectedTrack: null,
  activeTrack: 'topik',
  user: { name: '', avatar: '' },
  topikProgress: initialTopikProgress,
  epsProgress: initialEpsProgress,
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

// ── EPS lesson order (alpha 7ta + eps 30ta) ───────────────────────
const EPS_ORDER = [
  'alpha-1', 'alpha-2', 'alpha-3', 'alpha-4', 'alpha-5', 'alpha-6', 'alpha-7',
  'eps-1',  'eps-2',  'eps-3',  'eps-4',  'eps-5',  'eps-6',  'eps-7',  'eps-8',  'eps-9',  'eps-10',
  'eps-11', 'eps-12', 'eps-13', 'eps-14', 'eps-15', 'eps-16', 'eps-17', 'eps-18', 'eps-19', 'eps-20',
  'eps-21', 'eps-22', 'eps-23', 'eps-24', 'eps-25', 'eps-26', 'eps-27', 'eps-28', 'eps-29', 'eps-30',
  'eps2-11', 'eps2-12', 'eps2-13', 'eps2-14', 'eps2-15', 'eps2-16', 'eps2-17', 'eps2-18', 'eps2-19', 'eps2-20',
  'eps2-21', 'eps2-22', 'eps2-23', 'eps2-24', 'eps2-25', 'eps2-26', 'eps2-27', 'eps2-28', 'eps2-29', 'eps2-30',
  'eps2-31', 'eps2-32', 'eps2-33', 'eps2-34', 'eps2-35', 'eps2-36', 'eps2-37', 'eps2-38', 'eps2-39', 'eps2-40',
]

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setSubscribed: () => set({ isSubscribed: true }),
      completeOnboarding: (track) => {
        const code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase()
        set({ onboardingDone: true, selectedTrack: track, activeTrack: track, referralCode: code })
      },
      setActiveTrack: (track) => set({ activeTrack: track }),

      activatePremium: (days = -1) => {
        const s = get()
        let expiry = null
        if (days > 0) {
          const d = new Date()
          d.setDate(d.getDate() + days)
          expiry = d.toISOString()
        }
        const updatedTopik = { ...s.topikProgress }
        for (let lvl = 2; lvl <= 6; lvl++) {
          const current = updatedTopik[lvl]
          const hasProgress = Object.values(current.lessonProgress).some(v => v !== 'locked')
          if (!hasProgress) {
            updatedTopik[lvl] = { ...current, lessonProgress: makeFirstAvailable(lvl) }
          }
        }
        set({ isPremium: true, premiumExpiry: expiry, topikProgress: updatedTopik })
      },

      unlockEpsForPremium: () => {
        const s = get()
        const allAvailable = Object.fromEntries(EPS_ORDER.map(id => [id, 'available']))
        set({ epsProgress: { ...s.epsProgress, lessonProgress: allAvailable } })
      },

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
        set({ xp: s.xp + amount, weeklyXp: newWeeklyXp + amount, weekStart: newWeekStart, streak: newStreak, lastActiveDate: today })
      },

      completeLesson: (lessonId, score, isPerfect) => {
        const s = get()
        const isTopik = lessonId.startsWith('topik')
        const isEps = lessonId.startsWith('eps-') || lessonId.startsWith('alpha-') || lessonId.startsWith('eps2-')
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
          const ep = { ...s.epsProgress }
          const lp = { ...ep.lessonProgress }
          lp[lessonId] = 'done'
          const currentIdx = EPS_ORDER.indexOf(lessonId)
          if (currentIdx >= 0 && currentIdx < EPS_ORDER.length - 1) {
            const nextId = EPS_ORDER[currentIdx + 1]
            if (lp[nextId] === 'locked') lp[nextId] = 'available'
          }
          const epsOnly = EPS_ORDER.filter(id => id.startsWith('eps-'))
          const allEpsDone = epsOnly.every(id => lp[id] === 'done')
          set({
            epsProgress: {
              ...ep,
              lessonProgress: lp,
              finalTestStatus: allEpsDone ? 'available' : ep.finalTestStatus
            },
          })
        }
      },

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
            epsProgress: {
              ...ep,
              finalTestStatus: passed ? 'done' : 'available',
              finalTestScore: Math.max(score, ep.finalTestScore || 0),
              finalTestAttempts: attempts
            },
          })
        }
      },

      addReferral: () => {
        const s = get()
        const newCount = s.referralCount + 1
        const newDays = Math.floor(newCount / 10) * 30
        if (newDays > s.referralDays) get().activatePremium(newDays - s.referralDays)
        set({ referralCount: newCount, referralDays: newDays })
      },

      startQuiz: (lessonId) => set({ activeQuiz: { lessonId, answers: [], startedAt: Date.now() } }),
      answerQuiz: (answerIndex) => {
        const aq = get().activeQuiz
        if (!aq) return
        set({ activeQuiz: { ...aq, answers: [...aq.answers, answerIndex] } })
      },
      clearQuiz: () => set({ activeQuiz: null, activeTest: null }),
      reset: () => set(initialState),
    }),
    { name: 'korean-app-state-v3' }
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

// ── TOPIK_LEVELS ──────────────────────────────────────────────────
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
    questions: [],
  },
}))

// ── ALPHA_LESSONS (7 ta) ──────────────────────────────────────────
export const ALPHA_LESSONS = [
  { id: 'alpha-1', number: 1, title: '🔤 Unlilar 1 | ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ', xp: 10 },
  { id: 'alpha-2', number: 2, title: '🔤 Unlilar 2 | ㅐ ㅔ ㅑ ㅕ ㅛ ㅠ', xp: 10 },
  { id: 'alpha-3', number: 3, title: '🔤 Undoshlar 1 | ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ', xp: 10 },
  { id: 'alpha-4', number: 4, title: '🔤 Undoshlar 2 | ㅇ ㅈ ㅎ ㅋ ㅌ ㅍ ㅊ', xp: 10 },
  { id: 'alpha-5', number: 5, title: '🔤 Kuchli undoshlar | ㄲ ㄸ ㅃ ㅆ ㅉ', xp: 10 },
  { id: 'alpha-6', number: 6, title: '🔤 Bo\'g\'in tizimi | 음절 구조', xp: 10 },
  { id: 'alpha-7', number: 7, title: '🔤 Amaliy so\'zlar | EPS-TOPIK uchun', xp: 10 },
]

// ── EPS_LESSONS (30 ta) ───────────────────────────────────────────
export const EPS_LESSONS = [
  { id: 'eps-1',  number: 1,  title: '👋 O\'zini tanishtirish | 자기소개', xp: 20 },
  { id: 'eps-2',  number: 2,  title: '🛒 Kundalik buyumlar | 생활용품', xp: 20 },
  { id: 'eps-3',  number: 3,  title: '📍 Joylashuv va joylar | 위치와 장소', xp: 20 },
  { id: 'eps-4',  number: 4,  title: '🏃 Harakat va predmetlar | 동작과 사물', xp: 20 },
  { id: 'eps-5',  number: 5,  title: '📅 Sana va hafta kunlari | 날짜와 요일', xp: 20 },
  { id: 'eps-6',  number: 6,  title: '⏰ Kunlik faoliyat | 하루 일과', xp: 20 },
  { id: 'eps-7',  number: 7,  title: '🌤️ Fasllar va ob-havo | 계절과 날씨', xp: 20 },
  { id: 'eps-8',  number: 8,  title: '👨‍👩‍👧 Oila va do\'stlar | 가족과 친구', xp: 20 },
  { id: 'eps-9',  number: 9,  title: '🍜 Ovqat buyurtma | 음식 주문', xp: 20 },
  { id: 'eps-10', number: 10, title: '🛍️ Sotib olish | 물건 구입', xp: 20 },
  { id: 'eps-11', number: 11, title: '🏠 Uy ishlari | 집안일', xp: 20 },
  { id: 'eps-12', number: 12, title: '🚌 Jamoat transporti | 대중교통', xp: 20 },
  { id: 'eps-13', number: 13, title: '🏖️ Dam olish kunlari | 주말 활동', xp: 20 },
  { id: 'eps-14', number: 14, title: '🗺️ Yo\'l so\'rash | 길 찾기', xp: 20 },
  { id: 'eps-15', number: 15, title: '👕 Kiyim | 옷차림', xp: 20 },
  { id: 'eps-16', number: 16, title: '🏠 Uy topish | 집 구하기', xp: 20 },
  { id: 'eps-17', number: 17, title: '✈️ Ta\'til | 휴가', xp: 20 },
  { id: 'eps-18', number: 18, title: '🎯 Hobbi | 취미', xp: 20 },
  { id: 'eps-19', number: 19, title: '🍳 Ovqat tayyorlash | 요리', xp: 20 },
  { id: 'eps-20', number: 20, title: '📱 Internet va smartfon | 인터넷과 스마트폰', xp: 20 },
  { id: 'eps-21', number: 21, title: '🏥 Shifoxona | 병원', xp: 20 },
  { id: 'eps-22', number: 22, title: '💊 Dorixona | 약국', xp: 20 },
  { id: 'eps-23', number: 23, title: '📮 Pochta | 우체국', xp: 20 },
  { id: 'eps-24', number: 24, title: '🏦 Bank | 은행', xp: 20 },
  { id: 'eps-25', number: 25, title: '🏢 Chet ellik ishchilar markazi | 외국인 근로자 지원 기관', xp: 20 },
  { id: 'eps-26', number: 26, title: '🏠 Koreya yashash va ovqat madaniyati | 주거/음식 문화', xp: 20 },
  { id: 'eps-27', number: 27, title: '🎉 Koreya bayramlari | 한국의 기념일', xp: 20 },
  { id: 'eps-28', number: 28, title: '🎊 Koreya an\'anaviy bayramlari | 한국의 명절', xp: 20 },
  { id: 'eps-29', number: 29, title: '🙇 Koreya odob-qoidalari | 한국의 예절', xp: 20 },
  { id: 'eps-30', number: 30, title: '🎤 Koreya ommaviy madaniyati | 한국의 대중문화', xp: 20 },
]
export const EPS_LESSONS_2 = [
  { id: 'eps2-11', number: 31, title: "🧵 To'qimachilik | 섬유 제조", xp: 25 },
  { id: 'eps2-12', number: 32, title: "🪑 Mebel ishlab chiqarish | 가구 제작", xp: 25 },
  { id: 'eps2-13', number: 33, title: "🏗️ Qurilish ishlari | 건축 시공", xp: 25 },
  { id: 'eps2-14', number: 34, title: "🌊 Infratuzilma qurilishi | 토목 시공", xp: 25 },
  { id: 'eps2-15', number: 35, title: "🌾 Qishloq xo'jaligi | 농작물 재배", xp: 25 },
  { id: 'eps2-16', number: 36, title: "🐄 Chorvachilik | 축산", xp: 25 },
  { id: 'eps2-17', number: 37, title: "🐟 Baliqchilik | 어업", xp: 25 },
  { id: 'eps2-18', number: 38, title: "🌿 Issiqxona | 시설 원예", xp: 25 },
  { id: 'eps2-19', number: 39, title: "🪵 Yog'och ishlash | 목재 가공", xp: 25 },
  { id: 'eps2-20', number: 40, title: "♻️ Chiqindi qayta ishlash | 재활용", xp: 25 },
  { id: 'eps2-21', number: 41, title: "🧵 To'qimachilik | 섬유 제조", xp: 25 },
  { id: 'eps2-22', number: 42, title: "🪑 Mebel ishlab chiqarish | 가구 제작", xp: 25 },
  { id: 'eps2-23', number: 43, title: "🏗️ Qurilish ishlari | 건축 시공", xp: 25 },
  { id: 'eps2-24', number: 44, title: "🌊 Infratuzilma qurilishi | 토목 시공", xp: 25 },
  { id: 'eps2-25', number: 45, title: "🌾 Qishloq xo'jaligi | 농작물 재배", xp: 25 },
  { id: 'eps2-26', number: 46, title: "🐄 Chorvachilik | 축산", xp: 25 },
  { id: 'eps2-27', number: 47, title: "🐟 Baliqchilik | 어업", xp: 25 },
  { id: 'eps2-28', number: 48, title: "🌿 Issiqxona | 시설 원예", xp: 25 },
  { id: 'eps2-29', number: 49, title: "🪵 Yog'och ishlash | 목재 가공", xp: 25 },
  { id: 'eps2-30', number: 50, title: "♻️ Chiqindi qayta ishlash | 재활용", xp: 25 },
  { id: 'eps2-31', number: 51, title: "🏨 Mehmonxona xizmati | 숙박 서비스", xp: 25 },
  { id: 'eps2-32', number: 52, title: "🍳 Ovqat tayyorlash | 음식 조리", xp: 25 },
  { id: 'eps2-33', number: 53, title: "⚠️ Xavfsizlik belgilari | 산업 안전 및 보건 표지", xp: 25 },
  { id: 'eps2-34', number: 54, title: "🦺 Xavfsizlik qoidalari | 산업 안전 및 보건 수칙", xp: 25 },
  { id: 'eps2-35', number: 55, title: "🧤 Xavfsizlik jihozlari | 산업 안전 및 위생 장비", xp: 25 },
  { id: 'eps2-36', number: 56, title: "🏥 Mehnat shikastlanishi | 산업 재해", xp: 25 },
  { id: 'eps2-37', number: 57, title: "📋 Mehnat shartnomasi | 근로 계약", xp: 25 },
  { id: 'eps2-38', number: 58, title: "💰 Ish haqi | 임금", xp: 25 },
  { id: 'eps2-39', number: 59, title: "🏢 Ish joyi huquqlari | 근로자 권리", xp: 25 },
  { id: 'eps2-40', number: 60, title: "🎓 Malaka oshirish | 직업 훈련", xp: 25 },
]
export const EPS_FINAL_TEST = {
  id: 'eps-final',
  title: 'EPS-TOPIK 1 yakuniy testi',
  passMark: 60,
  questions: [],
}
