import { ref, computed } from 'vue'
import type { UploadJobStatus } from '../../infrastructure/services/UploadService'

export type JobProgressState = {
  state: UploadJobStatus['state'] | 'idle'
  elapsedSeconds: number
  message: string
}

export function useJobProgress() {
  const jobState = ref<JobProgressState>({
    state: 'idle',
    elapsedSeconds: 0,
    message: '',
  })

  let elapsedTimer: ReturnType<typeof setInterval> | null = null

  const progressLabel = computed(() => {
    switch (jobState.value.state) {
      case 'Pending':
        return 'Na fila…'
      case 'Processing':
        return 'Processando…'
      case 'Completed':
        return 'Concluído'
      case 'Failed':
        return 'Falhou'
      default:
        return 'Processando…'
    }
  })

  function startTracking(initialState: UploadJobStatus['state'] = 'Pending') {
    stopTracking()
    jobState.value = { state: initialState, elapsedSeconds: 0, message: progressLabel.value }
    elapsedTimer = setInterval(() => {
      jobState.value.elapsedSeconds += 1
    }, 1000)
  }

  function updateFromStatus(status: UploadJobStatus) {
    jobState.value.state = status.state
    jobState.value.message = progressLabel.value
  }

  function stopTracking() {
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = null
    }
  }

  function reset() {
    stopTracking()
    jobState.value = { state: 'idle', elapsedSeconds: 0, message: '' }
  }

  return { jobState, progressLabel, startTracking, updateFromStatus, stopTracking, reset }
}
