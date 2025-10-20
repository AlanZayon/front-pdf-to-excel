import { UploadCommand } from '../../application/commands/UploadCommand'
import type { UploadResult } from '../../domain/models/UploadResult'
import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class UploadService {
  static async execute(command: UploadCommand): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', command.file)

    try {
      const response = await http.post('/api/upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'CNPJ': command.cnpj || '',
          'CodigoBanco':command.bankCode || '',

        },
        withCredentials: true,
      })

      console.log('Upload bem-sucedido:', response.data)


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
    console.log('Iniciando o salvamento da classificação...', classificationData)
    try {
      console.log('Dados de classificação a serem enviados:', classificationData)
      const response = await http.post('/api/upload/finalizar-processamento', classificationData, {
        headers: { 'Content-Type': 'application/json' },
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
}