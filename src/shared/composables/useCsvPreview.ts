import { ref, computed, watch, type Ref } from 'vue'
import { http } from '../utils/http'
import { getSessionId } from '../utils/session'
import {
  parseDominioCsv,
  summarizeCsvRows,
  filterCsvRows,
  paginateRows,
  getTotalPages,
  type CsvPreviewRow,
  type CsvPreviewSummary,
  type CsvPreviewViewMode,
} from '../utils/csvPreview'

const DEFAULT_PAGE_SIZE = 25
const RAW_DISPLAY_LIMIT = 300

export function useCsvPreview(options: {
  visible: Ref<boolean>
  fileName: Ref<string | undefined>
}) {
  const rawText = ref('')
  const rows = ref<CsvPreviewRow[]>([])
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const viewMode = ref<CsvPreviewViewMode>('table')
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  const filteredRows = computed(() => filterCsvRows(rows.value, searchQuery.value))
  const summary = computed<CsvPreviewSummary>(() => summarizeCsvRows(rows.value))
  const filteredSummary = computed(() => summarizeCsvRows(filteredRows.value))
  const totalPages = computed(() => getTotalPages(filteredRows.value.length, pageSize.value))
  const paginatedRows = computed(() => paginateRows(filteredRows.value, page.value, pageSize.value))

  const rawLineCount = computed(() => rawText.value.split(/\r?\n/).filter(Boolean).length)

  const rawPreviewLines = computed(() => {
    const allLines = rawText.value.split(/\r?\n/).filter(Boolean)
    let lines = allLines

    if (searchQuery.value.trim()) {
      const term = searchQuery.value.trim().toLowerCase()
      lines = allLines.filter((line) => line.toLowerCase().includes(term))
      return lines
    }

    if (lines.length > RAW_DISPLAY_LIMIT) {
      return lines.slice(0, RAW_DISPLAY_LIMIT)
    }

    return lines
  })

  const rawTruncated = computed(
    () => !searchQuery.value.trim() && rawLineCount.value > RAW_DISPLAY_LIMIT
  )

  const displayRangeLabel = computed(() => {
    const total = filteredRows.value.length
    if (total === 0) return '0 linhas'
    const start = (page.value - 1) * pageSize.value + 1
    const end = Math.min(page.value * pageSize.value, total)
    return `${start}–${end} de ${total}`
  })

  async function loadPreview() {
    if (!options.visible.value) return

    loading.value = true
    error.value = ''
    rawText.value = ''
    rows.value = []
    page.value = 1

    try {
      const sessionId = getSessionId()
      const response = await http.get('/api/download/download', {
        responseType: 'text',
        params: options.fileName.value ? { file: options.fileName.value } : undefined,
        headers: { 'X-User-Session': sessionId },
      })

      const text = typeof response.data === 'string' ? response.data : ''
      rawText.value = text
      rows.value = parseDominioCsv(text)

      if (rows.value.length === 0 && text.trim()) {
        error.value = 'O arquivo não contém linhas válidas no formato Domínio.'
      }
    } catch {
      error.value = 'Não foi possível carregar a pré-visualização. Tente baixar o arquivo ou processe novamente.'
    } finally {
      loading.value = false
    }
  }

  function setViewMode(mode: CsvPreviewViewMode) {
    viewMode.value = mode
  }

  function setPage(next: number) {
    page.value = Math.min(Math.max(1, next), totalPages.value)
  }

  function setPageSize(size: number) {
    pageSize.value = size
    page.value = 1
  }

  watch(options.visible, (visible) => {
    if (visible) loadPreview()
  })

  watch(searchQuery, () => {
    page.value = 1
  })

  watch(options.fileName, () => {
    if (options.visible.value) loadPreview()
  })

  return {
    rawText,
    rows,
    loading,
    error,
    searchQuery,
    viewMode,
    page,
    pageSize,
    filteredRows,
    summary,
    filteredSummary,
    totalPages,
    paginatedRows,
    rawPreviewLines,
    rawTruncated,
    rawLineCount,
    displayRangeLabel,
    loadPreview,
    setViewMode,
    setPage,
    setPageSize,
  }
}
