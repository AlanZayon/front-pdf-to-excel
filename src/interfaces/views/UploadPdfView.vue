<template>
  <div class="app-container">
    <div class="user-area">
      <button
        type="button"
        class="user-info"
        :aria-expanded="showUserMenu"
        aria-haspopup="menu"
        @click="toggleUserMenu"
      >
        <img :src="defaultAvatar" class="user-avatar" alt="Avatar do usuário">
        <span class="user-name">{{ user?.fullName || 'Usuário' }}</span>
        <span v-if="taxCodesIncomplete" class="menu-badge" title="Códigos de imposto incompletos">!</span>
        <svg class="user-dropdown-icon" viewBox="0 0 24 24" :class="{ rotated: showUserMenu }">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </button>

      <div v-if="showUserMenu" class="user-menu" role="menu">
        <button class="user-menu-item" type="button" role="menuitem" @click="openEditModal">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path
              d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
            />
          </svg>
          EDITAR PERFIL
        </button>
        <button class="user-menu-item" type="button" role="menuitem" @click="router.push('/codigo'); showUserMenu = false">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          CÓD.IMPOSTO
          <span v-if="taxCodesIncomplete" class="item-badge">!</span>
        </button>
        <button class="user-menu-item" type="button" role="menuitem" @click="router.push('/descricoes'); showUserMenu = false">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          DESCRIÇÕES OFX
        </button>
        <button class="user-menu-item" type="button" role="menuitem" @click="handleLogout">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path
              d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
            />
          </svg>
          SAIR
        </button>
      </div>
    </div>

    <div class="upload-container">
      <h1 class="title">UPLOAD DE ARQUIVOS</h1>
      <p class="subtitle">UPLOAD PDF E OFX</p>

      <JourneyStepper :steps="journeySteps" :current-step-id="currentJourneyStep" />
      <OnboardingBanner />

      <form class="upload-form" @submit.prevent>
        <UploadDropzone
          :is-dragging="isDragging"
          :has-file="Boolean(file)"
          :file-type-hint="fileType"
          @dragover="isDragging = true"
          @dragleave="isDragging = false"
          @drop="onDrop"
          @click="triggerFileInput"
          @change="onFileChange"
          @validation-error="uploadResult = { success: false, message: $event }"
        />
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.ofx,application/pdf,application/x-ofx"
          class="hidden-input"
          @change="onFileChange"
        >

        <ProLaboreFields
          v-if="fileType === 'PDF' || !file"
          v-model:active="proLaboreActive"
          :value="proLaboreValue"
          :year="proLaboreYear"
          :is-valid="isProLaboreValid"
          @input="onProLaboreInput"
        />

        <div v-if="fileName" class="file-info">
          <svg class="file-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span class="file-name">{{ fileName }}</span>
          <span class="file-type">({{ fileType }})</span>
          <button type="button" class="clear-button" @click="clearFile">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
        </div>

        <div v-if="isLoading || isProcessingJob || isProcessingOfx" class="upload-button">
          <span class="button-loading">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
            </svg>
            {{ progressLabel }}<template v-if="jobState.elapsedSeconds > 0"> ({{ jobState.elapsedSeconds }}s)</template>
          </span>
        </div>

        <button
          v-if="classificationPaused && groupedTransactions.length > 0"
          type="button"
          class="upload-button secondary-action"
          @click="resumeClassification"
        >
          RETOMAR CLASSIFICAÇÃO
        </button>

        <button
          v-else-if="file"
          type="button"
          class="upload-button"
          :disabled="!canProcessFile"
          @click="handleUpload"
        >
          <svg class="download-icon" viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H13V5H13V11H19V13Z" />
          </svg>
          PROCESSAR ARQUIVO
        </button>

        <div
          v-if="uploadResult"
          class="result-message"
          :class="{ error: !uploadResult.success }"
        >
          <svg v-if="uploadResult.success" class="result-icon" viewBox="0 0 24 24">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
          <svg v-else class="result-icon" viewBox="0 0 24 24">
            <path
              d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
            />
          </svg>
          <p>{{ successMessage }}</p>
        </div>

        <div v-if="uploadResult?.success" class="download-actions">
          <button
            type="button"
            class="download-button"
            :disabled="isProcessingJob"
            @click="handleDownload($event, previewFileName)"
          >
            <svg class="download-icon" viewBox="0 0 24 24">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
            </svg>
            {{ downloadLabel }}
          </button>
          <button type="button" class="preview-button" @click="showCsvPreview = true">
            PRÉ-VISUALIZAR
          </button>
        </div>

        <section v-if="conversionHistory.length > 0" class="history-section">
          <h2 class="history-title">Conversões recentes</h2>
          <ul class="history-list">
            <li v-for="item in conversionHistory.slice(0, 5)" :key="item.id">
              <span>{{ item.fileName }}</span>
              <span class="history-meta">{{ item.outputFile }} · {{ new Date(item.completedAt).toLocaleString('pt-BR') }}</span>
            </li>
          </ul>
        </section>
      </form>
    </div>

    <CsvPreviewModal
      :visible="showCsvPreview"
      :file-name="previewFileName"
      @close="showCsvPreview = false"
    />

    <EditEmployeeModal
      v-if="showEditModal"
      :is-open="showEditModal"
      :user-data="user ?? undefined"
      @close="closeEditModal"
    />

    <BankModal
      :visible="showBankDataModal"
      :file-name="fileName || ''"
      :bank-code="bankCode"
      :cnpj="cnpj"
      :is-processing="isProcessingOfx"
      :is-form-valid="isBankFormValid"
      :validation-errors="bankValidationErrors"
      :show-date-filter="showDateFilter"
      :date-filter="dateFilter"
      :is-date-filter-valid="isDateFilterValid"
      @close="closeBankDataModal"
      @confirm="proceedWithOfxProcessing"
      @update:bank-code="bankCode = $event"
      @update:cnpj="cnpj = $event"
      @toggle-date-filter="toggleDateFilterVisibility"
      @apply-date-filter="applyDateFilter"
      @clear-date-filter="clearDateFilter"
    >
      <template #formatDateRange>
        <span>{{ formatDateRange() }}</span>
      </template>
    </BankModal>

    <ClassificationModal
      v-if="showClassificationModal"
      :file-name="fileName || ''"
      :date-filter="dateFilter"
      :show-date-filter="showDateFilter"
      :is-date-filter-valid="isDateFilterValid"
      :format-date-range="formatDateRange"
      :grouped-transactions="groupedTransactions"
      :filtered-grouped-transactions="filteredGroupedTransactions"
      :positive-groups="positiveGroups"
      :negative-groups="negativeGroups"
      :individual-transactions="individualTransactions"
      :value-search-results="valueSearchResults"
      :classified-count="classifiedCount"
      :pending-count="pendingCount"
      :total-groups-count="totalGroupsCount"
      :classification-progress-percent="classificationProgressPercent"
      :draft-restored="draftRestored"
      :find-first-pending-group-key="findFirstPendingGroupKey"
      :individual-transactions-count="individualTransactionsCount"
      :individual-classifications-count="individualClassificationsCount"
      :current-filter="currentFilter"
      :search-by-value="searchByValue"
      :search-by-description="searchByDescription"
      :show-search-section="showSearchSection"
      :current-search-type="currentSearchType"
      :search-results="searchResults"
      :search-results-positive="searchResultsPositive"
      :search-results-negative="searchResultsNegative"
      :batch-codes-positive="batchCodesPositive"
      :batch-codes-negative="batchCodesNegative"
      :bank-code-input="bankCodeInput"
      :selected-bank-code="selectedBankCode"
      :is-saving-classification="isSavingClassification"
      :is-form-valid="isFormValid"
      :should-filter-out="shouldFilterOut"
      :is-description-classified="isDescriptionClassified"
      :is-in-search-results="isInSearchResults"
      :has-individual-classifications="hasIndividualClassifications"
      :get-individual-classification-count="getIndividualClassificationCount"
      :get-status-class="getStatusClass"
      :get-status-text="getStatusText"
      :format-currency="formatCurrency"
      :build-transaction-payload="buildTransactionPayload"
      @close="closeClassificationModal"
      @save="saveClassification"
      @set-filter="setFilter"
      @clear-date-filter="clearDateFilter"
      @toggle-date-filter="toggleDateFilterVisibility"
      @apply-date-filter="applyDateFilter"
      @filter-banks="filterBanks"
      @on-bank-code-apply="onBankCodeApply"
      @update:bank-code-input="bankCodeInput = $event"
      @toggle-search-visibility="toggleSearchVisibility"
      @set-search-type="setSearchType"
      @update:search-by-description="searchByDescription = $event"
      @update:search-by-value="searchByValue = $event"
      @clear-current-search="clearCurrentSearch"
      @apply-batch-classification="applyBatchClassification"
      @update:batch-codes-positive="batchCodesPositive = $event"
      @update:batch-codes-negative="batchCodesNegative = $event"
      @save-individual-classification="saveIndividualClassification"
      @remove-individual-classification="removeIndividualClassification"
      @toggle-description="toggleDescription"
      @validate-group-code="validateGroupCode"
      @handle-group-debito-focus="handleGroupDebitoFocus"
      @handle-group-credito-focus="handleGroupCreditoFocus"
      @update:date-filter-start="dateFilter.startDate = $event"
      @update:date-filter-end="dateFilter.endDate = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { UploadCommand } from '../../application/commands/UploadCommand'
import { UploadService } from '../../infrastructure/services/UploadService'
import { ImpostoService } from '../../infrastructure/services/ImpostoService'
import { LoadImpostosCommand } from '../../application/commands/LoadImpostosCommand'
import ProLaboreFields from './upload/components/ProLaboreFields.vue'
import UploadDropzone from './upload/components/UploadDropzone.vue'
import BankModal from './upload/components/BankModal.vue'
import ClassificationModal from './upload/components/ClassificationModal.vue'
import JourneyStepper from '../ui/JourneyStepper.vue'
import OnboardingBanner from '../ui/OnboardingBanner.vue'
import CsvPreviewModal from '../ui/CsvPreviewModal.vue'
import { useAuthStore } from '../../stores/authStore'
import type { UploadResult } from '../../domain/models/UploadResult'
import { useDateFilter } from './upload/composables/useDateFilter'
import { useProLabore } from './upload/composables/useProLabore'
import { useUploadWorkflow } from './upload/composables/useUploadWorkflow'
import { useClassification } from './upload/composables/useClassification'
import { useClassificationDraft } from './upload/composables/useClassificationDraft'
import { validateCnpj, validateBankCode } from './upload/composables/useCnpjValidation'
import { useUnsavedWorkGuard } from '../../shared/composables/useUnsavedWorkGuard'
import { useSessionExpiryWarning } from '../../shared/composables/useSessionExpiry'
import { useConversionHistory } from '../../shared/composables/useConversionHistory'
import { notifySuccess, notifyInfo } from '../../shared/composables/useToast'
import { getDownloadButtonLabel, formatSuccessMessage } from '../../shared/utils/downloadLabels'
import { mapApiErrorToUserMessage } from '../../shared/utils/errorMessages'

const defaultAvatar = '/avatar-default.svg'
const EditEmployeeModal = defineAsyncComponent(() => import('../modal/EditEmployeeModal.vue'))
const router = useRouter()
const { confirmAction } = useUnsavedWorkGuard()
useSessionExpiryWarning()
const { history: conversionHistory, addRecord: addConversionRecord } = useConversionHistory()

interface OfxTransaction {
  descricao: string
  datas: string[]
  valores: number[]
  codigosDebito?: (string | number)[]
  codigosCredito?: (string | number)[]
  codigosBanco?: (string | number)[]
  classificada?: boolean
  codigoDebito?: string
  codigoCredito?: string
  debitoError?: string
  creditoError?: string
  debitoLocked?: boolean
  creditoLocked?: boolean
  data?: string
  valor?: number
  dividida?: boolean
  tipo?: string
}

interface OfxResult {
  success: boolean
  type?: string
  status?: string
  outputFile?: string
  message?: string
  transacoesClassificadas?: OfxTransaction[]
  pendingTransactions?: OfxTransaction[]
}

interface Bank {
  code: string | number
  name: string
}

const authStore = useAuthStore()

const taxCodesIncomplete = ref(false)
const showCsvPreview = ref(false)
const draftRestored = ref(false)
const classificationPaused = ref(false)
onMounted(async () => {
  authStore.markPageReady()
  const result = await ImpostoService.loadImpostos(new LoadImpostosCommand())
  if (!result.success || !result.data?.taxCodes) {
    taxCodesIncomplete.value = true
    return
  }
  taxCodesIncomplete.value = !Object.values(result.data.taxCodes).some(
    (codes) =>
      (codes.debito ?? '').trim() !== '' &&
      codes.debito !== '_' &&
      (codes.credito ?? '').trim() !== '' &&
      codes.credito !== '_'
  )
})

const user = computed(() => authStore.user)

const showUserMenu = ref(false)
const showEditModal = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const openEditModal = () => {
  showUserMenu.value = false
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  await authStore.logout()
}

const {
  showDateFilter,
  dateFilter,
  isDateFilterValid,
  toggleDateFilterVisibility,
  applyDateFilter,
  clearDateFilter,
  formatDateRange,
  filterTransactionsByDate,
} = useDateFilter()

const {
  proLaboreActive,
  proLaboreValue,
  proLaboreYear,
  parsedProLaboreValue,
  isProLaboreValid,
  onProLaboreInput,
  resetProLabore,
} = useProLabore()

const {
  file,
  fileName,
  fileType,
  uploadResult,
  isLoading,
  isProcessingJob,
  showBankDataModal,
  canProcessFile,
  setFile,
  resetUploadState,
  handleUpload,
  handleDownload,
  jobState,
  progressLabel,
} = useUploadWorkflow({
  active: proLaboreActive,
  year: proLaboreYear,
  parsedValue: parsedProLaboreValue,
  isValid: isProLaboreValid,
  resetProLabore,
  value: proLaboreValue,
})

const showClassificationModal = ref(false)
const ofxResponse = ref<any>(null)
const isProcessingOfx = ref(false)
const cnpj = ref('')
const bankCode = ref('')

const cnpjFormatted = computed(() => cnpj.value.replace(/\D/g, ''))

const classificationStorageKey = computed(() => {
  const bank = bankCode.value.replace(/\D/g, '')
  const fileKey = file.value
    ? `${file.value.name}:${file.value.size}:${file.value.lastModified}`
    : ''
  return `${cnpjFormatted.value}:${bank}:${fileKey}`
})

let resetClassificationStateFn = () => {}
let clearClassificationDraftFn = () => {}

const resetWorkflowState = (options?: { preserveProLabore?: boolean }) => {
  resetUploadState(options)
  resetClassificationStateFn()
  showClassificationModal.value = false
  ofxResponse.value = null
  isProcessingOfx.value = false
  cnpj.value = ''
  bankCode.value = ''
  clearDateFilter()
}

const onClassificationSaved = (result: UploadResult) => {
  const outputFile =
    result.success && 'outputFile' in result && result.outputFile ? result.outputFile : 'EXTRATO.csv'

  showClassificationModal.value = false
  classificationPaused.value = false
  clearClassificationDraftFn()
  resetClassificationStateFn()
  clearDateFilter()
  ofxResponse.value = null
  isProcessingOfx.value = false

  uploadResult.value = {
    success: true,
    status: 'completed',
    type: 'ofx',
    outputFile,
    message: formatSuccessMessage('Classificação salva com sucesso', outputFile),
    transacoesClassificadas: [],
  }

  if (fileName.value) {
    addConversionRecord({
      fileName: fileName.value,
      fileType: 'OFX',
      outputFile,
      status: 'completed',
    })
  }

  notifySuccess('Classificação salva. Baixe o CSV abaixo.')
}

const {
  groupedTransactions,
  individualClassifications,
  isSavingClassification,
  searchByDescription,
  searchByValue,
  searchResults,
  valueSearchResults,
  batchCodesPositive,
  batchCodesNegative,
  currentFilter,
  currentSearchType,
  showSearchSection,
  bankCodeInput,
  availableBanks,
  selectedBankCode,
  positiveGroups,
  negativeGroups,
  filteredGroupedTransactions,
  individualTransactions,
  classifiedCount,
  pendingCount,
  totalGroupsCount,
  classificationProgressPercent,
  findFirstPendingGroupKey,
  individualTransactionsCount,
  individualClassificationsCount,
  searchResultsPositive,
  searchResultsNegative,
  isFormValid,
  setGroupsFromTransactions,
  resetClassificationState,
  setFilter,
  shouldFilterOut,
  getStatusClass,
  getStatusText,
  validateGroupCode,
  formatCurrency,
  applyBatchClassification,
  saveIndividualClassification,
  removeIndividualClassification,
  buildTransactionPayload,
  toggleDescription,
  handleGroupDebitoFocus,
  handleGroupCreditoFocus,
  isInSearchResults,
  isDescriptionClassified,
  hasIndividualClassifications,
  getIndividualClassificationCount,
  filterBanks,
  onBankCodeApply,
  setSearchType,
  clearCurrentSearch,
  toggleSearchVisibility,
  saveClassification,
} = useClassification({
  ofxResponse,
  cnpjFormatted,
  dateFilter,
  filterTransactionsByDate,
  onSaved: onClassificationSaved,
})

const { restoreDraft, clearDraft: clearClassificationDraft } = useClassificationDraft(
  classificationStorageKey,
  groupedTransactions,
  individualClassifications
)

resetClassificationStateFn = resetClassificationState
clearClassificationDraftFn = clearClassificationDraft

const isBankFormValid = computed(() => validateCnpj(cnpj.value) && validateBankCode(bankCode.value))

const bankValidationErrors = computed(() => {
  const errors: string[] = []
  if (cnpj.value && !validateCnpj(cnpj.value)) errors.push('CNPJ deve conter 14 dígitos válidos.')
  if (bankCode.value && !validateBankCode(bankCode.value)) errors.push('Código do banco deve ter 3 ou 4 dígitos.')
  return errors
})

const downloadLabel = computed(() => {
  const outputFile =
    uploadResult.value?.success && 'outputFile' in uploadResult.value
      ? uploadResult.value.outputFile
      : undefined
  return getDownloadButtonLabel(outputFile, fileType.value)
})

const successMessage = computed(() => uploadResult.value?.message ?? '')

const journeySteps = computed(() => {
  if (fileType.value === 'OFX') {
    return [
      { id: 'select', label: 'Selecionar arquivo' },
      { id: 'bank', label: 'CNPJ e banco' },
      { id: 'classify', label: 'Classificar' },
      { id: 'download', label: 'Baixar CSV' },
    ]
  }
  return [
    { id: 'select', label: 'Selecionar arquivo' },
    { id: 'process', label: 'Processar' },
    { id: 'download', label: 'Baixar CSV' },
  ]
})

const currentJourneyStep = computed(() => {
  if (uploadResult.value?.success) return 'download'
  if (showClassificationModal.value || classificationPaused.value) return 'classify'
  if (showBankDataModal.value || (fileType.value === 'OFX' && file.value && !uploadResult.value)) return 'bank'
  if (isLoading.value || isProcessingJob.value || isProcessingOfx.value) {
    return fileType.value === 'OFX' ? 'bank' : 'process'
  }
  if (file.value) return fileType.value === 'OFX' ? 'bank' : 'process'
  return 'select'
})

const previewFileName = computed(() => {
  if (uploadResult.value?.success && 'outputFile' in uploadResult.value) {
    return uploadResult.value.outputFile
  }
  return undefined
})

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.[0]) return

  resetWorkflowState({ preserveProLabore: true })
  setFile(target.files[0])
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  const droppedFile = event.dataTransfer?.files?.[0]
  if (!droppedFile) return

  resetWorkflowState({ preserveProLabore: true })
  setFile(droppedFile)
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  fileInput.value?.click()
}

const clearFile = () => {
  resetWorkflowState()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const closeBankDataModal = async () => {
  const hasInput = cnpj.value.trim() !== '' || bankCode.value.trim() !== ''
  if (hasInput || file.value) {
    const confirmed = await confirmAction({
      message: 'Deseja descartar o arquivo e as informações bancárias preenchidas?',
      confirmLabel: 'Descartar tudo',
    })
    if (!confirmed) {
      showBankDataModal.value = false
      return
    }
  }
  showBankDataModal.value = false
  cnpj.value = ''
  bankCode.value = ''
  clearDateFilter()
  clearFile()
}

const closeClassificationModal = async () => {
  const hasWork = pendingCount.value > 0 || groupedTransactions.value.length > 0
  if (hasWork) {
    const confirmed = await confirmAction({
      message: 'Deseja descartar a classificação em andamento? O rascunho será mantido se você apenas fechar.',
      confirmLabel: 'Descartar tudo',
      cancelLabel: 'Continuar depois',
    })
    if (!confirmed) {
      showClassificationModal.value = false
      classificationPaused.value = true
      return
    }
  }
  showClassificationModal.value = false
  classificationPaused.value = false
  resetClassificationState()
  clearDateFilter()
  clearFile()
}

const resumeClassification = () => {
  classificationPaused.value = false
  showClassificationModal.value = true
}

const proceedWithOfxProcessing = async (): Promise<void> => {
  if (!file.value || !isBankFormValid.value) return

  isProcessingOfx.value = true
  resetClassificationState()

  // Restaura rascunho apenas para o mesmo arquivo + CNPJ + banco (não substitui OFX novo)
  if (restoreDraft()) {
    showBankDataModal.value = false
    showClassificationModal.value = true
    draftRestored.value = true
    notifyInfo('Rascunho restaurado — continue de onde parou.')
    isProcessingOfx.value = false
    return
  }

  draftRestored.value = false

  const dateFilterData = dateFilter.value.isActive
    ? {
        startDate: dateFilter.value.startDate,
        endDate: dateFilter.value.endDate,
      }
    : undefined

  const command = new UploadCommand(
    file.value,
    cnpjFormatted.value,
    bankCode.value.replace(/\D/g, ''),
    dateFilterData,
    undefined
  )

  try {
    const uploadResponse = await UploadService.execute(command)

    if (!uploadResponse.success) {
      uploadResult.value = uploadResponse
      return
    }

    let result = uploadResponse as OfxResult

    if (uploadResponse.jobId) {
      isProcessingOfx.value = true
      const jobStatus = await UploadService.pollJobUntilComplete(uploadResponse.jobId)
      isProcessingOfx.value = false

      if (!jobStatus || jobStatus.state === 'Failed') {
        uploadResult.value = {
          success: false,
          message: jobStatus?.message || 'Erro ao processar arquivo OFX',
        }
        return
      }

      result = UploadService.buildUploadResultFromJobStatus(jobStatus) as OfxResult
    }

    if (result.success && result.type === 'ofx') {
      ofxResponse.value = result

      let allTransactions: OfxTransaction[] = [
          ...(result.transacoesClassificadas || []).map((transaction: OfxTransaction) => {
            const firstValue = transaction.valores?.[0] || 0
            const isPositive = firstValue > 0

            return {
              ...transaction,
              classificada: true,
              codigoDebito: transaction.codigosDebito?.[0]?.toString() || transaction.codigoDebito || '',
              codigoCredito: transaction.codigosCredito?.[0]?.toString() || transaction.codigoCredito || '',
              debitoError: '',
              creditoError: '',
              debitoLocked: isPositive,
              creditoLocked: !isPositive,
            }
          }),
        ]

        if (result.status === 'pending_classification') {
          const descricoesComValoresMistos = new Set<string>()
          const analiseDescricoes = new Map<string, { temPositivo: boolean; temNegativo: boolean }>()

          result.pendingTransactions?.forEach((transaction: OfxTransaction) => {
            const descricao = transaction.descricao

            if (!analiseDescricoes.has(descricao)) {
              analiseDescricoes.set(descricao, {
                temPositivo: false,
                temNegativo: false,
              })
            }

            const analise = analiseDescricoes.get(descricao)!

            transaction.valores.forEach((valor: number) => {
              if (valor >= 0) analise.temPositivo = true
              if (valor < 0) analise.temNegativo = true
            })

            if (analise.temPositivo && analise.temNegativo) {
              descricoesComValoresMistos.add(descricao)
            }
          })

          const pendingTransactionsProcessed: OfxTransaction[] = (result.pendingTransactions || []).flatMap(
            (transaction: OfxTransaction) => {
              const descricao = transaction.descricao
              const deveDividir = descricoesComValoresMistos.has(descricao)

              if (!deveDividir) {
                const valorPositivo = transaction.valores[0] >= 0
                return [
                  {
                    ...transaction,
                    classificada: false,
                    codigoDebito: valorPositivo ? transaction.codigosBanco?.[0]?.toString() || '' : '',
                    codigoCredito: !valorPositivo ? transaction.codigosBanco?.[0]?.toString() || '' : '',
                    debitoError: '',
                    creditoError: '',
                    debitoLocked: false,
                    creditoLocked: false,
                  },
                ]
              }

              const transacoesDivididas: OfxTransaction[] = []

              transaction.datas.forEach((data: string, index: number) => {
                const valor = transaction.valores[index]
                const tipo = valor >= 0 ? 'POSITIVO' : 'NEGATIVO'

                transacoesDivididas.push({
                  ...transaction,
                  descricao: transaction.descricao,
                  data,
                  valor,
                  datas: [data],
                  valores: [valor],
                  codigosDebito: transaction.codigosDebito ? [transaction.codigosDebito[index]] : [],
                  codigosCredito: transaction.codigosCredito ? [transaction.codigosCredito[index]] : [],
                  codigosBanco: transaction.codigosBanco ? [transaction.codigosBanco[0]] : [],
                  classificada: false,
                  codigoDebito: valor >= 0 ? transaction.codigosBanco?.[0]?.toString() || '' : '',
                  codigoCredito: valor < 0 ? transaction.codigosBanco?.[0]?.toString() || '' : '',
                  debitoError: '',
                  creditoError: '',
                  debitoLocked: false,
                  creditoLocked: false,
                  dividida: true,
                  tipo,
                })
              })

              return transacoesDivididas
            }
          )

          allTransactions = [...allTransactions, ...pendingTransactionsProcessed]
        }

        setGroupsFromTransactions(allTransactions)

        availableBanks.value = allTransactions
          .flatMap((t: OfxTransaction) => t.codigosBanco || [])
          .filter((code: string | number, index: number, self: (string | number)[]) => code != null && self.indexOf(code) === index)
          .sort((a: string | number, b: string | number) => Number(a) - Number(b))
          .map((code: string | number): Bank => ({ code, name: `Banco ${code}` }))

      showBankDataModal.value = false
      showClassificationModal.value = true
    } else {
      uploadResult.value = {
        success: true,
        status: 'completed',
        type: 'ofx',
        outputFile: 'outputFile' in result && typeof result.outputFile === 'string' ? result.outputFile : 'EXTRATO.csv',
        message: formatSuccessMessage(
          result.message || 'OFX processado com sucesso',
          'outputFile' in result && typeof result.outputFile === 'string' ? result.outputFile : 'EXTRATO.csv'
        ),
        transacoesClassificadas: [],
      }
      if (fileName.value) {
        addConversionRecord({
          fileName: fileName.value,
          fileType: 'OFX',
          outputFile: uploadResult.value.outputFile,
          status: 'completed',
        })
      }
      showBankDataModal.value = false
    }
  } catch (error) {
    console.error('Erro ao processar OFX:', error)
    uploadResult.value = { success: false, message: mapApiErrorToUserMessage(error, 'Erro ao processar arquivo OFX') }
  } finally {
    isProcessingOfx.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap');

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #000;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.upload-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 3rem;
  border-radius: 4px;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Montserrat', sans-serif;
  border: 1px solid #333;
  position: relative;
  overflow: hidden;
}

.upload-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff4d4d, #f9cb28, #ff4d4d);
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.title {
  color: #fff;
  text-align: center;
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.subtitle {
  color: #aaa;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 2rem;
  font-weight: 400;
  letter-spacing: 1px;
}

.upload-form {
  display: flex;
  flex-direction: column;
}

.hidden-input {
  display: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(40, 40, 40, 0.8);
  border-radius: 4px;
  margin-top: 1rem;
  border-left: 3px solid #f9cb28;
}

.file-icon {
  width: 20px;
  height: 20px;
  fill: #f9cb28;
}

.file-name {
  flex: 1;
  font-size: 0.95rem;
  color: #ddd;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-type {
  font-size: 0.85rem;
  color: #aaa;
}

.clear-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: rotate(90deg);
}

.clear-button svg {
  fill: #aaa;
}

.upload-button {
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #ff4d4d, #f9cb28);
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 50px;
  margin-top: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.4);
}

.upload-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  animation: rotate 1.5s linear infinite;
  width: 20px;
  height: 20px;
}

.spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.result-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  background-color: rgba(40, 60, 40, 0.7);
  color: #4caf50;
  border-left: 3px solid #4caf50;
}

.result-message.error {
  background-color: rgba(60, 40, 40, 0.7);
  color: #ff4d4d;
  border-left: 3px solid #ff4d4d;
}

.result-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.result-message p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.download-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #4caf50, #2e7d32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  line-height: 1.2;
  box-sizing: border-box;
}

.download-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.download-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.download-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

.user-area {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #333;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f9cb28;
}

.user-name {
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-dropdown-icon {
  width: 16px;
  height: 16px;
  fill: #f9cb28;
  transition: transform 0.3s ease;
}

.user-dropdown-icon.rotated {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 5px;
  background: #1a1a1a;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  overflow: hidden;
  min-width: 200px;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 15px;
  background: transparent;
  border: none;
  color: #ddd;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu-item:hover {
  background: rgba(249, 203, 40, 0.1);
  color: #f9cb28;
}

.user-menu-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.menu-badge,
.item-badge {
  background: #ff4d4d;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

.item-badge {
  margin-left: auto;
}

.user-info {
  border: none;
  font: inherit;
  color: inherit;
}

.secondary-action {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #f9cb28 !important;
}

.download-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.download-actions .download-button,
.download-actions .preview-button {
  flex: 1;
  width: auto;
  margin-top: 0;
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1.2;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  box-sizing: border-box;
  white-space: nowrap;
}

.download-actions .preview-button {
  background: transparent;
  color: #4caf50;
  border: 1px solid #4caf50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-actions .preview-button:hover {
  background: rgba(76, 175, 80, 0.1);
}

@media (min-width: 640px) {
  .download-actions {
    flex-direction: row;
  }
}

.preview-button {
  width: 100%;
  padding: 0.85rem 1rem;
  background: transparent;
  color: #4caf50;
  border: 1px solid #4caf50;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1.2;
  min-height: 48px;
  box-sizing: border-box;
}

.history-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.history-title {
  font-size: 0.85rem;
  color: #aaa;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history-list li {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #222;
  font-size: 0.85rem;
  color: #ddd;
}

.history-meta {
  color: #888;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .app-container {
    padding: 12px;
    align-items: flex-start;
    padding-top: 72px;
  }

  .user-area {
    position: fixed;
    top: 12px;
    right: 12px;
    left: 12px;
  }

  .user-info {
    width: 100%;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  .upload-container {
    margin: 0;
    padding: 1.5rem 1rem;
    width: 100%;
    max-width: none;
  }

  .title {
    font-size: 1.75rem;
    letter-spacing: 2px;
  }

  .upload-button,
  .download-button,
  .preview-button {
    width: 100%;
  }

  .download-actions .download-button,
  .download-actions .preview-button {
    white-space: normal;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }
}
</style>
