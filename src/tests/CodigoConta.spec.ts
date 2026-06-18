import { describe, it, expect } from 'vitest'
import { ref } from 'vue'

describe('CodigoConta dirty state', () => {
  it('detects when tax codes were modified', () => {
    const original = ref({ INSS: { debito: '1', credito: '2' } })
    const current = ref({ INSS: { debito: '1', credito: '2' } })

    const hasChanges = () =>
      JSON.stringify(current.value) !== JSON.stringify(original.value)

    expect(hasChanges()).toBe(false)

    current.value = {
      INSS: { debito: '9', credito: '2' },
    }

    expect(hasChanges()).toBe(true)
  })
})
