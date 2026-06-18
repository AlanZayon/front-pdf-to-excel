import { ref, computed } from 'vue'

const PRO_LABORE_YEAR = new Date().getFullYear()

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
  const proLaboreYear = PRO_LABORE_YEAR

  const parsedProLaboreValue = computed(() => parsePtBrCurrency(proLaboreValue.value))
  const isProLaboreValid = computed(() => !proLaboreActive.value || parsedProLaboreValue.value !== null)

  const onProLaboreInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    proLaboreValue.value = formatPtBrCurrencyInput(target.value)
  }

  const resetProLabore = () => {
    proLaboreActive.value = false
    proLaboreValue.value = ''
  }

  return {
    proLaboreActive,
    proLaboreValue,
    proLaboreYear,
    parsedProLaboreValue,
    isProLaboreValid,
    onProLaboreInput,
    resetProLabore
  }
}
