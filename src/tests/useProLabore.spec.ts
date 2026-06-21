import { describe, expect, it } from 'vitest'
import { useProLabore, isValidProLaboreYear } from '../interfaces/views/upload/composables/useProLabore'

describe('useProLabore', () => {
  it('defaults year to current year', () => {
    const { proLaboreYear } = useProLabore()
    expect(proLaboreYear.value).toBe(new Date().getFullYear())
  })

  it('validates pro labore year range', () => {
    expect(isValidProLaboreYear(2025)).toBe(true)
    expect(isValidProLaboreYear(1999)).toBe(false)
    expect(isValidProLaboreYear(2100)).toBe(false)
  })

  it('resets year when clearing pro labore', () => {
    const { proLaboreYear, resetProLabore } = useProLabore()
    proLaboreYear.value = 2020
    resetProLabore()
    expect(proLaboreYear.value).toBe(new Date().getFullYear())
  })
})
