import axios from 'axios'

const PDF_EMPTY_PATTERNS = [
  'nenhum dado para gerar',
  'nenhum pagamento',
  'nenhum dado',
]

export function mapJobFailureMessage(message?: string): string {
  if (!message?.trim()) return 'Erro ao processar arquivo'
  const lower = message.toLowerCase()
  if (PDF_EMPTY_PATTERNS.some((p) => lower.includes(p))) {
    return 'Nenhum pagamento encontrado neste PDF. Verifique se é um DARF/DAS válido.'
  }
  return message
}

export function mapApiErrorToUserMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const status = error.response?.status
  const data = error.response?.data as Record<string, unknown> | string | undefined

  if (status === 429) {
    return 'Muitas tentativas. Aguarde 1 minuto e tente novamente.'
  }

  if (status === 401) {
    return 'Sessão expirada. Faça login novamente.'
  }

  let rawMessage = ''
  if (typeof data === 'string' && data.trim()) {
    rawMessage = data
  } else if (data && typeof data === 'object') {
    if (typeof data.message === 'string') rawMessage = data.message
    else if (typeof data.title === 'string') rawMessage = data.title
  }

  const lower = rawMessage.toLowerCase()
  if (PDF_EMPTY_PATTERNS.some((p) => lower.includes(p))) {
    return 'Nenhum pagamento encontrado neste PDF. Verifique se é um DARF/DAS válido.'
  }

  if (lower.includes('100 mb') || lower.includes('tamanho máximo')) {
    return rawMessage || 'Arquivo excede o tamanho máximo permitido (100 MB).'
  }

  if (rawMessage.trim()) return rawMessage
  return fallback
}
