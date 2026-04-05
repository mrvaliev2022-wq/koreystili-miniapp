import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useStore, getTgUser } from './store'
import { registerUser, checkPremium } from './api'

import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import LearningPath from './screens/LearningPath'
import Lesson from './screens/Lesson'
import Premium from './screens/Premium'
import Leaderboard from './screens/Leaderboard'
import Profile from './screens/Profile'
import BottomNav from './components/BottomNav'

const SHOW_NAV = ['/', '/path', '/leaderboard', '/profile']

function AppInner() {
  const { onboardingDone, setUser, activatePremium } = useStore()
  const location = useLocation()
  const showNav = SHOW_NAV.includes(location.pathname)

  useEffect(() => {
    // Telegram user olish va register qilish
    const init = async () => {
      const tgUser = getTgUser()
      if (tgUser.name) setUser(tgUser)

      if (tgUser.id && tgUser.id !== '0') {
        // Register
        await registerUser({
          user_id: tgUser.id,
          first_name: tgUser.name.split(' ')[0],
          last_name: tgUser.name.split(' ').slice(1).join(' ') || undefined,
          username: tgUser.username || undefined,
        }).catch(() => {})

        // Premium tekshirish
        const isPrem = await checkPremium()
        if (isPrem) activatePremium(-1)
      }
    }

    init()
    // 1 soniya keyin qayta urinish (Telegram sekin yuklanishi uchun)
    const t = setTimeout(init, 1000)
    return () => clearTimeout(t)
  }, [])

  if (!onboardingDone) return <Onboarding />

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/path" element={<LearningPath />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
