import { ref, computed, type Ref } from 'vue'
import { UploadCommand } from '../../../../application/commands/UploadCommand'
import { UploadService } from '../../../../infrastructure/services/UploadService'
import { FileDownloadService } from '../../../../infrastructure/services/FileDownloadService'
import type { UploadResult } from '../../../../domain/models/UploadResult'
import { isValidFileType, getFileTypeLabel } from './useTransactionGroups'

type ProLaboreConfig = {
  active: Ref<boolean>
  year: number
  parsedValue: Ref<number | null>
  isValid: Ref<boolean>
  resetProLabore: () => void
  value: Ref<string>
}

export function useUploadWorkflow(proLabore: ProLaboreConfig) {
  const file = ref<File | null>(null)
  const fileName = ref<string | null>(null)
  const fileType = ref<string>('')
  const uploadResult = ref<UploadResult | null>(null)
  const isLoading = ref(false)
  const isProcessingJob = ref(false)
  const showBankDataModal = ref(false)
  const currentJobId = ref<string | null>(null)

  const canProcessFile = computed(
    () => Boolean(file.value) && !isLoading.value && !isProcessingJob.value && proLabore.isValid.value
  )

  const resetUploadState = (options?: { preserveProLabore?: boolean }) => {
    file.value = null
    fileName.value = null
    fileType.value = ''
    uploadResult.value = null
    isLoading.value = false
    isProcessingJob.value = false
    showBankDataModal.value = false
    currentJobId.value = null
    if (!options?.preserveProLabore) {
      proLabore.resetProLabore()
    }
  }

  const setFile = (selectedFile: File) => {
    if (!isValidFileType(selectedFile)) {
      uploadResult.value = { success: false, message: 'Tipo de arquivo inválido. Use PDF ou OFX.' }
      return false
    }

    file.value = selectedFile
    fileName.value = selectedFile.name
    fileType.value = getFileTypeLabel(selectedFile)
    uploadResult.value = null
    return true
  }

  const pollJobUntilComplete = async (jobId: string): Promise<boolean> => {
    isProcessingJob.value = true
    const status = await UploadService.pollJobUntilComplete(jobId)
    isProcessingJob.value = false

    if (!status) {
      uploadResult.value = {
        success: false,
        message: 'Tempo esgotado aguardando processamento do arquivo',
      }
      return false
    }

    if (status.state === 'Failed') {
      uploadResult.value = {
        success: false,
        message: status.message || 'Erro ao processar arquivo',
      }
      return false
    }

    uploadResult.value = UploadService.buildUploadResultFromJobStatus(status)
    return true
  }

  const handleUpload = async (): Promise<'pdf_done' | 'ofx_bank_modal' | 'error'> => {
    if (!file.value || !canProcessFile.value) return 'error'

    isLoading.value = true
    uploadResult.value = null

    try {
      if (fileType.value === 'PDF') {
        const command = new UploadCommand(
          file.value,
          '',
          '',
          undefined,
          proLabore.active.value
            ? { ano: proLabore.year, valor: proLabore.parsedValue.value }
            : undefined
        )
        const result = await UploadService.execute(command)

        if (result.jobId) {
          currentJobId.value = result.jobId
          const completed = await pollJobUntilComplete(result.jobId)
          if (!completed) return 'error'
        } else {
          uploadResult.value = result
        }

        return uploadResult.value?.success ? 'pdf_done' : 'error'
      }

      if (fileType.value === 'OFX') {
        showBankDataModal.value = true
        return 'ofx_bank_modal'
      }

      return 'error'
    } finally {
      isLoading.value = false
    }
  }

  const handleDownload = async (event?: Event) => {
    event?.preventDefault()

    try {
      await FileDownloadService.execute()
      FileDownloadService.resetSessionId()
      resetUploadState({ preserveProLabore: true })
      return true
    } catch {
      uploadResult.value = {
        success: false,
        message: 'Erro ao baixar arquivo',
      }
      return false
    }
  }

  return {
    file,
    fileName,
    fileType,
    uploadResult,
    isLoading,
    isProcessingJob,
    showBankDataModal,
    currentJobId,
    canProcessFile,
    setFile,
    resetUploadState,
    handleUpload,
    handleDownload,
    pollJobUntilComplete,
  }
}
