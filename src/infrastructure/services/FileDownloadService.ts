import { http } from '../../shared/utils/http'
import { getSessionId, resetSessionId } from '../../shared/utils/session'
import { logger } from '../../shared/logging/logger'
import { HistoryService } from './HistoryService'

export class FileDownloadService {
  static async execute(fileName?: string, jobId?: string): Promise<void> {
    try {
      if (jobId) {
        await HistoryService.downloadByJobId(jobId, fileName)
        logger.info(`Download realizado com sucesso via job ${jobId}`)
        return
      }

      const sessionId = getSessionId()

      const response = await http.get('/api/download/download', {
        responseType: 'blob',
        params: fileName ? { file: fileName } : undefined,
        headers: {
          'X-User-Session': sessionId
        }
      })

      const contentDisposition = response.headers['content-disposition']
      let resolvedFileName = fileName || 'PGTO.csv'

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)

        if (fileNameMatch && fileNameMatch[1]) {
          resolvedFileName = fileNameMatch[1].replace(/['"]/g, '')

          if (resolvedFileName.includes("UTF-8''")) {
            resolvedFileName = resolvedFileName.split("UTF-8''")[1]
          }
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', resolvedFileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      logger.info(`Download realizado com sucesso: ${resolvedFileName}`)
    } catch (error) {
      logger.error('Erro ao realizar download', error)
      throw error
    }
  }

  static resetSessionId(): void {
    resetSessionId()
  }
}
