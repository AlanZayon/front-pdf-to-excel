<script lang="ts" setup>
import TransactionGroupRow from './TransactionGroupRow.vue'
import ClassificationSearch from './ClassificationSearch.vue'

defineProps<{
  fileName: string
  dateFilter: { startDate: string; endDate: string; isActive: boolean }
  showDateFilter: boolean
  isDateFilterValid: boolean
  formatDateRange: () => string
  groupedTransactions: any[]
  filteredGroupedTransactions: any[]
  positiveGroups: any[]
  negativeGroups: any[]
  individualTransactions: any[]
  valueSearchResults: any[]
  classifiedCount: number
  pendingCount: number
  individualTransactionsCount: number
  individualClassificationsCount: number
  currentFilter: 'all' | 'classified' | 'pending' | 'individual'
  searchByValue: string
  searchByDescription: string
  showSearchSection: boolean
  currentSearchType: 'description' | 'value'
  searchResults: any[]
  searchResultsPositive: any[]
  searchResultsNegative: any[]
  batchCodesPositive: { debito: string; credito: string }
  batchCodesNegative: { debito: string; credito: string }
  bankCodeInput: string
  selectedBankCode: string
  isSavingClassification: boolean
  isFormValid: boolean
  shouldFilterOut: (group: any) => boolean
  isDescriptionClassified: (group: any) => boolean
  isInSearchResults: (group: any) => boolean
  hasIndividualClassifications: (group: any) => boolean
  getIndividualClassificationCount: (group: any) => number
  getStatusClass: (group: any) => string
  getStatusText: (group: any) => string
  formatCurrency: (value: number) => string
}>()

defineEmits<{
  close: []
  save: []
  setFilter: [filter: 'all' | 'classified' | 'pending' | 'individual']
  clearDateFilter: []
  toggleDateFilter: []
  applyDateFilter: []
  filterBanks: []
  onBankCodeApply: []
  'update:bankCodeInput': [value: string]
  toggleSearchVisibility: []
  setSearchType: [type: 'description' | 'value']
  'update:searchByDescription': [value: string]
  'update:searchByValue': [value: string]
  clearCurrentSearch: []
  applyBatchClassification: [type: 'positive' | 'negative']
  'update:batchCodesPositive': [value: { debito: string; credito: string }]
  'update:batchCodesNegative': [value: { debito: string; credito: string }]
  saveIndividualClassification: [result: any]
  toggleDescription: [group: any]
  validateGroupCode: [group: any, type: 'debito' | 'credito']
  handleGroupDebitoFocus: [group: any, event: FocusEvent]
  handleGroupCreditoFocus: [group: any, event: FocusEvent]
  'update:dateFilterStart': [value: string]
  'update:dateFilterEnd': [value: string]
}>()
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="classification-modal">
      <div class="modal-header">
        <h2>CLASSIFICAÇÃO DE TRANSAÇÕES OFX</h2>
        <button type="button" class="close-button" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            />
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <div class="file-info-modal">
          <div class="file-info-main">
            <svg class="file-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span class="file-info-text">
              {{ fileName }} - {{ filteredGroupedTransactions.length }} descrições para classificar
            </span>
            <div v-if="dateFilter.isActive" class="active-date-filter-indicator">
              <span class="filter-badge">FILTRO ATIVO</span>
              <span class="filter-range">{{ formatDateRange() }}</span>
              <button type="button" class="clear-filter-button" @click="$emit('clearDateFilter')">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="bank-code-inline">
            <label for="bank-code-unclassified">Cód. não classif.:</label>
            <input
              id="bank-code-unclassified"
              type="text"
              maxlength="4"
              inputmode="numeric"
              :value="bankCodeInput"
              placeholder="0000"
              class="bank-code-input"
              @input="$emit('update:bankCodeInput', ($event.target as HTMLInputElement).value); $emit('filterBanks')"
            >
            <button type="button" class="bank-code-apply" @click="$emit('onBankCodeApply')">Aplicar</button>
          </div>
        </div>

        <div class="filters-section">
          <div class="filters-container">
            <div class="filter-buttons">
              <button
                type="button"
                class="filter-button"
                :class="{ active: currentFilter === 'all' }"
                @click="$emit('setFilter', 'all')"
              >
                TODAS AS DESCRIÇÕES
              </button>
              <button
                type="button"
                class="filter-button"
                :class="{ active: currentFilter === 'classified' }"
                @click="$emit('setFilter', 'classified')"
              >
                CLASSIFICADAS
              </button>
              <button
                type="button"
                class="filter-button"
                :class="{ active: currentFilter === 'pending' }"
                @click="$emit('setFilter', 'pending')"
              >
                NÃO CLASSIFICADAS
              </button>
              <button
                type="button"
                class="filter-button"
                :class="{ active: currentFilter === 'individual' }"
                @click="$emit('setFilter', 'individual')"
              >
                CLASSIFICAÇÕES INDIVIDUAIS
              </button>
            </div>

            <div class="filter-stats">
              <span class="filter-stat">Total de Históricos: {{ groupedTransactions.length }}</span>
              <span class="filter-stat classified">Classificadas: {{ classifiedCount }}</span>
              <span class="filter-stat pending">Pendentes: {{ pendingCount }}</span>
              <span class="filter-stat individual"> Transações Individuais: {{ individualTransactionsCount }}</span>
              <span class="filter-stat individual"> Transações Totais: {{ individualClassificationsCount }}</span>
            </div>
          </div>
        </div>

        <div class="date-filter-modal-section">
          <div class="filter-toggle-header" @click="$emit('toggleDateFilter')">
            <h3>FILTRAR TRANSAÇÕES POR PERÍODO</h3>
            <svg class="filter-toggle-icon" :class="{ rotated: showDateFilter }" viewBox="0 0 24 24">
              <path d="M7,10L12,15L17,10H7Z" />
            </svg>
          </div>
          <div v-if="showDateFilter" class="date-filter-controls-modal">
            <div class="date-input-group-modal">
              <label>Data Inicial:</label>
              <input
                type="date"
                :value="dateFilter.startDate"
                class="date-input-modal"
                @input="$emit('update:dateFilterStart', ($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="date-input-group-modal">
              <label>Data Final:</label>
              <input
                type="date"
                :value="dateFilter.endDate"
                class="date-input-modal"
                @input="$emit('update:dateFilterEnd', ($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="date-filter-actions-modal">
              <button type="button" :disabled="!isDateFilterValid" class="filter-apply-button-modal" @click="$emit('applyDateFilter')">
                APLICAR FILTRO
              </button>
              <button type="button" class="filter-clear-button-modal" @click="$emit('clearDateFilter')">
                LIMPAR FILTRO
              </button>
            </div>
          </div>
        </div>

        <ClassificationSearch
          :show-search-section="showSearchSection"
          :current-search-type="currentSearchType"
          :search-by-description="searchByDescription"
          :search-by-value="searchByValue"
          :search-results="searchResults"
          :search-results-positive="searchResultsPositive"
          :search-results-negative="searchResultsNegative"
          :batch-codes-positive="batchCodesPositive"
          :batch-codes-negative="batchCodesNegative"
          @toggle-visibility="$emit('toggleSearchVisibility')"
          @set-search-type="$emit('setSearchType', $event)"
          @update:search-by-description="$emit('update:searchByDescription', $event)"
          @update:search-by-value="$emit('update:searchByValue', $event)"
          @clear-search="$emit('clearCurrentSearch')"
          @apply-batch="$emit('applyBatchClassification', $event)"
          @update:batch-codes-positive="$emit('update:batchCodesPositive', $event)"
          @update:batch-codes-negative="$emit('update:batchCodesNegative', $event)"
        />

        <div class="transactions-container">
          <div v-if="(searchByValue && valueSearchResults.length > 0) || currentFilter === 'individual'">
            <div v-if="currentFilter === 'individual'" class="value-search-results-header">
              CLASSIFICAÇÕES INDIVIDUAIS: {{ individualTransactions.length }} transação(ões) com classificação individual
            </div>
            <div v-else class="value-search-results-header">
              RESULTADOS POR VALOR: {{ valueSearchResults.length }} transação(ões) encontrada(s)
            </div>

            <div
              v-for="(result, idx) in currentFilter === 'individual' ? individualTransactions : valueSearchResults"
              :key="`value-${idx}`"
              class="value-search-item"
              :class="{ 'has-individual-classification': result.hasIndividualClassification }"
            >
              <div class="value-search-main">
                <div class="value-search-left">
                  <span class="value-date">{{ result.data }}</span>
                  <span class="value-description">{{ result.descricao }}</span>
                </div>
                <div class="value-search-right">
                  <span class="value-amount" :class="{ negative: result.valor < 0, positive: result.valor >= 0 }">
                    {{ formatCurrency(result.valor) }}
                  </span>
                </div>
              </div>

              <div v-if="result.hasIndividualClassification" class="individual-classification-info">
                <span class="individual-badge">⚠️ CLASSIFICAÇÃO INDIVIDUAL</span>
              </div>

              <div class="individual-classification-fields">
                <div class="code-input-group">
                  <label>Código Débito:</label>
                  <input type="text" v-model="result.codigoDebito" placeholder="Ex: 1234" :readonly="result.valor >= 0">
                </div>
                <div class="code-input-group">
                  <label>Código Crédito:</label>
                  <input type="text" v-model="result.codigoCredito" placeholder="Ex: 5678" :readonly="result.valor < 0">
                </div>
                <button
                  type="button"
                  class="save-individual-button"
                  :disabled="!result.codigoDebito || !result.codigoCredito"
                  @click="$emit('saveIndividualClassification', result)"
                >
                  SALVAR
                </button>
              </div>
            </div>

            <div v-if="currentFilter === 'individual' && individualTransactions.length === 0" class="no-transactions">
              Nenhuma transação com classificação individual encontrada.
            </div>
          </div>

          <div v-else class="two-columns-layout">
            <div class="column positive-column">
              <div class="column-header">
                <h3>ENTRADAS</h3>
                <span class="column-count">{{ positiveGroups.length }} descrição(ões)</span>
              </div>

              <div class="groups-scroll">
                <TransactionGroupRow
                  v-for="(group, index) in positiveGroups"
                  :key="`positive-${index}`"
                  :group="group"
                  side="positive"
                  :selected-bank-code="selectedBankCode"
                  :should-filter-out="shouldFilterOut"
                  :is-description-classified="isDescriptionClassified"
                  :is-in-search-results="isInSearchResults"
                  :has-individual-classifications="hasIndividualClassifications"
                  :get-individual-classification-count="getIndividualClassificationCount"
                  :get-status-class="getStatusClass"
                  :get-status-text="getStatusText"
                  :format-currency="formatCurrency"
                  @toggle="$emit('toggleDescription', $event)"
                  @validate="(group, type) => $emit('validateGroupCode', group, type)"
                  @debito-focus="(group, event) => $emit('handleGroupDebitoFocus', group, event)"
                  @credito-focus="(group, event) => $emit('handleGroupCreditoFocus', group, event)"
                />
              </div>
            </div>

            <div class="column negative-column">
              <div class="column-header">
                <h3>SAÍDAS</h3>
                <span class="column-count">{{ negativeGroups.length }} descrição(ões)</span>
              </div>

              <div class="groups-scroll">
                <TransactionGroupRow
                  v-for="(group, index) in negativeGroups"
                  :key="`negative-${index}`"
                  :group="group"
                  side="negative"
                  :selected-bank-code="selectedBankCode"
                  :should-filter-out="shouldFilterOut"
                  :is-description-classified="isDescriptionClassified"
                  :is-in-search-results="isInSearchResults"
                  :has-individual-classifications="hasIndividualClassifications"
                  :get-individual-classification-count="getIndividualClassificationCount"
                  :get-status-class="getStatusClass"
                  :get-status-text="getStatusText"
                  :format-currency="formatCurrency"
                  @toggle="$emit('toggleDescription', $event)"
                  @validate="(group, type) => $emit('validateGroupCode', group, type)"
                  @debito-focus="(group, event) => $emit('handleGroupDebitoFocus', group, event)"
                  @credito-focus="(group, event) => $emit('handleGroupCreditoFocus', group, event)"
                />
              </div>
            </div>
          </div>

          <div
            v-if="filteredGroupedTransactions.length === 0 && !(searchByValue && valueSearchResults.length > 0) && currentFilter !== 'individual'"
            class="no-transactions"
          >
            Nenhuma descrição encontrada com os filtros atuais.
          </div>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="save-button"
            :disabled="isSavingClassification || !isFormValid"
            :class="{ loading: isSavingClassification }"
            @click="$emit('save')"
          >
            <div v-if="isSavingClassification" class="button-loading">
              <svg class="spinner" viewBox="0 0 50 50" width="18" height="18">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
              </svg>
              SALVANDO...
            </div>
            <div v-else class="button-content">SALVAR CLASSIFICAÇÃO</div>
          </button>
          <button type="button" class="cancel-button" :disabled="isSavingClassification" @click="$emit('close')">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./upload-modal.css"></style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap');
</style>
