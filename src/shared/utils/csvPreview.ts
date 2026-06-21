export type CsvPreviewRow = {
  lineNumber: number
  tipo: string
  data: string
  dataFormatted: string
  debito: string
  credito: string
  valor: number
  valorFormatted: string
  descricao: string
  rawLine: string
}

export type CsvPreviewSummary = {
  totalRows: number
  totalValor: number
  totalValorFormatted: string
  dateMin: string | null
  dateMax: string | null
  uniqueDescriptions: number
}

export type CsvPreviewViewMode = 'table' | 'raw'

export type EditableCsvField = 'tipo' | 'data' | 'debito' | 'credito' | 'valor' | 'descricao'

const DOMINIO_COLUMNS = ['Tipo', 'Data', 'Débito', 'Crédito', 'Valor', '', 'Histórico'] as const

export function getDominioColumnLabels(): readonly string[] {
  return DOMINIO_COLUMNS
}

export function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }

  fields.push(current)
  return fields
}

export function formatDominioDate(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 8) return raw
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  return `${day}/${month}/${year}`
}

export function parseDominioDate(raw: string): Date | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 8) return null
  const day = parseInt(digits.slice(0, 2), 10)
  const month = parseInt(digits.slice(2, 4), 10) - 1
  const year = parseInt(digits.slice(4, 8), 10)
  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null
  return date
}

export function formatCurrencyBrl(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatValorForInput(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

export function parseValorInput(input: string): number | null {
  const normalized = input.trim().replace(/\./g, '').replace(',', '.')
  if (!normalized) return null
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : null
}

export function normalizeDominioDataInput(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 8) return digits
  return digits.slice(0, 8)
}

export function serializeDominioRow(
  row: Pick<CsvPreviewRow, 'tipo' | 'data' | 'debito' | 'credito' | 'valor' | 'descricao'>
): string {
  const descricao = row.descricao ?? ''
  const descricaoField =
    descricao.includes(',') || descricao.includes('"') || descricao.includes('\n')
      ? `"${descricao.replace(/"/g, '""')}"`
      : descricao

  return `${row.tipo},${row.data},${row.debito},${row.credito},${formatValorForInput(row.valor)},,${descricaoField}`
}

export function syncCsvPreviewRow(
  row: CsvPreviewRow,
  patch: Partial<Pick<CsvPreviewRow, EditableCsvField>>
): CsvPreviewRow {
  const merged = { ...row, ...patch }
  const data = normalizeDominioDataInput(merged.data)
  const valor = typeof merged.valor === 'number' && Number.isFinite(merged.valor) ? merged.valor : 0
  const updated: CsvPreviewRow = {
    ...merged,
    data,
    dataFormatted: formatDominioDate(data) || data,
    valor,
    valorFormatted: formatCurrencyBrl(valor),
  }

  return {
    ...updated,
    rawLine: serializeDominioRow(updated),
  }
}

export function rowsToCsvText(rows: CsvPreviewRow[]): string {
  return rows.map((row) => row.rawLine).join('\n')
}

export function applyRawTextToRows(
  text: string
): { ok: true; rows: CsvPreviewRow[] } | { ok: false; message: string } {
  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, message: 'O CSV não pode ficar vazio.' }
  }

  const parsed = parseDominioCsv(trimmed)
  if (parsed.length === 0) {
    return { ok: false, message: 'Nenhuma linha válida no formato Domínio. Verifique o texto bruto.' }
  }

  return {
    ok: true,
    rows: parsed.map((row, index) => ({ ...row, lineNumber: index + 1 })),
  }
}

export function downloadTextAsCsv(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function parseDominioCsv(text: string): CsvPreviewRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)

  return lines
    .map((line, index) => {
      const fields = parseCsvLine(line)
      if (fields.length < 5) return null

      const valor = parseFloat(fields[4]?.replace(',', '.') ?? '')
      const descricao = (fields[6] ?? fields[5] ?? '').trim()

      return {
        lineNumber: index + 1,
        tipo: fields[0]?.trim() ?? '',
        data: fields[1]?.trim() ?? '',
        dataFormatted: formatDominioDate(fields[1]?.trim() ?? ''),
        debito: fields[2]?.trim() ?? '',
        credito: fields[3]?.trim() ?? '',
        valor: Number.isFinite(valor) ? valor : 0,
        valorFormatted: Number.isFinite(valor) ? formatCurrencyBrl(valor) : fields[4] ?? '',
        descricao,
        rawLine: line,
      }
    })
    .filter((row): row is CsvPreviewRow => row !== null)
}

export function summarizeCsvRows(rows: CsvPreviewRow[]): CsvPreviewSummary {
  if (rows.length === 0) {
    return {
      totalRows: 0,
      totalValor: 0,
      totalValorFormatted: formatCurrencyBrl(0),
      dateMin: null,
      dateMax: null,
      uniqueDescriptions: 0,
    }
  }

  let totalValor = 0
  let dateMin: Date | null = null
  let dateMax: Date | null = null
  const descriptions = new Set<string>()

  rows.forEach((row) => {
    totalValor += row.valor
    descriptions.add(row.descricao.toLowerCase())

    const parsed = parseDominioDate(row.data)
    if (!parsed) return
    if (!dateMin || parsed < dateMin) dateMin = parsed
    if (!dateMax || parsed > dateMax) dateMax = parsed
  })

  return {
    totalRows: rows.length,
    totalValor,
    totalValorFormatted: formatCurrencyBrl(totalValor),
    dateMin: dateMin ? formatDominioDateFromDate(dateMin) : null,
    dateMax: dateMax ? formatDominioDateFromDate(dateMax) : null,
    uniqueDescriptions: descriptions.size,
  }
}

function formatDominioDateFromDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function filterCsvRows(rows: CsvPreviewRow[], query: string): CsvPreviewRow[] {
  const term = query.trim().toLowerCase()
  if (!term) return rows

  return rows.filter((row) => {
    return (
      row.descricao.toLowerCase().includes(term) ||
      row.debito.includes(term) ||
      row.credito.includes(term) ||
      row.dataFormatted.includes(term) ||
      row.valorFormatted.toLowerCase().includes(term) ||
      row.valor.toFixed(2).includes(term)
    )
  })
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems === 0) return 1
  return Math.ceil(totalItems / pageSize)
}

export function getFileKindLabel(fileName?: string): string {
  if (!fileName) return 'CSV'
  if (fileName.toUpperCase().includes('PGTO')) return 'PGTO — Pagamentos (PDF)'
  if (fileName.toUpperCase().includes('EXTRATO')) return 'EXTRATO — Movimentação (OFX)'
  return fileName
}
