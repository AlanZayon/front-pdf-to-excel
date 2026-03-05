import { UploadCommand } from '../../application/commands/UploadCommand'
import type { UploadResult } from '../../domain/models/UploadResult'
import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class UploadService {
  static async execute(command: UploadCommand): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', command.file)
    const sessionId = this.getSessionId()

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
      'CNPJ': command.cnpj || '',
      'CodigoBanco': command.bankCode || '',
      'X-User-Session': sessionId
    }

    // NOVO: Adicionar headers do pro labore se existir
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
      })

      return {
        success: true,
        ...response.data,
        message: 'Upload concluído com sucesso',
      }
    } catch (error: any) {
      logger.error('Erro no upload', error?.response?.data || error.message)

      return {
        success: false,
        message: 'Erro ao enviar o arquivo',
        error: error?.response?.data || error.message,
      }
    }
  }


  static async saveClassification(classificationData: {
    TransacoesClassificadas: any[]
    Classificacoes: Array<{
      descricao: string
      data: string
      valor: number
      codigoDebito: string
      codigoCredito: string
    }>
    TransacoesPendentes: any[],
    cnpj: string
  }): Promise<UploadResult> {
    try {
      const sessionId = this.getSessionId()
      const response = await http.post('/api/upload/finalizar-processamento', classificationData, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Session': sessionId
        },
        withCredentials: true,
      })

      logger.info('Classificação salva com sucesso:', response.data)

      return {
        success: true,
        ...response.data,
        message: 'Classificação salva com sucesso',
      }
    } catch (error: any) {
      logger.error('Erro ao salvar classificação', error?.response?.data || error.message)

      return {
        success: false,
        message: 'Erro ao salvar classificação',
        error: error?.response?.data || error.message,
      }
    }
  }

  static getSessionId(): string {
    let sessionId = sessionStorage.getItem('userSessionId')
    if (!sessionId) {
      sessionId = this.generateUUID()
      sessionStorage.setItem('userSessionId', sessionId)
    }
    return sessionId
  }

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
}