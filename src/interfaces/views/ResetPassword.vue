<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Cabeçalho -->
      <div class="auth-header">
        <h2>REDEFINIR SENHA</h2>
        <p class="auth-subtitle">Digite sua nova senha abaixo</p>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleResetPassword" class="auth-form">
        <!-- Campo Nova Senha -->
        <div class="input-group">
          <label class="input-label">NOVA SENHA</label>
          <div class="input-wrapper" :class="{ 
            'valid': validatePassword(newPassword).isValid && newPassword.length > 0, 
            'invalid': fieldErrors.newPassword || (newPassword && !validatePassword(newPassword).isValid)
          }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
            <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" class="input-field" placeholder="DIGITE A NOVA SENHA" required>
            <button @click.prevent="showPassword = !showPassword" class="password-toggle">
              <svg class="password-icon" viewBox="0 0 24 24">
                <path v-if="showPassword" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                <path v-else d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
              </svg>
            </button>
          </div>

          <!-- Indicador de força da senha -->
          <div v-if="newPassword" class="password-strength-container">
            <div class="strength-bar-container">
              <div class="strength-bar" :class="passwordStrengthClass"></div>
            </div>
            <div class="strength-info">
              <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
              <span class="strength-score">{{ passwordStrength.score }}/5</span>
            </div>
          </div>

          <!-- Lista de requisitos da senha -->
          <div v-if="newPassword" class="password-requirements">
            <div class="requirement-item" :class="{ 'met': passwordRequirements.length }">
              <svg class="requirement-icon" viewBox="0 0 24 24">
                <path d="M9,20.42L2.79,14.21L5.21,11.79L9,15.58L18.79,5.79L21.21,8.21L9,20.42Z"/>
              </svg>
              <span>Mínimo 8 caracteres</span>
            </div>
            <div class="requirement-item" :class="{ 'met': passwordRequirements.lowercase }">
              <svg class="requirement-icon" viewBox="0 0 24 24">
                <path d="M9,20.42L2.79,14.21L5.21,11.79L9,15.58L18.79,5.79L21.21,8.21L9,20.42Z"/>
              </svg>
              <span>Uma letra minúscula</span>
            </div>
            <div class="requirement-item" :class="{ 'met': passwordRequirements.uppercase }">
              <svg class="requirement-icon" viewBox="0 0 24 24">
                <path d="M9,20.42L2.79,14.21L5.21,11.79L9,15.58L18.79,5.79L21.21,8.21L9,20.42Z"/>
              </svg>
              <span>Uma letra maiúscula</span>
            </div>
            <div class="requirement-item" :class="{ 'met': passwordRequirements.number }">
              <svg class="requirement-icon" viewBox="0 0 24 24">
                <path d="M9,20.42L2.79,14.21L5.21,11.79L9,15.58L18.79,5.79L21.21,8.21L9,20.42Z"/>
              </svg>
              <span>Um número</span>
            </div>
            <div class="requirement-item" :class="{ 'met': passwordRequirements.special }">
              <svg class="requirement-icon" viewBox="0 0 24 24">
                <path d="M9,20.42L2.79,14.21L5.21,11.79L9,15.58L18.79,5.79L21.21,8.21L9,20.42Z"/>
              </svg>
              <span>Um caractere especial (!@#$%^&*)</span>
            </div>
          </div>

          <p v-if="fieldErrors.newPassword" class="error-message">{{ fieldErrors.newPassword }}</p>
          <p v-else-if="newPassword && !validatePassword(newPassword).isValid" class="error-message">
            {{ validatePassword(newPassword).message }}
          </p>
        </div>

        <!-- Campo Confirmar Nova Senha -->
        <div class="input-group">
          <label class="input-label">CONFIRMAR NOVA SENHA</label>
          <div class="input-wrapper" :class="{ 
            'valid': confirmPassword === newPassword && confirmPassword.length > 0 && validatePassword(newPassword).isValid, 
            'invalid': fieldErrors.confirmPassword || (confirmPassword && confirmPassword !== newPassword)
          }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
            <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="input-field" placeholder="CONFIRME A NOVA SENHA" required>
            <button @click.prevent="showConfirmPassword = !showConfirmPassword" class="password-toggle">
              <svg class="password-icon" viewBox="0 0 24 24">
                <path v-if="showConfirmPassword" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                <path v-else d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
              </svg>
            </button>
          </div>
          <p v-if="fieldErrors.confirmPassword" class="error-message">{{ fieldErrors.confirmPassword }}</p>
          <p v-else-if="confirmPassword && confirmPassword !== newPassword" class="error-message">
            As senhas não coincidem
          </p>
        </div>

        <!-- Ações do Formulário -->
        <div class="auth-actions">
          <button type="submit" class="auth-button" :disabled="isLoading || !isFormValid" :class="{ 'loading': isLoading }">
            <span v-if="!isLoading">REDEFINIR SENHA</span>
            <span v-else class="button-loading">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              REDEFININDO...
            </span>
          </button>
          <router-link to="/login" class="auth-link">Voltar para o login</router-link>
        </div>
      </form>
    </div>

    <!-- Modal de Resultado -->
    <div v-if="showResultModal" class="modal-overlay confirm-overlay">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h2>{{ resultModalTitle }}</h2>
        </div>
        <div class="modal-body">
          <p>{{ resultModalMessage }}</p>
          <div class="modal-actions">
            <button @click="handleResultModalClose" class="auth-button">
              {{ resultModalSuccess ? 'IR PARA LOGIN' : 'TENTAR NOVAMENTE' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Dados reativos
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const showResultModal = ref(false)
const resultModalTitle = ref('')
const resultModalMessage = ref('')
const resultModalSuccess = ref(false)
const fieldErrors = ref({
  newPassword: '',
  confirmPassword: ''
})

// Roteamento
const route = useRoute()
const router = useRouter()

// Extrair token e email da URL
const token = ref('')
const email = ref('')

onMounted(() => {
  token.value = route.query.token as string
  email.value = route.query.email as string
  
  if (!token.value || !email.value) {
    showResultModal.value = true
    resultModalTitle.value = 'LINK INVÁLIDO'
    resultModalMessage.value = 'O link de redefinição de senha está incompleto ou inválido.'
    resultModalSuccess.value = false
  }
})

// Função completa de validação de senha
const validatePassword = (password: string) => {
  if (!password) {
    return { isValid: false, message: 'Senha é obrigatória' }
  }

  if (password.length < 8) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' }
  }

  if (password.length > 128) {
    return { isValid: false, message: 'A senha não pode ter mais de 128 caracteres' }
  }

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)

  if (!hasLowercase) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula' }
  }

  if (!hasUppercase) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' }
  }

  if (!hasNumbers) {
    return { isValid: false, message: 'A senha deve conter pelo menos um número' }
  }

  if (!hasSpecialChar) {
    return { isValid: false, message: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)' }
  }

  // Verificar sequências comuns
  const commonSequences = [
    '123456', '654321', 'abcdef', 'fedcba', 'qwerty', 'asdfgh', 
    '111111', '000000', 'password', 'senha123'
  ]

  for (const sequence of commonSequences) {
    if (password.toLowerCase().includes(sequence)) {
      return { isValid: false, message: 'A senha não pode conter sequências comuns' }
    }
  }

  // Verificar caracteres repetidos
  const repeatedChars = /(.)\1{3,}/.test(password)
  if (repeatedChars) {
    return { isValid: false, message: 'A senha não pode ter mais de 3 caracteres iguais consecutivos' }
  }

  return { isValid: true, message: 'Senha válida' }
}

// Computed para requisitos da senha
const passwordRequirements = computed(() => ({
  length: newPassword.value.length >= 8,
  lowercase: /[a-z]/.test(newPassword.value),
  uppercase: /[A-Z]/.test(newPassword.value),
  number: /[0-9]/.test(newPassword.value),
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword.value)
}))

// Computed para força da senha (pontuação de 0 a 5)
const passwordStrength = computed(() => {
  if (!newPassword.value) return { score: 0 }

  let score = 0
  const password = newPassword.value

  // Critérios básicos (1 ponto cada)
  if (password.length >= 8) score++
  if (password.length >= 12) score += 0.5 // Bonus por comprimento extra
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score++

  // Critérios avançados (bônus)
  if (password.length >= 16) score += 0.5 // Senha muito longa
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    score += 0.5 // Múltiplos caracteres especiais
  }

  // Verificar diversidade de caracteres
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.7) score += 0.5

  return { score: Math.min(Math.round(score * 2) / 2, 5) } // Arredondar para 0.5 e máximo 5
})

const passwordStrengthClass = computed(() => {
  const score = passwordStrength.value.score
  if (score <= 1.5) return 'very-weak'
  if (score <= 2.5) return 'weak'
  if (score <= 3.5) return 'medium'
  if (score <= 4.5) return 'strong'
  return 'very-strong'
})

const passwordStrengthText = computed(() => {
  const score = passwordStrength.value.score
  if (score <= 1.5) return 'Muito Fraca'
  if (score <= 2.5) return 'Fraca'
  if (score <= 3.5) return 'Média'
  if (score <= 4.5) return 'Forte'
  return 'Muito Forte'
})

const isFormValid = computed(() => {
  return validatePassword(newPassword.value).isValid && 
         newPassword.value === confirmPassword.value &&
         passwordStrength.value.score >= 3 // Exigir pelo menos senha média
})

// Função para redefinir senha
const handleResetPassword = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  fieldErrors.value = { newPassword: '', confirmPassword: '' }
  
  try {
    // Preparar dados para a requisição
    const requestData = {
      email: email.value,
      token: token.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value
    }

    // Fazer requisição para o endpoint de redefinição de senha
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json()

    if (result.success) {
      // Sucesso
      resultModalTitle.value = 'SENHA REDEFINIDA'
      resultModalMessage.value = 'Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.'
      resultModalSuccess.value = true
      showResultModal.value = true
    } else {
      // Tratar erros
      if (result.errors) {
        if (result.errors.InvalidToken) {
          fieldErrors.value.newPassword = 'Link de redefinição inválido ou expirado'
        } else if (result.errors.PasswordMismatch) {
          fieldErrors.value.confirmPassword = 'As senhas não coincidem'
        } else if (result.errors.PasswordTooShort) {
          fieldErrors.value.newPassword = 'A senha deve ter pelo menos 8 caracteres'
        } else if (result.errors.WeakPassword) {
          fieldErrors.value.newPassword = 'A senha não atende aos critérios de segurança'
        } else {
          // Erro genérico
          fieldErrors.value.newPassword = result.message || 'Erro ao redefinir senha'
        }
      }
      
      if (!result.errors) {
        resultModalTitle.value = 'ERRO AO REDEFINIR SENHA'
        resultModalMessage.value = result.message || 'Ocorreu um erro ao tentar redefinir sua senha.'
        resultModalSuccess.value = false
        showResultModal.value = true
      }
    }
  } catch (error) {
    console.error('Erro inesperado:', error)
    resultModalTitle.value = 'ERRO INESPERADO'
    resultModalMessage.value = 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    resultModalSuccess.value = false
    showResultModal.value = true
  } finally {
    isLoading.value = false
  }
}

const handleResultModalClose = () => {
  showResultModal.value = false
  if (resultModalSuccess.value) {
    router.push('/login')
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 20px;
}

.auth-card {
  background: #1a1a1a;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  border: 1px solid #333;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
}

.auth-card::before {
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

.auth-header {
  padding: 2rem 1.5rem 1rem;
  text-align: center;
  border-bottom: 1px solid #333;
  background: rgba(30, 30, 30, 0.7);
}

.auth-header h2 {
  color: #f9cb28;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 2px;
  font-size: 1.8rem;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.auth-subtitle {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0;
}

.auth-form {
  padding: 1.5rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  color: #ddd;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

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
  padding: 0.75rem 3rem 0.75rem 40px;
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

.input-field:focus + .input-icon {
  fill: #f9cb28;
}

.input-wrapper.valid {
  border-left: 3px solid #4CAF50;
}

.input-wrapper.invalid {
  border-left: 3px solid #ff4d4d;
}

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

/* Indicador de força da senha melhorado */
.password-strength-container {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 4px;
  border: 1px solid #333;
}

.strength-bar-container {
  margin-bottom: 0.5rem;
}

.strength-bar {
  height: 6px;
  border-radius: 3px;
  background: #333;
  overflow: hidden;
  position: relative;
}

.strength-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
  animation: strengthPulse 2s ease-in-out infinite;
}

.strength-bar.very-weak::after {
  width: 20%;
  background: #d32f2f;
}

.strength-bar.weak::after {
  width: 40%;
  background: #f57c00;
}

.strength-bar.medium::after {
  width: 60%;
  background: #f9cb28;
}

.strength-bar.strong::after {
  width: 80%;
  background: #689f38;
}

.strength-bar.very-strong::after {
  width: 100%;
  background: #388e3c;
}

.strength-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strength-text {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.strength-text.very-weak { color: #d32f2f; }
.strength-text.weak { color: #f57c00; }
.strength-text.medium { color: #f9cb28; }
.strength-text.strong { color: #689f38; }
.strength-text.very-strong { color: #388e3c; }

.strength-score {
  font-size: 0.8rem;
  color: #aaa;
  font-weight: 600;
}

/* Lista de requisitos da senha */
.password-requirements {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
  transition: color 0.3s ease;
}

.requirement-item.met {
  color: #4CAF50;
}

.requirement-icon {
  width: 14px;
  height: 14px;
  fill: #666;
  transition: fill 0.3s ease;
}

.requirement-item.met .requirement-icon {
  fill: #4CAF50;
}

.error-message {
  color: #ff4d4d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message::before {
  content: "⚠";
  font-size: 0.9rem;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
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
  transform: none;
  box-shadow: none;
}

.auth-button.loading {
  color: transparent;
}

.auth-link {
  color: #f9cb28;
  text-align: center;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: #ff8a00;
  text-decoration: underline;
}

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
  color: #1a1a1a;
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

/* Modal de confirmação */
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
  max-width: 450px;
  border: 1px solid #333;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
}

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

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #333;
  background: rgba(30, 30, 30, 0.7);
}

.modal-header h2 {
  color: #f9cb28;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 2px;
  font-size: 1.5rem;
  margin: 0;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  color: #ddd;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
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

@keyframes strengthPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsividade */
@media (max-width: 480px) {
  .auth-container {
    padding: 10px;
  }
  
  .auth-header {
    padding: 1.5rem 1rem 0.5rem;
  }
  
  .auth-form {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }

  .password-requirements {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }
  
  .requirement-item {
    font-size: 0.75rem;
  }
  
  .password-strength-container {
    padding: 0.5rem;
  }
}

/* Estados especiais para inputs com padding ajustado */
.input-field:focus ~ .password-toggle .password-icon {
  fill: #f9cb28;
}

/* Melhorias visuais adicionais */
.input-wrapper.valid .input-icon {
  fill: #4CAF50;
}

.input-wrapper.invalid .input-icon {
  fill: #ff4d4d;
}

/* Tooltip de ajuda para requisitos */
.password-requirements::before {
  content: "Requisitos da senha:";
  display: block;
  color: #aaa;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  grid-column: 1 / -1;
}

/* Animação para os check marks dos requisitos */
.requirement-item.met .requirement-icon {
  animation: checkmark 0.3s ease-in-out;
}

@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>