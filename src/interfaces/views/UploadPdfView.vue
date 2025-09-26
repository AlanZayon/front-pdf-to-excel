<template>
  <div class="app-container">

    <!-- Área do Usuário -->
    <div class="user-area">
      <div class="user-info" @click="toggleUserMenu">
        <img :src="defaultAvatar" class="user-avatar" alt="User Avatar">
        <span class="user-name">{{ user?.fullName || 'Rockstar User' }}</span>
        <svg class="user-dropdown-icon" viewBox="0 0 24 24" :class="{ 'rotated': showUserMenu }">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </div>

      <div v-if="showUserMenu" class="user-menu">
        <button class="user-menu-item" @click="openEditModal">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path
              d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
          </svg>
          EDITAR PERFIL
        </button>
        <EditEmployeeModal :isOpen="showEditModal" @close="closeEditModal" :userData="user ?? undefined" />
        <button class="user-menu-item" @click="handleLogout">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path
              d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
          </svg>
          SAIR
        </button>
      </div>
    </div>
    <div class="upload-container">

      <h1 class="title">UPLOAD DE ARQUIVOS</h1>
      <p class="subtitle">UPLOAD PDF E OFX</p>

      <form class="upload-form">
        <div class="drop-zone" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop" :class="{ 'dragging': isDragging, 'has-file': file }" @click="triggerFileInput">
          <div class="drop-zone-content">
            <svg class="upload-icon" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <p class="drop-text">ARRASTE E SOLTE SEU ARQUIVO AQUI</p>
            <p class="drop-subtext">ou clique para selecionar (PDF ou OFX)</p>
          </div>
          <input ref="fileInput" type="file" accept=".pdf,.ofx,application/pdf,application/x-ofx" @change="onFileChange"
            class="hidden-input" />
        </div>

        <div v-if="fileName || ofxFileName" class="file-info">
          <svg class="file-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span class="file-name">{{ fileName || ofxFileName }}</span>
          <span class="file-type">({{ fileType }})</span>
          <button @click="clearFile" class="clear-button" type="button">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div v-if="isLoading" class="upload-button">
          <span class="button-loading">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            PROCESSANDO...
          </span>
        </div>

        <div v-if="uploadResult" class="result-message"
          :class="{ 'error': uploadResult.message === 'Erro ao enviar o arquivo' }">
          <svg v-if="uploadResult.message !== 'Erro ao enviar o arquivo'" class="result-icon" viewBox="0 0 24 24">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
          <svg v-else class="result-icon" viewBox="0 0 24 24">
            <path
              d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <p>{{ uploadResult.message.toUpperCase() }}</p>
        </div>

        <button v-if="uploadResult && uploadResult.message !== 'Erro ao enviar o arquivo'" @click="handleDownload"
          class="download-button">
          <svg class="download-icon" viewBox="0 0 24 24">
            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
          </svg>
          BAIXAR ARQUIVO {{ fileType.toUpperCase() }}
        </button>
      </form>
    </div>

    <div v-if="showBankDataModal" class="modal-overlay" @click.self="closeBankDataModal">
      <div class="bank-data-modal">
        <div class="modal-header">
          <h2>INFORMAÇÕES BANCÁRIAS</h2>
          <button class="close-button" @click="closeBankDataModal">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="file-info-modal">
            <svg class="file-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>{{ fileName || ofxFileName }} - Arquivo OFX</span>
          </div>
          <div class="bank-fields">
            <div class="input-group">
              <label>CNPJ:</label>
              <input type="text" v-model="cnpj" v-maska="'##.###.###/####-##'" placeholder="00.000.000/0000-00">
            </div>

          </div>

          <div class="modal-actions">
            <button @click="proceedWithOfxProcessing" :disabled="!isBankFormValid || isProcessingOfx"
              class="confirm-button" :class="{ 'loading': isProcessingOfx }">
              <div v-if="isProcessingOfx" class="button-loading">
                <svg class="spinner" viewBox="0 0 50 50" width="18" height="18">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                PROCESSANDO...
              </div>
              <span v-else>CONFIRMAR E PROCESSAR</span>
            </button>
            <button @click="closeBankDataModal" class="cancel-button" :disabled="isProcessingOfx">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Classificação OFX -->
    <div v-if="showClassificationModal" class="modal-overlay" @click.self="closeClassificationModal">
      <div class="classification-modal">
        <div class="modal-header">
          <h2>CLASSIFICAÇÃO DE TRANSAÇÕES OFX</h2>
          <button class="close-button" @click="closeClassificationModal">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="file-info-modal">
            <svg class="file-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>{{ fileName }} - {{ groupedTransactions.length }} descrições para classificar</span>

            <div class="input-group-codeBank">
              <div class="combobox-container">
                <input type="text" v-model="bankCodeInput" @input="filterBanks" @focus="showBankDropdown = true"
                  @blur="onBankCodeBlur" placeholder="Código banco" class="combobox-input">
                <button class="combobox-toggle" @click="showBankDropdown = !showBankDropdown">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M7,10L12,15L17,10H7Z" />
                  </svg>
                </button>

                <div v-if="showBankDropdown" class="combobox-dropdown">
                  <div v-for="bank in filteredBanks" :key="bank.code" class="combobox-option"
                    @mousedown="selectBank(bank)">
                    {{ bank.code }}
                  </div>
                  <div v-if="filteredBanks.length === 0" class="combobox-no-results">
                    Nenhum banco encontrado
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sistema de Pesquisa e Classificação em Lote -->
          <div class="batch-classification-section">
            <div class="search-container">
              <div class="search-input-group">
                <svg class="search-icon" viewBox="0 0 24 24">
                  <path
                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
                <input type="text" v-model="searchTerm" @input="searchTransactions"
                  placeholder="Pesquisar por descrição..." class="search-input">
                <button v-if="searchTerm" @click="clearSearch" class="clear-search-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
              </div>

              <div class="search-results" v-if="searchTerm && searchResults.length > 0">
                <div class="search-stats">
                  Encontradas {{ searchResults.length }} descrições
                  <span v-if="searchResultsPositive.length > 0">
                    ({{ searchResultsPositive.length }} positivas, {{ searchResultsNegative.length }} negativas)
                  </span>
                </div>

                <!-- Classificação para descrições positivas -->
                <div v-if="searchResultsPositive.length > 0" class="batch-classification-group">
                  <h4 class="batch-group-title positive">
                    DESCRIÇÕES POSITIVAS ({{ searchResultsPositive.length }})
                  </h4>
                  <div class="batch-input-fields">
                    <div class="code-input-group">
                      <label>Código Crédito (Positivas):</label>
                      <input type="text" v-model="batchCodesPositive.credito" placeholder="Ex: 5678"
                        class="batch-input">
                    </div>
                    <button @click="applyBatchClassification('positive')" :disabled="!batchCodesPositive.credito"
                      class="batch-apply-button">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                      APLICAR PARA {{ searchResultsPositive.length }} DESCRIÇÕES POSITIVAS
                    </button>
                  </div>
                </div>

                <!-- Classificação para descrições negativas -->
                <div v-if="searchResultsNegative.length > 0" class="batch-classification-group">
                  <h4 class="batch-group-title negative">
                    DESCRIÇÕES NEGATIVAS ({{ searchResultsNegative.length }})
                  </h4>
                  <div class="batch-input-fields">
                    <div class="code-input-group">
                      <label>Código Débito (Negativas):</label>
                      <input type="text" v-model="batchCodesNegative.debito" placeholder="Ex: 1234" class="batch-input">
                    </div>
                    <button @click="applyBatchClassification('negative')" :disabled="!batchCodesNegative.debito"
                      class="batch-apply-button">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                      APLICAR PARA {{ searchResultsNegative.length }} DESCRIÇÕES NEGATIVAS
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="searchTerm && searchResults.length === 0" class="no-results">
                Nenhuma descrição encontrada para "{{ searchTerm }}"
              </div>
            </div>
          </div>

          <!-- Estatísticas -->
          <div class="classification-stats">
            <div class="stat-item">
              <span class="stat-label">Total:</span>
              <span class="stat-value">{{ groupedTransactions.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Classificadas:</span>
              <span class="stat-value classified">{{ classifiedCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Pendentes:</span>
              <span class="stat-value pending">{{ pendingCount }}</span>
            </div>
          </div>

          <!-- Lista de Descrições Agrupadas -->
          <div class="transactions-container">
            <div class="description-group" v-for="(group, index) in filteredGroupedTransactions" :key="index"
              :class="{ 'classified': isDescriptionClassified(group), 'search-highlight': isInSearchResults(group) }">

              <!-- Cabeçalho da Descrição -->
              <div class="description-header" @click="toggleDescription(group)">
                <div class="description-main">
                  <span class="description-text">{{ group.descricao }}</span>
                </div>
                <div class="description-controls">
                  <svg class="description-arrow" :class="{ 'rotated': group.expanded }" viewBox="0 0 24 24">
                    <path d="M7,10L12,15L17,10H7Z" />
                  </svg>
                </div>
              </div>

              <!-- Campos de Classificação (sempre visíveis) -->
              <div class="classification-fields">
                <div class="code-input-group">
                  <label>Código Débito:</label>
                  <input type="text" v-model="group.codigoDebito" @input="validateGroupCode(group, 'debito')"
                    placeholder="Ex: 1234" :class="{ error: group.debitoError }" :readonly="group.debitoLocked"
                    @focus="handleGroupDebitoFocus(group, $event)">
                  <span class="error-message" v-if="group.debitoError">{{ group.debitoError }}</span>
                </div>

                <div class="code-input-group">
                  <label>Código Crédito:</label>
                  <input type="text" v-model="group.codigoCredito" @input="validateGroupCode(group, 'credito')"
                    placeholder="Ex: 5678" :class="{ error: group.creditoError }" :readonly="group.creditoLocked"
                    @focus="handleGroupCreditoFocus(group, $event)">
                  <span class="error-message" v-if="group.creditoError">{{ group.creditoError }}</span>
                </div>
              </div>

              <!-- Detalhes das Transações (expandíveis) -->
              <div v-if="group.expanded" class="transactions-details">
                <div class="transactions-list">
                  <div v-for="(data, i) in group.transacoes[0].data" :key="i" class="transaction-detail">
                    <span class="transaction-date">{{ data }}</span>
                    <span class="transaction-value"
                      :class="{ negative: group.transacoes[0].valor[i] < 0, positive: group.transacoes[0].valor[i] >= 0 }">
                      {{ group.transacoes[0].valor[i] }}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="saveClassification" :disabled="!isFormValid || isSavingClassification" class="save-button"
              :class="{ 'loading': isSavingClassification }">
              <div v-if="isSavingClassification" class="button-loading">
                <svg class="spinner" viewBox="0 0 50 50" width="18" height="18">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                SALVANDO...
              </div>
              <div v-else class="button-content">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                </svg>
                SALVAR CLASSIFICAÇÃO
              </div>
            </button>
            <button @click="closeClassificationModal" class="cancel-button" :disabled="isSavingClassification">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { UploadCommand } from '../../application/commands/UploadCommand'
import { UploadService } from '../../infrastructure/services/UploadService'
import { FileDownloadService } from '../../infrastructure/services/FileDownloadService'
import defaultAvatar from '../../images/avatar-sistema-pdf.png'
import EditEmployeeModal from '../modal/EditEmployeeModal.vue'
import { useAuthStore } from '../../stores/authStore'
import type { UploadResult } from '../../domain/models/UploadResult'
import { vMaska } from "maska/vue"

const authStore = useAuthStore()
onMounted(() => {
  authStore.markPageReady()
})

// Dados do usuário
const user = computed(() => authStore.user)

const showUserMenu = ref(false)
const showEditModal = ref(false)

const openEditModal = () => {
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

// Código atualizado para suportar PDF e OFX
const file = ref<File | null>(null)
const fileName = ref<string | null>(null)
const fileType = ref<string>('') // PDF ou OFX
const uploadResult = ref<UploadResult | null>(null)
const isLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

// Variáveis para o modal de classificação
const showClassificationModal = ref(false)
const ofxTransactions = ref<any[]>([])
const groupedTransactions = ref<any[]>([])
const ofxFileName = ref('')
const ofxResponse = ref<any>(null)

// Novas variáveis para o modal de dados bancários
const showBankDataModal = ref(false)
const cnpj = ref('')
const cnpjFormatted = ref('')
const selectedBankCode = ref('')
const availableBanks = ref<any[]>([])

const bankCodeInput = ref('')
const showBankDropdown = ref(false)
const filteredBanks = ref<any[]>([])

// Estados de loading para os botões
const isProcessingOfx = ref(false)
const isSavingClassification = ref(false)

// Variáveis para pesquisa e classificação em lote
const searchTerm = ref('')
const searchResults = ref<any[]>([])
const batchCodesPositive = ref({
  debito: '',
  credito: ''
})
const batchCodesNegative = ref({
  debito: '',
  credito: ''
})

const groupTransactionsByDescription = (transactions: any[]) => {
  const groupsMap = new Map()

  transactions.forEach(transaction => {
    if (!groupsMap.has(transaction.descricao)) {
      groupsMap.set(transaction.descricao, {
        descricao: transaction.descricao,
        transacoes: [],
        total: 0,
        codigoDebito: '',
        codigoCredito: '',
        debitoError: '',
        creditoError: '',
        debitoLocked: false,
        creditoLocked: false,
        expanded: false
      })
    }


    const group = groupsMap.get(transaction.descricao)
    group.transacoes.push({
      data: transaction.datas,
      valor: transaction.valores
    })
  })


  return Array.from(groupsMap.values())
}

// Função para aplicar o código banco às descrições
const applyBankCodeToGroups = () => {
  if (!selectedBankCode.value) return;

  groupedTransactions.value.forEach(group => {

    if (group.transacoes[0].valor[0] < 0) {
      // Descrição com total negativo: código banco vai para débito
      group.codigoCredito = selectedBankCode.value;
      group.debitoLocked = false;
      group.creditoLocked = true;
    } else {
      // Descrição com total positivo: código banco vai para crédito
      group.codigoDebito = selectedBankCode.value;
      group.creditoLocked = false;
      group.debitoLocked = true;
    }
  });
};

// Quando o código banco é alterado, aplica às descrições
watch(selectedBankCode, (newCode) => {
  if (newCode) {
    applyBankCodeToGroups();
  }
});

// Funções para manipular o foco nos campos das descrições
const handleGroupDebitoFocus = (group: any, event: FocusEvent) => {
  if (group.debitoLocked) {
    (event.target as HTMLInputElement).blur();
  }
};

const handleGroupCreditoFocus = (group: any, event: FocusEvent) => {
  if (group.creditoLocked) {
    (event.target as HTMLInputElement).blur();
  }
};

// Função para expandir/recolher os detalhes de uma descrição
const toggleDescription = (group: any) => {
  group.expanded = !group.expanded;
};

const filterBanks = () => {
  if (!bankCodeInput.value.trim()) {
    filteredBanks.value = availableBanks.value
    return
  }

  const searchTerm = bankCodeInput.value.toLowerCase()
  filteredBanks.value = availableBanks.value.filter(bank =>
    String(bank.code).toLowerCase().includes(searchTerm) ||
    String(bank.name).toLowerCase().includes(searchTerm)
  )
}

// Seleciona um banco da lista
const selectBank = (bank: any) => {
  bankCodeInput.value = `${bank.code}`
  selectedBankCode.value = bank.code
  showBankDropdown.value = false
}

// Quando o input perde o foco, tenta encontrar um banco correspondente
const onBankCodeBlur = () => {
  setTimeout(() => {
    showBankDropdown.value = false

    if (/^\d+$/.test(bankCodeInput.value)) {
      const bank = availableBanks.value.find(b => b.code === bankCodeInput.value)
      if (bank) {
        selectedBankCode.value = bank.code
        bankCodeInput.value = `${bank.code} - ${bank.name}`
      } else {
        selectedBankCode.value = bankCodeInput.value
      }
    } else if (bankCodeInput.value.includes(' - ')) {
      const parts = bankCodeInput.value.split(' - ')
      if (parts.length > 0) {
        selectedBankCode.value = parts[0]
      }
    }
  }, 200)
}

// Inicializa a lista filtrada quando os bancos são carregados
watch(availableBanks, (newBanks) => {
  filteredBanks.value = newBanks
}, { immediate: true })

const isValidFileType = (file: File): boolean => {
  const validTypes = [
    'application/pdf',
    'application/x-ofx',
    'text/xml',
    'application/xml'
  ];
  const validExtensions = ['.pdf', '.ofx'];

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  return validTypes.includes(file.type) || validExtensions.includes(extension);
}

const getFileType = (file: File): string => {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return 'PDF';
  } else if (file.type === 'application/x-ofx' || file.name.toLowerCase().endsWith('.ofx') ||
    file.type.includes('xml') || file.name.toLowerCase().endsWith('.xml')) {
    return 'OFX';
  }
  return '';
}

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const selectedFile = target.files[0];

    if (!isValidFileType(selectedFile)) {
      uploadResult.value = { success: false, message: 'Tipo de arquivo inválido. Use PDF ou OFX.' };
      return;
    }

    file.value = selectedFile;
    fileName.value = selectedFile.name;
    fileType.value = getFileType(selectedFile);
    await handleUpload();
  }
}

const onDrop = async (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const droppedFile = event.dataTransfer.files[0];

    if (!isValidFileType(droppedFile)) {
      uploadResult.value = { success: false, message: 'Tipo de arquivo inválido. Use PDF ou OFX.' };
      return;
    }

    file.value = droppedFile;
    fileName.value = droppedFile.name;
    fileType.value = getFileType(droppedFile);
    await handleUpload();
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const clearFile = () => {
  file.value = null
  fileName.value = null
  ofxFileName.value = ''
  fileType.value = ''
  uploadResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleUpload = async () => {
  if (!file.value) return

  isLoading.value = true
  uploadResult.value = null

  try {
    if (fileType.value === 'PDF') {
      const command = new UploadCommand(file.value)
      const result = await UploadService.execute(command)
      uploadResult.value = result
    } else if (fileType.value === 'OFX') {
      showBankDataModal.value = true
    }
  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    uploadResult.value = { success: false, message: 'Erro ao processar arquivo' }
  } finally {
    isLoading.value = false
  }
}

const closeBankDataModal = () => {
  showBankDataModal.value = false
  cnpj.value = ''
  selectedBankCode.value = ''
  clearFile()
}

function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj.charAt(i)) * pesos1[i];
  }

  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;

  if (digito1 !== parseInt(cnpj.charAt(12))) return false;

  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj.charAt(i)) * pesos2[i];
  }

  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;

  return digito2 === parseInt(cnpj.charAt(13));
}

const isBankFormValid = computed(() => {
  return validarCNPJ(cnpj.value)
})

const proceedWithOfxProcessing = async () => {
  if (!file.value || !isBankFormValid.value) return

  isProcessingOfx.value = true
  cnpjFormatted.value = cnpj.value.replace(/\D/g, '')

  const command = new UploadCommand(file.value, cnpj.value.replace(/\D/g, ''))

  try {
    const result = await UploadService.execute(command)

    if (result.success && result.type === 'ofx' && result.status === 'pending_classification') {
      ofxResponse.value = result
      ofxTransactions.value = result.pendingTransactions.map(transaction => ({
        ...transaction,
        codigoDebito: '',
        codigoCredito: '',
        debitoError: '',
        creditoError: '',
        debitoLocked: false,
        creditoLocked: false
      }))

      // Agrupa as transações por descrição
      groupedTransactions.value = groupTransactionsByDescription(ofxTransactions.value)
      ofxFileName.value = file.value.name

      availableBanks.value = ofxTransactions.value
        .flatMap(t => t.codigosBanco || [])
        .filter((code, index, self) => code != null && self.indexOf(code) === index)
        .sort((a, b) => a - b)
        .map(code => ({ code, name: `Banco ${code}` }))

      showBankDataModal.value = false
      showClassificationModal.value = true
    } else {
      uploadResult.value = {
        success: true,
        status: 'completed',
        type: 'ofx',
        outputPath: 'outputPath' in result ? result.outputPath : '',
        message: result.message || 'Nenhuma transação encontrada no arquivo OFX'
      }
      showBankDataModal.value = false
    }
  } catch (error) {
    console.error('Erro ao processar OFX:', error)
    uploadResult.value = { success: false, message: 'Erro ao processar arquivo OFX' }
  } finally {
    isProcessingOfx.value = false
  }
}

const handleDownload = async (event: Event) => {
  event.preventDefault()

  try {
    await FileDownloadService.execute()
  } catch (error) {
    uploadResult.value = { success: false, message: 'DOWNLOAD FAILED - TRY AGAIN' }
  }
}

// Funções do modal de classificação
const closeClassificationModal = () => {
  showClassificationModal.value = false
  ofxTransactions.value = []
  groupedTransactions.value = []
  ofxFileName.value = ''
  cnpj.value = ''
  bankCodeInput.value = ''
  clearSearch()
  clearFile()
}

// Formata valor monetário
// const formatCurrency = (value: number) => {
//   return new Intl.NumberFormat('pt-BR', {
//     style: 'currency',
//     currency: 'BRL'
//   }).format(value)
// }

// Valida código para grupos
const validateGroupCode = (group: any, type: 'debito' | 'credito') => {
  const code = type === 'debito' ? group.codigoDebito : group.codigoCredito
  const errorField = type === 'debito' ? 'debitoError' : 'creditoError'

  if (!code || code.trim() === '') {
    group[errorField] = 'Código é obrigatório'
    return false
  }

  if (!/^\d+$/.test(code)) {
    group[errorField] = 'Apenas números são permitidos'
    return false
  }

  group[errorField] = ''
  return true
}

// Verifica se o formulário é válido
const isFormValid = computed(() => {
  return groupedTransactions.value.every(group => {
    return group.codigoDebito &&
      group.codigoCredito &&
      !group.debitoError &&
      !group.creditoError
  })
})

// Funções de pesquisa
const searchTransactions = () => {
  if (!searchTerm.value.trim()) {
    searchResults.value = []
    return
  }

  searchResults.value = groupedTransactions.value.filter(group =>
    group.descricao.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
}

const clearSearch = () => {
  searchTerm.value = ''
  searchResults.value = []
  batchCodesPositive.value = { debito: '', credito: '' }
  batchCodesNegative.value = { debito: '', credito: '' }
}

// Computed para separar descrições positivas e negativas nos resultados da pesquisa
const searchResultsPositive = computed(() => {
  return searchResults.value.filter(group => group.total >= 0)
})

const searchResultsNegative = computed(() => {
  return searchResults.value.filter(group => group.total < 0)
})

// Aplica classificação em lote para grupos
const applyBatchClassification = (type: 'positive' | 'negative') => {
  const codes = type === 'positive' ? batchCodesPositive.value : batchCodesNegative.value
  const targetGroups = type === 'positive' ? searchResultsPositive.value : searchResultsNegative.value

  if (!codes.credito && type === 'positive') {
    alert('Por favor, preencha código de crédito antes de aplicar.')
    return
  }

  if (!codes.debito && type === 'negative') {
    alert('Por favor, preencha código de débito antes de aplicar.')
    return
  }

  targetGroups.forEach(group => {
    group.codigoDebito = codes.debito || selectedBankCode.value
    group.codigoCredito = codes.credito || selectedBankCode.value
    group.debitoError = ''
    group.creditoError = ''
    group.debitoLocked = false
    group.creditoLocked = false
  })

  if (type === 'positive') {
    batchCodesPositive.value = { debito: '', credito: '' }
  } else {
    batchCodesNegative.value = { debito: '', credito: '' }
  }

  alert(`Códigos aplicados para ${targetGroups.length} descrições ${type === 'positive' ? 'positivas' : 'negativas'}!`)
}

// Verifica se uma descrição está nos resultados da pesquisa
const isInSearchResults = (group: any) => {
  return searchResults.value.includes(group)
}

// Verifica se uma descrição foi classificada
const isDescriptionClassified = (group: any) => {
  return group.codigoDebito && group.codigoCredito
}

// Computed para contar descrições classificadas
const classifiedCount = computed(() => {
  return groupedTransactions.value.filter(group =>
    group.codigoDebito && group.codigoCredito
  ).length
})

const pendingCount = computed(() => {
  return groupedTransactions.value.length - classifiedCount.value
})

// Descrições filtradas para exibição
const filteredGroupedTransactions = computed(() => {
  if (searchTerm.value.trim()) {
    return searchResults.value
  }
  return groupedTransactions.value
})

const saveClassification = async () => {
  let isValid = true

  groupedTransactions.value.forEach(group => {
    const debitoValid = validateGroupCode(group, 'debito')
    const creditoValid = validateGroupCode(group, 'credito')

    if (!debitoValid || !creditoValid) {
      isValid = false
    }
  })

  if (!isValid) {
    alert('Por favor, corrija os erros antes de salvar.')
    return
  }

  isSavingClassification.value = true

  // Prepara os dados para enviar - desagrupa as transações
  interface ClassifiedTransaction {
    descricao: string;
    data: string;
    valor: number;
    codigoDebito: string;
    codigoCredito: string;
    codigoBanco: string;
  }

  const classifiedData: ClassifiedTransaction[] = groupedTransactions.value.flatMap((group: {
    descricao: string;
    transacoes: { data: string; valor: number }[];
    codigoDebito: string;
    codigoCredito: string;
  }) =>
    group.transacoes.map((transacao: { data: string; valor: number }) => ({
      descricao: group.descricao,
      data: transacao.data,
      valor: transacao.valor,
      codigoDebito: group.codigoDebito,
      codigoCredito: group.codigoCredito,
      codigoBanco: selectedBankCode.value
    }))
  )

  try {
    const result = await UploadService.saveClassification({
      TransacoesClassificadas: ofxResponse.value?.transacoesClassificadas || [],
      Classificacoes: classifiedData,
      TransacoesPendentes: ofxResponse.value?.pendingTransactions || [],
      cnpj: cnpjFormatted.value,
    })

    if (result.success) {
      uploadResult.value = {
        success: true,
        message: 'Classificação salva com sucesso',
        status: 'completed',
        type: 'ofx',
        outputPath: ''
      }
      showClassificationModal.value = false
    } else {
      throw new Error(result.message || 'Erro ao salvar classificação')
    }
  } catch (error) {
    alert('Erro ao salvar classificação. Tente novamente.')
  } finally {
    isSavingClassification.value = false
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
}

.upload-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 3rem;
  border-radius: 4px;
  background: #000;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Montserrat', sans-serif;
  border: 1px solid #333;
  position: relative;
  overflow: hidden;
}

.upload-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff4d4d, #f9cb28, #ff4d4d);
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
  border-color: #ddd;
  color: #555;
}

.transaction-item.classified .classification-fields input[readonly] {
  background-color: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

/* Estilos para os botões com loading */
.confirm-button,
.save-button {
  position: relative;
  transition: all 0.3s ease;
}

.confirm-button.loading,
.save-button.loading {
  background-color: #666;
  cursor: not-allowed;
}

.confirm-button:disabled,
.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  animation: spin 1s linear infinite;
}

.spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
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

/* Estilos para desabilitar botões durante loading */
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.drop-zone {
  border: 3px dashed #444;
  padding: 3rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  background-color: rgba(30, 30, 30, 0.5);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.drop-zone.dragging {
  background-color: rgba(50, 50, 50, 0.7);
  border-color: #f9cb28;
}

.drop-zone.has-file {
  border-color: #4CAF50;
  background-color: rgba(40, 50, 40, 0.7);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.upload-icon {
  width: 48px;
  height: 48px;
  fill: #f9cb28;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 5px rgba(249, 203, 40, 0.5));
}

.drop-zone:hover .upload-icon,
.drop-zone.dragging .upload-icon {
  fill: #ff4d4d;
  transform: scale(1.1);
}

.drop-zone.has-file .upload-icon {
  fill: #4CAF50;
}

.drop-text {
  font-size: 1.2rem;
  color: #fff;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
}

.drop-subtext {
  font-size: 0.9rem;
  color: #aaa;
  margin: 0;
  font-weight: 400;
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
  stroke: #000;
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
  color: #4CAF50;
  border-left: 3px solid #4CAF50;
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
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
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
  margin-top: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.download-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

/* Estilos para a área do usuário */
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

/* Estilos para o modal de classificação */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.classification-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  border: 1px solid #333;
  position: relative;
}

.classification-modal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff4d4d, #f9cb28, #ff4d4d);
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  background: rgba(30, 30, 30, 0.8);
}

.modal-header h2 {
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.close-button {
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

.close-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: rotate(90deg);
}

.close-button svg {
  fill: #aaa;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.batch-classification-section {
  margin-bottom: 2rem;
}

.search-container {
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
}

.search-input-group {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  fill: #aaa;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.clear-search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
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

.clear-search-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: translateY(-50%) rotate(90deg);
}

.clear-search-button svg {
  fill: #aaa;
}

.search-results {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid #444;
}

.search-stats {
  color: #f9cb28;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.batch-classification-group {
  margin-bottom: 2rem;
  background: rgba(50, 50, 50, 0.3);
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #555;
}

.batch-group-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.batch-group-title.positive {
  color: #4CAF50;
  border-left: 3px solid #4CAF50;
  padding-left: 1rem;
}

.batch-group-title.negative {
  color: #ff4d4d;
  border-left: 3px solid #ff4d4d;
  padding-left: 1rem;
}

.batch-input-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.batch-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.batch-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.batch-apply-button {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.batch-apply-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.batch-apply-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.no-results {
  text-align: center;
  color: #aaa;
  font-style: italic;
  padding: 2rem;
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #444;
}

/* Estilos para as estatísticas */
.classification-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #aaa;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.stat-value {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
}

.stat-value.classified {
  color: #4CAF50;
}

.stat-value.pending {
  color: #ff4d4d;
}

.transactions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 40vh;
  overflow-y: auto;
  padding-right: 5px;
}

.transactions-container::-webkit-scrollbar {
  width: 6px;
}

.transactions-container::-webkit-scrollbar-track {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 3px;
}

.transactions-container::-webkit-scrollbar-thumb {
  background: #f9cb28;
  border-radius: 3px;
}

.transactions-container::-webkit-scrollbar-thumb:hover {
  background: #ff4d4d;
}

.transaction-item {
  background: rgba(40, 40, 40, 0.7);
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  border-color: #f9cb28;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.2);
}

.transaction-item.classified {
  border-left: 3px solid #4CAF50;
  background: rgba(40, 60, 40, 0.3);
}

.transaction-item.search-highlight {
  border-color: #f9cb28;
  box-shadow: 0 0 15px rgba(249, 203, 40, 0.3);
  background: rgba(249, 203, 40, 0.1);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.transaction-date {
  color: #aaa;
  font-size: 0.9rem;
}

.transaction-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.transaction-value.negative {
  color: #ff4d4d;
}

.transaction-value.positive {
  color: #4CAF50;
}

.transaction-description {
  color: #ddd;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.classification-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.code-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.code-input-group label {
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.code-input-group input {
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

.code-input-group input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.code-input-group input.error {
  border-color: #ff4d4d;
  box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.3);
}

.error-message {
  color: #ff4d4d;
  font-size: 0.8rem;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.save-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
}

/* Ajuste para mobile */
@media (max-width: 768px) {
  .upload-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .title {
    font-size: 2.5rem;
  }

  .user-area {
    top: 10px;
    right: 10px;
  }

  .user-name {
    display: none;
  }

  .user-info {
    padding: 6px;
  }

  .classification-modal {
    width: 98%;
    margin: 5px;
    max-height: 98vh;
  }

  .modal-header h2 {
    font-size: 1.4rem;
  }

  .classification-fields,
  .batch-input-fields {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .save-button,
  .cancel-button {
    width: 100%;
    justify-content: center;
  }

  .classification-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }

  .transactions-container {
    max-height: 30vh;
  }

  .search-container {
    padding: 1rem;
  }

  .batch-classification-group {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1rem;
  }

  .search-input {
    padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  }

  .batch-apply-button {
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
  }
}

/* Estilos melhorados para o modal de dados bancários */
.bank-data-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border-radius: 8px;
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  border: 1px solid #333;
  position: relative;
}

.bank-data-modal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff4d4d, #f9cb28, #ff4d4d);
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  background: rgba(30, 30, 30, 0.8);
}

.modal-header h2 {
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.close-button {
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

.close-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: rotate(90deg);
}

.close-button svg {
  fill: #aaa;
}

.file-info-modal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(40, 40, 40, 0.8);
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border-left: 3px solid #f9cb28;
  font-size: 0.95rem;
  color: #ddd;
}

.bank-fields {
  padding: 0;
}

.input-group {
  margin-bottom: 1.5rem;

}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.input-group input::placeholder {
  color: #777;
}

.input-group-codeBank input,
.input-group-codeBank select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group-codeBank input:focus,
.input-group-codeBank select:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.input-group-codeBank input::placeholder {
  color: #777;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.confirm-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.confirm-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.cancel-button:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
}

/* Ajuste para mobile */
@media (max-width: 768px) {
  .bank-data-modal {
    width: 98%;
    margin: 5px;
    max-height: 98vh;
  }

  .modal-header h2 {
    font-size: 1.4rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .confirm-button,
  .cancel-button {
    width: 100%;
    justify-content: center;
  }
}

/* Animações */
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

/* Estilos para o combobox */
.combobox-container {
  position: relative;
  width: 100%;
}

.combobox-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.combobox-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 1000;
  margin-top: 4px;
}

.combobox-option {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  color: #000;
}

.combobox-option:hover {
  background-color: #f5f5f5;
}

.combobox-option:last-child {
  border-bottom: none;
}

.combobox-no-results {
  padding: 8px 12px;
  color: #666;
  font-style: italic;
}

.description-group {
  border: 1px solid #333;
  border-radius: 6px;
  margin-bottom: 1rem;
  background: rgba(40, 40, 40, 0.7);
  transition: all 0.3s ease;
  position: relative;
}

.description-group.classified {
  border-left: 3px solid #4CAF50;
  background: rgba(40, 60, 40, 0.3);
}

.description-group.search-highlight {
  background: rgba(249, 203, 40, 0.1);
  border-color: #f9cb28;
  box-shadow: 0 0 15px rgba(249, 203, 40, 0.3);
}

.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
}

.description-header:hover {
  background: rgba(50, 50, 50, 0.8);
  border-color: #f9cb28;
}

.description-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.description-text {
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.description-count {
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 600;
}

.description-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.description-total {
  font-weight: 700;
  font-size: 1.1rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
}

.description-total.positive {
  color: #4CAF50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.description-total.negative {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
}

.description-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  fill: #f9cb28;
}

.description-arrow.rotated {
  transform: rotate(180deg);
}

.classification-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #333;
  background: rgba(30, 30, 30, 0.5);
}

.transactions-details {
  border-top: 1px solid #333;
  background: rgba(40, 40, 40, 0.5);
}

.transactions-list {
  padding: 0.75rem 1rem;
}

.transaction-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #444;
  transition: all 0.3s ease;
}

.transaction-detail:hover {
  background: rgba(255, 255, 255, 0.05);
}

.transaction-detail:last-child {
  border-bottom: none;
}

.transaction-date {
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 600;
}

.transaction-value {
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
}

.transaction-value.positive {
  color: #4CAF50;
}

.transaction-value.negative {
  color: #ff4d4d;
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .description-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .description-controls {
    width: 100%;
    justify-content: space-between;
  }

  .classification-fields {
    grid-template-columns: 1fr;
  }
}

/* Estilos para os campos de código */
.code-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.code-input-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.code-input-group input {
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.9rem;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

.code-input-group input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.code-input-group input.error {
  border-color: #ff4d4d;
  box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.3);
}

.error-message {
  font-size: 0.8rem;
  color: #ff4d4d;
  font-weight: 600;
}

/* Estilos para os botões de classificação em lote */
.batch-classification-group {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px;
  border-left: 3px solid #f9cb28;
}

.batch-group-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-left: 0.75rem;
}

.batch-group-title.positive {
  color: #4CAF50;
  border-left-color: #4CAF50;
}

.batch-group-title.negative {
  color: #ff4d4d;
  border-left-color: #ff4d4d;
}

.batch-input-fields {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: end;
}

.batch-apply-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.batch-apply-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.batch-apply-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

/* Estatísticas */
.classification-stats {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px;
  border: 1px solid #333;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  color: #fff;
}

.stat-value.classified {
  color: #4CAF50;
}

.stat-value.pending {
  color: #ff4d4d;
}

/* Animações */
.description-group {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>