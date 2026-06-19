<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

export type IndividualTransactionPayload = {
  transactionKey: string
  descricao: string
  data: string
  valor: number
  codigoDebito: string
  codigoCredito: string
  hasIndividualClassification: boolean
  isClassificacaoIndividual: boolean
  groupRef?: any
}

const props = defineProps<{
  transaction: IndividualTransactionPayload
  group?: any
  selectedBankCode: string
  formatCurrency: (value: number) => string
  showDescription?: boolean
}>()

const emit = defineEmits<{
  save: [payload: IndividualTransactionPayload]
  remove: [transactionKey: string]
}>()

const isEditing = ref(false)
const localDebito = ref('')
const localCredito = ref('')
const debitoError = ref('')
const creditoError = ref('')

const isPositive = computed(() => props.transaction.valor >= 0)
const isDebitoReadonly = computed(() => isPositive.value)
const isCreditoReadonly = computed(() => !isPositive.value)

const groupDebito = computed(() => props.group?.codigoDebito || props.selectedBankCode || '—')
const groupCredito = computed(() => props.group?.codigoCredito || props.selectedBankCode || '—')

const canSave = computed(
  () => localDebito.value.trim() !== '' && localCredito.value.trim() !== '' && !debitoError.value && !creditoError.value
)

function initDraft() {
  const t = props.transaction
  if (t.hasIndividualClassification && (t.codigoDebito || t.codigoCredito)) {
    localDebito.value = t.codigoDebito
    localCredito.value = t.codigoCredito
    return
  }

  const bank = props.selectedBankCode || ''
  localDebito.value = props.group?.codigoDebito || (isPositive.value ? bank : props.group?.codigoDebito || bank)
  localCredito.value = props.group?.codigoCredito || (!isPositive.value ? bank : props.group?.codigoCredito || bank)

  if (isPositive.value && !localDebito.value) localDebito.value = bank
  if (!isPositive.value && !localCredito.value) localCredito.value = bank
}

function validateField(type: 'debito' | 'credito') {
  const code = type === 'debito' ? localDebito.value : localCredito.value
  const errorRef = type === 'debito' ? debitoError : creditoError

  if (!code || !code.trim()) {
    errorRef.value = 'Código é obrigatório'
    return false
  }
  if (!/^\d+$/.test(code.trim())) {
    errorRef.value = 'Apenas números'
    return false
  }
  errorRef.value = ''
  return true
}

function validateAll() {
  const debitoOk = isDebitoReadonly.value || validateField('debito')
  const creditoOk = isCreditoReadonly.value || validateField('credito')
  return debitoOk && creditoOk
}

function startEdit() {
  initDraft()
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  debitoError.value = ''
  creditoError.value = ''
}

function buildPayload(): IndividualTransactionPayload {
  return {
    transactionKey: props.transaction.transactionKey,
    descricao: props.transaction.descricao || props.group?.descricao || '',
    data: props.transaction.data,
    valor: props.transaction.valor,
    codigoDebito: localDebito.value.trim(),
    codigoCredito: localCredito.value.trim(),
    hasIndividualClassification: true,
    isClassificacaoIndividual: true,
    groupRef: props.group ?? props.transaction.groupRef,
  }
}

function save() {
  if (!validateAll()) return
  emit('save', buildPayload())
  isEditing.value = false
}

function remove() {
  emit('remove', props.transaction.transactionKey)
  isEditing.value = false
}

watch(
  () => props.transaction.hasIndividualClassification,
  (has) => {
    if (has && !isEditing.value) {
      localDebito.value = props.transaction.codigoDebito
      localCredito.value = props.transaction.codigoCredito
    }
  }
)
</script>

<template>
  <div
    class="individual-txn-card"
    :class="{
      'is-individual': transaction.hasIndividualClassification,
      'is-editing': isEditing,
      'is-positive': isPositive,
      'is-negative': !isPositive,
    }"
  >
    <div class="individual-txn-header">
      <div class="individual-txn-meta">
        <span class="individual-txn-date">{{ transaction.data }}</span>
        <span
          class="individual-txn-value"
          :class="{ negative: transaction.valor < 0, positive: transaction.valor >= 0 }"
        >
          {{ formatCurrency(transaction.valor) }}
        </span>
      </div>

      <div v-if="!isEditing" class="individual-txn-status">
        <span v-if="transaction.hasIndividualClassification" class="status-chip individual">
          Personalizada · D {{ transaction.codigoDebito }} / C {{ transaction.codigoCredito }}
        </span>
        <span v-else class="status-chip inherited">
          Herda do grupo · D {{ groupDebito }} / C {{ groupCredito }}
        </span>
      </div>

      <div v-if="!isEditing" class="individual-txn-actions">
        <button
          v-if="!transaction.hasIndividualClassification"
          type="button"
          class="individual-action-btn primary"
          @click="startEdit"
        >
          Personalizar
        </button>
        <template v-else>
          <button type="button" class="individual-action-btn" @click="startEdit">Editar</button>
          <button type="button" class="individual-action-btn danger" @click="remove">Usar grupo</button>
        </template>
      </div>
    </div>

    <p v-if="showDescription && transaction.descricao" class="individual-txn-description">
      {{ transaction.descricao }}
    </p>

    <div v-if="isEditing" class="individual-txn-form">
      <p class="individual-form-hint">
        {{ isPositive ? 'Entrada: informe o código de crédito.' : 'Saída: informe o código de débito.' }}
        O outro campo usa o código do banco automaticamente.
      </p>

      <div class="individual-classification-fields">
        <div class="code-input-group">
          <label>Código Débito</label>
          <input
            v-model="localDebito"
            type="text"
            inputmode="numeric"
            placeholder="Ex: 1234"
            :class="{ error: debitoError }"
            :readonly="isDebitoReadonly"
            @input="validateField('debito')"
          >
          <span v-if="debitoError" class="error-message">{{ debitoError }}</span>
          <span v-else-if="isDebitoReadonly" class="field-hint">Preenchido pelo código do banco</span>
        </div>

        <div class="code-input-group">
          <label>Código Crédito</label>
          <input
            v-model="localCredito"
            type="text"
            inputmode="numeric"
            placeholder="Ex: 5678"
            :class="{ error: creditoError }"
            :readonly="isCreditoReadonly"
            @input="validateField('credito')"
          >
          <span v-if="creditoError" class="error-message">{{ creditoError }}</span>
          <span v-else-if="isCreditoReadonly" class="field-hint">Preenchido pelo código do banco</span>
        </div>

        <div class="individual-form-buttons">
          <button type="button" class="save-individual-button" :disabled="!canSave" @click="save">
            Aplicar
          </button>
          <button type="button" class="cancel-individual-button" @click="cancelEdit">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>
