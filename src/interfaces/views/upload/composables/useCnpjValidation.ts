export function validateCnpj(cnpj: string): boolean {
  const cleanedCnpj = cnpj.replace(/[^\d]+/g, '')

  if (cleanedCnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleanedCnpj)) return false

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let soma = 0
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cleanedCnpj.charAt(i)) * pesos1[i]
  }

  let resto = soma % 11
  const digito1 = resto < 2 ? 0 : 11 - resto

  if (digito1 !== parseInt(cleanedCnpj.charAt(12))) return false

  soma = 0
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cleanedCnpj.charAt(i)) * pesos2[i]
  }

  resto = soma % 11
  const digito2 = resto < 2 ? 0 : 11 - resto

  return digito2 === parseInt(cleanedCnpj.charAt(13))
}

export function validateBankCode(codigo: string): boolean {
  if (!codigo) return false
  const codigoLimpo = codigo.replace(/\D/g, '')
  return codigoLimpo.length > 0 && /^\d+$/.test(codigoLimpo) && !/^0+$/.test(codigoLimpo)
}
