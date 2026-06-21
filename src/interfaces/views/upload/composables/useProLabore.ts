import { ref, computed } from 'vue'

const DEFAULT_PRO_LABORE_YEAR = new Date().getFullYear()
const MIN_PRO_LABORE_YEAR = 2000
const MAX_PRO_LABORE_YEAR = 2099

export function isValidProLaboreYear(year: number): boolean {
  return Number.isInteger(year) && year >= MIN_PRO_LABORE_YEAR && year <= MAX_PRO_LABORE_YEAR
}

function parsePtBrCurrency(value: string): number | null {
  const sanitizedValue = value.replace(/\s/g, '')
  if (!sanitizedValue) return null

  const normalizedValue = sanitizedValue.replace(/\./g, '').replace(',', '.')
  const parsedValue = Number(normalizedValue)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null
  }

  return parsedValue
}

function formatPtBrCurrencyInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, '')
  if (!digitsOnly) return ''

  const numericValue = Number(digitsOnly) / 100

  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function useProLabore() {
  const proLaboreActive = ref(false)
  const proLaboreValue = ref('')
  const proLaboreYear = ref(DEFAULT_PRO_LABORE_YEAR)

  const parsedProLaboreValue = computed(() => parsePtBrCurrency(proLaboreValue.value))
  const isProLaboreValid = computed(
    () =>
      !proLaboreActive.value ||
      (parsedProLaboreValue.value !== null && isValidProLaboreYear(proLaboreYear.value))
  )

  const onProLaboreInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    proLaboreValue.value = formatPtBrCurrencyInput(target.value)
  }

  const onProLaboreYearInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const parsed = Number.parseInt(target.value, 10)
    proLaboreYear.value = Number.isFinite(parsed) ? parsed : DEFAULT_PRO_LABORE_YEAR
  }

  const resetProLabore = () => {
    proLaboreActive.value = false
    proLaboreValue.value = ''
    proLaboreYear.value = DEFAULT_PRO_LABORE_YEAR
  }

  return {
    proLaboreActive,
    proLaboreValue,
    proLaboreYear,
    parsedProLaboreValue,
    isProLaboreValid,
    isValidProLaboreYear,
    onProLaboreInput,
    onProLaboreYearInput,
    resetProLabore,
  }
}
