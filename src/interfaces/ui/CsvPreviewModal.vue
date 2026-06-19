<script lang="ts" setup>
import { computed, toRef } from 'vue'
import AppModal from './AppModal.vue'
import { FileDownloadService } from '../../infrastructure/services/FileDownloadService'
import { useCsvPreview } from '../../shared/composables/useCsvPreview'
import { getFileKindLabel } from '../../shared/utils/csvPreview'
import { notifyError, notifySuccess } from '../../shared/composables/useToast'

const props = defineProps<{
  visible: boolean
  fileName?: string
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
  rawPreviewLines,
  rawTruncated,
  rawLineCount,
  displayRangeLabel,
  filteredRows,
  loadPreview,
  setViewMode,
  setPage,
  setPageSize,
} = useCsvPreview({
  visible: toRef(props, 'visible'),
  fileName: toRef(props, 'fileName'),
})

const fileKindLabel = computed(() => getFileKindLabel(props.fileName))
const isFiltered = computed(() => searchQuery.value.trim().length > 0)
const activeSummary = computed(() => (isFiltered.value ? filteredSummary.value : summary.value))

async function copyVisibleRows() {
  const text =
    viewMode.value === 'raw'
      ? rawPreviewLines.value.join('\n')
      : paginatedRows.value.map((row) => row.rawLine).join('\n')

  if (!text) {
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

async function handleDownload() {
  try {
    await FileDownloadService.execute(props.fileName)
  } catch {
    notifyError('Erro ao baixar o CSV.')
  }
}
</script>

<template>
  <AppModal :visible="visible" title-id="csv-preview-title" @close="$emit('close')">
    <div class="csv-preview-modal" role="document">
      <header class="preview-top">
        <div class="preview-title-block">
          <h2 id="csv-preview-title">Pré-visualização do CSV</h2>
          <p class="preview-subtitle">Revise os lançamentos antes de importar no Domínio Contábil.</p>
        </div>
        <button type="button" class="icon-close" aria-label="Fechar pré-visualização" @click="$emit('close')">
          ×
        </button>
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
          Confira códigos e valores antes do download.
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
            <div class="view-toggle" role="tablist" aria-label="Modo de visualização">
              <button
                type="button"
                role="tab"
                class="view-toggle-btn"
                :class="{ active: viewMode === 'table' }"
                :aria-selected="viewMode === 'table'"
                @click="setViewMode('table')"
              >
                Tabela
              </button>
              <button
                type="button"
                role="tab"
                class="view-toggle-btn"
                :class="{ active: viewMode === 'raw' }"
                :aria-selected="viewMode === 'raw'"
                @click="setViewMode('raw')"
              >
                Texto bruto
              </button>
            </div>

            <button type="button" class="btn-ghost" @click="copyVisibleRows">
              Copiar {{ viewMode === 'table' ? 'página' : 'resultados' }}
            </button>
          </div>
        </div>

        <div v-if="viewMode === 'table'" class="table-panel">
          <div v-if="filteredRows.length === 0" class="empty-filter">
            Nenhum lançamento corresponde à busca.
          </div>

          <div v-else class="table-scroll">
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
                  <td>{{ row.tipo }}</td>
                  <td class="col-date">{{ row.dataFormatted }}</td>
                  <td class="col-code">{{ row.debito }}</td>
                  <td class="col-code">{{ row.credito }}</td>
                  <td class="col-valor">{{ row.valorFormatted }}</td>
                  <td class="col-desc">{{ row.descricao }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer v-if="filteredRows.length > 0" class="table-footer">
            <span class="range-label">{{ displayRangeLabel }} lançamentos</span>

            <div class="page-size">
              <label for="csv-page-size">Por página</label>
              <select id="csv-page-size" :value="pageSize" @change="setPageSize(Number(($event.target as HTMLSelectElement).value))">
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
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
          <div v-if="rawPreviewLines.length === 0" class="empty-filter">Nenhuma linha corresponde à busca.</div>
          <pre v-else class="raw-content" aria-label="Conteúdo bruto do CSV">{{ rawPreviewLines.join('\n') }}</pre>
          <p v-if="rawPreviewLines.length > 0" class="raw-meta">
            {{ rawPreviewLines.length }} linha(s) exibida(s)
            <span v-if="rawTruncated"> · mostrando as primeiras {{ rawPreviewLines.length }} de {{ rawLineCount }}</span>
          </p>
        </div>
      </template>

      <footer class="preview-footer">
        <button type="button" class="btn-secondary" @click="$emit('close')">Fechar</button>
        <button type="button" class="btn-primary" :disabled="loading || !!error" @click="handleDownload">
          Baixar CSV
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
  width: min(1120px, 96vw);
  max-height: 90vh;
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
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid #2a2a2a;
}

.preview-title-block h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
  font-weight: 700;
}

.preview-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: #999;
  line-height: 1.4;
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
  gap: 0.65rem;
  padding: 0.65rem 1.25rem;
  flex-wrap: wrap;
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 0 1.25rem 0.75rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid #2e2e2e;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.summary-label {
  font-size: 0.72rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.summary-value {
  font-size: 1.15rem;
  color: #fff;
  font-weight: 700;
}

.summary-value-sm {
  font-size: 0.9rem;
  line-height: 1.3;
}

.summary-hint {
  font-size: 0.72rem;
  color: #666;
}

.info-banner {
  margin: 0 1.25rem 0.75rem;
  padding: 0.65rem 0.85rem;
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.25);
  border-radius: 6px;
  font-size: 0.78rem;
  color: #b8ddb9;
  line-height: 1.45;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem 0.75rem;
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
  padding: 0.65rem 0.75rem 0.65rem 2.35rem;
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.88rem;
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
  padding: 0 1.25rem;
  display: flex;
  flex-direction: column;
}

.table-scroll {
  overflow: auto;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  max-height: min(420px, 45vh);
  background: #0a0a0a;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
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
  padding: 0.6rem 0.65rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #333;
  white-space: nowrap;
}

.preview-table td {
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid #1e1e1e;
  vertical-align: top;
}

.preview-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.col-line {
  color: #666;
  width: 40px;
}

.col-date {
  white-space: nowrap;
  color: #f9cb28;
  font-weight: 600;
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
  max-width: 320px;
  word-break: break-word;
}

.table-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0 1rem;
  font-size: 0.8rem;
  color: #888;
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

.raw-content {
  margin: 0;
  padding: 0.85rem;
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: auto;
  max-height: min(460px, 48vh);
  font-size: 0.78rem;
  line-height: 1.5;
  color: #ccc;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.raw-meta {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: #666;
}

.empty-filter {
  padding: 2rem 1rem;
  text-align: center;
  color: #888;
  border: 1px dashed #333;
  border-radius: 8px;
}

.loading-state {
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
  padding: 1rem 1.25rem;
  border-top: 1px solid #2a2a2a;
  background: rgba(0, 0, 0, 0.25);
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
