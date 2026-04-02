import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useStore, getTelegramUser } from './store'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import LearningPath from './screens/LearningPath'
import Lesson from './screens/Lesson'
import TestScreen from './screens/TestScreen'
import { Leaderboard, Profile, Review, Referral } from './screens/OtherScreens'
import Premium from './screens/Premium'
import BottomNav from './components/BottomNav'
import Leaderboard from './screens/Leaderboard'
// Routes ichiga:
<Route path="/leaderboard" element={<Leaderboard />} />
const SHOW_NAV = ['/', '/path', '/learning-path', '/leaderboard', '/profile']

function AppInner() {
  const { isSubscribed, onboardingDone, activeTrack, setActiveTrack, setUser, user } = useStore()
  const location = useLocation()
  const showNav = SHOW_NAV.includes(location.pathname)

  useEffect(() => {
    // Pull Telegram user on first mount + register with backend
    const tgUser = getTelegramUser()
    if (tgUser.name && !user.name) setUser(tgUser)
    if (tgUser.id) {
      import('./api.js').then(({ registerUser }) => {
        const refCode = new URLSearchParams(window.location.search).get('start') ||
          window.Telegram?.WebApp?.initDataUnsafe?.start_param || ''
        registerUser({
          user_id: tgUser.id,
          first_name: tgUser.name.split(' ')[0],
          last_name: tgUser.name.split(' ').slice(1).join(' ') || undefined,
          referral_code: refCode || undefined,
        }).catch(() => {})
      }).catch(() => {})
    }

    // ✅ FIX: agar onboardingDone=true lekin activeTrack=null bo'lsa — tuzat
    if (onboardingDone && !activeTrack) {
      setActiveTrack('topik')
    }
  }, [])

  // ChannelGate disabled
  if (!onboardingDone) return <Onboarding />

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/path" element={<LearningPath />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/test/:testId" element={<TestScreen />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/review" element={<Review />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/referral" element={<Referral />} />
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
