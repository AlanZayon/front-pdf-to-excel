import { http, parseApiError } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export type Cliente = {
  id: number
  cnpj: string
  razaoSocial: string
  codigoBancoPadrao?: number | null
  ativo: boolean
  createdAtUtc: string
}

export type CreateClientePayload = {
  cnpj: string
  razaoSocial: string
  codigoBancoPadrao?: number | null
}

export type UpdateClientePayload = {
  razaoSocial: string
  codigoBancoPadrao?: number | null
  ativo?: boolean
}

export class ClienteService {
  static async list(search?: string, page = 1, pageSize = 50): Promise<{ items: Cliente[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search?.trim()) params.set('search', search.trim())

    const response = await http.get(`/api/clientes?${params.toString()}`, { withCredentials: true })
    return {
      items: response.data.items ?? [],
      total: response.data.total ?? 0,
    }
  }

  static async getById(id: number): Promise<Cliente | null> {
    try {
      const response = await http.get<Cliente>(`/api/clientes/${id}`, { withCredentials: true })
      return response.data
    } catch {
      return null
    }
  }

  static async create(payload: CreateClientePayload): Promise<Cliente> {
    const response = await http.post<Cliente>('/api/clientes', payload, { withCredentials: true })
    return response.data
  }

  static async update(id: number, payload: UpdateClientePayload): Promise<Cliente> {
    const response = await http.put<Cliente>(`/api/clientes/${id}`, payload, { withCredentials: true })
    return response.data
  }

  static async deactivate(id: number): Promise<void> {
    await http.delete(`/api/clientes/${id}`, { withCredentials: true })
  }

  static formatCnpj(cnpj: string): string {
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length !== 14) return cnpj
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  static normalizeCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '')
  }

  static isValidCnpj(cnpj: string): boolean {
    const digits = ClienteService.normalizeCnpj(cnpj)
    if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false

    const calcDigit = (base: string, weights: number[]) => {
      const sum = weights.reduce((acc, weight, index) => acc + Number(base[index]) * weight, 0)
      const remainder = sum % 11
      return remainder < 2 ? 0 : 11 - remainder
    }

    const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const firstDigit = calcDigit(digits.slice(0, 12), firstWeights)
    const secondDigit = calcDigit(digits.slice(0, 12) + String(firstDigit), secondWeights)

    return digits.endsWith(`${firstDigit}${secondDigit}`)
  }

  static formatBankCode(code?: number | null): string {
    if (code == null) return '—'
    return String(code).padStart(4, '0')
  }

  static handleError(error: unknown, fallback: string): string {
    logger.error(fallback, error)
    return parseApiError(error, fallback)
  }
}
