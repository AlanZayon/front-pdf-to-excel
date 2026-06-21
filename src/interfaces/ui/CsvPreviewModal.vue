<script lang="ts" setup>
import { computed, toRef } from 'vue'
import AppModal from './AppModal.vue'
import { useCsvPreview } from '../../shared/composables/useCsvPreview'
import {
  downloadTextAsCsv,
  formatValorForInput,
  getFileKindLabel,
  type EditableCsvField,
} from '../../shared/utils/csvPreview'
import { notifyError, notifySuccess } from '../../shared/composables/useToast'

const props = defineProps<{
  visible: boolean
  fileName?: string
  jobId?: string
}>()

defineEmits<{ close: [] }>()

const {
  loading,
  error,
  searchQuery,
  viewMode,
  page,
  pageSize,
  summary,
  filteredSummary,
  totalPages,
  paginatedRows,
  displayRangeLabel,
  filteredRows,
  isDirty,
  isEditing,
  rawEditText,
  rawEditError,
  rawDisplayText,
  loadPreview,
  updateRowField,
  setViewMode,
  enterEditMode,
  exitEditMode,
  setPage,
  setPageSize,
  discardEdits,
  getDownloadText,
} = useCsvPreview({
  visible: toRef(props, 'visible'),
  fileName: toRef(props, 'fileName'),
  jobId: toRef(props, 'jobId'),
})

const fileKindLabel = computed(() => getFileKindLabel(props.fileName))
const isFiltered = computed(() => searchQuery.value.trim().length > 0)
const activeSummary = computed(() => (isFiltered.value ? filteredSummary.value : summary.value))

function onFieldChange(lineNumber: number, field: EditableCsvField, event: Event) {
  updateRowField(lineNumber, field, (event.target as HTMLInputElement).value)
}

function switchViewMode(mode: 'table' | 'raw') {
  if (!setViewMode(mode)) {
    notifyError(rawEditError.value || 'Não foi possível aplicar as alterações do texto bruto.')
  }
}

function handleEnterEditMode() {
  enterEditMode()
}

function handleViewModeClick() {
  if (isEditing.value) handleExitEditMode()
}

function handleEditModeClick() {
  if (!isEditing.value) handleEnterEditMode()
}

function handleExitEditMode() {
  if (!exitEditMode()) {
    notifyError(rawEditError.value || 'Corrija o texto bruto antes de voltar à visualização.')
  }
}

async function copyVisibleRows() {
  const text =
    viewMode.value === 'raw'
      ? isEditing.value
        ? rawEditText.value
        : rawDisplayText.value
      : paginatedRows.value.map((row) => row.rawLine).join('\n')

  if (!text.trim()) {
    notifyError('Nada para copiar.')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    notifySuccess('Linhas copiadas para a área de transferência.')
  } catch {
    notifyError('Não foi possível copiar. Tente baixar o arquivo.')
  }
}

function handleDownload() {
  const content = getDownloadText()
  if (!content) {
    notifyError(rawEditError.value || 'Corrija o CSV antes de baixar.')
    return
  }

  downloadTextAsCsv(content, props.fileName || 'conversao.csv')
  notifySuccess(isDirty.value ? 'CSV editado baixado com sucesso.' : 'CSV baixado com sucesso.')
}

function handleDiscardEdits() {
  discardEdits()
  notifySuccess('Alterações descartadas.')
}</script>

<template>
  <AppModal :visible="visible" :panel-scroll="false" title-id="csv-preview-title" @close="$emit('close')">
    <div class="csv-preview-modal" role="document">
      <header class="preview-top">
        <div class="preview-title-block">
          <h2 id="csv-preview-title">Pré-visualização do CSV</h2>
          <p class="preview-subtitle">
            {{
              isEditing
                ? 'Modo edição — ajuste os lançamentos e baixe o CSV corrigido.'
                : 'Revise os lançamentos antes de importar no Domínio Contábil.'
            }}
          </p>
        </div>
        <div class="preview-top-actions">
          <span v-if="isEditing" class="mode-badge mode-badge-edit">Editando</span>
          <span v-else-if="isDirty" class="dirty-badge">Alterações pendentes</span>
          <button type="button" class="icon-close" aria-label="Fechar pré-visualização" @click="$emit('close')">
            ×
          </button>
        </div>
      </header>

      <div v-if="fileName" class="file-badge-row">
        <span class="file-badge">{{ fileKindLabel }}</span>
        <span class="file-name">{{ fileName }}</span>
      </div>

      <div v-if="loading" class="loading-state" aria-busy="true">
        <div class="skeleton skeleton-stats" />
        <div class="skeleton skeleton-toolbar" />
        <div class="skeleton skeleton-table" />
        <p class="loading-label">Carregando lançamentos…</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button type="button" class="btn-secondary" @click="loadPreview">Tentar novamente</button>
      </div>

      <template v-else>
        <div class="preview-body">
        <section class="summary-grid" aria-label="Resumo do arquivo">
          <article class="summary-card">
            <span class="summary-label">Lançamentos</span>
            <strong class="summary-value">{{ activeSummary.totalRows }}</strong>
            <span v-if="isFiltered" class="summary-hint">de {{ summary.totalRows }} no arquivo</span>
          </article>
          <article class="summary-card">
            <span class="summary-label">Valor total</span>
            <strong class="summary-value">{{ activeSummary.totalValorFormatted }}</strong>
          </article>
          <article class="summary-card">
            <span class="summary-label">Período</span>
            <strong class="summary-value summary-value-sm">
              {{
                activeSummary.dateMin && activeSummary.dateMax
                  ? `${activeSummary.dateMin} — ${activeSummary.dateMax}`
                  : '—'
              }}
            </strong>
          </article>
          <article class="summary-card">
            <span class="summary-label">Históricos únicos</span>
            <strong class="summary-value">{{ activeSummary.uniqueDescriptions }}</strong>
          </article>
        </section>

        <div class="info-banner">
          Formato fixo Domínio: Tipo · Data (DDMMAAAA) · Débito · Crédito · Valor · Histórico.
          {{
            isEditing
              ? 'Altere os campos na tabela ou no texto bruto. Use Visualizar para conferir sem editar.'
              : 'Use Editar para corrigir inconsistências antes de baixar o arquivo.'
          }}
        </div>

        <div class="toolbar">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              class="search-input"
              placeholder="Buscar por histórico, código, data ou valor…"
              aria-label="Buscar lançamentos"
            >
          </div>

          <div class="toolbar-actions">
            <div class="mode-toggle" role="group" aria-label="Modo da pré-visualização">
              <button
                type="button"
                class="mode-toggle-btn"
                :class="{ active: !isEditing }"
                :aria-pressed="!isEditing"
                @click="handleViewModeClick"
              >
                Visualizar
              </button>
              <button
                type="button"
                class="mode-toggle-btn"
                :class="{ active: isEditing }"
                :aria-pressed="isEditing"
                @click="handleEditModeClick"
              >
                Editar
              </button>
            </div>

            <div class="view-toggle" role="tablist" aria-label="Formato de exibição">
              <button
                type="button"
                role="tab"
                class="view-toggle-btn"
                :class="{ active: viewMode === 'table' }"
                :aria-selected="viewMode === 'table'"
                @click="switchViewMode('table')"
              >
                Tabela
              </button>
              <button
                type="button"
                role="tab"
                class="view-toggle-btn"
                :class="{ active: viewMode === 'raw' }"
                :aria-selected="viewMode === 'raw'"
                @click="switchViewMode('raw')"
              >
                Texto bruto
              </button>
            </div>

            <button v-if="isEditing && isDirty" type="button" class="btn-ghost" @click="handleDiscardEdits">
              Descartar
            </button>

            <button type="button" class="btn-ghost" @click="copyVisibleRows">
              Copiar {{ viewMode === 'table' ? 'página' : 'resultados' }}
            </button>
          </div>
        </div>

        <div v-if="viewMode === 'table'" class="table-panel">
          <div v-if="filteredRows.length === 0" class="empty-filter">
            Nenhum lançamento corresponde à busca.
          </div>

          <div v-else class="table-scroll app-scrollbar">
            <table class="preview-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Data</th>
                  <th scope="col">Débito</th>
                  <th scope="col">Crédito</th>
                  <th scope="col" class="col-valor">Valor</th>
                  <th scope="col">Histórico</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in paginatedRows" :key="row.lineNumber">
                  <td class="col-line">{{ row.lineNumber }}</td>
                  <template v-if="isEditing">
                    <td>
                      <input
                        class="cell-input cell-input-sm"
                        :value="row.tipo"
                        aria-label="Tipo"
                        @change="onFieldChange(row.lineNumber, 'tipo', $event)"
                      >
                    </td>
                    <td class="col-date">
                      <input
                        class="cell-input cell-input-date"
                        :value="row.dataFormatted"
                        aria-label="Data"
                        inputmode="numeric"
                        placeholder="DD/MM/AAAA"
                        @change="onFieldChange(row.lineNumber, 'data', $event)"
                      >
                    </td>
                    <td class="col-code">
                      <input
                        class="cell-input cell-input-code"
                        :value="row.debito"
                        aria-label="Débito"
                        @change="onFieldChange(row.lineNumber, 'debito', $event)"
                      >
                    </td>
                    <td class="col-code">
                      <input
                        class="cell-input cell-input-code"
                        :value="row.credito"
                        aria-label="Crédito"
                        @change="onFieldChange(row.lineNumber, 'credito', $event)"
                      >
                    </td>
                    <td class="col-valor">
                      <input
                        class="cell-input cell-input-valor"
                        :value="formatValorForInput(row.valor)"
                        aria-label="Valor"
                        inputmode="decimal"
                        @change="onFieldChange(row.lineNumber, 'valor', $event)"
                      >
                    </td>
                    <td class="col-desc">
                      <input
                        class="cell-input cell-input-desc"
                        :value="row.descricao"
                        aria-label="Histórico"
                        @change="onFieldChange(row.lineNumber, 'descricao', $event)"
                      >
                    </td>
                  </template>
                  <template v-else>
                    <td>{{ row.tipo }}</td>
                    <td class="col-date">{{ row.dataFormatted }}</td>
                    <td class="col-code">{{ row.debito }}</td>
                    <td class="col-code">{{ row.credito }}</td>
                    <td class="col-valor">{{ row.valorFormatted }}</td>
                    <td class="col-desc">{{ row.descricao }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>

          <footer v-if="filteredRows.length > 0" class="table-footer">
            <span class="range-label">{{ displayRangeLabel }} lançamentos</span>

            <div class="page-size">
              <label for="csv-page-size">Por página</label>
              <select id="csv-page-size" :value="pageSize" @change="setPageSize(Number(($event.target as HTMLSelectElement).value))">
                <option :value="50">50</option>
                <option :value="75">75</option>
                <option :value="100">100</option>
                <option :value="150">150</option>
              </select>
            </div>

            <div class="pagination">
              <button type="button" class="page-btn" :disabled="page <= 1" @click="setPage(page - 1)">
                Anterior
              </button>
              <span class="page-indicator">{{ page }} / {{ totalPages }}</span>
              <button type="button" class="page-btn" :disabled="page >= totalPages" @click="setPage(page + 1)">
                Próxima
              </button>
            </div>
          </footer>
        </div>

        <div v-else class="raw-panel">
          <textarea
            v-if="isEditing"
            v-model="rawEditText"
            class="raw-editor app-scrollbar"
            aria-label="Editar conteúdo bruto do CSV"
            spellcheck="false"
          />
          <template v-else>
            <div v-if="!rawDisplayText" class="empty-filter">Nenhuma linha corresponde à busca.</div>
            <pre v-else class="raw-content app-scrollbar" aria-label="Conteúdo bruto do CSV">{{ rawDisplayText }}</pre>
          </template>
          <p v-if="isEditing && rawEditError" class="raw-error" role="alert">{{ rawEditError }}</p>
          <p v-else class="raw-meta">
            {{
              isEditing
                ? 'Edite linha a linha no formato Domínio. Volte para Visualizar para conferir o resultado.'
                : 'Visualização somente leitura. Clique em Editar para modificar o arquivo.'
            }}
          </p>
        </div>
        </div>
      </template>

      <footer class="preview-footer">
        <button type="button" class="btn-secondary" @click="$emit('close')">Fechar</button>
        <button type="button" class="btn-primary" :disabled="loading || !!error" @click="handleDownload">
          {{ isDirty ? 'Baixar CSV editado' : 'Baixar CSV' }}
        </button>
      </footer>
    </div>
  </AppModal>
</template>

<style scoped>
.csv-preview-modal {
  background: #141414;
  border: 1px solid #333;
  border-radius: 12px;
  width: min(1400px, 98vw);
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  color: #e8e8e8;
  font-family: 'Montserrat', sans-serif;
  overflow: hidden;
}

.preview-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem 0.5rem;
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
}

.preview-title-block h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 700;
}

.preview-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: #999;
  line-height: 1.35;
}

.preview-top-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.mode-badge {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.mode-badge-edit {
  background: rgba(33, 150, 243, 0.12);
  border: 1px solid rgba(33, 150, 243, 0.35);
  color: #7ec8ff;
}

.dirty-badge {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(249, 203, 40, 0.12);
  border: 1px solid rgba(249, 203, 40, 0.35);
  color: #f9cb28;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.icon-close {
  background: transparent;
  border: none;
  color: #888;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  border-radius: 6px;
}

.icon-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.file-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.file-badge {
  background: rgba(249, 203, 40, 0.15);
  color: #f9cb28;
  border: 1px solid rgba(249, 203, 40, 0.35);
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.file-name {
  font-size: 0.85rem;
  color: #aaa;
}

.preview-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;
  padding: 0 1rem 0.35rem;
  flex-shrink: 0;
}

.summary-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid #2e2e2e;
  border-radius: 6px;
  padding: 0.45rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.summary-label {
  font-size: 0.72rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.summary-value {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 700;
}

.summary-value-sm {
  font-size: 0.82rem;
  line-height: 1.25;
}

.summary-hint {
  font-size: 0.72rem;
  color: #666;
}

.info-banner {
  margin: 0 1rem 0.35rem;
  padding: 0.35rem 0.6rem;
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.25);
  border-radius: 6px;
  font-size: 0.72rem;
  color: #b8ddb9;
  line-height: 1.35;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 0.35rem;
  flex-shrink: 0;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  fill: #666;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.45rem 0.65rem 0.45rem 2.1rem;
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.82rem;
}

.search-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mode-toggle {
  display: inline-flex;
  border: 1px solid rgba(249, 203, 40, 0.35);
  border-radius: 6px;
  overflow: hidden;
}

.mode-toggle-btn {
  background: transparent;
  border: none;
  color: #aaa;
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.mode-toggle-btn.active {
  background: rgba(249, 203, 40, 0.15);
  color: #f9cb28;
}

.mode-toggle-btn:not(.active):hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.view-toggle {
  display: inline-flex;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
}

.view-toggle-btn {
  background: transparent;
  border: none;
  color: #aaa;
  padding: 0.45rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.view-toggle-btn.active {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.btn-ghost,
.btn-secondary,
.btn-primary {
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 40px;
  padding: 0.45rem 0.85rem;
}

.btn-ghost {
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
}

.btn-ghost:hover {
  border-color: #666;
  color: #fff;
}

.table-panel,
.raw-panel {
  flex: 1;
  min-height: 0;
  padding: 0 1rem 0.25rem;
  display: flex;
  flex-direction: column;
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  background: #0a0a0a;
  scroll-padding-bottom: 0.75rem;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  table-layout: fixed;
}

.preview-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.preview-table th {
  background: #1f1f1f;
  color: #f9cb28;
  text-align: left;
  padding: 0.32rem 0.45rem;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #333;
  white-space: nowrap;
}

.preview-table td {
  padding: 0.24rem 0.45rem;
  border-bottom: 1px solid #1e1e1e;
  vertical-align: middle;
}

.preview-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.cell-input {
  width: 100%;
  min-width: 0;
  padding: 0.2rem 0.35rem;
  border-radius: 4px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.cell-input:hover {
  border-color: rgba(255, 255, 255, 0.12);
}

.cell-input:focus {
  outline: none;
  border-color: rgba(249, 203, 40, 0.45);
  background: rgba(249, 203, 40, 0.06);
}

.cell-input-sm {
  max-width: 52px;
}

.cell-input-code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  max-width: 88px;
}

.cell-input-date {
  min-width: 108px;
  width: 108px;
  max-width: 108px;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  white-space: nowrap;
  color: #f9cb28;
  font-weight: 600;
}

.cell-input-valor {
  text-align: right;
  max-width: 96px;
  font-weight: 700;
  color: #4caf50;
}

.cell-input-desc {
  min-width: 180px;
}

.col-line {
  color: #666;
  width: 40px;
}

.col-date {
  white-space: nowrap;
  color: #f9cb28;
  font-weight: 600;
  width: 118px;
  min-width: 118px;
}

.col-code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  color: #9cdcfe;
}

.col-valor {
  text-align: right;
  white-space: nowrap;
  font-weight: 700;
  color: #4caf50;
}

.col-desc {
  max-width: 520px;
  word-break: break-word;
}

.table-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0 0.45rem;
  font-size: 0.76rem;
  color: #888;
  flex-shrink: 0;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.page-size select {
  background: #0d0d0d;
  border: 1px solid #333;
  color: #fff;
  border-radius: 4px;
  padding: 0.25rem 0.4rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
  border-radius: 4px;
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  font-size: 0.78rem;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  min-width: 4rem;
  text-align: center;
}

.raw-panel {
  padding-bottom: 0.75rem;
}

.raw-editor {
  width: 100%;
  min-height: 0;
  flex: 1;
  margin: 0;
  padding: 0.85rem;
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: auto;
  resize: vertical;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #ccc;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  box-sizing: border-box;
}

.raw-editor:focus {
  outline: none;
  border-color: rgba(249, 203, 40, 0.45);
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.12);
}

.raw-error {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: #ff8a8a;
}

.raw-meta {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: #666;
}

.raw-content {
  margin: 0;
  padding: 0.85rem;
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: auto;
  flex: 1;
  min-height: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #ccc;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-filter {
  padding: 2rem 1rem;
  text-align: center;
  color: #888;
  border: 1px dashed #333;
  border-radius: 8px;
}

.loading-state {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 1rem 1.25rem 1.5rem;
}

.skeleton {
  background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.skeleton-stats {
  height: 72px;
}

.skeleton-toolbar {
  height: 44px;
}

.skeleton-table {
  height: 220px;
}

.loading-label {
  text-align: center;
  color: #888;
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.error-state {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 2rem 1.25rem;
  text-align: center;
}

.error-message {
  color: #ff6b6b;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.65rem 1rem;
  border-top: 1px solid #2a2a2a;
  background: #141414;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.35);
}

.btn-secondary {
  background: transparent;
  border: 1px solid #555;
  color: #ddd;
}

.btn-secondary:hover {
  border-color: #888;
}

.btn-primary {
  background: linear-gradient(to right, #4caf50, #2e7d32);
  border: none;
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: space-between;
  }

  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination {
    justify-content: center;
  }
}
</style>
