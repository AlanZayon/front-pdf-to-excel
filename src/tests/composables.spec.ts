import { describe, it, expect } from 'vitest'
import { validateCnpj, validateBankCode } from '@/interfaces/views/upload/composables/useCnpjValidation'
import { createTransactionKey, groupTransactionsByDescription } from '@/interfaces/views/upload/composables/useTransactionGroups'

describe('useCnpjValidation', () => {
  it('validates a correct CNPJ', () => {
    expect(validateCnpj('11.222.333/0001-81')).toBe(true)
  })

  it('rejects invalid CNPJ', () => {
    expect(validateCnpj('11.111.111/1111-11')).toBe(false)
  })

  it('validates bank code', () => {
    expect(validateBankCode('341')).toBe(true)
    expect(validateBankCode('0000')).toBe(false)
  })
})

describe('useTransactionGroups', () => {
  it('creates stable transaction keys', () => {
    expect(createTransactionKey('PIX', '01/01/2025', 10)).toBe('PIX|01/01/2025|10')
  })

  it('groups transactions by description', () => {
    const groups = groupTransactionsByDescription([
      { descricao: 'PIX', data: '01/01/2025', valor: 10 },
      { descricao: 'PIX', data: '02/01/2025', valor: 20 }
    ], new Map())

    expect(groups).toHaveLength(1)
    expect(groups[0].total).toBe(30)
  })
})
