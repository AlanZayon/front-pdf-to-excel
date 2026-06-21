import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useClassificationDraft } from '@/interfaces/views/upload/composables/useClassificationDraft'
import { ref } from 'vue'

describe('useClassificationDraft', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('restores slim draft patches on top of prepared groups', () => {
    const storageKey = ref('12345678000199:341:extrato.ofx:1024:1700000000000')
    const groupedTransactions = ref<any[]>([
      { descricao: 'PIX', codigoDebito: '', codigoCredito: '', transacoesDetalhadas: [] },
    ])
    const individualClassifications = ref(new Map<string, any>())

    sessionStorage.setItem(
      'fiscal2csv:classification:12345678000199:341:extrato.ofx:1024:1700000000000',
      JSON.stringify({
        version: 2,
        savedAt: Date.now(),
        groupClassifications: [{ descricao: 'PIX', codigoDebito: '188', codigoCredito: '5' }],
        individualClassifications: [['k1', { codigoDebito: '1', codigoCredito: '2' }]],
      })
    )

    const { restoreDraft, clearDraft } = useClassificationDraft(
      storageKey,
      groupedTransactions,
      individualClassifications
    )

    expect(restoreDraft()).toBe(true)
    expect(groupedTransactions.value[0].codigoDebito).toBe('188')
    expect(individualClassifications.value.get('k1')?.codigoDebito).toBe('1')

    clearDraft()
    expect(
      sessionStorage.getItem('fiscal2csv:classification:12345678000199:341:extrato.ofx:1024:1700000000000')
    ).toBeNull()
  })

  it('restores legacy full draft when groups are still empty', () => {
    sessionStorage.setItem(
      'fiscal2csv:classification:12345678000199:341:antigo.ofx:2048:1700000000001',
      JSON.stringify({
        groupedTransactions: [{ descricao: 'ANTIGO', total: 10, transacoesDetalhadas: [] }],
        individualClassifications: [],
      })
    )

    const storageKey = ref('12345678000199:341:antigo.ofx:2048:1700000000001')
    const groupedTransactions = ref<any[]>([])
    const individualClassifications = ref(new Map<string, any>())
    const { restoreDraft } = useClassificationDraft(
      storageKey,
      groupedTransactions,
      individualClassifications
    )

    expect(restoreDraft()).toBe(true)
    expect(groupedTransactions.value).toHaveLength(1)
  })

  it('does not restore draft from a different file key', () => {
    sessionStorage.setItem(
      'fiscal2csv:classification:12345678000199:341:antigo.ofx:2048:1700000000001',
      JSON.stringify({
        version: 2,
        savedAt: Date.now(),
        groupClassifications: [{ descricao: 'ANTIGO', codigoDebito: '1', codigoCredito: '2' }],
        individualClassifications: [],
      })
    )

    const storageKey = ref('12345678000199:341:novo.ofx:4096:1700000000002')
    const groupedTransactions = ref<any[]>([
      { descricao: 'NOVO', codigoDebito: '', codigoCredito: '', transacoesDetalhadas: [] },
    ])
    const individualClassifications = ref(new Map<string, any>())
    const { restoreDraft } = useClassificationDraft(
      storageKey,
      groupedTransactions,
      individualClassifications
    )

    expect(restoreDraft()).toBe(false)
    expect(groupedTransactions.value[0].codigoDebito).toBe('')
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

  it('does not throw when session storage quota is exceeded', () => {
    const storageKey = ref('quota:test')
    const groupedTransactions = ref<any[]>([
      { descricao: 'PIX', codigoDebito: '1', codigoCredito: '2', transacoesDetalhadas: [] },
    ])
    const individualClassifications = ref(new Map<string, any>())

    const setItem = sessionStorage.setItem.bind(sessionStorage)
    vi.spyOn(sessionStorage, 'setItem').mockImplementation((key, value) => {
      if (String(key).startsWith('fiscal2csv:classification:')) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      }
      setItem(key, value)
    })

    const { saveDraft } = useClassificationDraft(
      storageKey,
      groupedTransactions,
      individualClassifications
    )

    expect(() => saveDraft()).not.toThrow()
  })
})
