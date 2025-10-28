import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class FileDownloadService {
  static async execute(): Promise<void> {
    try {
      const sessionId = this.getSessionId()

      const response = await http.get('/api/download/download', {
        responseType: 'blob',
        withCredentials: true,
        headers: {
          'X-User-Session': sessionId
        }
      })

      const contentDisposition = response.headers['content-disposition']
      let fileName = 'PGTO.csv'


      if (contentDisposition) {

        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)

        if (fileNameMatch && fileNameMatch[1]) {

          fileName = fileNameMatch[1].replace(/['"]/g, '')

          if (fileName.includes("UTF-8''")) {
            fileName = fileName.split("UTF-8''")[1]
          }
        }
      }


      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      logger.info(`Download realizado com sucesso: ${fileName}`)

    } catch (error) {
      logger.error('Erro ao realizar download', error)
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