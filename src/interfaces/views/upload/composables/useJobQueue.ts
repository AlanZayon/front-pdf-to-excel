import { ref, computed } from 'vue'
import { UploadCommand } from '../../../../application/commands/UploadCommand'
import { UploadService } from '../../../../infrastructure/services/UploadService'
import type { UploadResult } from '../../../../domain/models/UploadResult'
import { getFileTypeLabel } from './useTransactionGroups'
import { mapJobFailureMessage } from '../../../../shared/utils/errorMessages'

export type QueueItemStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'pending_classification'

export type QueueItem = {
  id: string
  file: File
  fileName: string
  fileType: string
  status: QueueItemStatus
  jobId?: string
  message?: string
  uploadResult?: UploadResult
  clienteId?: number | null
  cnpj?: string
  bankCode?: string
  proLabore?: { ano: number; valor: number | null; active: boolean }
}

const MAX_CONCURRENT = 3
export const MAX_FILES_PER_UPLOAD = 10

export function getUploadBatchLimitMessage(fileCount: number): string | null {
  if (fileCount <= MAX_FILES_PER_UPLOAD) return null
  return `Selecione no máximo ${MAX_FILES_PER_UPLOAD} arquivos por vez (PDF ou OFX).`
}

export function getOfxBatchClienteRequiredMessage(
  files: File[],
  clienteId: number | null | undefined
): string | null {
  const hasOfx = files.some((file) => getFileTypeLabel(file) === 'OFX')
  if (!hasOfx || clienteId) return null
  return 'Para processar vários OFX em paralelo, selecione um cliente cadastrado. A opção "Padrão do escritório / manual" não é permitida.'
}

export function getQueueOutputFileName(item: QueueItem): string | undefined {
  if (item.status !== 'completed') return undefined
  if (item.uploadResult?.success && 'outputFile' in item.uploadResult && item.uploadResult.outputFile) {
    return item.uploadResult.outputFile
  }
  return item.fileName.replace(/\.[^.]+$/, '.csv')
}

export function queueItemNeedsBankData(item: QueueItem): boolean {
  return (
    item.fileType === 'OFX' &&
    item.status === 'pending_classification' &&
    (!item.cnpj || !item.bankCode)
  )
}

export function queueItemNeedsClassification(item: QueueItem): boolean {
  return (
    item.status === 'pending_classification' &&
    item.uploadResult?.success === true &&
    item.uploadResult.type === 'ofx' &&
    item.uploadResult.status === 'pending_classification'
  )
}

export function getQueuePendingAction(item: QueueItem): 'configure' | 'classify' | null {
  if (item.status !== 'pending_classification') return null
  if (queueItemNeedsClassification(item)) return 'classify'
  if (queueItemNeedsBankData(item)) return 'configure'
  return null
}

export function canPreviewQueueItem(item: QueueItem): boolean {
  return item.status === 'completed' && Boolean(item.jobId || getQueueOutputFileName(item))
}

export function useJobQueue() {
  const items = ref<QueueItem[]>([])
  const activeCount = ref(0)

  const pendingClassificationItems = computed(() =>
    items.value.filter((item) => item.status === 'pending_classification')
  )

  const completedItems = computed(() =>
    items.value.filter((item) => item.status === 'completed')
  )

  const hasMultipleCompleted = computed(() => completedItems.value.length >= 2)

  function enqueueFiles(
    files: File[],
    options?: {
      clienteId?: number | null
      cnpj?: string
      bankCode?: string
      proLabore?: QueueItem['proLabore']
    }
  ) {
    const limitMessage = getUploadBatchLimitMessage(files.length)
    if (limitMessage) return limitMessage

    for (const file of files) {
      items.value.push({
        id: crypto.randomUUID(),
        file,
        fileName: file.name,
        fileType: getFileTypeLabel(file),
        status: 'pending',
        clienteId: options?.clienteId,
        cnpj: options?.cnpj,
        bankCode: options?.bankCode,
        proLabore: options?.proLabore,
      })
    }
    void processQueue()
    return null
  }

  async function processQueue() {
    while (activeCount.value < MAX_CONCURRENT) {
      const next = items.value.find((item) => item.status === 'pending')
      if (!next) break

      next.status = 'processing'
      activeCount.value++
      void processItem(next).finally(() => {
        activeCount.value--
        void processQueue()
      })
    }
  }

  async function processItem(item: QueueItem) {
    if (queueItemNeedsBankData(item)) {
      item.status = 'pending_classification'
      item.message = 'Informe CNPJ e banco para processar OFX'
      return
    }

    const command = new UploadCommand(
      item.file,
      item.cnpj ?? '',
      item.bankCode ?? '',
      undefined,
      item.proLabore?.active
        ? { ano: item.proLabore.ano, valor: item.proLabore.valor }
        : undefined,
      item.clienteId
    )

    const result = await UploadService.execute(command)
    if (!result.jobId) {
      item.status = result.success ? 'completed' : 'failed'
      item.message = result.message
      item.uploadResult = result
      return
    }

    item.jobId = result.jobId
    const status = await UploadService.pollJobUntilComplete(result.jobId)
    if (!status) {
      item.status = 'failed'
      item.message = 'Tempo esgotado aguardando processamento'
      return
    }

    if (status.state === 'Failed') {
      item.status = 'failed'
      item.message = mapJobFailureMessage(status.message)
      return
    }

    const uploadResult = UploadService.buildUploadResultFromJobStatus(status)
    item.uploadResult = uploadResult

    if (uploadResult.success && uploadResult.type === 'ofx' && uploadResult.status === 'pending_classification') {
      item.status = 'pending_classification'
      item.message = 'Classificação pendente'
      return
    }

    item.status = uploadResult.success ? 'completed' : 'failed'
    item.message = uploadResult.message
  }

  function updateOfxContext(itemId: string, cnpj: string, bankCode: string, clienteId?: number | null) {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return
    const wasWaitingForBank = queueItemNeedsBankData(item)
    item.cnpj = cnpj
    item.bankCode = bankCode
    item.clienteId = clienteId
    if (wasWaitingForBank && item.cnpj && item.bankCode) {
      item.status = 'pending'
      item.message = undefined
      void processQueue()
    }
  }

  function completeQueueItem(itemId: string, uploadResult: UploadResult, jobId?: string) {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return
    item.uploadResult = uploadResult
    item.message = uploadResult.message
    if (jobId) item.jobId = jobId
    item.status = uploadResult.success ? 'completed' : 'failed'
  }

  function applyClienteToWaitingOfxItems(clienteId: number, cnpj: string, bankCode: string) {
    for (const item of items.value) {
      if (!queueItemNeedsBankData(item)) continue
      updateOfxContext(item.id, cnpj, bankCode, clienteId)
    }
  }

  function removeItem(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function clearCompleted() {
    items.value = items.value.filter(
      (item) => item.status !== 'completed' && item.status !== 'failed'
    )
  }

  return {
    items,
    pendingClassificationItems,
    completedItems,
    hasMultipleCompleted,
    enqueueFiles,
    updateOfxContext,
    completeQueueItem,
    applyClienteToWaitingOfxItems,
    removeItem,
    clearCompleted,
  }
}
