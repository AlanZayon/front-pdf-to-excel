import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class FileDownloadService {
  static async execute(): Promise<void> {
    try {
      const response = await http.get('/api/download/download', {
        responseType: 'blob',
        withCredentials: true
      })

      const contentDisposition = response.headers['content-disposition']
      let fileName = 'PGTO.csv'

      console.log('Content-Disposition header:', contentDisposition) 

      if (contentDisposition) {

        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)
        
        if (fileNameMatch && fileNameMatch[1]) {

          fileName = fileNameMatch[1].replace(/['"]/g, '')
          
          if (fileName.includes("UTF-8''")) {
            fileName = fileName.split("UTF-8''")[1]
          }
        }
      }

      console.log('Filename extracted:', fileName)

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
}