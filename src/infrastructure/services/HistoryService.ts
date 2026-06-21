import { http } from '../../shared/utils/http'
import type { UploadJobStatus } from '../../infrastructure/services/UploadService'

export type UploadHistoryItem = {
  jobId: string
  state: string
  fileType?: string
  inputFileName?: string
  outputFile?: string
  message?: string
  createdAtUtc: string
  completedAtUtc?: string
  clienteId?: number
  clienteNome?: string
  cnpj?: string
  sessionId: string
}

export class HistoryService {
  static async list(params?: {
    clienteId?: number
    tipo?: string
    from?: string
    to?: string
    page?: number
    pageSize?: number
  }): Promise<{ items: UploadHistoryItem[]; total: number }> {
    const query = new URLSearchParams()
    if (params?.clienteId) query.set('clienteId', String(params.clienteId))
    if (params?.tipo) query.set('tipo', params.tipo)
    if (params?.from) query.set('from', params.from)
    if (params?.to) query.set('to', params.to)
    query.set('page', String(params?.page ?? 1))
    query.set('pageSize', String(params?.pageSize ?? 20))

    const response = await http.get(`/api/upload/history?${query.toString()}`, { withCredentials: true })
    return {
      items: response.data.items ?? [],
      total: response.data.total ?? 0,
    }
  }

  static async downloadByJobId(jobId: string, fileName?: string): Promise<void> {
    const response = await http.get(`/api/download/${jobId}`, {
      withCredentials: true,
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'conversao.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  static async fetchCsvTextByJobId(jobId: string): Promise<string> {
    const response = await http.get(`/api/download/${jobId}`, {
      withCredentials: true,
      responseType: 'text',
    })

    return typeof response.data === 'string' ? response.data : ''
  }

  static mapJobStatus(item: UploadHistoryItem): UploadJobStatus | null {
    if (item.state !== 'Completed' && item.state !== 'Failed') return null
    return {
      jobId: item.jobId,
      state: item.state as UploadJobStatus['state'],
      message: item.message,
      createdAtUtc: item.createdAtUtc,
      completedAtUtc: item.completedAtUtc,
      outputFile: item.outputFile,
    }
  }
}
