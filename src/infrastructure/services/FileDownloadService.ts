import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class FileDownloadService {
  static async execute(): Promise<void> {
    try {
      const response = await http.get('/api/download/download', {
        responseType: 'blob',
      })
      console.log(response.data)

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'PGTO.csv') 
      document.body.appendChild(link)
      link.click()
      link.remove()

      logger.info('Download realizado com sucesso')
    } catch (error) {
      logger.error('Erro ao realizar download', error)
    }
  }
}
