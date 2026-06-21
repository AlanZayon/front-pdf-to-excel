import { ref, computed, watch, type Ref } from 'vue'
import { http } from '../utils/http'
import { getSessionId } from '../utils/session'
import { HistoryService } from '../../infrastructure/services/HistoryService'
import {
  parseDominioCsv,
  summarizeCsvRows,
  filterCsvRows,
  paginateRows,
  getTotalPages,
  rowsToCsvText,
  applyRawTextToRows,
  syncCsvPreviewRow,
  parseValorInput,
  normalizeDominioDataInput,
  type CsvPreviewRow,
  type CsvPreviewSummary,
  type CsvPreviewViewMode,
  type EditableCsvField,
} from '../utils/csvPreview'

const DEFAULT_PAGE_SIZE = 100

export function useCsvPreview(options: {
  visible: Ref<boolean>
  fileName: Ref<string | undefined>
  jobId?: Ref<string | undefined>
}) {
  const rawText = ref('')
  const rows = ref<CsvPreviewRow[]>([])
  const baselineExportText = ref('')
  const rawEditText = ref('')
  const rawEditError = ref('')
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const viewMode = ref<CsvPreviewViewMode>('table')
  const isEditing = ref(false)
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  const filteredRows = computed(() => filterCsvRows(rows.value, searchQuery.value))
  const summary = computed<CsvPreviewSummary>(() => summarizeCsvRows(rows.value))
  const filteredSummary = computed(() => summarizeCsvRows(filteredRows.value))
  const totalPages = computed(() => getTotalPages(filteredRows.value.length, pageSize.value))
  const paginatedRows = computed(() => paginateRows(filteredRows.value, page.value, pageSize.value))

  const exportText = computed(() => rowsToCsvText(rows.value))

  const isDirty = computed(() => {
    if (!isEditing.value) return exportText.value !== baselineExportText.value
    if (viewMode.value === 'raw') {
      return rawEditText.value.trim() !== baselineExportText.value.trim()
    }
    return exportText.value !== baselineExportText.value
  })

  const rawDisplayText = computed(() => {
    const lines = rowsToCsvText(rows.value).split('\n').filter(Boolean)
    const term = searchQuery.value.trim().toLowerCase()
    if (!term) return lines.join('\n')
    return lines.filter((line) => line.toLowerCase().includes(term)).join('\n')
  })

  const displayRangeLabel = computed(() => {
    const total = filteredRows.value.length
    if (total === 0) return '0 linhas'
    const start = (page.value - 1) * pageSize.value + 1
    const end = Math.min(page.value * pageSize.value, total)
    return `${start}–${end} de ${total}`
  })

  function syncBaseline() {
    baselineExportText.value = rowsToCsvText(rows.value)
    rawEditText.value = baselineExportText.value
  }

  async function loadPreview() {
    if (!options.visible.value) return

    loading.value = true
    error.value = ''
    rawEditError.value = ''
    rawText.value = ''
    rows.value = []
    page.value = 1
    viewMode.value = 'table'
    isEditing.value = false

    try {
      let text = ''

      if (options.jobId?.value) {
        text = await HistoryService.fetchCsvTextByJobId(options.jobId.value)
      } else {
        const sessionId = getSessionId()
        const response = await http.get('/api/download/download', {
          responseType: 'text',
          params: options.fileName.value ? { file: options.fileName.value } : undefined,
          headers: { 'X-User-Session': sessionId },
        })
        text = typeof response.data === 'string' ? response.data : ''
      }

      rawText.value = text
      rows.value = parseDominioCsv(text)
      syncBaseline()

      if (rows.value.length === 0 && text.trim()) {
        error.value = 'O arquivo não contém linhas válidas no formato Domínio.'
      }
    } catch {
      error.value = 'Não foi possível carregar a pré-visualização. Tente baixar o arquivo ou processe novamente.'
    } finally {
      loading.value = false
    }
  }

  function updateRowField(lineNumber: number, field: EditableCsvField, value: string) {
    const index = rows.value.findIndex((row) => row.lineNumber === lineNumber)
    if (index === -1) return

    let patch: Partial<Pick<CsvPreviewRow, EditableCsvField>> = {}

    if (field === 'valor') {
      const parsed = parseValorInput(value)
      if (parsed === null) return
      patch = { valor: parsed }
    } else if (field === 'data') {
      patch = { data: normalizeDominioDataInput(value) }
    } else {
      patch = { [field]: value.trim() }
    }

    const updated = syncCsvPreviewRow(rows.value[index], patch)
    rows.value = rows.value.map((row, rowIndex) =>
      rowIndex === index ? { ...updated, lineNumber: row.lineNumber } : row
    )
  }

  function commitRawEdits(): boolean {
    const result = applyRawTextToRows(rawEditText.value)
    if (!result.ok) {
      rawEditError.value = result.message
      return false
    }

    rawEditError.value = ''
    rows.value = result.rows
    return true
  }

  function setViewMode(mode: CsvPreviewViewMode): boolean {
    if (mode === viewMode.value) return true

    if (isEditing.value && mode === 'table' && viewMode.value === 'raw') {
      if (!commitRawEdits()) return false
    }

    if (mode === 'raw') {
      rawEditText.value = rowsToCsvText(rows.value)
      rawEditError.value = ''
    }

    viewMode.value = mode
    return true
  }

  function enterEditMode() {
    rawEditText.value = rowsToCsvText(rows.value)
    rawEditError.value = ''
    isEditing.value = true
  }

  function exitEditMode(): boolean {
    if (isEditing.value && viewMode.value === 'raw') {
      if (!commitRawEdits()) return false
    }
    isEditing.value = false
    rawEditError.value = ''
    return true
  }

  function setPage(next: number) {
    page.value = Math.min(Math.max(1, next), totalPages.value)
  }

  function setPageSize(size: number) {
    pageSize.value = size
    page.value = 1
  }

  function discardEdits() {
    const result = applyRawTextToRows(baselineExportText.value)
    if (!result.ok) return
    rows.value = result.rows
    rawEditText.value = baselineExportText.value
    rawEditError.value = ''
    error.value = ''
    isEditing.value = false
  }

  function getDownloadText(): string | null {
    if (isEditing.value && viewMode.value === 'raw') {
      const result = applyRawTextToRows(rawEditText.value)
      if (!result.ok) {
        rawEditError.value = result.message
        return null
      }
      rawEditError.value = ''
      rows.value = result.rows
      rawEditText.value = rowsToCsvText(rows.value)
      return rawEditText.value
    }

    return rowsToCsvText(rows.value)
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

  if (options.jobId) {
    watch(options.jobId, () => {
      if (options.visible.value) loadPreview()
    })
  }

  return {
    rawText,
    rows,
    rawEditText,
    rawEditError,
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
    displayRangeLabel,
    isDirty,
    isEditing,
    rawDisplayText,
    loadPreview,
    updateRowField,
    setViewMode,
    enterEditMode,
    exitEditMode,
    setPage,
    setPageSize,
    discardEdits,
    getDownloadText,
  }
}
