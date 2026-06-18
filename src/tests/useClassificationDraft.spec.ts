import { describe, it, expect, beforeEach } from 'vitest'
import { useClassificationDraft } from '@/interfaces/views/upload/composables/useClassificationDraft'
import { ref } from 'vue'

describe('useClassificationDraft', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('restores saved draft from session storage', () => {
    const storageKey = ref('12345678000199:341:extrato.ofx:1024:1700000000000')
    const groupedTransactions = ref<any[]>([])
    const individualClassifications = ref(new Map<string, any>())

    sessionStorage.setItem(
      'fiscal2csv:classification:12345678000199:341:extrato.ofx:1024:1700000000000',
      JSON.stringify({
        groupedTransactions: [{ descricao: 'PIX', total: 10, transacoesDetalhadas: [] }],
        individualClassifications: [['k1', { codigoDebito: '1', codigoCredito: '2' }]],
      })
    )

    const { restoreDraft, clearDraft } = useClassificationDraft(
      storageKey,
      groupedTransactions,
      individualClassifications
    )

    expect(restoreDraft()).toBe(true)
    expect(groupedTransactions.value).toHaveLength(1)
    expect(individualClassifications.value.get('k1')?.codigoDebito).toBe('1')

    clearDraft()
    expect(
      sessionStorage.getItem('fiscal2csv:classification:12345678000199:341:extrato.ofx:1024:1700000000000')
    ).toBeNull()
  })

  it('does not restore draft from a different file key', () => {
    sessionStorage.setItem(
      'fiscal2csv:classification:12345678000199:341:antigo.ofx:2048:1700000000001',
      JSON.stringify({
        groupedTransactions: [{ descricao: 'ANTIGO', total: 10, transacoesDetalhadas: [] }],
        individualClassifications: [],
      })
    )

    const storageKey = ref('12345678000199:341:novo.ofx:4096:1700000000002')
    const groupedTransactions = ref<any[]>([])
    const individualClassifications = ref(new Map<string, any>())
    const { restoreDraft } = useClassificationDraft(
      storageKey,
      groupedTransactions,
      individualClassifications
    )

    expect(restoreDraft()).toBe(false)
    expect(groupedTransactions.value).toHaveLength(0)
  })

  it('returns false when storage key is empty', () => {
    const storageKey = ref('')
    const groupedTransactions = ref<any[]>([])
    const individualClassifications = ref(new Map<string, any>())
    const { restoreDraft } = useClassificationDraft(
      storageKey,
      groupedTransactions,
      individualClassifications
    )

    expect(restoreDraft()).toBe(false)
  })
})
