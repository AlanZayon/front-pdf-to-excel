import { ref, computed, watch, type Ref } from 'vue'
import { UploadService } from '../../../../infrastructure/services/UploadService'
import type { UploadResult } from '../../../../domain/models/UploadResult'
import { notifyError, notifySuccess } from '../../../../shared/composables/useToast'
import { useDebouncedRef } from '../../../../shared/composables/useDebouncedRef'
import { groupTransactionsByDescription as buildTransactionGroups } from './useTransactionGroups'

type DateFilterState = {
  startDate: string
  endDate: string
  isActive: boolean
}

export function useClassification(options: {
  ofxResponse: Ref<any>
  cnpjFormatted: Ref<string>
  dateFilter: Ref<DateFilterState>
  filterTransactionsByDate: (items: any[]) => any[]
  onSaved: (result: UploadResult) => void
}) {
  const groupedTransactions = ref<any[]>([])
  const individualClassifications = ref<Map<string, any>>(new Map())
  const isSavingClassification = ref(false)

  const searchByDescription = ref('')
  const searchByValue = ref('')
  const debouncedSearchDescription = useDebouncedRef(searchByDescription)
  const debouncedSearchValue = useDebouncedRef(searchByValue)
  const searchResults = ref<any[]>([])
  const valueSearchResults = ref<any[]>([])

  const batchCodesPositive = ref({ debito: '', credito: '' })
  const batchCodesNegative = ref({ debito: '', credito: '' })
  const currentFilter = ref<'all' | 'classified' | 'pending' | 'individual'>('all')
  const currentSearchType = ref<'description' | 'value'>('description')
  const showSearchSection = ref(false)

  const bankCodeInput = ref('')
  const showBankDropdown = ref(false)
  const filteredBanks = ref<any[]>([])
  const availableBanks = ref<any[]>([])
  const selectedBankCode = ref('')

  const setGroupsFromTransactions = (transactions: any[]) => {
    groupedTransactions.value = buildTransactionGroups(transactions, individualClassifications.value)
  }

  const resetClassificationState = () => {
    groupedTransactions.value = []
    individualClassifications.value.clear()
    searchByDescription.value = ''
    searchByValue.value = ''
    searchResults.value = []
    valueSearchResults.value = []
    batchCodesPositive.value = { debito: '', credito: '' }
    batchCodesNegative.value = { debito: '', credito: '' }
    currentFilter.value = 'all'
    currentSearchType.value = 'description'
    bankCodeInput.value = ''
    selectedBankCode.value = ''
    availableBanks.value = []
    filteredBanks.value = []
    showBankDropdown.value = false
  }

  const isDescriptionClassified = (group: any) => {
    if (group.transacoesDetalhadas.length === 1 && group.transacoesDetalhadas[0].hasIndividualClassification) {
      return true
    }
    return !!group.codigoDebito && !!group.codigoCredito
  }

  const hasIndividualClassifications = (group: any) =>
    group.transacoesDetalhadas.some((transacao: any) => transacao.hasIndividualClassification)

  const getIndividualClassificationCount = (group: any) =>
    group.transacoesDetalhadas.filter((transacao: any) => transacao.hasIndividualClassification).length

  const filteredGroupedTransactions = computed(() => {
    let filtered = groupedTransactions.value

    if (currentFilter.value === 'classified') {
      filtered = filtered.filter((group) => isDescriptionClassified(group))
    } else if (currentFilter.value === 'pending') {
      filtered = filtered.filter((group) => !isDescriptionClassified(group))
    } else if (currentFilter.value === 'individual') {
      filtered = filtered.filter((group) => hasIndividualClassifications(group))
    }

    if (searchByDescription.value) {
      const searchTerm = debouncedSearchDescription.value.toLowerCase()
      filtered = filtered.filter((group) => group.descricao.toLowerCase().includes(searchTerm))
    }

    return filtered
  })

  const filterGroupsByDate = (groups: any[]) => {
    const parseBrDate = (dateStr: string): Date => {
      if (!dateStr) return new Date(NaN)
      const [day, month, year] = dateStr.split('/').map(Number)
      return new Date(year, month - 1, day, 0, 0, 0)
    }

    const parseIsoDate = (dateStr: string): Date => {
      if (!dateStr) return new Date(NaN)
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day, 0, 0, 0)
    }

    const startDate = parseIsoDate(options.dateFilter.value.startDate)
    const endDate = parseIsoDate(options.dateFilter.value.endDate)

    return groups
      .map((group) => {
        const filteredTransacoesDetalhadas = group.transacoesDetalhadas.filter((transacao: any) => {
          const transactionDate = parseBrDate(transacao.data)
          return transactionDate >= startDate && transactionDate <= endDate
        })

        if (filteredTransacoesDetalhadas.length === 0) return null

        return {
          ...group,
          transacoesDetalhadas: filteredTransacoesDetalhadas,
          transacoes: filteredTransacoesDetalhadas.map((t: any) => ({ data: t.data, valor: t.valor })),
          total: filteredTransacoesDetalhadas.reduce((sum: number, t: any) => sum + t.valor, 0),
        }
      })
      .filter((group) => group !== null)
  }

  const positiveGroups = computed(() => {
    const filtered = filteredGroupedTransactions.value.filter((group) => group.total >= 0)
    return options.dateFilter.value.isActive ? filterGroupsByDate(filtered) : filtered
  })

  const negativeGroups = computed(() => {
    const filtered = filteredGroupedTransactions.value.filter((group) => group.total < 0)
    return options.dateFilter.value.isActive ? filterGroupsByDate(filtered) : filtered
  })

  const individualTransactions = computed(() => {
    const results: any[] = []

    groupedTransactions.value.forEach((group) => {
      group.transacoesDetalhadas.forEach((transacao: any) => {
        if (transacao.hasIndividualClassification) {
          const individualClass = individualClassifications.value.get(transacao.transactionKey)
          results.push({
            descricao: group.descricao,
            data: transacao.data,
            valor: transacao.valor,
            transactionKey: transacao.transactionKey,
            codigoDebito: individualClass?.codigoDebito || '',
            codigoCredito: individualClass?.codigoCredito || '',
            hasIndividualClassification: true,
            isClassificacaoIndividual: true,
            groupRef: group,
          })
        }
      })
    })

    if (options.dateFilter.value.isActive) {
      return options.filterTransactionsByDate(results)
    }

    return results
  })

  const classifiedCount = computed(
    () =>
      groupedTransactions.value.filter(
        (group) =>
          (group.transacoesDetalhadas.length === 1 && group.transacoesDetalhadas[0].hasIndividualClassification) ||
          (group.codigoDebito && group.codigoCredito)
      ).length
  )

  const pendingCount = computed(() => groupedTransactions.value.length - classifiedCount.value)

  const totalGroupsCount = computed(() => groupedTransactions.value.length)

  const classificationProgressPercent = computed(() => {
    const total = totalGroupsCount.value
    if (total === 0) return 0
    return Math.round((classifiedCount.value / total) * 100)
  })

  const findFirstPendingGroupKey = (): string | null => {
    const groups = groupedTransactions.value.filter((group) => !isDescriptionClassified(group))
    if (groups.length === 0) return null
    return groups[0].descricao
  }

  const individualTransactionsCount = computed(() => {
    let count = 0
    groupedTransactions.value.forEach((group) => {
      group.transacoesDetalhadas.forEach((transacao: any) => {
        if (transacao.hasIndividualClassification) count++
      })
    })
    return count
  })

  const individualClassificationsCount = computed(() => {
    let count = 0
    groupedTransactions.value.forEach((group) => {
      count += group.transacoesDetalhadas.length
    })
    return count
  })

  const searchResultsPositive = computed(() => searchResults.value.filter((group) => group.total >= 0))
  const searchResultsNegative = computed(() => searchResults.value.filter((group) => group.total < 0))

  const setFilter = (filter: 'all' | 'classified' | 'pending' | 'individual') => {
    currentFilter.value = filter
  }

  const shouldFilterOut = (group: any) => {
    if (currentFilter.value === 'classified') return !isDescriptionClassified(group)
    if (currentFilter.value === 'pending') return isDescriptionClassified(group)
    if (currentFilter.value === 'individual') return !hasIndividualClassifications(group)
    return false
  }

  const getStatusClass = (group: any) => (isDescriptionClassified(group) ? 'classified' : 'pending')
  const getStatusText = (group: any) => (isDescriptionClassified(group) ? 'CLASSIFICADA' : 'PENDENTE')

  const validateGroupCode = (group: any, type: 'debito' | 'credito') => {
    const errorField = type === 'debito' ? 'debitoError' : 'creditoError'

    if (
      Array.isArray(group.transacoesDetalhadas) &&
      group.transacoesDetalhadas.length === 1 &&
      group.transacoesDetalhadas[0].isClassificacaoIndividual === true
    ) {
      group[errorField] = ''
      return true
    }

    const code = type === 'debito' ? group.codigoDebito : group.codigoCredito

    if (!code || code.trim() === '') {
      group[errorField] = 'Código é obrigatório'
      return false
    }

    if (!/^\d+$/.test(code)) {
      group[errorField] = 'Apenas números são permitidos'
      return false
    }

    group[errorField] = ''
    return true
  }

  const isFormValid = computed(() => {
    const groupsToValidate = options.dateFilter.value.isActive
      ? [...positiveGroups.value, ...negativeGroups.value]
      : groupedTransactions.value

    return (
      groupsToValidate.every((group) => {
        if (group.transacoesDetalhadas.length === 1) {
          const unicaTransacao = group.transacoesDetalhadas[0]
          if (unicaTransacao.hasIndividualClassification) return true
        }

        const hasValidDebito = group.codigoDebito && group.codigoDebito.trim() !== '' && !group.debitoError
        const hasValidCredito = group.codigoCredito && group.codigoCredito.trim() !== '' && !group.creditoError
        return hasValidDebito && hasValidCredito
      }) && groupsToValidate.length > 0
    )
  })

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const searchByDescriptionFunction = () => {
    if (!searchByDescription.value.trim()) {
      searchResults.value = []
      return
    }

    const searchLower = searchByDescription.value.toLowerCase()
    const exactMatchRegex = new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    searchResults.value = groupedTransactions.value.filter((group) => exactMatchRegex.test(group.descricao))
  }

  const searchByValueFunction = () => {
    if (!searchByValue.value.trim()) {
      valueSearchResults.value = []
      return
    }

    const searchValue = parseFloat(searchByValue.value.replace(',', '.'))
    if (isNaN(searchValue)) {
      valueSearchResults.value = []
      return
    }

    const searchValueInCents = Math.round(searchValue * 100)
    const results: any[] = []
    const groupsToSearch = options.dateFilter.value.isActive
      ? [...positiveGroups.value, ...negativeGroups.value]
      : groupedTransactions.value

    groupsToSearch.forEach((group) => {
      group.transacoesDetalhadas.forEach((transacao: any) => {
        const transactionValueInCents = Math.round(transacao.valor * 100)
        if (Math.abs(transactionValueInCents) === Math.abs(searchValueInCents)) {
          const transKey = transacao.transactionKey
          const individualClass = individualClassifications.value.get(transKey)
          results.push({
            descricao: group.descricao,
            data: transacao.data,
            valor: transacao.valor,
            transactionKey: transKey,
            codigoDebito: individualClass?.codigoDebito || '',
            codigoCredito: individualClass?.codigoCredito || '',
            hasIndividualClassification: individualClassifications.value.has(transKey),
            isClassificacaoIndividual: individualClassifications.value.has(transKey),
            groupRef: group,
          })
        }
      })
    })

    valueSearchResults.value = results
  }

  const performSearch = () => {
    if (currentSearchType.value === 'value' && searchByValue.value.trim()) {
      searchByValueFunction()
    } else if (currentSearchType.value === 'description' && searchByDescription.value.trim()) {
      searchByDescriptionFunction()
    } else {
      searchResults.value = []
      valueSearchResults.value = []
    }
  }

  const applyBatchClassification = (type: 'positive' | 'negative') => {
    const codes = type === 'positive' ? batchCodesPositive.value : batchCodesNegative.value
    const targetGroups = type === 'positive' ? searchResultsPositive.value : searchResultsNegative.value

    if (!codes.credito && type === 'positive') {
      notifyError('Por favor, preencha código de crédito antes de aplicar.')
      return
    }

    if (!codes.debito && type === 'negative') {
      notifyError('Por favor, preencha código de débito antes de aplicar.')
      return
    }

    targetGroups.forEach((group) => {
      if (type === 'positive') {
        group.codigoCredito = codes.credito
        if (!group.codigoDebito) group.codigoDebito = selectedBankCode.value
      } else {
        group.codigoDebito = codes.debito
        if (!group.codigoCredito) group.codigoCredito = selectedBankCode.value
      }
      group.debitoError = ''
      group.creditoError = ''
      group.debitoLocked = false
      group.creditoLocked = false
    })

    if (type === 'positive') {
      batchCodesPositive.value = { debito: '', credito: '' }
    } else {
      batchCodesNegative.value = { debito: '', credito: '' }
    }

    notifySuccess(
      `Códigos aplicados para ${targetGroups.length} descrições ${type === 'positive' ? 'positivas' : 'negativas'}!`
    )
  }

  const validateIndividualCodes = (codigoDebito: string, codigoCredito: string) => {
    if (!codigoDebito?.trim() || !codigoCredito?.trim()) {
      notifyError('Preencha os códigos de débito e crédito.')
      return false
    }
    if (!/^\d+$/.test(codigoDebito.trim()) || !/^\d+$/.test(codigoCredito.trim())) {
      notifyError('Os códigos devem conter apenas números.')
      return false
    }
    return true
  }

  const syncIndividualToTransaction = (result: any) => {
    result.hasIndividualClassification = true
    result.isClassificacaoIndividual = true
    result.codigoDebito = result.codigoDebito.trim()
    result.codigoCredito = result.codigoCredito.trim()

    const group = result.groupRef
    if (group?.transacoesDetalhadas) {
      const transacao = group.transacoesDetalhadas.find((t: any) => t.transactionKey === result.transactionKey)
      if (transacao) {
        transacao.hasIndividualClassification = true
        transacao.isClassificacaoIndividual = true
        transacao.codigoDebito = result.codigoDebito
        transacao.codigoCredito = result.codigoCredito
      }
    }

    valueSearchResults.value.forEach((searchResult) => {
      if (searchResult.transactionKey === result.transactionKey) {
        searchResult.hasIndividualClassification = true
        searchResult.isClassificacaoIndividual = true
        searchResult.codigoDebito = result.codigoDebito
        searchResult.codigoCredito = result.codigoCredito
      }
    })
  }

  const saveIndividualClassification = (result: any) => {
    if (!validateIndividualCodes(result.codigoDebito, result.codigoCredito)) return

    individualClassifications.value.set(result.transactionKey, {
      codigoDebito: result.codigoDebito.trim(),
      codigoCredito: result.codigoCredito.trim(),
      descricao: result.descricao,
      data: result.data,
      valor: result.valor,
      isClassificacaoIndividual: true,
    })

    syncIndividualToTransaction(result)
    notifySuccess('Código personalizado aplicado a esta transação.')
  }

  const removeIndividualClassification = (transactionKey: string) => {
    individualClassifications.value.delete(transactionKey)

    groupedTransactions.value.forEach((group) => {
      group.transacoesDetalhadas.forEach((transacao: any) => {
        if (transacao.transactionKey === transactionKey) {
          transacao.hasIndividualClassification = false
          transacao.isClassificacaoIndividual = false
          transacao.codigoDebito = ''
          transacao.codigoCredito = ''
        }
      })
    })

    valueSearchResults.value.forEach((searchResult) => {
      if (searchResult.transactionKey === transactionKey) {
        searchResult.hasIndividualClassification = false
        searchResult.isClassificacaoIndividual = false
        searchResult.codigoDebito = ''
        searchResult.codigoCredito = ''
      }
    })

    notifySuccess('Transação voltou a usar o código do grupo.')
  }

  const buildTransactionPayload = (transacao: any, group: any) => ({
    transactionKey: transacao.transactionKey,
    descricao: group.descricao,
    data: transacao.data,
    valor: transacao.valor,
    codigoDebito: transacao.codigoDebito || '',
    codigoCredito: transacao.codigoCredito || '',
    hasIndividualClassification: transacao.hasIndividualClassification,
    isClassificacaoIndividual: transacao.isClassificacaoIndividual,
    groupRef: group,
  })

  const applyBankCodeToGroups = () => {
    if (!selectedBankCode.value) return

    groupedTransactions.value.forEach((group) => {
      if (group.total >= 0 && group.codigoCredito === '') {
        group.codigoCredito = selectedBankCode.value.toString()
      } else if (group.total < 0 && group.codigoDebito === '') {
        group.codigoDebito = selectedBankCode.value.toString()
      }

      if (group.codigoDebito) validateGroupCode(group, 'debito')
      if (group.codigoCredito) validateGroupCode(group, 'credito')
    })
  }

  const toggleDescription = (group: any) => {
    group.expanded = !group.expanded
  }

  watch(currentFilter, (filter) => {
    if (filter === 'individual') {
      groupedTransactions.value.forEach((group) => {
        if (hasIndividualClassifications(group)) group.expanded = true
      })
    }
  })

  const handleGroupDebitoFocus = (group: any, event: FocusEvent) => {
    if (group.debitoLocked || (selectedBankCode.value !== '' && group.total >= 0)) {
      ;(event.target as HTMLInputElement).blur()
    }
  }

  const handleGroupCreditoFocus = (group: any, event: FocusEvent) => {
    if (group.creditoLocked || (selectedBankCode.value !== '' && group.total < 0)) {
      ;(event.target as HTMLInputElement).blur()
    }
  }

  const isInSearchResults = (group: any) => searchResults.value.includes(group)

  const filterBanks = () => {
    if (!bankCodeInput.value.trim()) {
      filteredBanks.value = availableBanks.value
      return
    }

    const searchTerm = bankCodeInput.value.toLowerCase()
    filteredBanks.value = availableBanks.value.filter(
      (bank) =>
        String(bank.code).toLowerCase().includes(searchTerm) ||
        String(bank.name).toLowerCase().includes(searchTerm)
    )
  }

  const onBankCodeApply = () => {
    setTimeout(() => {
      showBankDropdown.value = false

      if (/^\d+$/.test(bankCodeInput.value)) {
        const bank = availableBanks.value.find((b) => b.code === bankCodeInput.value)
        if (bank) {
          selectedBankCode.value = bank.code
          bankCodeInput.value = `${bank.code} - ${bank.name}`
        } else {
          selectedBankCode.value = bankCodeInput.value
        }
      } else if (bankCodeInput.value.includes(' - ')) {
        const parts = bankCodeInput.value.split(' - ')
        if (parts.length > 0) selectedBankCode.value = parts[0]
      }
    }, 200)
  }

  const setSearchType = (type: 'description' | 'value') => {
    currentSearchType.value = type
    if (type === 'description') {
      searchByValue.value = ''
      valueSearchResults.value = []
    } else {
      searchByDescription.value = ''
      searchResults.value = []
      batchCodesPositive.value = { debito: '', credito: '' }
      batchCodesNegative.value = { debito: '', credito: '' }
    }
  }

  const clearDescriptionSearch = () => {
    searchByDescription.value = ''
    searchResults.value = []
    batchCodesPositive.value = { debito: '', credito: '' }
    batchCodesNegative.value = { debito: '', credito: '' }
  }

  const clearValueSearch = () => {
    searchByValue.value = ''
    valueSearchResults.value = []
  }

  const clearCurrentSearch = () => {
    if (currentSearchType.value === 'description') clearDescriptionSearch()
    else clearValueSearch()
  }

  const toggleSearchVisibility = () => {
    showSearchSection.value = !showSearchSection.value
  }

  const saveClassification = async () => {
    let isValid = true
    const visibleGroups = options.dateFilter.value.isActive
      ? [...positiveGroups.value, ...negativeGroups.value]
      : groupedTransactions.value

    visibleGroups.forEach((group) => {
      if (group.transacoesDetalhadas.length === 1 && group.transacoesDetalhadas[0].hasIndividualClassification) {
        return
      }
      const debitoValid = validateGroupCode(group, 'debito')
      const creditoValid = validateGroupCode(group, 'credito')
      if (!debitoValid || !creditoValid) isValid = false
    })

    if (!isValid || !isFormValid.value) {
      notifyError('Por favor, classifique todas as descrições pendentes antes de salvar.')
      return
    }

    isSavingClassification.value = true

    const classifiedData: Array<{
      descricao: string
      data: string
      valor: number
      codigoDebito: number
      codigoCredito: number
      codigoBanco: number
      isClassificacaoIndividual: boolean
    }> = []

    visibleGroups.forEach((group) => {
      group.transacoesDetalhadas.forEach((transacao: any) => {
        const transKey = transacao.transactionKey
        const individualClass = individualClassifications.value.get(transKey)
        const isIndividual = individualClassifications.value.has(transKey)

        classifiedData.push({
          descricao: group.descricao,
          data: transacao.data,
          valor: transacao.valor,
          codigoDebito: parseInt(individualClass?.codigoDebito || group.codigoDebito, 10) || 0,
          codigoCredito: parseInt(individualClass?.codigoCredito || group.codigoCredito, 10) || 0,
          codigoBanco: parseInt(String(group.codigosBanco?.[0] ?? ''), 10) || 0,
          isClassificacaoIndividual: isIndividual,
        })
      })
    })

    try {
      const filterTransactionsByDateRange = (transactions: any[]) => {
        if (!options.dateFilter.value.isActive || !options.dateFilter.value.startDate || !options.dateFilter.value.endDate) {
          return transactions
        }

        const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

        const parseToDateOnly = (input: string | Date): Date | null => {
          if (!input) return null
          if (input instanceof Date && !isNaN(input.getTime())) return dateOnly(input)
          if (typeof input === 'string') {
            const s = input.trim()
            if (s.includes('/')) {
              const parts = s.split('/').map((p) => parseInt(p, 10))
              if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
                const [day, month, year] = parts
                return new Date(year, month - 1, day)
              }
            }
            const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
            if (isoMatch) {
              return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10))
            }
            const parsed = new Date(s)
            if (!isNaN(parsed.getTime())) return dateOnly(parsed)
          }
          return null
        }

        const start = parseToDateOnly(options.dateFilter.value.startDate)
        const end = parseToDateOnly(options.dateFilter.value.endDate)
        if (!start || !end) return transactions

        const startTs = dateOnly(start).getTime()
        const endTs = dateOnly(end).getTime()

        return transactions
          .map((transaction) => {
            const filteredDatas: string[] = []
            const filteredValores: number[] = []
            const filteredCodigosDebito: any[] = []
            const filteredCodigosCredito: any[] = []

            transaction.datas.forEach((data: string, index: number) => {
              if (!data) return
              const transactionDateObj = parseToDateOnly(data)
              if (!transactionDateObj) return
              const txTs = transactionDateObj.getTime()
              if (txTs >= startTs && txTs <= endTs) {
                filteredDatas.push(data)
                filteredValores.push(transaction.valores[index])
                if (transaction.codigosDebito?.[index] !== undefined) {
                  filteredCodigosDebito.push(transaction.codigosDebito[index])
                }
                if (transaction.codigosCredito?.[index] !== undefined) {
                  filteredCodigosCredito.push(transaction.codigosCredito[index])
                }
              }
            })

            if (filteredDatas.length === 0) return null

            return {
              ...transaction,
              datas: filteredDatas,
              valores: filteredValores,
              codigosDebito: filteredCodigosDebito.length > 0 ? filteredCodigosDebito : transaction.codigosDebito || [],
              codigosCredito:
                filteredCodigosCredito.length > 0 ? filteredCodigosCredito : transaction.codigosCredito || [],
            }
          })
          .filter((t) => t !== null)
      }

      const payload = {
        TransacoesClassificadas: filterTransactionsByDateRange(options.ofxResponse.value?.transacoesClassificadas || []),
        Classificacoes: classifiedData,
        TransacoesPendentes: filterTransactionsByDateRange(options.ofxResponse.value?.pendingTransactions || []),
        cnpj: options.cnpjFormatted.value,
        dateFilter: options.dateFilter.value.isActive
          ? {
              startDate: options.dateFilter.value.startDate,
              endDate: options.dateFilter.value.endDate,
              isActive: options.dateFilter.value.isActive,
            }
          : undefined,
      }

      const result = await UploadService.saveClassification(payload)
      if (result.success) {
        options.onSaved(result)
      } else {
        throw new Error(result.message || 'Erro ao salvar classificação')
      }
    } catch (error) {
      console.error('Erro ao salvar classificação:', error)
      notifyError('Erro ao salvar classificação. Tente novamente.')
    } finally {
      isSavingClassification.value = false
      selectedBankCode.value = ''
      bankCodeInput.value = ''
    }
  }

  watch(debouncedSearchDescription, () => {
    if (currentSearchType.value === 'description') performSearch()
  })

  watch(debouncedSearchValue, () => {
    if (currentSearchType.value === 'value') performSearch()
  })

  watch(
    () => groupedTransactions.value,
    (groups) => {
      groups.forEach((group) => {
        if (
          Array.isArray(group.transacoesDetalhadas) &&
          group.transacoesDetalhadas.length === 1 &&
          group.transacoesDetalhadas[0].isClassificacaoIndividual === true
        ) {
          validateGroupCode(group, 'debito')
          validateGroupCode(group, 'credito')
        }
      })
    },
    { deep: true }
  )

  watch(valueSearchResults, (newResults) => {
    newResults.forEach((result) => {
      if (result.groupRef?.codigosBanco?.length > 0) {
        if (result.valor < 0) result.codigoCredito = result.groupRef.codigosBanco[0]
        else result.codigoDebito = result.groupRef.codigosBanco[0]
      }
    })
  }, { deep: true })

  watch(selectedBankCode, (newCode) => {
    if (newCode) applyBankCodeToGroups()
  })

  watch(availableBanks, (newBanks) => {
    filteredBanks.value = newBanks
  }, { immediate: true })

  return {
    groupedTransactions,
    individualClassifications,
    isSavingClassification,
    searchByDescription,
    searchByValue,
    searchResults,
    valueSearchResults,
    batchCodesPositive,
    batchCodesNegative,
    currentFilter,
    currentSearchType,
    showSearchSection,
    bankCodeInput,
    showBankDropdown,
    filteredBanks,
    availableBanks,
    selectedBankCode,
    positiveGroups,
    negativeGroups,
    filteredGroupedTransactions,
    individualTransactions,
    classifiedCount,
    pendingCount,
    totalGroupsCount,
    classificationProgressPercent,
    findFirstPendingGroupKey,
    individualTransactionsCount,
    individualClassificationsCount,
    searchResultsPositive,
    searchResultsNegative,
    isFormValid,
    setGroupsFromTransactions,
    resetClassificationState,
    setFilter,
    shouldFilterOut,
    getStatusClass,
    getStatusText,
    validateGroupCode,
    formatCurrency,
    applyBatchClassification,
    saveIndividualClassification,
    removeIndividualClassification,
    buildTransactionPayload,
    toggleDescription,
    handleGroupDebitoFocus,
    handleGroupCreditoFocus,
    isInSearchResults,
    isDescriptionClassified,
    hasIndividualClassifications,
    getIndividualClassificationCount,
    filterBanks,
    onBankCodeApply,
    setSearchType,
    clearCurrentSearch,
    toggleSearchVisibility,
    saveClassification,
  }
}
