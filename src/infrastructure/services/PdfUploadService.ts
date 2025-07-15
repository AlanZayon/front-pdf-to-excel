import { UploadPdfCommand } from '../../application/commands/UploadPdfCommand'
import type { UploadResult } from '../../domain/models/UploadResult'
import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class PdfUploadService {
  static async execute(command: UploadPdfCommand): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('pdfFile', command.file)

    try {
      const response = await http.post('/api/upload/upload', formData)
      logger.info('PDF enviado com sucesso', response.data)
      return { message: 'PDF enviado com sucesso' }
    } catch (error) {
      logger.error('Erro no upload', error)
      return { message: 'Erro ao enviar o PDF' }
    }
  }
}
