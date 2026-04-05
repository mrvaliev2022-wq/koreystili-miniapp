import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export function getTgUser() {
  try {
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (u) return {
      id: String(u.id),
      name: u.first_name + (u.last_name ? ' ' + u.last_name : ''),
      username: u.username || '',
      photo: u.photo_url || ''
    }
  } catch {}
  return { id: '0', name: "O'quvchi", username: '', photo: '' }
}

export const useStore = create(
  persist(
    (set, get) => ({
      user: { id: '0', name: '', username: '', photo: '' },
      setUser: (user) => set({ user }),

      onboardingDone: false,
      activeTrack: 'topik',
      completeOnboarding: (track) => set({ onboardingDone: true, activeTrack: track }),
      setActiveTrack: (track) => set({ activeTrack: track }),

      xp: 0,
      streak: 0,
      addXp: (amount) => set(s => ({ xp: s.xp + amount })),
      setStreak: (streak) => set({ streak }),

      isPremium: false,
      premiumExpiry: null,
      activatePremium: (days) => {
        if (days === -1) {
          set({ isPremium: true, premiumExpiry: null })
        } else {
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + days)
          set({ isPremium: true, premiumExpiry: expiry.toISOString() })
        }
      },

      topikProgress: {
        1: { lessonProgress: { 'topik-1-1': 'available' } },
        2: { lessonProgress: {} },
        3: { lessonProgress: {} },
        4: { lessonProgress: {} },
        5: { lessonProgress: {} },
        6: { lessonProgress: {} },
      },

      epsProgress: {
        lessonProgress: { 'eps-1': 'available' }
      },

      completeLesson: (lessonId, score, isPerfect) => {
        const xpGain = isPerfect ? 30 : 20
        set(s => ({ xp: s.xp + xpGain }))

        if (lessonId.startsWith('topik')) {
          const parts = lessonId.split('-')
          const lvl = parseInt(parts[1])
          const num = parseInt(parts[2])
          const nextNum = num + 1
          const nextId = nextNum <= 10 ? `topik-${lvl}-${nextNum}` : `topik-${lvl + 1}-1`

          set(s => {
            const newTopik = { ...s.topikProgress }
            newTopik[lvl] = {
              lessonProgress: {
                ...newTopik[lvl]?.lessonProgress,
                [lessonId]: 'done',
              }
            }
            if (nextNum <= 10) {
              newTopik[lvl].lessonProgress[nextId] = 'available'
            } else if (lvl < 6) {
              newTopik[lvl + 1] = {
                lessonProgress: {
                  ...newTopik[lvl + 1]?.lessonProgress,
                  [nextId]: 'available'
                }
              }
            }
            return { topikProgress: newTopik }
          })
        }

        if (lessonId.startsWith('eps') || lessonId.startsWith('alpha')) {
          const allIds = [
            ...Array.from({ length: 7 }, (_, i) => `alpha-${i + 1}`),
            ...Array.from({ length: 30 }, (_, i) => `eps-${i + 1}`),
            ...Array.from({ length: 30 }, (_, i) => `eps2-${i + 11}`),
          ]
          const idx = allIds.indexOf(lessonId)
          const nextId = idx >= 0 && idx < allIds.length - 1 ? allIds[idx + 1] : null

          set(s => ({
            epsProgress: {
              lessonProgress: {
                ...s.epsProgress.lessonProgress,
                [lessonId]: 'done',
                ...(nextId ? { [nextId]: 'available' } : {})
              }
            }
          }))
        }
      },

      referralCode: '',
      setReferralCode: (code) => set({ referralCode: code }),
    }),
    { name: 'koreystili-v1' }
  )
)
