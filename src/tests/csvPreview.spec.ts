import { describe, it, expect } from 'vitest'
import {
  parseCsvLine,
  parseDominioCsv,
  summarizeCsvRows,
  filterCsvRows,
  formatDominioDate,
  paginateRows,
  getTotalPages,
} from '@/shared/utils/csvPreview'

describe('csvPreview', () => {
  it('parses quoted CSV fields', () => {
    expect(parseCsvLine('1,01012025,111,222,50.00,,"PIX ""ESPECIAL"""')).toEqual([
      '1',
      '01012025',
      '111',
      '222',
      '50.00',
      '',
      'PIX "ESPECIAL"',
    ])
  })

  it('parses dominio csv rows', () => {
    const text = [
      '1,01012025,1111,2222,150.50,,"PIX RECEBIDO"',
      '1,15012025,3333,4444,75.00,,"TARIFA"',
    ].join('\n')

    const rows = parseDominioCsv(text)
    expect(rows).toHaveLength(2)
    expect(rows[0].dataFormatted).toBe('01/01/2025')
    expect(rows[0].valor).toBe(150.5)
    expect(rows[0].descricao).toBe('PIX RECEBIDO')
  })

  it('formats dominio date', () => {
    expect(formatDominioDate('01012025')).toBe('01/01/2025')
  })

  it('summarizes rows', () => {
    const rows = parseDominioCsv('1,01012025,1,2,100.00,,"A"\n1,31012025,1,2,50.00,,"B"')
    const summary = summarizeCsvRows(rows)
    expect(summary.totalRows).toBe(2)
    expect(summary.totalValor).toBe(150)
    expect(summary.dateMin).toBe('01/01/2025')
    expect(summary.dateMax).toBe('31/01/2025')
    expect(summary.uniqueDescriptions).toBe(2)
  })

  it('filters rows by description and codes', () => {
    const rows = parseDominioCsv('1,01012025,1111,2222,10.00,,"PIX"\n1,02012025,9999,8888,20.00,,"BOLETO"')
    expect(filterCsvRows(rows, 'pix')).toHaveLength(1)
    expect(filterCsvRows(rows, '9999')).toHaveLength(1)
  })

  it('paginates rows', () => {
    const items = [1, 2, 3, 4, 5]
    expect(paginateRows(items, 1, 2)).toEqual([1, 2])
    expect(paginateRows(items, 2, 2)).toEqual([3, 4])
    expect(getTotalPages(5, 2)).toBe(3)
  })
})
