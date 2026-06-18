const SESSION_STORAGE_KEY = 'userSessionId'

export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }
  return sessionId
}

export function resetSessionId(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}
