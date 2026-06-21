<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  embedded?: boolean
  showSearchSection: boolean
  currentSearchType: 'description' | 'value'
  searchByDescription: string
  searchByValue: string
  searchResults: any[]
  searchResultsPositive: any[]
  searchResultsNegative: any[]
  batchCodesPositive: { debito: string; credito: string }
  batchCodesNegative: { debito: string; credito: string }
  valueResultsCount?: number
}>()

defineEmits<{
  toggleVisibility: []
  setSearchType: [type: 'description' | 'value']
  'update:searchByDescription': [value: string]
  'update:searchByValue': [value: string]
  clearSearch: []
  applyBatch: [type: 'positive' | 'negative']
  'update:batchCodesPositive': [value: { debito: string; credito: string }]
  'update:batchCodesNegative': [value: { debito: string; credito: string }]
}>()

const activeQuery = computed(() =>
  props.currentSearchType === 'description' ? props.searchByDescription.trim() : props.searchByValue.trim()
)

const isValueQueryInvalid = computed(() => {
  if (props.currentSearchType !== 'value' || !props.searchByValue.trim()) return false
  const parsed = parseFloat(props.searchByValue.replace(',', '.'))
  return Number.isNaN(parsed)
})

const showDescriptionBatch = computed(
  () => props.currentSearchType === 'description' && props.searchByDescription.trim() && props.searchResults.length > 0
)

const showDescriptionEmpty = computed(
  () => props.currentSearchType === 'description' && props.searchByDescription.trim() && props.searchResults.length === 0
)

const showValueResults = computed(
  () => props.currentSearchType === 'value' && props.searchByValue.trim() && !isValueQueryInvalid.value && (props.valueResultsCount ?? 0) > 0
)

const showValueEmpty = computed(
  () => props.currentSearchType === 'value' && props.searchByValue.trim() && !isValueQueryInvalid.value && (props.valueResultsCount ?? 0) === 0
)

function isGroupClassified(group: any) {
  return !!(group.codigoDebito && group.codigoCredito)
}

function txnCount(group: any) {
  return group.transacoesDetalhadas?.length ?? group.transacoes?.length ?? 0
}
</script>

<template>
  <div class="clf-search" :class="{ 'clf-search--embedded': embedded }">
    <div v-if="!embedded" class="clf-search__toggle" @click="$emit('toggleVisibility')">
      <span>Busca e classificação em lote</span>
      <svg class="clf-search__chevron" :class="{ open: showSearchSection }" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7,10L12,15L17,10H7Z" />
      </svg>
    </div>

    <div v-if="embedded || showSearchSection" class="clf-search__body">
      <div class="clf-search__top">
        <div class="clf-search__modes" role="tablist" aria-label="Tipo de busca">
          <button
            type="button"
            role="tab"
            class="clf-search__mode"
            :class="{ active: currentSearchType === 'description' }"
            :aria-selected="currentSearchType === 'description'"
            @click="$emit('setSearchType', 'description')"
          >
            Descrição
          </button>
          <button
            type="button"
            role="tab"
            class="clf-search__mode"
            :class="{ active: currentSearchType === 'value' }"
            :aria-selected="currentSearchType === 'value'"
            @click="$emit('setSearchType', 'value')"
          >
            Valor
          </button>
        </div>

        <div class="clf-search__field">
          <svg class="clf-search__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
          <input
            v-if="currentSearchType === 'description'"
            type="search"
            :value="searchByDescription"
            placeholder="Palavra na descrição (ex: pix, tarifa, salário)…"
            class="clf-search__input"
            aria-label="Buscar por descrição"
            @input="$emit('update:searchByDescription', ($event.target as HTMLInputElement).value)"
          >
          <input
            v-else
            type="search"
            :value="searchByValue"
            placeholder="Valor exato (ex: 150,50 ou -89,90)…"
            class="clf-search__input"
            aria-label="Buscar por valor"
            @input="$emit('update:searchByValue', ($event.target as HTMLInputElement).value)"
          >
          <button
            v-if="activeQuery"
            type="button"
            class="clf-search__clear"
            aria-label="Limpar busca"
            @click="$emit('clearSearch')"
          >
            ×
          </button>
        </div>
      </div>

      <p class="clf-search__hint">
        <template v-if="currentSearchType === 'description'">
          Encontra descrições que contenham a palavra digitada. Use para aplicar o mesmo código a várias de uma vez.
        </template>
        <template v-else>
          Localiza transações com valor exato (positivo ou negativo). Os resultados aparecem na lista abaixo para personalizar.
        </template>
      </p>

      <p v-if="isValueQueryInvalid" class="clf-search__alert" role="alert">
        Digite um valor numérico válido (use vírgula ou ponto para centavos).
      </p>

      <div v-if="showDescriptionEmpty" class="clf-search__empty">
        Nenhuma descrição contém «{{ searchByDescription.trim() }}». Tente outra palavra ou parte dela.
      </div>

      <div v-if="showValueEmpty" class="clf-search__empty">
        Nenhuma transação com valor {{ searchByValue.trim() }}.
      </div>

      <div v-if="showValueResults" class="clf-search__value-banner">
        <strong>{{ valueResultsCount }}</strong>
        {{ valueResultsCount === 1 ? 'transação encontrada' : 'transações encontradas' }}
        — role a lista abaixo para classificar individualmente.
      </div>

      <template v-if="showDescriptionBatch">
        <div class="clf-search__summary">
          <span class="clf-search__summary-count">{{ searchResults.length }} descrições</span>
          <span v-if="searchResultsPositive.length" class="clf-search__summary-tag income">
            {{ searchResultsPositive.length }} entradas
          </span>
          <span v-if="searchResultsNegative.length" class="clf-search__summary-tag expense">
            {{ searchResultsNegative.length }} saídas
          </span>
        </div>

        <div class="clf-search__batch-grid">
          <section v-if="searchResultsPositive.length > 0" class="clf-search__batch clf-search__batch--income">
            <header class="clf-search__batch-head">
              <h4>Entradas</h4>
              <span>{{ searchResultsPositive.length }}</span>
            </header>

            <div class="clf-search__batch-form">
              <label for="batch-credito">Código crédito</label>
              <div class="clf-search__batch-row">
                <input
                  id="batch-credito"
                  type="text"
                  inputmode="numeric"
                  :value="batchCodesPositive.credito"
                  placeholder="Ex: 5678"
                  @input="
                    $emit('update:batchCodesPositive', {
                      ...batchCodesPositive,
                      credito: ($event.target as HTMLInputElement).value,
                    })
                  "
                >
                <button
                  type="button"
                  class="clf-search__apply clf-search__apply--income"
                  :disabled="!batchCodesPositive.credito"
                  @click="$emit('applyBatch', 'positive')"
                >
                  Aplicar
                </button>
              </div>
              <p class="clf-search__batch-note">Débito usa o código do banco quando vazio.</p>
            </div>

            <ul class="clf-search__preview" aria-label="Descrições de entrada encontradas">
              <li v-for="group in searchResultsPositive" :key="`pos-${group.descricao}`">
                <span class="clf-search__preview-text" :title="group.descricao">{{ group.descricao }}</span>
                <span class="clf-search__preview-meta">
                  <span class="clf-search__preview-count">{{ txnCount(group) }} txn</span>
                  <span
                    class="clf-search__preview-status"
                    :class="isGroupClassified(group) ? 'done' : 'pending'"
                  >
                    {{ isGroupClassified(group) ? 'OK' : 'Pend.' }}
                  </span>
                </span>
              </li>
            </ul>
          </section>

          <section v-if="searchResultsNegative.length > 0" class="clf-search__batch clf-search__batch--expense">
            <header class="clf-search__batch-head">
              <h4>Saídas</h4>
              <span>{{ searchResultsNegative.length }}</span>
            </header>

            <div class="clf-search__batch-form">
              <label for="batch-debito">Código débito</label>
              <div class="clf-search__batch-row">
                <input
                  id="batch-debito"
                  type="text"
                  inputmode="numeric"
                  :value="batchCodesNegative.debito"
                  placeholder="Ex: 1234"
                  @input="
                    $emit('update:batchCodesNegative', {
                      ...batchCodesNegative,
                      debito: ($event.target as HTMLInputElement).value,
                    })
                  "
                >
                <button
                  type="button"
                  class="clf-search__apply clf-search__apply--expense"
                  :disabled="!batchCodesNegative.debito"
                  @click="$emit('applyBatch', 'negative')"
                >
                  Aplicar
                </button>
              </div>
              <p class="clf-search__batch-note">Crédito usa o código do banco quando vazio.</p>
            </div>

            <ul class="clf-search__preview" aria-label="Descrições de saída encontradas">
              <li v-for="group in searchResultsNegative" :key="`neg-${group.descricao}`">
                <span class="clf-search__preview-text" :title="group.descricao">{{ group.descricao }}</span>
                <span class="clf-search__preview-meta">
                  <span class="clf-search__preview-count">{{ txnCount(group) }} txn</span>
                  <span
                    class="clf-search__preview-status"
                    :class="isGroupClassified(group) ? 'done' : 'pending'"
                  >
                    {{ isGroupClassified(group) ? 'OK' : 'Pend.' }}
                  </span>
                </span>
              </li>
            </ul>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.clf-search {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.clf-search--embedded {
  border: none;
  background: transparent;
  border-radius: 0;
}

.clf-search__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  color: #ccc;
}

.clf-search__chevron {
  width: 18px;
  height: 18px;
  fill: #888;
  transition: transform 0.2s;
}

.clf-search__chevron.open {
  transform: rotate(180deg);
}

.clf-search__body {
  padding: 0.85rem 1rem 1rem;
}

.clf-search--embedded .clf-search__body {
  padding: 0;
}

.clf-search__top {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: stretch;
}

.clf-search__modes {
  display: inline-flex;
  padding: 2px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.clf-search__mode {
  padding: 0.45rem 0.85rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #888;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.clf-search__mode.active {
  background: rgba(249, 203, 40, 0.15);
  color: #f9cb28;
}

.clf-search__field {
  flex: 1 1 220px;
  position: relative;
  display: flex;
  align-items: center;
}

.clf-search__icon {
  position: absolute;
  left: 0.65rem;
  width: 16px;
  height: 16px;
  fill: #666;
  pointer-events: none;
}

.clf-search__input {
  width: 100%;
  padding: 0.55rem 2rem 0.55rem 2.15rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.35);
  color: #eee;
  font-size: 0.85rem;
  font-family: inherit;
  transition: border-color 0.15s;
}

.clf-search__input:focus {
  outline: none;
  border-color: rgba(249, 203, 40, 0.45);
}

.clf-search__input::placeholder {
  color: #555;
}

.clf-search__clear {
  position: absolute;
  right: 0.35rem;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: #aaa;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.clf-search__clear:hover {
  background: rgba(255, 77, 77, 0.15);
  color: #ff6b6b;
}

.clf-search__hint {
  margin: 0.55rem 0 0;
  font-size: 0.74rem;
  color: #666;
  line-height: 1.45;
}

.clf-search__alert {
  margin: 0.55rem 0 0;
  padding: 0.5rem 0.65rem;
  border-radius: 6px;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.25);
  color: #ff8a80;
  font-size: 0.78rem;
}

.clf-search__empty {
  margin-top: 0.65rem;
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 0.82rem;
  text-align: center;
}

.clf-search__value-banner {
  margin-top: 0.65rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: rgba(249, 203, 40, 0.08);
  border: 1px solid rgba(249, 203, 40, 0.2);
  font-size: 0.8rem;
  color: #bbb;
}

.clf-search__value-banner strong {
  color: #f9cb28;
}

.clf-search__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.clf-search__summary-count {
  font-size: 0.78rem;
  font-weight: 700;
  color: #ddd;
}

.clf-search__summary-tag {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}

.clf-search__summary-tag.income {
  background: rgba(76, 175, 80, 0.12);
  color: #81c784;
}

.clf-search__summary-tag.expense {
  background: rgba(255, 77, 77, 0.12);
  color: #ef9a9a;
}

.clf-search__batch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.clf-search__batch {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.clf-search__batch--income {
  border-top: 2px solid rgba(76, 175, 80, 0.55);
}

.clf-search__batch--expense {
  border-top: 2px solid rgba(255, 77, 77, 0.55);
}

.clf-search__batch-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.75rem;
  background: rgba(0, 0, 0, 0.2);
}

.clf-search__batch-head h4 {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.clf-search__batch--income .clf-search__batch-head h4 {
  color: #81c784;
}

.clf-search__batch--expense .clf-search__batch-head h4 {
  color: #ef9a9a;
}

.clf-search__batch-head span {
  font-size: 0.72rem;
  color: #777;
  font-weight: 600;
}

.clf-search__batch-form {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.clf-search__batch-form label {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  color: #888;
  margin-bottom: 0.35rem;
}

.clf-search__batch-row {
  display: flex;
  gap: 0.45rem;
}

.clf-search__batch-row input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.65rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 0.85rem;
  font-family: inherit;
}

.clf-search__batch-row input:focus {
  outline: none;
  border-color: rgba(249, 203, 40, 0.4);
}

.clf-search__apply {
  flex-shrink: 0;
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s;
}

.clf-search__apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.clf-search__apply--income {
  background: #388e3c;
}

.clf-search__apply--expense {
  background: #c62828;
}

.clf-search__batch-note {
  margin: 0.4rem 0 0;
  font-size: 0.68rem;
  color: #555;
  line-height: 1.35;
}

.clf-search__preview {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 160px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;
}

.clf-search__preview li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.76rem;
}

.clf-search__preview-text {
  flex: 1;
  min-width: 0;
  color: #bbb;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.clf-search__preview-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  flex-shrink: 0;
}

.clf-search__preview-count {
  font-size: 0.65rem;
  color: #666;
}

.clf-search__preview-status {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
}

.clf-search__preview-status.done {
  background: rgba(76, 175, 80, 0.15);
  color: #81c784;
}

.clf-search__preview-status.pending {
  background: rgba(255, 77, 77, 0.12);
  color: #ef9a9a;
}

@media (max-width: 640px) {
  .clf-search__top {
    flex-direction: column;
  }

  .clf-search__modes {
    width: 100%;
  }

  .clf-search__mode {
    flex: 1;
    text-align: center;
  }

  .clf-search__batch-grid {
    grid-template-columns: 1fr;
  }
}
</style>
