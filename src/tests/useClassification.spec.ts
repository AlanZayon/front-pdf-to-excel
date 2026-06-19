import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useClassification } from '@/interfaces/views/upload/composables/useClassification'

describe('useClassification', () => {
  it('validates numeric debit/credit codes', () => {
    const classification = useClassification({
      ofxResponse: ref(null),
      cnpjFormatted: ref('12345678000199'),
      dateFilter: ref({ startDate: '', endDate: '', isActive: false }),
      filterTransactionsByDate: (items) => items,
      onSaved: () => undefined,
    })

    const group: any = {
      descricao: 'PIX',
      codigoDebito: 'abc',
      codigoCredito: '',
      transacoesDetalhadas: [{ data: '01/01/2025', valor: 10 }],
    }

    expect(classification.validateGroupCode(group, 'debito')).toBe(false)
    expect(group.debitoError).toContain('números')

    group.codigoDebito = '1234'
    group.codigoCredito = '5678'
    expect(classification.validateGroupCode(group, 'debito')).toBe(true)
    expect(classification.validateGroupCode(group, 'credito')).toBe(true)
    expect(classification.isDescriptionClassified(group)).toBe(true)
  })

  it('applies batch credit codes to positive search results', () => {
    const classification = useClassification({
      ofxResponse: ref(null),
      cnpjFormatted: ref('12345678000199'),
      dateFilter: ref({ startDate: '', endDate: '', isActive: false }),
      filterTransactionsByDate: (items) => items,
      onSaved: () => undefined,
    })

    const positiveGroup = {
      descricao: 'Depósito',
      total: 100,
      codigoDebito: '',
      codigoCredito: '',
      transacoesDetalhadas: [{ data: '01/01/2025', valor: 100 }],
    }

    classification.groupedTransactions.value = [positiveGroup]
    classification.searchResults.value = [positiveGroup]
    classification.batchCodesPositive.value = { debito: '', credito: '9999' }

    classification.applyBatchClassification('positive')

    expect(positiveGroup.codigoCredito).toBe('9999')
  })

  it('computes pending and classified counts', () => {
    const classification = useClassification({
      ofxResponse: ref(null),
      cnpjFormatted: ref('12345678000199'),
      dateFilter: ref({ startDate: '', endDate: '', isActive: false }),
      filterTransactionsByDate: (items) => items,
      onSaved: () => undefined,
    })

    classification.groupedTransactions.value = [
      { descricao: 'A', codigoDebito: '1', codigoCredito: '2', transacoesDetalhadas: [] },
      { descricao: 'B', codigoDebito: '', codigoCredito: '', transacoesDetalhadas: [] },
    ]

    expect(classification.classifiedCount.value).toBe(1)
    expect(classification.pendingCount.value).toBe(1)
  })

  it('filters groups by pending status', () => {
    const classification = useClassification({
      ofxResponse: ref(null),
      cnpjFormatted: ref('12345678000199'),
      dateFilter: ref({ startDate: '', endDate: '', isActive: false }),
      filterTransactionsByDate: (items) => items,
      onSaved: () => undefined,
    })

    const pending = {
      descricao: 'Pendente',
      codigoDebito: '',
      codigoCredito: '',
      transacoesDetalhadas: [],
    }

    classification.groupedTransactions.value = [pending]
    classification.setFilter('pending')

    expect(classification.shouldFilterOut(pending)).toBe(false)
  })

  it('saves and removes individual classification', () => {
    const classification = useClassification({
      ofxResponse: ref(null),
      cnpjFormatted: ref('12345678000199'),
      dateFilter: ref({ startDate: '', endDate: '', isActive: false }),
      filterTransactionsByDate: (items) => items,
      onSaved: () => undefined,
    })

    const group = {
      descricao: 'PIX',
      codigoDebito: '1111',
      codigoCredito: '2222',
      transacoesDetalhadas: [
        {
          data: '01/01/2025',
          valor: -50,
          transactionKey: 'PIX|01/01/2025|-50',
          hasIndividualClassification: false,
          isClassificacaoIndividual: false,
        },
      ],
    }

    classification.groupedTransactions.value = [group]

    classification.saveIndividualClassification({
      transactionKey: 'PIX|01/01/2025|-50',
      descricao: 'PIX',
      data: '01/01/2025',
      valor: -50,
      codigoDebito: '3333',
      codigoCredito: '4444',
      groupRef: group,
    })

    expect(classification.individualClassifications.value.has('PIX|01/01/2025|-50')).toBe(true)
    expect(group.transacoesDetalhadas[0].hasIndividualClassification).toBe(true)
    expect((group.transacoesDetalhadas[0] as any).codigoDebito).toBe('3333')

    classification.removeIndividualClassification('PIX|01/01/2025|-50')

    expect(classification.individualClassifications.value.has('PIX|01/01/2025|-50')).toBe(false)
    expect(group.transacoesDetalhadas[0].hasIndividualClassification).toBe(false)
  })
})
