const BASE = import.meta.env.VITE_API_URL || 'https://topik-epsbackend-production.up.railway.app/api'

function getUserId() {
  try {
    const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    return id ? String(id) : '0'
  } catch {
    return '0'
  }
}

// Register user
export async function registerUser(userData) {
  try {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return await res.json()
  } catch { return null }
}

// Load lesson
export async function getLesson(lessonId) {
  const userId = getUserId()
  const res = await fetch(`${BASE}/lessons/${lessonId}?user_id=${userId}`)
  return await res.json()
}

// Load quiz
export async function getQuiz(lessonId) {
  const userId = getUserId()
  const res = await fetch(`${BASE}/lessons/${lessonId}/quiz?user_id=${userId}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

// Submit lesson complete
export async function submitLesson(lessonId, score, isPerfect, track) {
  const userId = getUserId()
  try {
    await fetch(`${BASE}/progress/lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, lesson_id: lessonId, score, is_perfect: isPerfect, track })
    })
    // Streak checkin
    await fetch(`${BASE}/streak/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, xp_earned: isPerfect ? 30 : 20 })
    })
  } catch {}
}

// Load progress
export async function loadProgress() {
  const userId = getUserId()
  if (userId === '0') return null
  try {
    const res = await fetch(`${BASE}/progress?user_id=${userId}`)
    return await res.json()
  } catch { return null }
}

// Check premium
export async function checkPremium() {
  const userId = getUserId()
  if (userId === '0') return false
  try {
    const res = await fetch(`${BASE}/payment/daily-check?user_id=${userId}`)
    const data = await res.json()
    return data.is_premium || false
  } catch { return false }
}

// Leaderboard
export async function getLeaderboard() {
  const userId = getUserId()
  try {
    const res = await fetch(`${BASE}/leaderboard/global?user_id=${userId}`)
    return await res.json()
  } catch { return { ok: false, data: [] } }
}

// Sync XP to leaderboard
export async function syncXp(xp, streak) {
  const userId = getUserId()
  if (userId === '0') return
  try {
    const tg = window.Telegram?.WebApp?.initDataUnsafe?.user
    await fetch(`${BASE}/leaderboard/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        username: tg?.username || '',
        first_name: tg?.first_name || 'Foydalanuvchi',
        avatar_url: tg?.photo_url || '',
        xp,
        streak
      })
    })
  } catch {}
}

// Create payment invoice
export async function createInvoice(plan) {
  const userId = getUserId()
  try {
    const res = await fetch(`${BASE}/payment/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, plan })
    })
    return await res.json()
  } catch { return null }
}
