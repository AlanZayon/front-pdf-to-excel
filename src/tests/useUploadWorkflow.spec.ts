import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useUploadWorkflow } from '@/interfaces/views/upload/composables/useUploadWorkflow'

vi.mock('@/infrastructure/services/UploadService', () => ({
  UploadService: {
    execute: vi.fn(async () => ({
      success: true,
      type: 'pdf',
      result: {},
      jobId: 'job-1',
      message: 'ok',
    })),
    pollJobUntilComplete: vi.fn(async () => ({
      jobId: 'job-1',
      state: 'Completed',
      message: 'ok',
      result: { type: 'pdf', result: {} },
    })),
    buildUploadResultFromJobStatus: vi.fn(() => ({
      success: true,
      type: 'pdf',
      result: {},
      message: 'ok',
    })),
  },
}))

vi.mock('@/infrastructure/services/FileDownloadService', () => ({
  FileDownloadService: {
    execute: vi.fn(async () => undefined),
    resetSessionId: vi.fn(),
  },
}))

vi.mock('@/shared/utils/session', () => ({
  resetSessionId: vi.fn(),
}))

describe('useUploadWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes PDF uploads via async job polling', async () => {
    const proLabore = {
      active: ref(false),
      year: ref(2026),
      parsedValue: ref<number | null>(null),
      isValid: ref(true),
      resetProLabore: vi.fn(),
      value: ref(''),
    }

    const workflow = useUploadWorkflow(proLabore)
    const file = new File(['pdf'], 'test.pdf', { type: 'application/pdf' })
    workflow.setFile(file)

    await workflow.handleUpload()

    expect(workflow.uploadResult.value?.success).toBe(true)
  })

  it('opens bank modal for OFX files', async () => {
    const proLabore = {
      active: ref(false),
      year: ref(2026),
      parsedValue: ref<number | null>(null),
      isValid: ref(true),
      resetProLabore: vi.fn(),
      value: ref(''),
    }

    const workflow = useUploadWorkflow(proLabore)
    const file = new File(['ofx'], 'test.ofx', { type: 'application/x-ofx' })
    workflow.setFile(file)

    const result = await workflow.handleUpload()
    expect(result).toBe('ofx_bank_modal')
    expect(workflow.showBankDataModal.value).toBe(true)
  })

  it('rejects invalid file types in setFile', () => {
    const proLabore = {
      active: ref(false),
      year: ref(2026),
      parsedValue: ref<number | null>(null),
      isValid: ref(true),
      resetProLabore: vi.fn(),
      value: ref(''),
    }

    const workflow = useUploadWorkflow(proLabore)
    const invalid = new File(['txt'], 'notes.txt', { type: 'text/plain' })
    expect(workflow.setFile(invalid)).toBe(false)
    expect(workflow.uploadResult.value?.success).toBe(false)
  })

  it('resets pro labore when clearing file', () => {
    const resetProLabore = vi.fn()
    const proLabore = {
      active: ref(true),
      year: ref(2026),
      parsedValue: ref<number | null>(100),
      isValid: ref(true),
      resetProLabore,
      value: ref('100,00'),
    }

    const workflow = useUploadWorkflow(proLabore)
    workflow.setFile(new File(['pdf'], 'test.pdf', { type: 'application/pdf' }))
    workflow.resetUploadState()

    expect(resetProLabore).toHaveBeenCalled()
    expect(workflow.file.value).toBeNull()
  })
})
