import { ref, onMounted } from 'vue'

export type ConversionRecord = {
  id: string
  fileName: string
  fileType: 'PDF' | 'OFX'
  outputFile: string
  completedAt: string
  status: 'completed' | 'failed'
}

const STORAGE_KEY = 'fiscal2csv_conversion_history'
const MAX_RECORDS = 20

const history = ref<ConversionRecord[]>([])

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    history.value = raw ? (JSON.parse(raw) as ConversionRecord[]) : []
  } catch {
    history.value = []
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value.slice(0, MAX_RECORDS)))
}

export function useConversionHistory() {
  onMounted(loadHistory)

  function addRecord(record: Omit<ConversionRecord, 'id' | 'completedAt'>) {
    loadHistory()
    history.value.unshift({
      ...record,
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
    })
    history.value = history.value.slice(0, MAX_RECORDS)
    persist()
  }

  function clearHistory() {
    history.value = []
    persist()
  }

  return { history, addRecord, clearHistory, loadHistory }
}
