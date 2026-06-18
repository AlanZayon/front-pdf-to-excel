import { describe, expect, it } from 'vitest'
import { useProLabore } from '../interfaces/views/upload/composables/useProLabore'

describe('useProLabore', () => {
  it('uses current year for pro labore', () => {
    const { proLaboreYear } = useProLabore()
    expect(proLaboreYear).toBe(new Date().getFullYear())
  })
})
