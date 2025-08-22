<template>
  <div class="auth-container">
    <div class="auth-card">
      <button @click="goToLogin" class="back-button">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
        </svg>
        VOLTAR
      </button>

      <h1 class="auth-title">REGISTRO</h1>
      <p class="auth-subtitle">JUNTE-SE À COMUNIDADE</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label for="name" class="input-label">NOME</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path
                d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
            <input id="name" v-model="name" type="text" required class="input-field" placeholder="SEU NOME"
              @input="validateName">
          </div>
          <p v-if="nameError" class="error-message">{{ nameError }}</p>
        </div>

        <div class="input-group">
          <label for="email" class="input-label">E-MAIL</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path
                d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z" />
            </svg>
            <input id="email" v-model="email" type="email" required class="input-field" placeholder="SEU@EMAIL.COM"
              @input="validateEmail">
          </div>
          <p v-if="emailError" class="error-message">{{ emailError }}</p>
        </div>

        <div class="input-group">
          <label for="password" class="input-label">SENHA</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path
                d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required
              class="input-field" placeholder="CRIE UMA SENHA FORTE" @input="validatePassword"
              @focus="showPasswordRules = true" @blur="showPasswordRules = false">
            <button @click="togglePasswordVisibility" class="password-toggle" type="button">
              <svg class="password-icon" viewBox="0 0 24 24">
                <path v-if="showPassword"
                  d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                <path v-else
                  d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
              </svg>
            </button>
          </div>

          <div v-if="showPasswordRules" class="password-rules">
            <p :class="{ 'rule-valid': hasMinLength }">• Mínimo 8 caracteres</p>
            <p :class="{ 'rule-valid': hasUpperCase }">• Pelo menos 1 letra maiúscula</p>
            <p :class="{ 'rule-valid': hasLowerCase }">• Pelo menos 1 letra minúscula</p>
            <p :class="{ 'rule-valid': hasNumber }">• Pelo menos 1 número</p>
            <p :class="{ 'rule-valid': hasSpecialChar }">• Pelo menos 1 caractere especial</p>
          </div>

          <div class="password-strength">
            <div class="strength-bar" :class="passwordStrengthClass"></div>
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        </div>

        <div class="input-group">
          <label for="confirmPassword" class="input-label">CONFIRMAR SENHA</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path
                d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
            <input id="confirmPassword" v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
              required class="input-field" placeholder="CONFIRME SUA SENHA" @input="validateConfirmPassword">
            <button @click="toggleConfirmPasswordVisibility" class="password-toggle" type="button">
              <svg class="password-icon" viewBox="0 0 24 24">
                <path v-if="showConfirmPassword"
                  d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                <path v-else
                  d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
              </svg>
            </button>
          </div>
          <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>
        </div>

        <div class="auth-actions">
          <button type="submit" class="auth-button" :disabled="isLoading || !isFormValid"
            :class="{ 'disabled': isLoading || !isFormValid }">
            <span v-if="!isLoading">CRIAR CONTA</span>
            <span v-else class="button-loading">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              PROCESSANDO...
            </span>
          </button>
        </div>

        <div class="auth-footer">
          <p>JÁ TEM UMA CONTA? <button type="button" @click="goToLogin" class="auth-link">FAZER LOGIN</button></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../../infrastructure/services/AuthService'
import { RegisterCommand } from '../../application/commands/RegisterCommand'
import { useAuthStore } from '../../stores/authStore'


const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.markPageReady()
})

// Dados do formulário
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

// Estados de visibilidade de senha
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showPasswordRules = ref(false)

// Mensagens de erro
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Validações de senha
const hasMinLength = computed(() => password.value.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(password.value))
const hasLowerCase = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /[0-9]/.test(password.value))
const hasSpecialChar = computed(() => /[^A-Za-z0-9]/.test(password.value))

// Força da senha
const passwordStrength = computed(() => {
  let strength = 0
  if (hasMinLength.value) strength++
  if (hasUpperCase.value) strength++
  if (hasLowerCase.value) strength++
  if (hasNumber.value) strength++
  if (hasSpecialChar.value) strength++
  return strength
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 2) return 'weak'
  if (passwordStrength.value <= 3) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (password.value.length === 0) return ''
  if (passwordStrength.value <= 2) return 'Fraca'
  if (passwordStrength.value <= 3) return 'Média'
  return 'Forte'
})

// Validação do formulário
const isFormValid = computed(() => {
  return (
    name.value.length > 0 &&
    !nameError.value &&
    email.value.length > 0 &&
    !emailError.value &&
    password.value.length > 0 &&
    !passwordError.value &&
    confirmPassword.value.length > 0 &&
    !confirmPasswordError.value &&
    passwordStrength.value >= 4
  )
})

// Funções de validação
const validateName = () => {
  if (name.value.length < 3) {
    nameError.value = 'O nome deve ter pelo menos 3 caracteres'
  } else {
    nameError.value = ''
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Por favor, insira um e-mail válido'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (password.value.length < 8) {
    passwordError.value = 'A senha deve ter pelo menos 8 caracteres'
    return
  }

  if (!hasUpperCase.value || !hasLowerCase.value || !hasNumber.value || !hasSpecialChar.value) {
    passwordError.value = 'A senha não atende a todos os requisitos'
    return
  }

  passwordError.value = ''
}

const validateConfirmPassword = () => {
  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'As senhas não coincidem'
  } else {
    confirmPasswordError.value = ''
  }
}

// Funções auxiliares
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const goToLogin = () => {
  router.push('/access')
}

const handleRegister = async () => {
  resetErrors();

  validateName();
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (!isFormValid.value) {
    return;
  }

  isLoading.value = true;

  try {
    const command = new RegisterCommand(
      name.value,
      email.value,
      password.value,
      confirmPassword.value
    );

    const result = await AuthService.register(command);

    if (result.success) {
      router.push('/access');
      showSuccessNotification(result.message || 'Registro realizado com sucesso!');
    } else {
      if (result.errors) {
        if (result.errors['Email']) {
          emailError.value = result.errors['Email'].join(', ');
        }
        if (result.errors['Password']) {
          passwordError.value = result.errors['Password'].join(', ');
        }
        if (result.errors['DuplicateUserName']) {
          emailError.value = 'Este e-mail já está em uso';
        }
      } else {
        showErrorNotification(result.message || 'Erro ao realizar registro');
      }
    }
  } catch (error) {
    console.error('Registration failed:', error);
    showErrorNotification('Ocorreu um erro inesperado durante o registro');
  } finally {
    isLoading.value = false;
  }
};

function resetErrors() {
  emailError.value = '';
  passwordError.value = '';
  confirmPasswordError.value = '';
  nameError.value = '';
}

function showSuccessNotification(message: string) {
  alert(message); 
}

function showErrorNotification(message: string) {
  alert(message);
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
  margin-bottom: 2rem;
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

.password-rules {
  margin-top: 8px;
  padding: 8px;
  background: rgba(30, 30, 30, 0.7);
  border-radius: 4px;
  font-size: 0.8rem;
  color: #aaa;
}

.password-rules p {
  margin: 4px 0;
}

.rule-valid {
  color: #4CAF50;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  flex-grow: 1;
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
  width: 0;
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-bar.weak::after {
  width: 33%;
  background: #ff4d4d;
}

.strength-bar.medium::after {
  width: 66%;
  background: #f9cb28;
}

.strength-bar.strong::after {
  width: 100%;
  background: #4CAF50;
}

.strength-text {
  font-size: 0.8rem;
  font-weight: 600;
}

.strength-bar.weak+.strength-text {
  color: #ff4d4d;
}

.strength-bar.medium+.strength-text {
  color: #f9cb28;
}

.strength-bar.strong+.strength-text {
  color: #4CAF50;
}

.error-message {
  color: #ff4d4d;
  font-size: 0.8rem;
  margin-top: 4px;
  padding-left: 4px;
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

.auth-button:disabled,
.auth-button.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #555;
  color: #999;
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

  .password-rules {
    font-size: 0.75rem;
  }
}
</style>