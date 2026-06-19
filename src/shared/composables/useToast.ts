import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let nextId = 1

function show(message: string, type: ToastType = 'info', durationMs = 4000) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  window.setTimeout(() => dismiss(id), durationMs)
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

export function useToast() {
  return { toasts, show, dismiss }
}

export function notifySuccess(message: string, durationMs = 6000) {
  show(message, 'success', durationMs)
}

export function notifyError(message: string) {
  show(message, 'error')
}

export function notifyInfo(message: string) {
  show(message, 'info')
}
