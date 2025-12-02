<template>
  <div class="auth-container">
    <div class="auth-card">
      <button @click="goToHome" class="back-button">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
        VOLTAR
      </button>

      <h1 class="auth-title">LOGIN</h1>
      <p class="auth-subtitle">ACESSE SUA CONTA</p>

      <!-- Botão para preencher dados de teste -->
      <div class="test-credentials-container">
        <button @click="fillTestCredentials" class="test-credentials-button">
          <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right: 8px;">
            <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" fill="currentColor"/>
          </svg>
          USAR DADOS DE TESTE
        </button>
        <div class="test-credentials-info">
          <p><strong>Login:</strong> teste@gmail.com</p>
          <p><strong>Senha:</strong> SENHA_forte58</p>
          <p class="test-warning">⚠️ Use estes dados apenas para testar o sistema</p>
        </div>
      </div>

      <!-- Mensagem de erro geral -->
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label for="email" class="input-label">E-MAIL</label>
          <div class="input-wrapper" :class="{ 'input-error': emailError }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z" />
            </svg>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input-field"
              placeholder="SEU@EMAIL.COM"
              @input="clearEmailError"
            >
          </div>
          <span v-if="emailError" class="error-text">{{ emailError }}</span>
        </div>

        <div class="input-group">
          <label for="password" class="input-label">SENHA</label>
          <div class="input-wrapper" :class="{ 'input-error': passwordError }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input-field"
              placeholder="SUA SENHA"
              @input="clearPasswordError"
            >
          </div>
          <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
        </div>

        <div class="auth-actions">
          <button type="submit" class="auth-button" :disabled="authStore.isLoading">
            <span v-if="!authStore.isLoading">ENTRAR</span>
            <span v-else class="button-loading">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              PROCESSANDO...
            </span>
          </button>

          <button type="button" @click="toggleForgotPassword" class="forgot-password">
            ESQUECI MINHA SENHA
          </button>
        </div>

        <div class="auth-footer">
          <p>NÃO TEM UMA CONTA? <button type="button" @click="goToRegister" class="auth-link">REGISTRE-SE</button></p>
        </div>
      </form>

      <div v-if="showForgotPassword" class="forgot-password-modal">
        <div class="modal-content">
          <h3>RECUPERAR SENHA</h3>
          <p>DIGITE SEU E-MAIL PARA RECEBER O LINK DE RECUPERAÇÃO</p>
          
          <!-- Mensagem de sucesso/erro da recuperação -->
          <div v-if="recoveryMessage" :class="['recovery-message', recoveryMessageType]">
            {{ recoveryMessage }}
          </div>
          
          <div class="input-group">
            <div class="input-wrapper" :class="{ 'input-error': recoveryEmailError }">
              <svg class="input-icon" viewBox="0 0 24 24">
                <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z" />
              </svg>
              <input
                v-model="recoveryEmail"
                type="email"
                required
                class="input-field"
                placeholder="SEU@EMAIL.COM"
                @input="recoveryEmailError = ''; recoveryMessage = ''"
                :disabled="isLoadingRecovery"
              >
            </div>
            <span v-if="recoveryEmailError" class="error-text">{{ recoveryEmailError }}</span>
          </div>

          <div class="modal-actions">
            <button @click="sendRecoveryEmail" class="auth-button" :disabled="isLoadingRecovery">
              <span v-if="!isLoadingRecovery">ENVIAR LINK</span>
              <span v-else class="button-loading">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                ENVIANDO...
              </span>
            </button>
            <button @click="toggleForgotPassword" class="auth-button secondary" :disabled="isLoadingRecovery">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter()
const authStore = useAuthStore()

// Dados de teste
const TEST_EMAIL = 'teste@gmail.com';
const TEST_PASSWORD = 'SENHA_forte58';

// Refs para os campos do formulário
const email = ref('')
const password = ref('')
const recoveryEmail = ref('')

// Refs para erros e estados
const emailError = ref('')
const passwordError = ref('')
const recoveryEmailError = ref('')
const showForgotPassword = ref(false)
const isLoadingRecovery = ref(false)
const recoveryMessage = ref('')
const recoveryMessageType = ref('') // 'success' ou 'error'

onMounted(() => {
  authStore.markPageReady()
  // Limpa erros ao montar o componente
  authStore.clearErrors()
})

const goToHome = () => {
  router.push('/')
}

const clearEmailError = () => {
  emailError.value = ''
}

const clearPasswordError = () => {
  passwordError.value = ''
}

// Função para preencher os campos com dados de teste
const fillTestCredentials = () => {
  email.value = TEST_EMAIL
  password.value = TEST_PASSWORD
  
  // Limpa erros
  clearEmailError()
  clearPasswordError()
  authStore.clearErrors()
  
  // Feedback visual (opcional)
  const emailField = document.getElementById('email')
  const passwordField = document.getElementById('password')
  
  if (emailField) {
    emailField.classList.add('field-highlight')
    setTimeout(() => emailField.classList.remove('field-highlight'), 1000)
  }
  
  if (passwordField) {
    passwordField.classList.add('field-highlight')
    setTimeout(() => passwordField.classList.remove('field-highlight'), 1000)
  }
  
  // Foca no campo de email para facilitar o login
  setTimeout(() => {
    if (emailField) emailField.focus()
  }, 100)
}

const validateForm = () => {
  let isValid = true

  // Validação do email
  if (!email.value) {
    emailError.value = 'E-mail é obrigatório'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    emailError.value = 'Por favor, insira um e-mail válido'
    isValid = false
  }

  // Validação da senha
  if (!password.value) {
    passwordError.value = 'Senha é obrigatória'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  // Limpa erros anteriores
  emailError.value = ''
  passwordError.value = ''
  authStore.clearErrors()

  // Validação do formulário
  if (!validateForm()) {
    return
  }

  await authStore.login(email.value, password.value)

  // Trata erros específicos retornados pelo authStore
  if (authStore.fieldErrors) {
    if (authStore.fieldErrors.email) {
      emailError.value = authStore.fieldErrors.email[0]
    }
    if (authStore.fieldErrors.password) {
      passwordError.value = authStore.fieldErrors.password[0]
    }
  }
}

const toggleForgotPassword = () => {
  showForgotPassword.value = !showForgotPassword.value
  recoveryEmailError.value = ''
  recoveryMessage.value = ''
  recoveryEmail.value = email.value
}

const validateRecoveryEmail = () => {
  if (!recoveryEmail.value) {
    recoveryEmailError.value = 'E-mail é obrigatório'
    return false
  }
  if (!/^\S+@\S+\.\S+$/.test(recoveryEmail.value)) {
    recoveryEmailError.value = 'Por favor, insira um e-mail válido'
    return false
  }
  return true
}

const sendRecoveryEmail = async () => {
  // Limpa mensagens anteriores
  recoveryMessage.value = ''
  
  if (!validateRecoveryEmail()) {
    return
  }

  isLoadingRecovery.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: recoveryEmail.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Sucesso
      recoveryMessage.value = 'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.'
      recoveryMessageType.value = 'success'
      
      // Fecha o modal após 3 segundos
      setTimeout(() => {
        showForgotPassword.value = false
        recoveryMessage.value = ''
      }, 3000)
    } else {
      // Erro do servidor
      recoveryMessage.value = data.message || 'Erro ao enviar e-mail de recuperação'
      recoveryMessageType.value = 'error'
    }
  } catch (error) {
    console.error('Recovery failed:', error)
    recoveryMessage.value = 'Erro de conexão. Tente novamente.'
    recoveryMessageType.value = 'error'
  } finally {
    isLoadingRecovery.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap');

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #000;
  padding: 20px;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  border-radius: 4px;
  background: #111;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Montserrat', sans-serif;
  border: 1px solid #333;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
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

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Container para dados de teste */
.test-credentials-container {
  background: rgba(249, 203, 40, 0.1);
  border: 1px solid rgba(249, 203, 40, 0.3);
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.test-credentials-button {
  background: linear-gradient(to right, #f9cb28, #ffb347);
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 100%;
  max-width: 250px;
}

.test-credentials-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.4);
}

.test-credentials-info {
  color: #aaa;
  font-size: 0.85rem;
  text-align: center;
}

.test-credentials-info p {
  margin: 5px 0;
}

.test-credentials-info strong {
  color: #f9cb28;
}

.test-warning {
  color: #ffa726;
  font-size: 0.8rem;
  margin-top: 8px;
  font-style: italic;
}

/* Estilo do botão de voltar */
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  color: #f9cb28;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
  z-index: 10;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
}

.back-button:hover {
  background: rgba(249, 203, 40, 0.1);
  transform: translateX(-3px);
}

.back-button svg {
  width: 18px;
  height: 18px;
}

.auth-title {
  color: #fff;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.auth-subtitle {
  color: #aaa;
  text-align: center;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  font-weight: 400;
  letter-spacing: 1px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.input-group {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-label {
  display: block;
  color: #f9cb28;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-field {
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

/* Estilo para highlight quando preenche os dados de teste */
.input-field.field-highlight {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
  transition: all 0.5s ease;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  fill: #f9cb28;
  z-index: 2;
}

.auth-button {
  width: 100%;
  padding: 1rem;
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
  letter-spacing: 1px;
  text-transform: uppercase;
  box-sizing: border-box;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.4);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-button.secondary {
  background: transparent;
  color: #f9cb28;
  border: 1px solid #f9cb28;
  margin-top: 10px;
}

.forgot-password {
  background: none;
  border: none;
  color: #aaa;
  font-size: 0.85rem;
  cursor: pointer;
  text-align: center;
  margin-top: 10px;
  transition: color 0.2s ease;
  padding: 5px;
  width: 100%;
}

.forgot-password:hover {
  color: #f9cb28;
}

.auth-footer {
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.auth-link {
  background: none;
  border: none;
  color: #f9cb28;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: inherit;
}

.auth-link:hover {
  color: #ff4d4d;
}

.forgot-password-modal {
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
  box-sizing: border-box;
}

.modal-content {
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 4px;
  width: 100%;
  max-width: 400px;
  border: 1px solid #333;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.7);
}

.modal-content h3 {
  color: #f9cb28;
  text-align: center;
  margin-bottom: 0.5rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 2px;
  font-size: 1.8rem;
}

.modal-content p {
  color: #aaa;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 1.5rem;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
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

.error-text {
  color: #ff4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.input-error {
  border-color: #ff4444 !important;
}

.input-error .input-field {
  color: #ff4444;
}

.input-error .input-icon {
  color: #ff4444;
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

@media (max-width: 768px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
  
  .auth-title {
    font-size: 2.2rem;
  }
  
  .auth-subtitle {
    font-size: 0.9rem;
  }
  
  .test-credentials-container {
    padding: 12px;
  }
  
  .test-credentials-button {
    padding: 10px 15px;
    font-size: 0.85rem;
    max-width: 100%;
  }
  
  .test-credentials-info {
    font-size: 0.8rem;
  }
  
  .input-field {
    padding: 10px 14px 10px 36px;
    font-size: 0.9rem;
  }
  
  .input-icon {
    width: 18px;
    height: 18px;
    left: 10px;
  }

  .back-button {
    top: 15px;
    left: 15px;
    font-size: 0.8rem;
  }
}
</style>