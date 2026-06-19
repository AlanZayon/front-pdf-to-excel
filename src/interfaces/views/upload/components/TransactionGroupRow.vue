<script lang="ts" setup>
import { computed } from 'vue'
import IndividualClassificationCard from './IndividualClassificationCard.vue'

const props = defineProps<{
  group: any
  side: 'positive' | 'negative'
  selectedBankCode: string
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
  toggle: [group: any]
  validate: [group: any, type: 'debito' | 'credito']
  debitoFocus: [group: any, event: FocusEvent]
  creditoFocus: [group: any, event: FocusEvent]
  saveIndividual: [payload: any]
  removeIndividual: [transactionKey: string]
}>()

const hasMultipleTransactions = computed(() => props.group.transacoesDetalhadas.length > 1)

const hasSingleIndividualClassification = computed(
  () =>
    props.group.transacoesDetalhadas.length === 1 &&
    props.group.transacoesDetalhadas[0].hasIndividualClassification
)

const isDebitoReadonly = computed(() => {
  if (props.side === 'positive') return true

  return (
    props.group.debitoLocked ||
    (props.selectedBankCode !== '' && props.group.total >= 0) ||
    hasSingleIndividualClassification.value
  )
})

const isCreditoReadonly = computed(() => {
  if (props.side === 'negative') return true

  return (
    props.group.creditoLocked ||
    (props.selectedBankCode !== '' && props.group.total < 0) ||
    hasSingleIndividualClassification.value
  )
})
</script>

<template>
  <div
    class="description-group"
    :class="{
      classified: isDescriptionClassified(group),
      'search-highlight': isInSearchResults(group),
      'filtered-out': shouldFilterOut(group),
      'has-individual-classifications': hasIndividualClassifications(group),
      'single-transaction': group.transacoesDetalhadas.length === 1,
    }"
    v-show="!shouldFilterOut(group)"
  >
    <div v-if="group.transacoesDetalhadas.length === 1" class="single-transaction-layout">
      <div class="single-transaction-header">
        <span class="single-transaction-date">{{ group.transacoesDetalhadas[0].data }}</span>
        <span
          class="single-transaction-value"
          :class="{
            negative: group.transacoesDetalhadas[0].valor < 0,
            positive: group.transacoesDetalhadas[0].valor >= 0,
          }"
        >
          {{ formatCurrency(group.transacoesDetalhadas[0].valor) }}
        </span>
      </div>
      <div class="single-transaction-description">{{ group.descricao }}</div>
      <div class="transaction-count-badge">{{ group.transacoesDetalhadas.length }} transação(ões)</div>
      <div v-if="hasIndividualClassifications(group)" class="individual-count-badge-single">
        {{ getIndividualClassificationCount(group) }} personalizada(s)
      </div>
    </div>

    <div v-else class="description-header" @click="$emit('toggle', group)">
      <div class="description-main">
        <span class="description-text">{{ group.descricao }}</span>
        <span class="transaction-count-badge-header">
          {{ group.transacoesDetalhadas.length }} transação(ões)
        </span>
        <span v-if="hasIndividualClassifications(group)" class="individual-count-badge">
          {{ getIndividualClassificationCount(group) }} personalizada(s)
        </span>
      </div>
      <div class="description-controls">
        <div class="description-status" :class="getStatusClass(group)">{{ getStatusText(group) }}</div>
        <span v-if="!group.expanded && hasMultipleTransactions" class="expand-hint">Clique para personalizar transações</span>
        <svg class="description-arrow" :class="{ rotated: group.expanded }" viewBox="0 0 24 24">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </div>
    </div>

    <div class="classification-fields">
      <div class="code-input-group">
        <label>Código Débito:</label>
        <input
          type="text"
          v-model="group.codigoDebito"
          placeholder="Ex: 1234"
          :class="{ error: group.debitoError }"
          :readonly="isDebitoReadonly"
          @input="$emit('validate', group, 'debito')"
          @focus="$emit('debitoFocus', group, $event)"
        >
        <span class="error-message" v-if="group.debitoError">{{ group.debitoError }}</span>
      </div>

      <div class="code-input-group">
        <label>Código Crédito:</label>
        <input
          type="text"
          v-model="group.codigoCredito"
          placeholder="Ex: 5678"
          :class="{ error: group.creditoError }"
          :readonly="isCreditoReadonly"
          @input="$emit('validate', group, 'credito')"
          @focus="$emit('creditoFocus', group, $event)"
        >
        <span class="error-message" v-if="group.creditoError">{{ group.creditoError }}</span>
      </div>
    </div>

    <div v-if="group.expanded && hasMultipleTransactions" class="transactions-details">
      <div class="individual-section-header">
        <strong>Personalizar transações</strong>
        <p>Alguma transação precisa de código diferente? Use <em>Personalizar</em> na linha desejada.</p>
      </div>
      <div class="transactions-list scrollable">
        <IndividualClassificationCard
          v-for="(transacao, i) in group.transacoesDetalhadas"
          :key="transacao.transactionKey || i"
          :transaction="buildTransactionPayload(transacao, group)"
          :group="group"
          :selected-bank-code="selectedBankCode"
          :format-currency="formatCurrency"
          @save="$emit('saveIndividual', $event)"
          @remove="$emit('removeIndividual', $event)"
        />
      </div>
    </div>
  </div>
</template>
