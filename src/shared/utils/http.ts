import axios from 'axios'
import { getSessionId, resetSessionId } from './session'
import { mapApiErrorToUserMessage } from './errorMessages'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not defined. API calls may fail.')
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export function parseApiError(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  return mapApiErrorToUserMessage(error, fallback)
}

http.interceptors.request.use((config) => {
  if (!config.headers['X-User-Session']) {
    config.headers['X-User-Session'] = getSessionId()
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      resetSessionId()
      if (!window.location.pathname.startsWith('/access') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/access'
      }
    }
    return Promise.reject(error)
  }
)
