import { describe, expect, it } from 'vitest'
import type { QueueItem } from '../interfaces/views/upload/composables/useJobQueue'
import {
  getQueuePendingAction,
  getOfxBatchClienteRequiredMessage,
  queueItemNeedsBankData,
  queueItemNeedsClassification,
} from '../interfaces/views/upload/composables/useJobQueue'

function makeItem(overrides: Partial<QueueItem>): QueueItem {
  return {
    id: '1',
    file: new File(['ofx'], 'extrato.ofx'),
    fileName: 'extrato.ofx',
    fileType: 'OFX',
    status: 'pending_classification',
    ...overrides,
  }
}

describe('useJobQueue helpers', () => {
  it('detects OFX waiting for bank data', () => {
    const item = makeItem({ cnpj: undefined, bankCode: undefined })
    expect(queueItemNeedsBankData(item)).toBe(true)
    expect(getQueuePendingAction(item)).toBe('configure')
  })

  it('detects OFX waiting for classification', () => {
    const item = makeItem({
      cnpj: '12345678000199',
      bankCode: '001',
      uploadResult: {
        success: true,
        type: 'ofx',
        status: 'pending_classification',
        transacoesClassificadas: [],
        pendingTransactions: [],
        filePath: '',
        message: 'Classificação pendente',
      },
    })

    expect(queueItemNeedsBankData(item)).toBe(false)
    expect(queueItemNeedsClassification(item)).toBe(true)
    expect(getQueuePendingAction(item)).toBe('classify')
  })

  it('requires cliente for batch OFX uploads', () => {
    const files = [
      new File(['ofx'], 'a.ofx'),
      new File(['ofx'], 'b.ofx'),
    ]

    expect(getOfxBatchClienteRequiredMessage(files, null)).toContain('Padrão do escritório')
    expect(getOfxBatchClienteRequiredMessage(files, 1)).toBeNull()
    expect(getOfxBatchClienteRequiredMessage([new File(['pdf'], 'a.pdf')], null)).toBeNull()
  })
})
