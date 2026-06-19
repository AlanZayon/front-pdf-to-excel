<script lang="ts" setup>
defineProps<{
  showSearchSection: boolean
  currentSearchType: 'description' | 'value'
  searchByDescription: string
  searchByValue: string
  searchResults: any[]
  searchResultsPositive: any[]
  searchResultsNegative: any[]
  batchCodesPositive: { debito: string; credito: string }
  batchCodesNegative: { debito: string; credito: string }
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
</script>

<template>
  <div class="single-search-section">
    <div class="search-toggle-header" @click="$emit('toggleVisibility')">
      <div class="search-header-title">
        <svg class="search-toggle-icon" :class="{ rotated: showSearchSection }" viewBox="0 0 24 24">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
        BARRA DE PESQUISA
      </div>
    </div>

    <div v-if="showSearchSection" class="search-content">
      <div class="search-type-selector">
        <button
          type="button"
          class="search-type-button"
          :class="{ active: currentSearchType === 'description' }"
          @click="$emit('setSearchType', 'description')"
        >
          PESQUISAR POR DESCRIÇÃO
        </button>
        <button
          type="button"
          class="search-type-button"
          :class="{ active: currentSearchType === 'value' }"
          @click="$emit('setSearchType', 'value')"
        >
          PESQUISAR POR VALOR
        </button>
      </div>

      <p v-if="currentSearchType === 'value'" class="search-type-hint">
        Encontre transações pelo valor exato para personalizar códigos rapidamente.
      </p>

      <div class="search-container">
        <div class="search-header">
          {{ currentSearchType === 'description' ? 'PESQUISAR POR DESCRIÇÃO' : 'PESQUISAR POR VALOR' }}
        </div>
        <div class="search-input-group">
          <svg class="search-icon" viewBox="0 0 24 24">
            <path
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
          <input
            v-if="currentSearchType === 'description'"
            type="text"
            :value="searchByDescription"
            placeholder="Digite a descrição..."
            class="search-input"
            @input="$emit('update:searchByDescription', ($event.target as HTMLInputElement).value)"
          >
          <input
            v-else
            type="text"
            :value="searchByValue"
            placeholder="Digite o valor (ex: 150.50)..."
            class="search-input"
            @input="$emit('update:searchByValue', ($event.target as HTMLInputElement).value)"
          >
          <button
            v-if="(currentSearchType === 'description' && searchByDescription) || (currentSearchType === 'value' && searchByValue)"
            type="button"
            class="clear-search-button"
            @click="$emit('clearSearch')"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="searchByDescription && searchResults.length > 0" class="batch-classification-section">
        <div class="search-results">
          <div class="search-stats">
            Encontradas {{ searchResults.length }} descrições
            <span v-if="searchResultsPositive.length > 0">
              ({{ searchResultsPositive.length }} positivas, {{ searchResultsNegative.length }} negativas)
            </span>
          </div>

          <div v-if="searchResultsPositive.length > 0" class="batch-classification-group">
            <h4 class="batch-group-title positive">({{ searchResultsPositive.length }})</h4>
            <div class="batch-input-fields">
              <div class="code-input-group">
                <label>Código Crédito (Positivas):</label>
                <input
                  type="text"
                  :value="batchCodesPositive.credito"
                  placeholder="Ex: 5678"
                  class="batch-input"
                  @input="
                    $emit('update:batchCodesPositive', {
                      ...batchCodesPositive,
                      credito: ($event.target as HTMLInputElement).value,
                    })
                  "
                >
              </div>
              <button
                type="button"
                class="batch-apply-button"
                :disabled="!batchCodesPositive.credito"
                @click="$emit('applyBatch', 'positive')"
              >
                APLICAR PARA {{ searchResultsPositive.length }} ENTRADAS
              </button>
            </div>
          </div>

          <div v-if="searchResultsNegative.length > 0" class="batch-classification-group">
            <h4 class="batch-group-title negative">SAÍDAS ({{ searchResultsNegative.length }})</h4>
            <div class="batch-input-fields">
              <div class="code-input-group">
                <label>Código Débito (Negativas):</label>
                <input
                  type="text"
                  :value="batchCodesNegative.debito"
                  placeholder="Ex: 1234"
                  class="batch-input"
                  @input="
                    $emit('update:batchCodesNegative', {
                      ...batchCodesNegative,
                      debito: ($event.target as HTMLInputElement).value,
                    })
                  "
                >
              </div>
              <button
                type="button"
                class="batch-apply-button"
                :disabled="!batchCodesNegative.debito"
                @click="$emit('applyBatch', 'negative')"
              >
                APLICAR PARA {{ searchResultsNegative.length }} SAÍDAS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
