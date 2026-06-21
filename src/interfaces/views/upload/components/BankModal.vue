<script lang="ts" setup>
import { vMaska } from 'maska/vue'
import type { Cliente } from '../../../../infrastructure/services/ClienteService'
import ClienteSearchSelect from './ClienteSearchSelect.vue'

defineProps<{
  visible: boolean
  fileName: string
  bankCode: string
  cnpj: string
  selectedClienteId: number | null
  isProcessing: boolean
  isFormValid: boolean
  validationErrors?: string[]
  showDateFilter: boolean
  dateFilter: { startDate: string; endDate: string; isActive: boolean }
  isDateFilterValid: boolean
}>()

defineEmits<{
  close: []
  confirm: []
  'update:bankCode': [value: string]
  'update:cnpj': [value: string]
  'update:selectedClienteId': [value: number | null]
  selectCliente: [cliente: Cliente | null]
  toggleDateFilter: []
  applyDateFilter: []
  clearDateFilter: []
}>()

defineSlots<{
  formatDateRange: () => unknown
}>()
</script>

<template>
  <div v-if="visible" class="modal-overlay" role="presentation" @click.self="$emit('close')">
    <div class="bank-data-modal" role="dialog" aria-modal="true" aria-labelledby="bank-modal-title">
      <div class="modal-header">
        <h2 id="bank-modal-title">INFORMAÇÕES BANCÁRIAS</h2>
        <button class="close-button" type="button" aria-label="Fechar modal" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <div class="file-info-modal">
          <svg class="file-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span>{{ fileName }} - Arquivo OFX</span>
        </div>

        <div class="bank-fields">
          <div class="input-group">
            <label for="bank-modal-cliente">Cliente cadastrado:</label>
            <ClienteSearchSelect
              :model-value="selectedClienteId"
              input-id="bank-modal-cliente"
              default-label="Selecionar manualmente"
              @update:model-value="$emit('update:selectedClienteId', $event)"
              @select="$emit('selectCliente', $event)"
            />
          </div>
          <div class="input-group">
            <label>Código do Banco:</label>
            <input
              :key="`bank-code-${selectedClienteId ?? 'manual'}`"
              type="text"
              :value="bankCode"
              v-maska="'####'"
              placeholder="0000"
              maxlength="4"
              @input="$emit('update:bankCode', ($event.target as HTMLInputElement).value)"
            >
          </div>
          <div class="input-group">
            <label>CNPJ:</label>
            <input
              :key="`cnpj-${selectedClienteId ?? 'manual'}`"
              type="text"
              :value="cnpj"
              v-maska="'##.###.###/####-##'"
              placeholder="00.000.000/0000-00"
              @input="$emit('update:cnpj', ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>

        <ul v-if="validationErrors?.length" class="validation-errors" role="alert">
          <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
        </ul>

        <div class="date-filter-section">
          <button type="button" class="filter-toggle-header" @click="$emit('toggleDateFilter')">
            <h3>FILTRAR POR PERÍODO</h3>
            <svg class="filter-toggle-icon" :class="{ rotated: showDateFilter }" viewBox="0 0 24 24">
              <path d="M7,10L12,15L17,10H7Z" />
            </svg>
          </button>
          <div v-if="showDateFilter" class="date-filter-controls">
            <div class="date-input-group">
              <label>Data Inicial:</label>
              <input v-model="dateFilter.startDate" type="date" class="date-input">
            </div>
            <div class="date-input-group">
              <label>Data Final:</label>
              <input v-model="dateFilter.endDate" type="date" class="date-input">
            </div>
            <div class="date-filter-actions">
              <button
                type="button"
                :disabled="!isDateFilterValid"
                class="filter-apply-button"
                @click="$emit('applyDateFilter')"
              >
                APLICAR FILTRO
              </button>
              <button type="button" class="filter-clear-button" @click="$emit('clearDateFilter')">
                LIMPAR FILTRO
              </button>
              <div v-if="dateFilter.isActive" class="filter-status">
                <span class="active-filter-badge">FILTRO ATIVO</span>
                <slot name="formatDateRange" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            :disabled="!isFormValid || isProcessing"
            class="confirm-button"
            :class="{ loading: isProcessing }"
            @click="$emit('confirm')"
          >
            <div v-if="isProcessing" class="button-loading">
              <svg class="spinner" viewBox="0 0 50 50" width="18" height="18">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
              </svg>
              PROCESSANDO...
            </div>
            <span v-else>CONFIRMAR E PROCESSAR</span>
          </button>
          <button type="button" class="cancel-button" :disabled="isProcessing" @click="$emit('close')">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/interfaces/views/upload/upload-shared.css';

.bank-data-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border-radius: 8px;
  width: 95%;
  max-width: 500px;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  border: 1px solid #333;
  position: relative;
}

.bank-data-modal::before {
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

.file-icon {
  width: 20px;
  height: 20px;
  fill: #f9cb28;
  flex-shrink: 0;
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

.input-group input {
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

.input-group input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.input-group select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

.input-group input::placeholder {
  color: #777;
}

.date-filter-section {
  margin: 20px 0;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.filter-toggle-header {
  display: flex;
  width: 100%;
  border: none;
  font: inherit;
  text-align: left;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.validation-errors {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0.75rem;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.4);
  border-radius: 4px;
  color: #ff4d4d;
  font-size: 0.85rem;
}

.filter-toggle-header:hover {
  background-color: rgba(50, 50, 50, 0.8);
  border-color: #f9cb28;
}

.filter-toggle-header h3 {
  margin: 0;
  color: #f9cb28;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bebas Neue', sans-serif;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.3);
}

.filter-toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  fill: #f9cb28;
}

.filter-toggle-icon.rotated {
  transform: rotate(180deg);
}

.date-filter-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.5s ease;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.9rem;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  min-width: 150px;
  box-sizing: border-box;
}

.date-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.date-filter-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-apply-button {
  padding: 0.75rem 1.5rem;
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
  font-family: 'Montserrat', sans-serif;
}

.filter-apply-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.filter-apply-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.filter-clear-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.filter-clear-button:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
  transform: translateY(-2px);
}

.filter-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 0.75rem;
}

.active-filter-badge {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bebas Neue', sans-serif;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

:deep(.filter-dates) {
  font-size: 0.8rem;
  color: #f9cb28;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  position: relative;
  min-width: 220px;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.confirm-button:disabled,
.confirm-button.loading {
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

.cancel-button:hover:not(:disabled) {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
}

.cancel-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  animation: rotate 1.5s linear infinite;
}

.spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
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
  .bank-data-modal {
    width: 98%;
    margin: 5px;
    max-height: 98vh;
  }

  .modal-header h2 {
    font-size: 1.4rem;
  }

  .date-filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .date-input-group {
    width: 100%;
  }

  .date-input {
    min-width: auto;
    width: 100%;
  }

  .date-filter-actions {
    justify-content: center;
    width: 100%;
  }

  .filter-status {
    margin-left: 0;
    justify-content: center;
    width: 100%;
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
</style>
