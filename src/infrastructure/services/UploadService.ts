import { UploadCommand } from '../../application/commands/UploadCommand'

import type { UploadResult } from '../../domain/models/UploadResult'

import { http, parseApiError } from '../../shared/utils/http'

import { getSessionId } from '../../shared/utils/session'

import { logger } from '../../shared/logging/logger'



export type UploadJobStatus = {

  jobId: string

  state: 'Pending' | 'Processing' | 'Completed' | 'Failed'

  message?: string

  createdAtUtc?: string

  completedAtUtc?: string

  outputFile?: string

  result?: Record<string, unknown>

}



export class UploadService {

  static async execute(

    command: UploadCommand

  ): Promise<UploadResult & { jobId?: string; state?: string }> {

    const formData = new FormData()

    formData.append('file', command.file)

    const sessionId = getSessionId()



    const headers: Record<string, string> = {

      'Content-Type': 'multipart/form-data',

      'CNPJ': command.cnpj || '',

      'CodigoBanco': command.bankCode || '',

      'X-User-Session': sessionId

    }



    if (command.proLabore) {

      headers['ProLabore-Ano'] = command.proLabore.ano.toString()

      if (command.proLabore.valor !== null && command.proLabore.valor !== undefined) {

        headers['ProLabore-Valor'] = command.proLabore.valor.toString()

      }

    }



    try {

      const response = await http.post('/api/upload/upload', formData, {

        headers,

        withCredentials: true,

        validateStatus: (status) => status === 200 || status === 202,

      })



      if (response.status === 202) {

        return {

          success: true,

          jobId: response.data.jobId,

          state: response.data.state,

          message: response.data.message || 'Arquivo enfileirado para processamento',

        } as UploadResult & { jobId?: string; state?: string }

      }



      return {

        success: true,

        ...response.data,

        message: 'Upload concluído com sucesso',

      }

    } catch (error: unknown) {

      logger.error('Erro no upload', error)



      return {

        success: false,

        message: parseApiError(error, 'Erro ao enviar o arquivo'),

        error,

      }

    }

  }



  static async getJobStatus(jobId: string): Promise<UploadJobStatus | null> {

    try {

      const response = await http.get<UploadJobStatus>(`/api/upload/status/${jobId}`, {

        withCredentials: true,

      })

      return response.data

    } catch {

      return null

    }

  }



  static getPollConfig() {
    const maxMs = Number(import.meta.env.VITE_JOB_POLL_MAX_MS) || 600_000
    const intervalMs = 1000
    return { maxAttempts: Math.ceil(maxMs / intervalMs), intervalMs }
  }

  static async pollJobUntilComplete(
    jobId: string,
    maxAttempts?: number,
    intervalMs?: number,
    onStatus?: (status: UploadJobStatus) => void
  ): Promise<UploadJobStatus | null> {
    const config = UploadService.getPollConfig()
    const attempts = maxAttempts ?? config.maxAttempts
    const interval = intervalMs ?? config.intervalMs

    for (let attempt = 0; attempt < attempts; attempt++) {
      const status = await UploadService.getJobStatus(jobId)

      if (!status) {
        await new Promise((resolve) => setTimeout(resolve, interval))
        continue
      }

      onStatus?.(status)

      if (status.state === 'Completed' || status.state === 'Failed') {
        return status
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    return null
  }



  static buildUploadResultFromJobStatus(status: UploadJobStatus): UploadResult {

    if (status.state === 'Failed') {

      return {

        success: false,

        message: status.message || 'Erro ao processar arquivo',

      }

    }



    const result = status.result ?? {}

    const type = result.type as string | undefined



    if (type === 'pdf') {

      return {

        success: true,

        type: 'pdf',

        result: result.result ?? result,

        outputFile: (result.outputFile as string | undefined) ?? status.outputFile ?? 'PGTO.csv',

        message: status.message || 'PDF processado com sucesso',

      }

    }



    if (type === 'ofx' && result.status === 'pending_classification') {

      return {

        success: true,

        type: 'ofx',

        status: 'pending_classification',

        transacoesClassificadas: (result.transacoesClassificadas as any[]) ?? [],

        pendingTransactions: (result.pendingTransactions as any[]) ?? [],

        filePath: '',

        message: status.message || 'Classificação pendente',

      }

    }



    if (type === 'ofx') {

      return {

        success: true,

        type: 'ofx',

        status: 'completed',

        outputFile: (result.outputFile as string | undefined) ?? status.outputFile ?? 'EXTRATO.csv',

        transacoesClassificadas: (result.transacoesClassificadas as any[]) ?? [],

        message: status.message || 'OFX processado com sucesso',

      }

    }



    return {

      success: true,

      type: 'pdf',

      result,

      message: status.message || 'Processamento concluído',

    }

  }



  static async saveClassification(classificationData: {

    TransacoesClassificadas: any[]

    Classificacoes: Array<{

      descricao: string

      data: string

      valor: number

      codigoDebito: number

      codigoCredito: number

      codigoBanco?: number

      isClassificacaoIndividual?: boolean

    }>

    TransacoesPendentes: any[]

    cnpj: string

    dateFilter?: {

      startDate: string

      endDate: string

      isActive: boolean

    }

  }): Promise<UploadResult & { jobId?: string }> {

    try {

      const sessionId = getSessionId()

      const response = await http.post('/api/upload/finalizar-processamento', classificationData, {

        headers: {

          'Content-Type': 'application/json',

          'X-User-Session': sessionId

        },

        withCredentials: true,

        validateStatus: (status) => status === 200 || status === 202,

      })



      if (response.status === 202) {

        const jobStatus = await UploadService.pollJobUntilComplete(response.data.jobId)

        if (!jobStatus || jobStatus.state === 'Failed') {

          return {

            success: false,

            message: jobStatus?.message || 'Erro ao finalizar classificação',

          }

        }



        return UploadService.buildUploadResultFromJobStatus(jobStatus)

      }



      logger.info('Classificação salva com sucesso:', response.data)



      return {

        success: true,

        type: 'ofx',

        status: 'completed',

        outputFile: response.data.outputFile ?? 'EXTRATO.csv',

        transacoesClassificadas: [],

        message: 'Classificação salva com sucesso',

      }

    } catch (error: unknown) {

      logger.error('Erro ao salvar classificação', error)



      return {

        success: false,

        message: parseApiError(error, 'Erro ao salvar classificação'),

        error,

      }

    }

  }

}

