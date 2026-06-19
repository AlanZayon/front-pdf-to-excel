import { describe, it, expect } from 'vitest'
import { getDownloadButtonLabel, formatSuccessMessage } from '@/shared/utils/downloadLabels'
import { mapJobFailureMessage } from '@/shared/utils/errorMessages'

describe('downloadLabels', () => {
  it('returns specific labels by output file', () => {
    expect(getDownloadButtonLabel('PGTO.csv')).toBe('BAIXAR PGTO.CSV')
    expect(getDownloadButtonLabel('EXTRATO.csv')).toBe('BAIXAR EXTRATO.CSV')
    expect(getDownloadButtonLabel(undefined, 'PDF')).toBe('BAIXAR PGTO.CSV')
  })

  it('includes output file in success message when missing', () => {
    expect(formatSuccessMessage('Processado', 'EXTRATO.csv')).toContain('EXTRATO.csv')
  })
})

describe('errorMessages', () => {
  it('maps empty PDF job failures', () => {
    expect(mapJobFailureMessage('Nenhum dado para gerar o CSV')).toContain('Nenhum pagamento')
  })
})
