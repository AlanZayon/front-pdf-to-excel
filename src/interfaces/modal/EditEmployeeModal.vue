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
        <button @click="activeTab = 'descriptions'" :class="{ 'active': activeTab === 'descriptions' }"
          class="tab-button">
          Buscar Descrições
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
                <path
                  d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
              </svg>
              <input v-model="currentPassword" :type="showCurrentPassword ? 'text' : 'password'" required
                class="input-field" placeholder="DIGITE SUA SENHA ATUAL">
              <button @click="showCurrentPassword = !showCurrentPassword" class="password-toggle">
                <svg class="password-icon" viewBox="0 0 24 24">
                  <path v-if="showCurrentPassword"
                    d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                  <path v-else
                    d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                </svg>
              </button>
            </div>
            <p v-if="passwordFieldErrors.currentPassword" class="error-message">{{ passwordFieldErrors.currentPassword
              }}</p>
          </div>

          <!-- Campo Nova Senha -->
          <div class="input-group">
            <label class="input-label">NOVA SENHA</label>
            <div class="input-wrapper" :class="{
              'valid': validatePassword(editedUser.password) && editedUser.password.length > 0,
              'invalid': passwordFieldErrors.newPassword || (editedUser.password && !validatePassword(editedUser.password))
            }">
              <svg class="input-icon" viewBox="0 0 24 24">
                <path
                  d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
              </svg>
              <input v-model="editedUser.password" :type="showPassword ? 'text' : 'password'" class="input-field"
                placeholder="DIGITE A NOVA SENHA">
              <button @click="showPassword = !showPassword" class="password-toggle">
                <svg class="password-icon" viewBox="0 0 24 24">
                  <path v-if="showPassword"
                    d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                  <path v-else
                    d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
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
                <path
                  d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
              </svg>
              <input v-model="editedUser.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                class="input-field" placeholder="CONFIRME A NOVA SENHA">
              <button @click="showConfirmPassword = !showConfirmPassword" class="password-toggle">
                <svg class="password-icon" viewBox="0 0 24 24">
                  <path v-if="showConfirmPassword"
                    d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                  <path v-else
                    d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                </svg>
              </button>
            </div>
            <p v-if="passwordFieldErrors.confirmPassword" class="error-message">{{ passwordFieldErrors.confirmPassword
              }}</p>
            <p v-else-if="editedUser.confirmPassword && editedUser.confirmPassword !== editedUser.password"
              class="error-message">
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

      <!-- Corpo do Modal - Buscar Descrições -->
      <div v-if="activeTab === 'descriptions'" class="modal-body">
        <div class="description-search-section">
          <div class="section-header">
            <h3 class="section-title">BUSCAR DESCRIÇÕES</h3>
            <p class="section-subtitle">CONSULTE AS DESCRIÇÕES POR CNPJ E CÓDIGO DO BANCO</p>
          </div>

          <div class="search-inputs">
            <div class="input-group">
              <label class="input-label">CNPJ</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24">
                  <path
                    d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
                </svg>
                <input v-model="searchCnpj" type="text" class="input-field" placeholder="00.000.000/0000-00"
                  @input="formatCnpj" maxlength="18">
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">CÓDIGO DO BANCO</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24">
                  <path
                    d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,7V9H9V7H7M11,7V9H13V7H11M15,7V9H17V7H15M7,11V13H9V11H7M11,11V13H13V11H11M15,11V13H17V11H15M7,15V17H9V15H7M11,15V17H13V15H11M15,15V17H17V15H15Z" />
                </svg>
                <input v-model="searchCodigoBanco" type="number" class="input-field" placeholder="Ex: 001"
                  @keypress="onlyNumbers">
              </div>
            </div>

            <button @click="searchDescriptions" class="auth-button search-button"
              :disabled="!searchCnpj || isSearching">
              <span v-if="!isSearching">
                <svg class="search-icon" viewBox="0 0 24 24">
                  <path
                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
                BUSCAR DESCRIÇÕES
              </span>
              <span v-else class="button-loading">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                BUSCANDO...
              </span>
            </button>
          </div>

          <!-- Barra de pesquisa nas descrições -->
          <div v-if="searchResults.length > 0" class="description-search-bar">
            <div class="search-bar-wrapper">
              <svg class="search-bar-icon" viewBox="0 0 24 24">
                <path
                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
              <input 
                v-model="descriptionSearchTerm" 
                type="text" 
                class="search-bar-input" 
                placeholder="Pesquisar nas descrições..."
                @input="filterDescriptions"
              >
              <div class="search-results-count" v-if="descriptionSearchTerm">
                {{ filteredResults.length }} de {{ searchResults.length }} resultados
              </div>
            </div>
            
            <!-- Novo: Filtro por códigos de débito e crédito -->
            <div class="code-filters">
              <div class="code-filter-group">
                <label class="code-filter-label">Filtrar por Código Débito:</label>
                <input 
                  v-model="debitoFilter" 
                  type="text" 
                  class="code-filter-input" 
                  placeholder="Ex: 12345"
                  maxlength="5"
                  @input="filterDescriptions"
                  @keypress="onlyNumbers"
                >
              </div>
              <div class="code-filter-group">
                <label class="code-filter-label">Filtrar por Código Crédito:</label>
                <input 
                  v-model="creditoFilter" 
                  type="text" 
                  class="code-filter-input" 
                  placeholder="Ex: 67890"
                  maxlength="5"
                  @input="filterDescriptions"
                  @keypress="onlyNumbers"
                >
              </div>
            </div>
          </div>

          <!-- Resultados da Busca -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div class="results-header">
              <h4 class="results-title">DESCRIÇÕES ENCONTRADAS</h4>
              <div class="results-count">
                {{ filteredResults.length }} {{ filteredResults.length === 1 ? "descrição encontrada" : "descrições encontradas" }}
              </div>
            </div>

            <!-- Cabeçalho da tabela -->
            <div class="results-table-header">
              <div class="result-description-header">DESCRIÇÃO</div>
              <div class="result-codes-header">
                <span class="code-label">DÉBITO</span>
                <span class="code-label">CRÉDITO</span>
              </div>
              <div class="result-type-header">TIPO</div>
            </div>

            <!-- Lista de resultados -->
            <div class="results-list">
              <div v-for="(result, index) in filteredResults" :key="result.id" class="result-item"
                :class="{ 'even': index % 2 === 0 }">
                <div class="result-description">
                  <div class="description-text">{{ result.termo }}</div>
                </div>

                <div class="result-codes">
                  <!-- Código Débito -->
                  <div class="code-input-group">
                    <input v-model="result.codigoDebito" type="text" class="code-input"
                      :class="{ 'disabled': result.tipoValor }" :disabled="result.tipoValor" placeholder="Débito"
                      maxlength="5" @keypress="onlyNumbers" @input="handleCodeInput($event, result, 'debito')">
                    <div class="code-status"
                      v-if="result.codigoDebito && result.codigoDebito !== getOriginalResult(result.id)?.codigoDebito">
                      <svg class="modified-icon" viewBox="0 0 24 24">
                        <path
                          d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                      </svg>
                    </div>
                  </div>

                  <!-- Código Crédito -->
                  <div class="code-input-group">
                    <input v-model="result.codigoCredito" type="text" class="code-input"
                      :class="{ 'disabled': !result.tipoValor }" :disabled="!result.tipoValor" placeholder="Crédito"
                      maxlength="5" @keypress="onlyNumbers" @input="handleCodeInput($event, result, 'credito')">
                    <div class="code-status"
                      v-if="result.codigoCredito && result.codigoCredito !== getOriginalResult(result.id)?.codigoCredito">
                      <svg class="modified-icon" viewBox="0 0 24 24">
                        <path
                          d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Indicador visual do tipo -->
                <div class="result-type-indicator"
                  :title="result.tipoValor ? 'Tipo: Crédito (editar apenas crédito)' : 'Tipo: Débito (editar apenas débito)'">
                  <span class="type-badge" :class="result.tipoValor ? 'credit' : 'debit'">
                    {{ result.tipoValor ? 'C' : 'D' }}
                  </span>
                  <span class="type-text">{{ result.tipoValor ? 'Crédito' : 'Débito' }}</span>
                </div>
              </div>
            </div>

            <!-- Ações para salvar as alterações -->
            <div class="results-actions" v-if="searchResults.length > 0">
              <div class="changes-indicator" v-if="hasChanges">
                <svg class="changes-icon" viewBox="0 0 24 24">
                  <path
                    d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                </svg>
                <span>Há alterações não salvas</span>
              </div>
              <button @click="saveDescriptionChanges" class="auth-button save-changes-button"
                :disabled="isSavingChanges || !hasChanges" :class="{ 'has-changes': hasChanges }">
                <span v-if="!isSavingChanges">
                  <svg class="save-icon" viewBox="0 0 24 24">
                    <path
                      d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                  </svg>
                  SALVAR ALTERAÇÕES
                </span>
                <span v-else class="button-loading">
                  <svg class="spinner" viewBox="0 0 50 50">
                    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                  </svg>
                  SALVANDO...
                </span>
              </button>
            </div>
          </div>

          <div v-if="searchError" class="error-message search-error">
            <svg class="error-icon" viewBox="0 0 24 24">
              <path
                d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            {{ searchError }}
          </div>

          <div v-if="isSearching && searchResults.length === 0" class="loading-overlay">
            <div class="spinner"></div>
            <p>Buscando descrições...</p>
          </div>

          <div v-if="!isSearching && searchResults.length === 0 && searchCnpj" class="no-results">
            <svg class="no-results-icon" viewBox="0 0 24 24">
              <path
                d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12C4,14.09 4.8,16 6.11,17.41L17.41,6.11C16,4.8 14.09,4 12,4M12,20A8,8 0 0,0 20,12C20,9.91 19.2,8 17.89,6.59L6.59,17.89C8,19.2 9.91,20 12,20Z" />
            </svg>
            <p>Nenhuma descrição encontrada para o CNPJ informado.</p>
            <p class="no-results-hint">Verifique se o CNPJ está correto e tente novamente.</p>
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
import { ChangeUserNameCommand } from '../../application/commands/ChangeUserNameCommand'
import type { ChangePasswordResult } from '../../domain/models/ChangePasswordResult'
import type { ChangeUserNameResult } from '../../domain/models/ChangeUserNameResult'
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
const activeTab = ref<'user' | 'account' | 'descriptions'>('user')
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
const nameFieldErrors = ref({
  newFullName: ''
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

// Dados para busca de descrições
const searchCnpj = ref('')
const searchCodigoBanco = ref('')
const searchResults = ref<any[]>([])
const originalResults = ref<any[]>([])
const isSearching = ref(false)
const isSavingChanges = ref(false)
const searchError = ref('')

// Nova funcionalidade: busca nas descrições
const descriptionSearchTerm = ref('')
const filteredResults = ref<any[]>([])

// Novos filtros para códigos de débito e crédito
const debitoFilter = ref('')
const creditoFilter = ref('')

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

const hasChanges = computed(() => {
  return searchResults.value.some((result, index) => {
    const original = originalResults.value[index]
    return (
      result.codigoDebito !== original.codigoDebito ||
      result.codigoCredito !== original.codigoCredito
    )
  })
})

// Funções para busca de descrições
const formatCnpj = () => {
  let cnpj = searchCnpj.value.replace(/\D/g, '')

  if (cnpj.length > 14) {
    cnpj = cnpj.substring(0, 14)
  }

  if (cnpj.length > 12) {
    searchCnpj.value = cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    )
  } else if (cnpj.length > 8) {
    searchCnpj.value = cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})/,
      '$1.$2.$3/$4'
    )
  } else if (cnpj.length > 5) {
    searchCnpj.value = cnpj.replace(
      /(\d{2})(\d{3})(\d{3})/,
      '$1.$2.$3'
    )
  } else if (cnpj.length > 2) {
    searchCnpj.value = cnpj.replace(
      /(\d{2})(\d{3})/,
      '$1.$2'
    )
  } else {
    searchCnpj.value = cnpj
  }
}

const onlyNumbers = (event: KeyboardEvent) => {
  const charCode = event.charCode
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}

const searchDescriptions = async () => {
  if (!searchCnpj.value) {
    searchError.value = 'CNPJ é obrigatório'
    return
  }

  isSearching.value = true
  searchError.value = ''
  searchResults.value = []
  originalResults.value = []
  descriptionSearchTerm.value = ''
  debitoFilter.value = ''
  creditoFilter.value = ''

  try {
    // Remove formatação do CNPJ
    const cnpjClean = searchCnpj.value.replace(/\D/g, '')
    const codigoBanco = searchCodigoBanco.value ? parseInt(searchCodigoBanco.value) : undefined

    // Chama o serviço para buscar as descrições
    const result = await ImpostoService.buscarDescricoes(cnpjClean, codigoBanco)

    if (result.success && result.data) {
      // Formata os resultados para garantir que temos números
      const formattedResults = result.data.map((item: any) => ({
        ...item,
        codigoDebito: item.codigoDebito?.toString() || '',
        codigoCredito: item.codigoCredito?.toString() || ''
      }))

      searchResults.value = formattedResults
      filteredResults.value = formattedResults
      originalResults.value = JSON.parse(JSON.stringify(formattedResults))
    } else {
      searchError.value = result.message || 'Nenhuma descrição encontrada'
    }
  } catch (error) {
    console.error('Erro ao buscar descrições:', error)
    searchError.value = 'Erro ao buscar descrições. Tente novamente.'
  } finally {
    isSearching.value = false
  }
}

// Função para filtrar descrições - AGORA INCLUINDO FILTRO POR CÓDIGOS
const filterDescriptions = () => {
  if (!descriptionSearchTerm.value.trim() && !debitoFilter.value && !creditoFilter.value) {
    filteredResults.value = [...searchResults.value]
    return
  }

  const searchTerm = descriptionSearchTerm.value.toLowerCase().trim()
  const debitoTerm = debitoFilter.value.trim()
  const creditoTerm = creditoFilter.value.trim()

  filteredResults.value = searchResults.value.filter(result => {
    // Filtro por texto na descrição
    const matchesDescription = !searchTerm || result.termo.toLowerCase().includes(searchTerm)
    
    // Filtro por código débito
    const matchesDebito = !debitoTerm || result.codigoDebito.includes(debitoTerm)
    
    // Filtro por código crédito
    const matchesCredito = !creditoTerm || result.codigoCredito.includes(creditoTerm)

    return matchesDescription && matchesDebito && matchesCredito
  })
}

// Função para obter resultado original por ID
const getOriginalResult = (id: string) => {
  return originalResults.value.find(item => item.id === id)
}

const handleCodeInput = (event: Event, result: any, type: 'debito' | 'credito') => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(0, 5)

  if (type === 'debito') {
    result.codigoDebito = value
  } else {
    result.codigoCredito = value
  }

  target.value = value
}

const saveDescriptionChanges = async () => {
  if (!hasChanges.value) {
    showResultModal.value = true
    resultModalTitle.value = 'NENHUMA ALTERAÇÃO'
    resultModalMessage.value = 'Não há alterações para salvar.'
    return
  }

  isSavingChanges.value = true

  try {
    // Filtra apenas os registros que foram alterados
    const atualizacoes = searchResults.value
      .map((result) => {
        const original = getOriginalResult(result.id)

        // Verifica se houve alteração
        const debitoAlterado = result.codigoDebito !== original?.codigoDebito
        const creditoAlterado = result.codigoCredito !== original?.codigoCredito

        if (debitoAlterado || creditoAlterado) {
          const termoEspecialId = parseInt(result.id) || result.id

          return {
            TermoEspecialId: termoEspecialId, // ID do registro
            NovoCodigoDebito: result.codigoDebito ? parseInt(result.codigoDebito) : null,
            NovoCodigoCredito: result.codigoCredito ? parseInt(result.codigoCredito) : null
          }
        }
        return null
      })
      .filter(update => update !== null)

    if (atualizacoes.length === 0) {
      showResultModal.value = true
      resultModalTitle.value = 'NENHUMA ALTERAÇÃO'
      resultModalMessage.value = 'Não há alterações para salvar.'
      return
    }

    // Prepara o payload para a API
    const payload = {
      CNPJ: searchCnpj.value.replace(/\D/g, ''), // Remove formatação
      CodigoBanco: searchCodigoBanco.value ? parseInt(searchCodigoBanco.value) : null,
      Atualizacoes: atualizacoes
    }

    // Chama o serviço para atualizar os registros
    const result = await ImpostoService.atualizarDescricoes(payload)

    if (result.success) {
      // Atualiza os originais com os novos valores
      originalResults.value = JSON.parse(JSON.stringify(searchResults.value))

      showResultModal.value = true
      resultModalTitle.value = 'ALTERAÇÕES SALVAS'
      resultModalMessage.value = `As alterações em ${atualizacoes.length} registro(s) foram salvas com sucesso!`
    } else {
      throw new Error(result.message || 'Erro ao salvar alterações')
    }

  } catch (error) {
    console.error('Erro ao salvar alterações:', error)
    showResultModal.value = true
    resultModalTitle.value = 'ERRO AO SALVAR'
    resultModalMessage.value = 'Ocorreu um erro ao salvar as alterações. Tente novamente.'
  } finally {
    isSavingChanges.value = false
  }
}

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

// Função para alterar nome do usuário
const changeUserName = async () => {
  isSaving.value = true
  nameFieldErrors.value = { newFullName: '' }

  try {
    const command = new ChangeUserNameCommand(editedUser.value.name)
    const result: ChangeUserNameResult = await AuthService.changeUserName(command)

    if (result.success) {
      // Nome alterado com sucesso
      resultModalTitle.value = 'NOME ALTERADO'
      resultModalMessage.value = 'Seu nome foi alterado com sucesso!'
      showResultModal.value = true

      // Atualiza o store de autenticação
      authStore.updateUserInfo({ fullName: editedUser.value.name })

      // Emite evento para o componente pai
      emit('save-user', { type: 'name', name: editedUser.value.name })
    } else {
      // Trata erros de campo
      if (result.fieldErrors) {
        nameFieldErrors.value = {
          newFullName: result.fieldErrors.newFullName || ''
        }
      }

      resultModalTitle.value = 'ERRO AO ALTERAR NOME'
      resultModalMessage.value = result.message || 'Ocorreu um erro ao tentar alterar seu nome.'
      showResultModal.value = true
    }
  } catch (error) {
    console.error('Erro inesperado ao alterar nome:', error)
    resultModalTitle.value = 'ERRO INESPERADO'
    resultModalMessage.value = 'Ocorreu um erro inesperado ao tentar alterar seu nome.'
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
    nameFieldErrors.value = { newFullName: '' }
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

watch(() => editedUser.value.name, () => {
  nameFieldErrors.value.newFullName = ''
})

watch(() => activeTab.value, (newVal) => {
  if (newVal === 'account') {
    loadTaxCodes()
  }
  // Limpa a busca quando muda para outras tabs
  if (newVal !== 'descriptions') {
    searchCnpj.value = ''
    searchCodigoBanco.value = ''
    searchResults.value = []
    filteredResults.value = []
    searchError.value = ''
    descriptionSearchTerm.value = ''
    debitoFilter.value = ''
    creditoFilter.value = ''
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
    } else if (changeType.value === 'name') {
      changeUserName()
    } else {
      performUserSave(changeType.value as 'email')
    }
  } else {
    saveAccountChanges()
  }
}

const saveUserChanges = async () => {
  if (isSaving.value) return

  if (activeUserSection.value === 'name') {
    if (!isUserFormValid.value) return

    // Verifica se o nome realmente mudou
    if (editedUser.value.name === props.userData?.fullName) {
      resultModalTitle.value = 'NENHUMA ALTERAÇÃO'
      resultModalMessage.value = 'O nome não foi alterado.'
      showResultModal.value = true
      return
    }

    await changeUserName()
    return
  }

  if (activeUserSection.value === 'email') {
    if (!isUserFormValid.value) return
    if (editedUser.value.email !== props.userData?.email) {
      requestConfirmation('email')
    } else {
      resultModalTitle.value = 'NENHUMA ALTERAÇÃO'
      resultModalMessage.value = 'O e-mail não foi alterado.'
      showResultModal.value = true
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
  } else if (resultModalTitle.value === 'NOME ALTERADO') {
    // Fecha o modal após alteração bem-sucedida do nome
    closeModal()
  }
}

const performUserSave = async (change: 'email') => {
  isSaving.value = true
  try {
    // Simula uma chamada API (substitua pela sua implementação real)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const payload: any = { type: change }
    if (change === 'email') {
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
  max-width: 800px;
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

/* Estilos para a busca de descrições */
.description-search-section {
  max-width: 100%;
}

.search-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr ;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1.5rem;
}

.search-button {
  height: fit-content;
  max-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  align-self: end;
}

.search-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Barra de pesquisa nas descrições */
.description-search-bar {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid #333;
  border-radius: 4px;
}

.search-bar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-bar-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  fill: #aaa;
  width: 20px;
  height: 20px;
  z-index: 1;
}

.search-bar-input {
  flex: 1;
  padding: 0.75rem 1rem 0.75rem 40px;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.15s ease;
  font-size: 0.9rem;
}

.search-bar-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.2);
}

.search-bar-input:focus + .search-bar-icon {
  fill: #f9cb28;
}

.search-results-count {
  color: #aaa;
  font-size: 0.8rem;
  background: rgba(249, 203, 40, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(249, 203, 40, 0.3);
  white-space: nowrap;
}

.search-results {
  border-top: 1px solid #333;
  padding-top: 1rem;
  margin-top: 1.5rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-title {
  color: #f9cb28;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Bebas Neue', sans-serif;
  margin: 0;
}

.results-count {
  color: #aaa;
  font-size: 0.85rem;
  background: rgba(249, 203, 40, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(249, 203, 40, 0.3);
}

.results-table-header {
  display: grid;
  grid-template-columns: 1fr 200px 80px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid #333;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #f9cb28;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-description-header {
  display: flex;
  align-items: center;
}

.result-codes-header {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.code-label {
  width: 80px;
  text-align: center;
}

.result-type-header {
  text-align: center;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 4px;
  background: rgba(30, 30, 30, 0.5);
}

.result-item {
  display: grid;
  grid-template-columns: 1fr 200px 80px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(51, 51, 51, 0.5);
  transition: all 0.2s ease;
  align-items: center;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: rgba(249, 203, 40, 0.05);
}

.result-item.even {
  background: rgba(40, 40, 40, 0.3);
}

.result-item.even:hover {
  background: rgba(249, 203, 40, 0.08);
}

.result-description {
  display: flex;
  align-items: center;
}

.description-text {
  color: #ddd;
  font-size: 0.9rem;
  line-height: 1.4;
}

.result-codes {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.code-input-group {
  position: relative;
  width: 80px;
}

.code-input {
  width: 100%;
  padding: 0.65rem 0.5rem;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.15s ease;
  text-align: center;
  font-size: 0.85rem;
}

.code-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.2);
}

.code-input.disabled {
  background: rgba(30, 30, 30, 0.3);
  color: #666;
  cursor: not-allowed;
}

.code-input::-webkit-inner-spin-button,
.code-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.code-status {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
}

.modified-icon {
  width: 12px;
  height: 12px;
  fill: #f9cb28;
}

.result-type-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.type-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: #1a1a1a;
}

.type-badge.debit {
  background: #ff4d4d;
}

.type-badge.credit {
  background: #4CAF50;
}

.type-text {
  font-size: 0.75rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.changes-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f9cb28;
  font-size: 0.9rem;
  font-weight: 600;
}

.changes-icon {
  width: 16px;
  height: 16px;
  fill: #f9cb28;
}

.save-changes-button {
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.save-changes-button:not(.has-changes) {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-changes-button.has-changes {
  background: linear-gradient(to right, #4CAF50, #45a049);
}

.save-changes-button.has-changes:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.save-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.search-error {
  margin-top: 1rem;
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-icon {
  width: 18px;
  height: 18px;
  fill: #ff4d4d;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #aaa;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-results-icon {
  width: 48px;
  height: 48px;
  fill: #666;
}

.no-results-hint {
  font-size: 0.85rem;
  color: #777;
}

.account-types-header {
  display: flex;
  width: 100%;
  margin-bottom: 0.5rem;
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

/* Tabs */
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

/* Loading overlay */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #aaa;
}

.loading-overlay .spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 1rem;
}

.loading-overlay .spinner .path {
  stroke: #f9cb28;
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

  .search-inputs {
    grid-template-columns: 1fr;
  }

  .search-button {
    min-width: auto;
    align-self: stretch;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1;
    min-width: 120px;
    text-align: center;
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }

  /* Responsividade para a seção de descrições */
  .results-table-header {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    display: none;
  }

  .result-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .result-codes {
    justify-content: flex-start;
    gap: 0.5rem;
  }

  .code-input-group {
    width: 100px;
  }

  .result-type-indicator {
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.5rem;
  }

  .results-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .save-changes-button {
    min-width: auto;
  }

  .search-bar-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .search-results-count {
    align-self: flex-end;
  }
}
.code-filters {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.code-filter-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.code-filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Montserrat', sans-serif;
}

.code-filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
}

.code-filter-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.code-filter-input::placeholder {
  color: #777;
}

/* Ajustes na barra de pesquisa */
.description-search-bar {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.search-bar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #f9cb28;
  fill: currentColor;
  filter: drop-shadow(0 0 5px rgba(249, 203, 40, 0.5));
}

.search-bar-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
}

.search-bar-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.search-bar-input::placeholder {
  color: #777;
}

.search-results-count {
  position: absolute;
  right: 0.75rem;
  font-size: 0.75rem;
  color: #f9cb28;
  background: rgba(40, 40, 40, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #f9cb28;
}
</style>