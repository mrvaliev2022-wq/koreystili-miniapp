const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Get Telegram user_id from WebApp SDK
function getTgUserId() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null
  } catch { return null }
}

async function apiFetch(path, opts = {}) {
  const userId = getTgUserId()
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify({ ...opts.body, user_id: userId }) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Auth & Registration ────────────────────────────────────────
export async function registerUser(userData) {
  return apiFetch('/register', { method: 'POST', body: userData })
}

export async function verifySubscription() {
  const userId = getTgUserId()
  return apiFetch('/verify-subscription', { method: 'POST', body: { user_id: userId } })
}

// ── Progress ───────────────────────────────────────────────────
export async function loadProgress() {
  const userId = getTgUserId()
  if (!userId) return null
  return apiFetch(`/progress?user_id=${userId}`)
}

export async function submitLessonComplete(lessonId, score, isPerfect, track) {
  const result = await apiFetch('/progress/lesson', {
    method: 'POST',
    body: { lesson_id: lessonId, score, is_perfect: isPerfect, track },
  })
  // Streak checkin
  const userId = getTgUserId()
  if (userId) {
    apiFetch('/streak/checkin', {
      method: 'POST',
      body: { user_id: userId, xp_earned: isPerfect ? 30 : 20 },
    }).catch(() => {})
  }
  return result
}

export async function streakCheckin(xpEarned = 20) {
  const userId = getTgUserId()
  if (!userId) return null
  return apiFetch('/streak/checkin', {
    method: 'POST',
    body: { user_id: userId, xp_earned: xpEarned },
  }).catch(() => null)
}

export async function streakInfo() {
  const userId = getTgUserId()
  if (!userId) return null
  return apiFetch(`/streak/info?user_id=${userId}`).catch(() => null)
}

export async function streakFreeze() {
  const userId = getTgUserId()
  if (!userId) return null
  return apiFetch('/streak/freeze', {
    method: 'POST',
    body: { user_id: userId },
  }).catch(() => null)
}

export async function submitTestResult(testId, score, track) {
  return apiFetch('/progress/test', {
    method: 'POST',
    body: { test_id: testId, score, track },
  })
}

// ── Leaderboard ────────────────────────────────────────────────
export async function fetchLeaderboard() {
  const userId = getTgUserId()
  return apiFetch(`/leaderboard?user_id=${userId}`)
}

// ── Referral ───────────────────────────────────────────────────
export async function completeLesson1Referral() {
  return apiFetch('/referral/complete-lesson1', { method: 'POST', body: {} })
}

// ── Payment ────────────────────────────────────────────────────
export async function createPaymentInvoice(plan) {
  return apiFetch('/payment/create-invoice', { method: 'POST', body: { plan } })
}

export async function verifyPayment(chargeId) {
  return apiFetch('/payment/verify', { method: 'POST', body: { charge_id: chargeId } })
}

// ── Health check ───────────────────────────────────────────────
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE.replace('/api', '')}/health`)
    return res.ok
  } catch { return false }
}
