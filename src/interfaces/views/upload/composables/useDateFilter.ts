import { ref, computed } from 'vue'

export function useDateFilter() {
  const showDateFilter = ref(false)
  const dateFilter = ref({
    startDate: '',
    endDate: '',
    isActive: false
  })

  const isDateFilterValid = computed(() =>
    Boolean(dateFilter.value.startDate && dateFilter.value.endDate)
  )

  const toggleDateFilterVisibility = () => {
    showDateFilter.value = !showDateFilter.value
  }

  const applyDateFilter = () => {
    if (!isDateFilterValid.value) return
    dateFilter.value.isActive = true
  }

  const clearDateFilter = () => {
    dateFilter.value = {
      startDate: '',
      endDate: '',
      isActive: false
    }
  }

  const formatDateRange = () => {
    if (!dateFilter.value.startDate || !dateFilter.value.endDate) return ''
    const start = new Date(dateFilter.value.startDate).toLocaleDateString('pt-BR')
    const end = new Date(dateFilter.value.endDate).toLocaleDateString('pt-BR')
    return `${start} a ${end}`
  }

  const filterTransactionsByDate = <T extends { data: string }>(transactions: T[]): T[] => {
    if (!dateFilter.value.isActive || !dateFilter.value.startDate || !dateFilter.value.endDate) {
      return transactions
    }

    const startDate = new Date(dateFilter.value.startDate)
    const endDate = new Date(dateFilter.value.endDate)

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.data)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  return {
    showDateFilter,
    dateFilter,
    isDateFilterValid,
    toggleDateFilterVisibility,
    applyDateFilter,
    clearDateFilter,
    formatDateRange,
    filterTransactionsByDate
  }
}
