import { onMounted, onUnmounted } from 'vue'
import { notifyError } from './useToast'

const SESSION_EXPIRY_KEY = 'auth_session_expiration'

export function setSessionExpiration(isoDate: string) {
  localStorage.setItem(SESSION_EXPIRY_KEY, isoDate)
}

export function clearSessionExpiration() {
  localStorage.removeItem(SESSION_EXPIRY_KEY)
}

export function useSessionExpiryWarning(warnMinutesBefore = 5) {
  let timer: ReturnType<typeof setInterval> | null = null
  let warned = false

  function checkExpiry() {
    const raw = localStorage.getItem(SESSION_EXPIRY_KEY)
    if (!raw || warned) return

    const expiration = new Date(raw)
    if (isNaN(expiration.getTime())) return

    const msUntilExpiry = expiration.getTime() - Date.now()
    const warnThresholdMs = warnMinutesBefore * 60 * 1000

    if (msUntilExpiry > 0 && msUntilExpiry <= warnThresholdMs) {
      warned = true
      notifyError('Sua sessão expira em breve. Salve seu trabalho e faça login novamente se necessário.')
    }
  }

  onMounted(() => {
    checkExpiry()
    timer = setInterval(checkExpiry, 60_000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
}
