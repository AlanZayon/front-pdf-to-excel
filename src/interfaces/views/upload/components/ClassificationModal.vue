<script lang="ts" setup>
import { computed } from 'vue'
import AppModal from '../../../ui/AppModal.vue'
import TransactionGroupRow from './TransactionGroupRow.vue'
import ClassificationSearch from './ClassificationSearch.vue'
import IndividualClassificationCard from './IndividualClassificationCard.vue'

const props = defineProps<{
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
  totalGroupsCount?: number
  classificationProgressPercent?: number
  draftRestored?: boolean
  findFirstPendingGroupKey?: () => string | null
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
  buildTransactionPayload: (transacao: any, group: any) => any
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
  removeIndividualClassification: [transactionKey: string]
  toggleDescription: [group: any]
  validateGroupCode: [group: any, type: 'debito' | 'credito']
  handleGroupDebitoFocus: [group: any, event: FocusEvent]
  handleGroupCreditoFocus: [group: any, event: FocusEvent]
  'update:dateFilterStart': [value: string]
  'update:dateFilterEnd': [value: string]
}>()

const progressTotal = computed(() => props.totalGroupsCount ?? props.groupedTransactions.length)
const progressPercent = computed(() =>
  props.classificationProgressPercent ??
  (progressTotal.value === 0 ? 0 : Math.round((props.classifiedCount / progressTotal.value) * 100))
)

const saveHint = computed(() => {
  if (props.isFormValid) return ''
  return `${props.pendingCount} descrição(ões) pendente(s) — complete os códigos antes de salvar.`
})

const showIndividualOrValueView = computed(
  () => (props.searchByValue && props.valueSearchResults.length > 0) || props.currentFilter === 'individual'
)

const filterLabels: Record<typeof props.currentFilter, string> = {
  all: 'Todas',
  pending: 'Pendentes',
  classified: 'Classificadas',
  individual: 'Personalizadas',
}

function scrollToNextPending() {
  const key = props.findFirstPendingGroupKey?.()
  if (!key) return
  const el = document.querySelector(`[data-group-key="${CSS.escape(key)}"]`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (el instanceof HTMLElement) {
    el.querySelector('input')?.focus()
  }
}
</script>

<template>
  <AppModal
    :visible="true"
    :panel-scroll="false"
    title-id="classification-modal-title"
    @close="$emit('close')"
  >
    <div class="clf-modal" role="document">
      <header class="clf-header">
        <div class="clf-header-main">
          <h2 id="classification-modal-title" class="clf-title">Classificação de transações OFX</h2>
          <p class="clf-subtitle">
            Atribua códigos de débito e crédito por descrição. Use busca em lote ou personalize transações individuais quando necessário.
          </p>
        </div>
        <div class="clf-header-actions">
          <div class="clf-progress-ring" aria-label="Progresso da classificação">
            <span class="clf-progress-value">{{ progressPercent }}%</span>
            <span class="clf-progress-label">concluído</span>
          </div>
          <button type="button" class="clf-icon-close" aria-label="Fechar modal" @click="$emit('close')">
            ×
          </button>
        </div>
      </header>

      <div class="clf-progress-track" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
        <div class="clf-progress-fill" :style="{ width: `${progressPercent}%` }" />
      </div>

      <div class="clf-meta-bar">
        <div class="clf-file-chip">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span class="clf-file-name" :title="fileName">{{ fileName }}</span>
          <span class="clf-file-count">· {{ filteredGroupedTransactions.length }} descrições</span>
        </div>

        <span v-if="draftRestored" class="clf-draft-badge">Rascunho restaurado</span>

        <span v-if="dateFilter.isActive" class="clf-date-badge">
          {{ formatDateRange() }}
          <button type="button" aria-label="Remover filtro de período" @click="$emit('clearDateFilter')">
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </span>

        <div class="clf-bank-inline">
          <label for="bank-code-unclassified">Cód. não classif.</label>
          <input
            id="bank-code-unclassified"
            type="text"
            maxlength="4"
            inputmode="numeric"
            :value="bankCodeInput"
            placeholder="0000"
            title="Código aplicado automaticamente ao campo bloqueado (débito ou crédito conforme o tipo)"
            @input="$emit('update:bankCodeInput', ($event.target as HTMLInputElement).value); $emit('filterBanks')"
          >
          <button type="button" class="clf-btn-sm" @click="$emit('onBankCodeApply')">Aplicar</button>
        </div>
      </div>

      <div class="clf-toolbar">
        <div class="clf-filter-segment" role="group" aria-label="Filtrar descrições">
          <button
            v-for="(label, key) in filterLabels"
            :key="key"
            type="button"
            :class="{ active: currentFilter === key }"
            @click="$emit('setFilter', key)"
          >
            {{ label }}
          </button>
        </div>

        <div class="clf-stats-row" aria-label="Estatísticas">
          <span class="clf-stat-chip"><strong>{{ groupedTransactions.length }}</strong> total</span>
          <span class="clf-stat-chip success"><strong>{{ classifiedCount }}</strong> classificadas</span>
          <span class="clf-stat-chip warning"><strong>{{ pendingCount }}</strong> pendentes</span>
          <span v-if="individualTransactionsCount > 0" class="clf-stat-chip accent">
            <strong>{{ individualTransactionsCount }}</strong> personalizadas
          </span>
        </div>

        <div class="clf-toolbar-actions">
          <button
            type="button"
            class="clf-tool-btn"
            :class="{ active: showSearchSection }"
            @click="$emit('toggleSearchVisibility')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            Buscar
          </button>
          <button
            type="button"
            class="clf-tool-btn"
            :class="{ active: showDateFilter }"
            @click="$emit('toggleDateFilter')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M19,8H5V6H19V8Z" />
            </svg>
            Período
          </button>
          <button
            v-if="pendingCount > 0 && findFirstPendingGroupKey"
            type="button"
            class="clf-tool-btn clf-next-btn"
            @click="scrollToNextPending"
          >
            Próxima pendente
          </button>
        </div>
      </div>

      <div v-if="showDateFilter || showSearchSection" class="clf-tools-panel">
        <div v-if="showDateFilter" class="clf-date-panel">
          <p class="clf-date-panel-title">Filtrar transações por período</p>
          <div class="clf-date-row">
            <div class="clf-date-field">
              <label for="clf-date-start">Data inicial</label>
              <input
                id="clf-date-start"
                type="date"
                :value="dateFilter.startDate"
                @input="$emit('update:dateFilterStart', ($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="clf-date-field">
              <label for="clf-date-end">Data final</label>
              <input
                id="clf-date-end"
                type="date"
                :value="dateFilter.endDate"
                @input="$emit('update:dateFilterEnd', ($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="clf-date-actions">
              <button
                type="button"
                class="clf-btn-primary"
                :disabled="!isDateFilterValid"
                @click="$emit('applyDateFilter')"
              >
                Aplicar
              </button>
              <button type="button" class="clf-btn-ghost" @click="$emit('clearDateFilter')">Limpar</button>
            </div>
          </div>
        </div>

        <ClassificationSearch
          v-if="showSearchSection"
          embedded
          :show-search-section="true"
          :current-search-type="currentSearchType"
          :search-by-description="searchByDescription"
          :search-by-value="searchByValue"
          :search-results="searchResults"
          :search-results-positive="searchResultsPositive"
          :search-results-negative="searchResultsNegative"
          :batch-codes-positive="batchCodesPositive"
          :batch-codes-negative="batchCodesNegative"
          :value-results-count="valueSearchResults.length"
          @toggle-visibility="$emit('toggleSearchVisibility')"
          @set-search-type="$emit('setSearchType', $event)"
          @update:search-by-description="$emit('update:searchByDescription', $event)"
          @update:search-by-value="$emit('update:searchByValue', $event)"
          @clear-search="$emit('clearCurrentSearch')"
          @apply-batch="$emit('applyBatchClassification', $event)"
          @update:batch-codes-positive="$emit('update:batchCodesPositive', $event)"
          @update:batch-codes-negative="$emit('update:batchCodesNegative', $event)"
        />
      </div>

      <main class="clf-main app-scrollbar">
        <template v-if="showIndividualOrValueView">
          <div class="clf-results-header">
            <h3>
              {{
                currentFilter === 'individual'
                  ? 'Transações personalizadas'
                  : 'Resultados por valor'
              }}
            </h3>
            <span>
              {{
                currentFilter === 'individual'
                  ? `${individualTransactions.length} transação(ões)`
                  : `${valueSearchResults.length} transação(ões)`
              }}
            </span>
          </div>

          <IndividualClassificationCard
            v-for="(result, idx) in currentFilter === 'individual' ? individualTransactions : valueSearchResults"
            :key="`value-${result.transactionKey || idx}`"
            :transaction="result"
            :group="result.groupRef"
            :selected-bank-code="selectedBankCode"
            :format-currency="formatCurrency"
            show-description
            @save="$emit('saveIndividualClassification', $event)"
            @remove="$emit('removeIndividualClassification', $event)"
          />

          <div v-if="currentFilter === 'individual' && individualTransactions.length === 0" class="clf-empty">
            <p>Nenhuma transação personalizada ainda.</p>
            <p class="empty-hint">
              Expanda uma descrição com várias transações e clique em <strong>Personalizar</strong> na linha desejada.
            </p>
          </div>
        </template>

        <div v-else class="clf-columns">
          <section class="clf-column" aria-label="Entradas">
            <div class="clf-column-header income">
              <h3>Entradas</h3>
              <span class="clf-column-count">{{ positiveGroups.length }} descrições</span>
            </div>
            <div class="clf-column-list">
              <div
                v-for="(group, index) in positiveGroups"
                :key="`positive-${index}`"
                :data-group-key="group.descricao"
              >
                <TransactionGroupRow
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
                  :build-transaction-payload="buildTransactionPayload"
                  @toggle="$emit('toggleDescription', $event)"
                  @validate="(g, type) => $emit('validateGroupCode', g, type)"
                  @debito-focus="(g, event) => $emit('handleGroupDebitoFocus', g, event)"
                  @credito-focus="(g, event) => $emit('handleGroupCreditoFocus', g, event)"
                  @save-individual="$emit('saveIndividualClassification', $event)"
                  @remove-individual="$emit('removeIndividualClassification', $event)"
                />
              </div>
              <div v-if="positiveGroups.length === 0" class="clf-empty">Nenhuma entrada com os filtros atuais.</div>
            </div>
          </section>

          <section class="clf-column" aria-label="Saídas">
            <div class="clf-column-header expense">
              <h3>Saídas</h3>
              <span class="clf-column-count">{{ negativeGroups.length }} descrições</span>
            </div>
            <div class="clf-column-list">
              <div
                v-for="(group, index) in negativeGroups"
                :key="`negative-${index}`"
                :data-group-key="group.descricao"
              >
                <TransactionGroupRow
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
                  :build-transaction-payload="buildTransactionPayload"
                  @toggle="$emit('toggleDescription', $event)"
                  @validate="(g, type) => $emit('validateGroupCode', g, type)"
                  @debito-focus="(g, event) => $emit('handleGroupDebitoFocus', g, event)"
                  @credito-focus="(g, event) => $emit('handleGroupCreditoFocus', g, event)"
                  @save-individual="$emit('saveIndividualClassification', $event)"
                  @remove-individual="$emit('removeIndividualClassification', $event)"
                />
              </div>
              <div v-if="negativeGroups.length === 0" class="clf-empty">Nenhuma saída com os filtros atuais.</div>
            </div>
          </section>
        </div>

        <div
          v-if="filteredGroupedTransactions.length === 0 && !showIndividualOrValueView"
          class="clf-empty"
        >
          Nenhuma descrição encontrada com os filtros atuais.
        </div>
      </main>

      <footer class="clf-footer">
        <p v-if="saveHint" class="clf-save-hint" role="alert">{{ saveHint }}</p>
        <p v-else class="clf-footer-hint">
          {{ classifiedCount }} de {{ progressTotal }} descrições classificadas — alterações são salvas como rascunho automaticamente.
        </p>
        <button type="button" class="clf-btn-cancel" :disabled="isSavingClassification" @click="$emit('close')">
          Cancelar
        </button>
        <button
          type="button"
          class="clf-btn-save"
          :disabled="isSavingClassification || !isFormValid"
          @click="$emit('save')"
        >
          <svg
            v-if="isSavingClassification"
            class="clf-spinner"
            viewBox="0 0 50 50"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" opacity="0.25" />
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80" stroke-linecap="round" />
          </svg>
          {{ isSavingClassification ? 'Salvando…' : 'Salvar classificação' }}
        </button>
      </footer>
    </div>
  </AppModal>
</template>

<style src="./upload-modal.css"></style>
<style src="./classification-modal.css"></style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap');
</style>
