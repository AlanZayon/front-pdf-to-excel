export const LINKED_TAXES = {
  INSS: 'INSS',
  IRRF: 'IRRF'
} as const

export function isLinkedTax(code: string): boolean {
  return code === LINKED_TAXES.IRRF
}

export function formatTaxName(name: string): string {
  return name
    .replace('INSS', 'INSS (DCTWEB)')
    .replace('SIMPLES_NACIONAL', 'SIMPLES NACIONAL')
    .replace('MULTA_JUROS', 'MULTA E JUROS')
}

export function getDebitoValue(
  code: string,
  taxCodes: Record<string, { debito?: string; credito?: string }>
): string {
  if (code === LINKED_TAXES.IRRF) {
    const inssCode = taxCodes[LINKED_TAXES.INSS]
    return inssCode?.debito === '_' ? '' : inssCode?.debito || ''
  }

  const taxCode = taxCodes[code]
  return taxCode?.debito === '_' ? '' : taxCode?.debito || ''
}

export function getCreditoValue(
  code: string,
  taxCodes: Record<string, { debito?: string; credito?: string }>
): string {
  if (code === LINKED_TAXES.IRRF) {
    const inssCode = taxCodes[LINKED_TAXES.INSS]
    return inssCode?.credito === '_' ? '' : inssCode?.credito || ''
  }

  const taxCode = taxCodes[code]
  return taxCode?.credito === '_' ? '' : taxCode?.credito || ''
}

export function syncLinkedTaxCodes(
  taxCodes: Record<string, { debito?: string; credito?: string }>,
  code: string,
  field: 'debito' | 'credito',
  value: string
): Record<string, { debito?: string; credito?: string }> {
  const updated = { ...taxCodes }

  if (!updated[code]) {
    updated[code] = { debito: '', credito: '' }
  }

  updated[code][field] = value

  if (code === LINKED_TAXES.INSS) {
    if (!updated[LINKED_TAXES.IRRF]) {
      updated[LINKED_TAXES.IRRF] = { debito: '', credito: '' }
    }
    updated[LINKED_TAXES.IRRF][field] = value
  }

  return updated
}
