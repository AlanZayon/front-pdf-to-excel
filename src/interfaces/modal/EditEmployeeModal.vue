<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Cabeçalho do Modal -->
      <div class="modal-header">
        <h2>EDITAR USUÁRIO</h2>
        <button @click="closeModal" class="close-button" aria-label="Fechar modal">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
      </div>

      <!-- Tabs de navegação -->
      <div class="tabs">
        <button @click="activeTab = 'user'" :class="{ 'active': activeTab === 'user' }" class="tab-button">
          Dados do Usuário
        </button>
        <button @click="activeTab = 'account'" :class="{ 'active': activeTab === 'account' }" class="tab-button">
          Códigos de Conta
        </button>
      </div>

      <!-- Corpo do Modal - Dados do Usuário -->
      <div v-if="activeTab === 'user'" class="modal-body">
        <div class="user-subtabs">
          <button @click="activeUserSection = 'name'" :class="{ 'active': activeUserSection === 'name' }"
            class="user-subtab-button">Nome</button>
          <button @click="activeUserSection = 'email'" :class="{ 'active': activeUserSection === 'email' }"
            class="user-subtab-button">E-mail</button>
          <button @click="activeUserSection = 'password'" :class="{ 'active': activeUserSection === 'password' }"
            class="user-subtab-button">Senha</button>
        </div>
        <div class="user-section" v-if="activeUserSection === 'name'">
          <div class="section-header">
            <h3 class="section-title">DADOS PESSOAIS</h3>
            <p class="section-subtitle">INFORMAÇÕES DO NOME DO USUÁRIO</p>
          </div>
          <!-- Campo Nome -->
          <div class="input-group">
            <label class="input-label">NOME</label>
            <div class="input-wrapper"
              :class="{ 'valid': validateName(editedUser.name), 'invalid': editedUser.name && !validateName(editedUser.name) }">
              <svg class="input-icon" viewBox="0 0 24 24">
                <path
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 9,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <input v-model="editedUser.name" type="text" required class="input-field" placeholder="NOME COMPLETO">
              <svg v-if="editedUser.name" class="valid-icon" viewBox="0 0 24 24">
                <path v-if="validateName(editedUser.name)"
                  d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                <path v-else
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </div>
            <p v-if="editedUser.name && !validateName(editedUser.name)" class="error-message">O nome deve ter pelo menos
              3
              caracteres</p>
          </div>
        </div>

        <div class="user-section" v-if="activeUserSection === 'email'">
          <div class="section-header">
            <h3 class="section-title">CONTATO</h3>
            <p class="section-subtitle">ENDEREÇO DE E-MAIL</p>
          </div>
          <!-- Campo E-mail -->
          <div class="input-group">
            <label class="input-label">E-MAIL</label>
            <div class="input-wrapper"
              :class="{ 'valid': validateEmail(editedUser.email), 'invalid': editedUser.email && !validateEmail(editedUser.email) }">
              <svg class="input-icon" viewBox="0 0 24 24">
                <path
                  d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z" />
              </svg>
              <input v-model="editedUser.email" type="email" required class="input-field" placeholder="NOVO@EMAIL.COM">
              <svg v-if="editedUser.email" class="valid-icon" viewBox="0 0 24 24">
                <path v-if="validateEmail(editedUser.email)"
                  d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                <path v-else
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </div>
            <p v-if="editedUser.email && !validateEmail(editedUser.email)" class="error-message">Por favor, insira um
              e-mail válido</p>
          </div>
        </div>

        <div class="user-section" v-if="activeUserSection === 'password'">
          <div class="section-header">
            <h3 class="section-title">SEGURANÇA</h3>
            <p class="section-subtitle">ALTERAÇÃO DE SENHA</p>
          </div>
          
          <!-- Campo Senha Atual -->
          <div class="input-group">
            <label class="input-label">SENHA ATUAL</label>
            <div class="input-wrapper" :class="{ 'invalid': passwordFieldErrors.currentPassword }">
              <svg class="input-icon" viewBox="0 0 24 24">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
              </svg>
              <input v-model="currentPassword" :type="showCurrentPassword ? 'text' : 'password'" required class="input-field" placeholder="DIGITE SUA SENHA ATUAL">
              <button @click="showCurrentPassword = !showCurrentPassword" class="password-toggle">
                <svg class="password-icon" viewBox="0 0 24 24">
                  <path v-if="showCurrentPassword" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                  <path v-else d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                </svg>
              </button>
            </div>
            <p v-if="passwordFieldErrors.currentPassword" class="error-message">{{ passwordFieldErrors.currentPassword }}</p>
          </div>

          <!-- Campo Nova Senha -->
          <div class="input-group">
            <label class="input-label">NOVA SENHA</label>
            <div class="input-wrapper" :class="{ 
              'valid': validatePassword(editedUser.password) && editedUser.password.length > 0, 
              'invalid': passwordFieldErrors.newPassword || (editedUser.password && !validatePassword(editedUser.password))
            }">
              <svg class="input-icon" viewBox="0 0 24 24">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
              </svg>
              <input v-model="editedUser.password" :type="showPassword ? 'text' : 'password'" class="input-field" placeholder="DIGITE A NOVA SENHA">
              <button @click="showPassword = !showPassword" class="password-toggle">
                <svg class="password-icon" viewBox="0 0 24 24">
                  <path v-if="showPassword" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                  <path v-else d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                </svg>
              </button>
            </div>
            <div v-if="editedUser.password" class="password-strength">
              <div class="strength-bar" :class="passwordStrengthClass"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
            <p v-if="passwordFieldErrors.newPassword" class="error-message">{{ passwordFieldErrors.newPassword }}</p>
            <p v-else-if="editedUser.password && !validatePassword(editedUser.password)" class="error-message">
              A senha deve ter pelo menos 8 caracteres
            </p>
          </div>

          <!-- Campo Confirmar Nova Senha -->
          <div class="input-group">
            <label class="input-label">CONFIRMAR NOVA SENHA</label>
            <div class="input-wrapper" :class="{ 
              'valid': editedUser.confirmPassword === editedUser.password && editedUser.confirmPassword.length > 0, 
              'invalid': passwordFieldErrors.confirmPassword || (editedUser.confirmPassword && editedUser.confirmPassword !== editedUser.password)
            }">
              <svg class="input-icon" viewBox="0 0 24 24">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
              </svg>
              <input v-model="editedUser.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="input-field" placeholder="CONFIRME A NOVA SENHA">
              <button @click="showConfirmPassword = !showConfirmPassword" class="password-toggle">
                <svg class="password-icon" viewBox="0 0 24 24">
                  <path v-if="showConfirmPassword" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                  <path v-else d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                </svg>
              </button>
            </div>
            <p v-if="passwordFieldErrors.confirmPassword" class="error-message">{{ passwordFieldErrors.confirmPassword }}</p>
            <p v-else-if="editedUser.confirmPassword && editedUser.confirmPassword !== editedUser.password" class="error-message">
              As senhas não coincidem
            </p>
          </div>
        </div>

        <!-- Ações do Modal -->
        <div class="modal-actions">
          <button @click="saveUserChanges" class="auth-button" :disabled="isSaving || !isUserFormValid"
            :class="{ 'loading': isSaving }">
            <span v-if="!isSaving">SALVAR ALTERAÇÕES</span>
            <span v-else class="button-loading">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              SALVANDO...
            </span>
          </button>
          <button @click="closeModal" class="auth-button secondary">
            CANCELAR
          </button>
          <button @click="requestAccountDeletion" class="auth-button delete-button">
            EXCLUIR CONTA
          </button>
        </div>
      </div>

      <!-- Corpo do Modal - Códigos de Conta -->
      <div v-if="activeTab === 'account'" class="modal-body">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Carregando códigos de conta...</p>
        </div>

        <div v-else class="tax-codes-section">
          <div class="section-header">
            <h3 class="section-title">CÓDIGOS DE CONTA</h3>
            <p class="section-subtitle">CONFIGURAÇÃO DOS TIPOS DE IMPOSTO</p>
            <div class="account-types-header">
              <div class="account-types">
                <span class="account-type-label">DÉBITO</span>
                <span class="account-type-label">CRÉDITO</span>
              </div>
            </div>
          </div>

          <div class="tax-code-row" v-for="tax in taxTypes" :key="tax.Code">
            <label class="tax-label">
              {{ tax.nome
              .replace('SIMPLES_NACIONAL', 'SIMPLES NACIONAL')
              .replace('MULTA_JUROS', 'MULTA E JUROS') }}
            </label>
            <div class="account-inputs">
              <input :value="taxCodes[tax.Code].debito === '_' ? '' : taxCodes[tax.Code].debito"
                @input="handleDebitoInput($event, tax.Code)" type="text" class="tax-input" :placeholder="'Débito'"
                :disabled="isSaving" maxlength="5" onkeypress="return event.charCode >= 48 && event.charCode <= 57">
              <input :value="taxCodes[tax.Code].credito === '_' ? '' : taxCodes[tax.Code].credito"
                @input="handleCreditoInput($event, tax.Code)" type="text" class="tax-input" :placeholder="'Crédito'"
                :disabled="isSaving" maxlength="5" onkeypress="return event.charCode >= 48 && event.charCode <= 57">
            </div>
          </div>

          <!-- Ações do Modal -->
          <div class="modal-actions">
            <button @click="saveAccountChanges" class="auth-button" :disabled="isSaving"
              :class="{ 'loading': isSaving }">
              <span v-if="!isSaving">SALVAR CÓDIGOS</span>
              <span v-else class="button-loading">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                SALVANDO...
              </span>
            </button>
            <button @click="closeModal" class="auth-button secondary">
              CANCELAR
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showDeleteConfirmation" class="modal-overlay confirm-overlay">
    <div class="modal-content confirm-modal">
      <div class="modal-header">
        <h2>CONFIRMAR EXCLUSÃO</h2>
      </div>
      <div class="modal-body">
        <p>
          Você está prestes a excluir sua conta permanentemente. Esta ação não pode ser desfeita.
          Todos os seus dados serão removedos do sistema.
        </p>
        <p class="warning-text">
          <strong>ATENÇÃO:</strong> Tem certeza que deseja continuar?
        </p>
        <div class="modal-actions">
          <button @click="deleteAccount" class="auth-button delete-button" :disabled="isDeleting">
            <span v-if="!isDeleting">CONFIRMAR EXCLUSÃO</span>
            <span v-else class="button-loading">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              EXCLUINDO...
            </span>
          </button>
          <button @click="showDeleteConfirmation = false" class="auth-button secondary">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Sucesso/Erro -->
  <div v-if="showResultModal" class="modal-overlay confirm-overlay">
    <div class="modal-content confirm-modal">
      <div class="modal-header">
        <h2>{{ resultModalTitle }}</h2>
      </div>
      <div class="modal-body">
        <p>{{ resultModalMessage }}</p>
        <div class="modal-actions">
          <button @click="handleResultModalClose" class="auth-button">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmação -->
  <div v-if="confirmChanges" class="modal-overlay confirm-overlay">
    <div class="modal-content confirm-modal">
      <div class="modal-header">
        <h2>CONFIRMAR ALTERAÇÃO</h2>
      </div>
      <div class="modal-body">
        <p v-if="changeType === 'email'">
          Você está alterando seu endereço de e-mail. Um link de confirmação será enviado para o novo endereço.
        </p>
        <p v-if="changeType === 'password'">
          Você está alterando sua senha. Certifique-se de que é uma senha forte e única.
        </p>
        <div class="modal-actions">
          <button @click="proceedWithChange" class="auth-button">
            CONFIRMAR
          </button>
          <button @click="confirmChanges = false" class="auth-button secondary">
            CANCELAR
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ImpostoService } from '../../infrastructure/services/ImpostoService'
import { LoadImpostosCommand } from '../../application/commands/LoadImpostosCommand'
import { UpdateImpostosCommand } from '../../application/commands/UpdateImpostosCommand'
import { AuthService } from '../../infrastructure/services/AuthService'
import { ChangePasswordCommand } from '../../application/commands/ChangePasswordCommand'
import type { ChangePasswordResult } from '../../domain/models/ChangePasswordResult'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import type { TaxCodes } from '../../application/interfaces/TaxCodes'
import type { ImpostoDto } from '../../application/dtos/ImpostoDto'

// Props e Emits
const props = defineProps({
  isOpen: Boolean,
  userData: Object as () => {
    fullName?: string;
    email?: string;
  }
})

const emit = defineEmits(['close', 'save-user', 'save-account', 'delete-account'])

// Dados reativos
const activeTab = ref<'user' | 'account'>('user')
const activeUserSection = ref<'name' | 'email' | 'password'>('name')
const editedUser = ref({
  name: props.userData?.fullName || '',
  email: props.userData?.email || '',
  password: '',
  confirmPassword: ''
})

// Dados para códigos de imposto
const taxCodes = ref<TaxCodes>({})
const originalTaxCodes = ref<TaxCodes>({})
const taxTypes = ref<ImpostoDto[]>([])
const isSaving = ref(false)
const isLoading = ref(false)

// Dados para usuário
const currentPassword = ref('')
const showPassword = ref(false)
const showCurrentPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordFieldErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const confirmChanges = ref(false)
const changeType = ref('')

const isDeleting = ref(false)
const showDeleteConfirmation = ref(false)
const showResultModal = ref(false)
const resultModalTitle = ref('')
const resultModalMessage = ref('')
const router = useRouter()
const authStore = useAuthStore()

// Funções de validação
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePassword = (password: string) => {
  return password === '' || password.length >= 8
}

const validateName = (name: string) => {
  return name.trim().length >= 3
}

// Computed properties
const passwordStrength = computed(() => {
  if (!editedUser.value.password) return 0

  let strength = 0
  if (editedUser.value.password.length >= 8) strength++
  if (editedUser.value.password.match(/[a-z]/) && editedUser.value.password.match(/[A-Z]/)) strength++
  if (editedUser.value.password.match(/[0-9]/)) strength++
  if (editedUser.value.password.match(/[^a-zA-Z0-9]/)) strength++

  return strength
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 1) return 'weak'
  if (passwordStrength.value <= 3) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value <= 1) return 'Fraca'
  if (passwordStrength.value <= 3) return 'Média'
  return 'Forte'
})

const isUserFormValid = computed(() => {
  if (activeUserSection.value === 'name') {
    return validateName(editedUser.value.name)
  }
  if (activeUserSection.value === 'email') {
    return validateEmail(editedUser.value.email)
  }
  if (activeUserSection.value === 'password') {
    return currentPassword.value !== '' &&
           validatePassword(editedUser.value.password) &&
           editedUser.value.password === editedUser.value.confirmPassword
  }
  return false
})

// Funções para códigos de imposto
const handleDebitoInput = (event: Event, taxCode: string) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, '').slice(0, 5);

  if (!taxCodes.value[taxCode]) {
    taxCodes.value[taxCode] = { debito: '_', credito: '_' };
  }
  taxCodes.value[taxCode].debito = value || '_';

  const taxType = taxTypes.value.find(t => t.Code === taxCode);
  if (taxType && taxType.codigoDebito) {
    taxType.codigoDebito.codigo = value || '_';
  }

  target.value = value;
}

const handleCreditoInput = (event: Event, taxCode: string) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, '').slice(0, 5);

  if (!taxCodes.value[taxCode]) {
    taxCodes.value[taxCode] = { debito: '_', credito: '_' };
  }
  taxCodes.value[taxCode].credito = value || '_';

  const taxType = taxTypes.value.find(t => t.Code === taxCode);
  if (taxType && taxType.codigoCredito) {
    taxType.codigoCredito.codigo = value || '_';
  }

  target.value = value;
}

const loadTaxCodes = async () => {
  try {
    isLoading.value = true
    const command = LoadImpostosCommand.create()
    const result = await ImpostoService.loadImpostos(command)

    if (!result.success) {
      throw new Error(result.message)
    }

    if (result.data) {
      taxTypes.value = result.data.impostos.filter(imposto => imposto.Code)

      const codes: TaxCodes = {}
      result.data.impostos.forEach(imposto => {
        if (imposto.Code) {
          codes[imposto.Code] = {
            debito: imposto.codigoDebito?.codigo || '_',
            credito: imposto.codigoCredito?.codigo || '_'
          }
        }
      })

      taxCodes.value = codes
      originalTaxCodes.value = JSON.parse(JSON.stringify(codes))
    }

  } catch (error) {
    console.error('Erro ao carregar códigos:', error)
    alert(error instanceof Error ? error.message : 'Erro ao carregar os códigos')
  } finally {
    isLoading.value = false
  }
}

// Função para trocar senha
const changePassword = async () => {
  isSaving.value = true
  passwordFieldErrors.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  
  try {
    const command = new ChangePasswordCommand(
      currentPassword.value,
      editedUser.value.password,
      editedUser.value.confirmPassword
    )
    
    const result: ChangePasswordResult = await AuthService.changePassword(command)
    
    if (result.success) {
      // Senha alterada com sucesso
      resultModalTitle.value = 'SENHA ALTERADA'
      resultModalMessage.value = 'Sua senha foi alterada com sucesso!'
      showResultModal.value = true
      
      // Limpa os campos
      currentPassword.value = ''
      editedUser.value.password = ''
      editedUser.value.confirmPassword = ''
    } else {
      // Trata erros de campo
      if (result.fieldErrors) {
        passwordFieldErrors.value = {
          currentPassword: result.fieldErrors.currentPassword || '',
          newPassword: result.fieldErrors.newPassword || '',
          confirmPassword: result.fieldErrors.confirmPassword || ''
        }
      }
      
      resultModalTitle.value = 'ERRO AO ALTERAR SENHA'
      resultModalMessage.value = result.message || 'Ocorreu um erro ao tentar alterar sua senha.'
      showResultModal.value = true
    }
  } catch (error) {
    console.error('Erro inesperado ao alterar senha:', error)
    resultModalTitle.value = 'ERRO INESPERADO'
    resultModalMessage.value = 'Ocorreu um erro inesperado ao tentar alterar sua senha.'
    showResultModal.value = true
  } finally {
    isSaving.value = false
  }
}

// Watchers
watch(() => props.userData, (newVal) => {
  if (newVal) {
    editedUser.value = {
      name: newVal.fullName || '',
      email: newVal.email || '',
      password: '',
      confirmPassword: ''
    }
    currentPassword.value = ''
    passwordFieldErrors.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  }
}, { immediate: true, deep: true })

watch(() => currentPassword.value, () => {
  passwordFieldErrors.value.currentPassword = ''
})

watch(() => editedUser.value.password, () => {
  passwordFieldErrors.value.newPassword = ''
})

watch(() => editedUser.value.confirmPassword, () => {
  passwordFieldErrors.value.confirmPassword = ''
})

watch(() => activeTab.value, (newVal) => {
  if (newVal === 'account') {
    loadTaxCodes()
  }
})

// Métodos
const closeModal = () => {
  emit('close')
}

const requestConfirmation = (type: string) => {
  changeType.value = type
  confirmChanges.value = true
}

const proceedWithChange = () => {
  confirmChanges.value = false
  if (activeTab.value === 'user') {
    if (changeType.value === 'password') {
      changePassword()
    } else {
      performUserSave(changeType.value as 'name' | 'email')
    }
  } else {
    saveAccountChanges()
  }
}

const saveUserChanges = async () => {
  if (isSaving.value) return

  if (activeUserSection.value === 'name') {
    if (!isUserFormValid.value) return
    await performUserSave('name')
    return
  }

  if (activeUserSection.value === 'email') {
    if (!isUserFormValid.value) return
    if (editedUser.value.email !== props.userData?.email) {
      requestConfirmation('email')
    } else {
      alert('Nenhuma alteração para salvar.')
    }
    return
  }

  if (activeUserSection.value === 'password') {
    if (!isUserFormValid.value) {
      // Mostra mensagens de erro específicas
      if (!currentPassword.value) {
        passwordFieldErrors.value.currentPassword = 'Por favor, insira sua senha atual'
      }
      if (!validatePassword(editedUser.value.password)) {
        passwordFieldErrors.value.newPassword = 'A senha deve ter pelo menos 8 caracteres'
      }
      if (editedUser.value.password !== editedUser.value.confirmPassword) {
        passwordFieldErrors.value.confirmPassword = 'As senhas não coincidem'
      }
      return
    }
    
    requestConfirmation('password')
    return
  }
}

const saveAccountChanges = async () => {
  isSaving.value = true
  try {
    // Filtra apenas os impostos que foram modificados
    const changes = taxTypes.value.filter(imposto => {
      const original = originalTaxCodes.value[imposto.Code]
      return (
        imposto.codigoDebito.codigo !== original?.debito ||
        imposto.codigoCredito.codigo !== original?.credito
      )
    })

    if (changes.length === 0) {
      alert('Nenhuma alteração para salvar.')
      closeModal()
      return
    }

    const command = UpdateImpostosCommand.create(changes)
    const result = await ImpostoService.updateImpostos(command)

    if (!result.success) {
      throw new Error(result.message)
    }

    // Atualiza os valores originais
    changes.forEach(change => {
      if (change.Code) {
        originalTaxCodes.value[change.Code] = {
          debito: change.codigoDebito.codigo,
          credito: change.codigoCredito.codigo
        }
      }
    })

    emit('save-account', taxCodes.value)
    alert('Códigos salvos com sucesso!')
    closeModal()

  } catch (error) {
    console.error('Erro ao salvar códigos:', error)
    alert(error instanceof Error ? error.message : 'Erro desconhecido ao salvar')
  } finally {
    isSaving.value = false
  }
}

const requestAccountDeletion = () => {
  showDeleteConfirmation.value = true
}

const deleteAccount = async () => {
  isDeleting.value = true
  try {
    const result = await AuthService.deleteUser()

    if (result.success) {
      // Logout após exclusão bem-sucedida
      await authStore.logout()

      // Mostra mensagem de sucesso
      resultModalTitle.value = 'CONTA EXCLUÍDA'
      resultModalMessage.value = 'Sua conta foi excluída com sucesso. Todos os seus dados foram removidos do sistema.'
      showDeleteConfirmation.value = false
      showResultModal.value = true
    } else {
      // Mostra mensagem de erro
      resultModalTitle.value = 'ERRO AO EXCLUIR'
      resultModalMessage.value = result.message || 'Ocorreu um erro ao tentar excluir sua conta.'
      if (result.errors) {
        resultModalMessage.value += '\n' + result.errors.map(e => e.description).join('\n')
      }
      showDeleteConfirmation.value = false
      showResultModal.value = true
    }
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    resultModalTitle.value = 'ERRO INESPERADO'
    resultModalMessage.value = 'Ocorreu um erro inesperado ao tentar excluir sua conta.'
    showDeleteConfirmation.value = false
    showResultModal.value = true
  } finally {
    isDeleting.value = false
  }
}

const handleResultModalClose = () => {
  showResultModal.value = false
  if (resultModalTitle.value === 'CONTA EXCLUÍDA') {
    // Redireciona para a página inicial após exclusão bem-sucedida
    router.push('/')
  }
}

const performUserSave = async (change: 'name' | 'email') => {
  isSaving.value = true
  try {
    // Simula uma chamada API (substitua pela sua implementação real)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const payload: any = { type: change }
    if (change === 'name') {
      payload.name = editedUser.value.name
    } else if (change === 'email') {
      payload.email = editedUser.value.email
    }

    emit('save-user', payload)
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
  } finally {
    isSaving.value = false
  }
}
</script>
<style scoped>
/* Estilos base */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 8px;
  width: 100%;
  max-width: 650px;
  border: 1px solid #333;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  transform: translateY(0);
  transition: transform 0.3s ease;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-content:hover {
  transform: translateY(-2px);
}

/* Efeito de gradiente no topo */
.modal-content::before {
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

/* Cabeçalho */
.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  background: rgba(30, 30, 30, 0.7);
}

.modal-header h2 {
  color: #f9cb28;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 2px;
  font-size: 1.8rem;
  margin: 0;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Botão de fechar */
.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 77, 77, 0.3);
  transform: rotate(90deg);
}

.close-button svg {
  fill: #aaa;
  transition: fill 0.2s ease;
}

.close-button:hover svg {
  fill: #fff;
}

/* Corpo do modal */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  scrollbar-width: thin;
  scrollbar-color: #f9cb28 #333;
}

/* Custom scrollbar */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #333;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: #f9cb28;
  border-radius: 4px;
  border: 1px solid #333;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background-color: #ff8a00;
}

/* Grupos de input */
.input-group {
  margin-bottom: 1.5rem;
  max-width: 100%;
}

.input-label {
  display: block;
  color: #ddd;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

/* Inputs */
.input-wrapper {
  position: relative;
  max-width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  fill: #aaa;
  width: 20px;
  height: 20px;
  transition: fill 0.15s ease;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 40px;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.2);
}

.input-field:focus+.input-icon {
  fill: #f9cb28;
}

/* Validação */
.input-wrapper.valid {
  border-left: 3px solid #4CAF50;
}

.input-wrapper.invalid {
  border-left: 3px solid #ff4d4d;
}

.valid-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
}

.input-wrapper.valid .valid-icon {
  fill: #4CAF50;
}

.input-wrapper.invalid .valid-icon {
  fill: #ff4d4d;
}

/* Seção de códigos fiscais */
.tax-codes-section {
  max-width: 100%;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  color: #f9cb28;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.section-subtitle {
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.account-types-header {
  display: flex;
  width: 100%;
  margin-bottom: 0.5rem;
}

.tax-label-spacer {
  width: 180px;
  flex-shrink: 0;
}

.account-types {
  display: flex;
  flex: 1;
  gap: 1rem;
  justify-content: flex-end;
  padding-right: 12px;
}

.account-type-label {
  color: #aaa;
  font-size: 0.8rem;
  width: 80px;
  text-align: start;
  display: inline-block;
}

/* Linhas de códigos fiscais */
.tax-code-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(51, 51, 51, 0.5);
  width: 100%;
}

.tax-code-row:last-child {
  border-bottom: none;
}

.tax-label {
  color: #ddd;
  font-weight: 600;
  font-size: 0.9rem;
  width: 180px;
  flex-shrink: 0;
  padding-left: 4px;
}

.account-inputs {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex: 1;
  padding-right: 10px;
  align-items: center;
}

.tax-input {
  width: 80px;
  padding: 0.65rem 0.5rem;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.15s ease;
  text-align: center;
}

.tax-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.2);
}

.tax-input::-webkit-inner-spin-button,
.tax-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Ações do modal */
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.modal-actions .auth-button {
  flex: 1;
}

.auth-button {
  padding: 0.85rem;
  background: linear-gradient(to right, #f9cb28, #ff8a00);
  border: none;
  border-radius: 4px;
  color: #1a1a1a;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.3);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-button.loading {
  color: transparent;
}

.auth-button.secondary {
  background: transparent;
  color: #f9cb28;
  border: 1px solid #f9cb28;
}

.auth-button.secondary:hover:not(:disabled) {
  background: rgba(249, 203, 40, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.1);
}

/* Loading */
.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 20px;
  height: 20px;
}

.spinner .path {
  stroke: #1a1a1a;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

/* Confirmação modal */
.confirm-overlay {
  background: rgba(0, 0, 0, 0.9);
}

.confirm-modal {
  max-width: 450px;
}

.confirm-modal .modal-body p {
  color: #ddd;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* Força da senha */
.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  flex-grow: 1;
  background: #333;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  display: block;
  height: 100%;
  width: var(--strength, 0%);
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-bar.weak::after {
  background: #ff4d4d;
  --strength: 33%;
}

.strength-bar.medium::after {
  background: #f9cb28;
  --strength: 66%;
}

.strength-bar.strong::after {
  background: #4CAF50;
  --strength: 100%;
}

.strength-text {
  font-size: 0.8rem;
  color: #aaa;
}

/* Mensagens de erro */
.error-message {
  color: #ff4d4d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
}

/* Botão de visualização de senha */
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-icon {
  width: 20px;
  height: 20px;
  fill: #aaa;
  transition: fill 0.2s ease;
}

.password-toggle:hover .password-icon {
  fill: #f9cb28;
}

/* Melhorias de acessibilidade */
.input-field:focus,
.tax-input:focus,
.auth-button:focus {
  outline: 2px solid rgba(249, 203, 40, 0.5);
  outline-offset: 2px;
}

/* Efeito de hover nos inputs */
.input-wrapper:hover .input-icon {
  fill: #f9cb28;
}

.input-field:hover {
  border-color: #555;
}

/* No style, junto com os outros estilos de botão */
.delete-button {
  background: linear-gradient(to right, #ff4d4d, #d93636);
  color: white;
}

.delete-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 77, 77, 0.3);
}

.warning-text {
  color: #ff4d4d;
  margin: 1rem 0;
  font-size: 0.95rem;
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

/* Responsividade */
@media (max-width: 768px) {
  .modal-body {
    padding: 1rem;
  }

  .tax-code-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tax-label {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .account-inputs {
    width: 100%;
    justify-content: space-between;
    padding-right: 0;
  }

  .tax-input {
    width: 48%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .account-types-header {
    display: none;
  }

  .account-types {
    display: none;
  }
}

.user-subtabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.user-subtab-button {
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid #333;
  border-radius: 4px;
  color: #aaa;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-subtab-button:hover {
  color: #f9cb28;
  border-color: #555;
}

.user-subtab-button.active {
  color: #f9cb28;
  border-color: #f9cb28;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #333;
  padding: 0 1.5rem;
}

.tab-button {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: #aaa;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #f9cb28;
}

.tab-button.active {
  color: #f9cb28;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #f9cb28;
}

/* Ajuste para o modal-body com tabs */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  scrollbar-width: thin;
  scrollbar-color: #f9cb28 #333;
  max-height: calc(90vh - 150px);
  /* Ajuste para acomodar as tabs */
}
</style>