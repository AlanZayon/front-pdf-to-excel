<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { vMaska } from 'maska/vue'
import AppModal from '../ui/AppModal.vue'
import { ClienteService, type Cliente } from '../../infrastructure/services/ClienteService'
import { useAuthStore } from '../../stores/authStore'
import { useUnsavedWorkGuard } from '../../shared/composables/useUnsavedWorkGuard'
import { notifyError, notifySuccess } from '../../shared/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { confirmAction } = useUnsavedWorkGuard()

const clientes = ref<Cliente[]>([])
const total = ref(0)
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = 20

const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ razaoSocial: '', cnpj: '', codigoBancoPadrao: '' })
const formError = ref('')
const openMenuId = ref<number | null>(null)
const menuAnchor = ref<{ top: number; left: number } | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const activeMenuCliente = computed(() => clientes.value.find((cliente) => cliente.id === openMenuId.value) ?? null)
const hasSearch = computed(() => search.value.trim().length > 0)
const rangeLabel = computed(() => {
  if (total.value === 0) return '0 clientes'
  const start = (page.value - 1) * pageSize + 1
  const end = Math.min(page.value * pageSize, total.value)
  return `${start}–${end} de ${total.value} cliente${total.value === 1 ? '' : 's'}`
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  authStore.markPageReady()
  await loadClientes()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

function handleDocumentClick() {
  openMenuId.value = null
  menuAnchor.value = null
}

function toggleActionsMenu(clienteId: number, event: MouseEvent) {
  event.stopPropagation()
  if (openMenuId.value === clienteId) {
    closeActionsMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  menuAnchor.value = { top: rect.bottom + 6, left: rect.right }
  openMenuId.value = clienteId
}

function closeActionsMenu() {
  openMenuId.value = null
  menuAnchor.value = null
}

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    void loadClientes()
  }, 300)
})

async function loadClientes() {
  loading.value = true
  try {
    const result = await ClienteService.list(search.value, page.value, pageSize)
    clientes.value = result.items
    total.value = result.total
    if (page.value > totalPages.value) {
      page.value = totalPages.value
    }
  } catch (error) {
    notifyError(ClienteService.handleError(error, 'Erro ao carregar clientes'))
  } finally {
    loading.value = false
  }
}

function clearSearch() {
  if (!search.value) return
  search.value = ''
}

function openCreate() {
  closeActionsMenu()
  editingId.value = null
  form.value = { razaoSocial: '', cnpj: '', codigoBancoPadrao: '' }
  formError.value = ''
  showForm.value = true
}

function openEdit(cliente: Cliente) {
  closeActionsMenu()
  editingId.value = cliente.id
  form.value = {
    razaoSocial: cliente.razaoSocial,
    cnpj: ClienteService.formatCnpj(cliente.cnpj),
    codigoBancoPadrao: cliente.codigoBancoPadrao?.toString() ?? '',
  }
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  if (saving.value) return
  showForm.value = false
  formError.value = ''
}

function validateForm(): boolean {
  const razao = form.value.razaoSocial.trim()
  if (razao.length < 2) {
    formError.value = 'Informe a razão social com pelo menos 2 caracteres.'
    return false
  }

  if (!editingId.value) {
    if (!ClienteService.isValidCnpj(form.value.cnpj)) {
      formError.value = 'CNPJ inválido. Verifique os dígitos informados.'
      return false
    }
  }

  const banco = form.value.codigoBancoPadrao.trim()
  if (banco && !/^\d{3,4}$/.test(banco)) {
    formError.value = 'Código do banco deve ter 3 ou 4 dígitos.'
    return false
  }

  formError.value = ''
  return true
}

async function saveCliente() {
  if (!validateForm()) return

  saving.value = true
  try {
    const banco = form.value.codigoBancoPadrao.trim()
      ? Number(form.value.codigoBancoPadrao)
      : null

    if (editingId.value) {
      await ClienteService.update(editingId.value, {
        razaoSocial: form.value.razaoSocial.trim(),
        codigoBancoPadrao: banco,
      })
      notifySuccess('Cliente atualizado com sucesso')
    } else {
      await ClienteService.create({
        razaoSocial: form.value.razaoSocial.trim(),
        cnpj: ClienteService.normalizeCnpj(form.value.cnpj),
        codigoBancoPadrao: banco,
      })
      notifySuccess('Cliente cadastrado com sucesso')
    }

    showForm.value = false
    formError.value = ''
    editingId.value = null
    await loadClientes()
  } catch (error) {
    notifyError(ClienteService.handleError(error, 'Erro ao salvar cliente'))
  } finally {
    saving.value = false
  }
}

async function deactivate(cliente: Cliente) {
  closeActionsMenu()
  const confirmed = await confirmAction({
    title: 'Desativar cliente?',
    message: `"${cliente.razaoSocial}" deixará de aparecer nas conversões. Você pode cadastrá-lo novamente depois, se necessário.`,
    confirmLabel: 'Desativar',
    cancelLabel: 'Cancelar',
  })

  if (!confirmed) return

  try {
    await ClienteService.deactivate(cliente.id)
    notifySuccess('Cliente desativado')
    if (clientes.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await loadClientes()
  } catch (error) {
    notifyError(ClienteService.handleError(error, 'Erro ao desativar cliente'))
  }
}

function goToTaxCodes(clienteId: number) {
  closeActionsMenu()
  router.push({ path: '/codigo', query: { clienteId: String(clienteId) } })
}

async function changePage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) return
  page.value = nextPage
  await loadClientes()
}
</script>

<template>
  <div class="clientes-page">
    <button type="button" class="back-button" @click="router.push('/')">VOLTAR</button>

    <header class="page-header">
      <h1>CLIENTES</h1>
      <p class="page-subtitle">Empresas do escritório para conversão PDF e OFX por CNPJ</p>
    </header>

    <div class="page-content">
      <section class="stats-row" aria-label="Resumo">
        <article class="stat-card">
          <span class="stat-label">Cadastrados</span>
          <strong class="stat-value">{{ total }}</strong>
        </article>
        <article class="stat-card">
          <span class="stat-label">Exibindo</span>
          <strong class="stat-value">{{ clientes.length }}</strong>
        </article>
        <article class="stat-card stat-card-wide">
          <span class="stat-label">Uso</span>
          <p class="stat-hint">
            Selecione o cliente no upload ou configure códigos de imposto específicos por empresa.
          </p>
        </article>
      </section>

      <section class="toolbar-card">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
          <input
            v-model="search"
            type="search"
            class="search-input"
            placeholder="Buscar por razão social ou CNPJ…"
            aria-label="Buscar clientes"
          >
          <button
            v-if="hasSearch"
            type="button"
            class="clear-search"
            aria-label="Limpar busca"
            @click="clearSearch"
          >
            ×
          </button>
        </div>

        <button type="button" class="primary-button" @click="openCreate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          NOVO CLIENTE
        </button>
      </section>

      <div v-if="loading" class="loading-panel" aria-busy="true">
        <div class="loading-spinner">
          <span class="spinner-circle" />
          <span class="spinner-circle" />
          <span class="spinner-circle" />
          <span class="spinner-circle" />
        </div>
        <p>Carregando clientes…</p>
      </div>

      <section v-else-if="clientes.length === 0" class="empty-state">
        <div class="empty-icon" aria-hidden="true">◎</div>
        <h2>{{ hasSearch ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado' }}</h2>
        <p>
          {{
            hasSearch
              ? 'Tente outro termo de busca ou cadastre uma nova empresa.'
              : 'Cadastre a primeira empresa para vincular CNPJ, banco padrão e códigos de imposto.'
          }}
        </p>
        <button v-if="!hasSearch" type="button" class="primary-button" @click="openCreate">
          CADASTRAR CLIENTE
        </button>
      </section>

      <section v-else class="table-card">
        <div class="table-scroll app-scrollbar">
          <table class="clientes-table">
            <thead>
              <tr>
                <th scope="col">Razão social</th>
                <th scope="col">CNPJ</th>
                <th scope="col">Banco padrão</th>
                <th scope="col">Cadastro</th>
                <th scope="col" class="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cliente in clientes" :key="cliente.id">
                <td class="col-name">
                  <span class="client-name">{{ cliente.razaoSocial }}</span>
                </td>
                <td class="col-cnpj">
                  <code>{{ ClienteService.formatCnpj(cliente.cnpj) }}</code>
                </td>
                <td class="col-bank">
                  <span v-if="cliente.codigoBancoPadrao" class="bank-badge">
                    {{ ClienteService.formatBankCode(cliente.codigoBancoPadrao) }}
                  </span>
                  <span v-else class="muted">Não definido</span>
                </td>
                <td class="col-date">
                  {{ new Date(cliente.createdAtUtc).toLocaleDateString('pt-BR') }}
                </td>
                <td class="col-actions">
                  <div class="actions-menu-wrap">
                    <button
                      type="button"
                      class="menu-trigger"
                      :aria-expanded="openMenuId === cliente.id"
                      aria-haspopup="menu"
                      :aria-label="`Ações para ${cliente.razaoSocial}`"
                      @click="toggleActionsMenu(cliente.id, $event)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="table-footer">
          <span>{{ rangeLabel }}</span>
          <div v-if="totalPages > 1" class="pagination">
            <button type="button" class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">
              Anterior
            </button>
            <span class="page-indicator">{{ page }} / {{ totalPages }}</span>
            <button type="button" class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">
              Próxima
            </button>
          </div>
        </footer>
      </section>
    </div>

    <AppModal :visible="showForm" title-id="cliente-form-title" @close="closeForm">
      <form class="form-dialog" @submit.prevent="saveCliente">
        <header class="form-header">
          <h2 id="cliente-form-title">{{ editingId ? 'Editar cliente' : 'Novo cliente' }}</h2>
          <p>Preencha os dados da empresa para uso nas conversões.</p>
        </header>

        <div class="form-grid">
          <label class="field">
            <span>Razão social</span>
            <input
              v-model="form.razaoSocial"
              type="text"
              required
              maxlength="256"
              autocomplete="organization"
              placeholder="Nome da empresa"
            >
          </label>

          <label v-if="!editingId" class="field">
            <span>CNPJ</span>
            <input
              v-model="form.cnpj"
              v-maska="'##.###.###/####-##'"
              type="text"
              required
              inputmode="numeric"
              placeholder="00.000.000/0000-00"
            >
          </label>

          <label v-else class="field">
            <span>CNPJ</span>
            <input :value="form.cnpj" type="text" disabled class="input-disabled">
          </label>

          <label class="field">
            <span>Banco padrão <small>(opcional)</small></span>
            <input
              v-model="form.codigoBancoPadrao"
              v-maska="'####'"
              type="text"
              maxlength="4"
              inputmode="numeric"
              placeholder="Ex.: 0341"
            >
          </label>
        </div>

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

        <footer class="form-actions">
          <button type="button" class="secondary-button" :disabled="saving" @click="closeForm">
            Cancelar
          </button>
          <button type="submit" class="primary-button" :disabled="saving">
            {{ saving ? 'Salvando…' : 'Salvar cliente' }}
          </button>
        </footer>
      </form>
    </AppModal>

    <Teleport to="body">
      <div
        v-if="activeMenuCliente && menuAnchor"
        class="actions-menu actions-menu-floating"
        role="menu"
        :style="{ top: `${menuAnchor.top}px`, left: `${menuAnchor.left}px` }"
        @click.stop
      >
        <button type="button" role="menuitem" class="menu-item" @click="openEdit(activeMenuCliente)">
          Editar
        </button>
        <button
          type="button"
          role="menuitem"
          class="menu-item menu-item-accent"
          @click="goToTaxCodes(activeMenuCliente.id)"
        >
          Impostos
        </button>
        <button type="button" role="menuitem" class="menu-item menu-item-danger" @click="deactivate(activeMenuCliente)">
          Desativar
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.clientes-page {
  min-height: 100vh;
  padding: 2rem 1.25rem 3rem;
  background: #1a1a1a;
  color: #fff;
  position: relative;
  box-sizing: border-box;
}

.back-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #f9cb28;
  border-radius: 4px;
  color: #f9cb28;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.back-button:hover {
  background: rgba(249, 203, 40, 0.1);
  transform: translateY(-1px);
}

.page-header {
  max-width: 1040px;
  margin: 0 auto 1.5rem;
  text-align: center;
  padding: 1rem 1rem 1.25rem;
  border-bottom: 1px solid #333;
  background: linear-gradient(180deg, rgba(249, 203, 40, 0.08), rgba(249, 203, 40, 0.02));
  border-radius: 16px 16px 0 0;
}

.page-header h1 {
  color: #f9cb28;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 2px;
  font-size: 2.2rem;
  margin: 0;
}

.page-subtitle {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
}

.page-content {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) minmax(0, 2fr);
  gap: 0.75rem;
}

.stat-card {
  background: rgba(24, 24, 24, 0.96);
  border: 1px solid rgba(249, 203, 40, 0.12);
  border-radius: 12px;
  padding: 0.85rem 1rem;
}

.stat-card-wide {
  grid-column: span 1;
}

.stat-label {
  display: block;
  color: #888;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  color: #f9cb28;
  font-weight: 700;
}

.stat-hint {
  margin: 0.15rem 0 0;
  color: #bbb;
  font-size: 0.85rem;
  line-height: 1.45;
}

.toolbar-card {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem;
  background: rgba(24, 24, 24, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.search-wrap {
  flex: 1;
  min-width: 240px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  fill: #666;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.25rem 0.75rem 2.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 10, 0.9);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.15);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #aaa;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.clear-search:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1.1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.primary-button svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.primary-button {
  background: #f9cb28;
  color: #111;
}

.primary-button:hover:not(:disabled),
.secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background: transparent;
  border: 1px solid #555;
  color: #ddd;
}

.loading-panel,
.empty-state {
  background: rgba(24, 24, 24, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.loading-panel p,
.empty-state p {
  color: #aaa;
  margin: 0.75rem 0 0;
}

.loading-spinner {
  display: flex;
  justify-content: center;
}

.spinner-circle {
  width: 10px;
  height: 10px;
  margin: 0 4px;
  background-color: #f9cb28;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.spinner-circle:nth-child(1) { animation-delay: -0.32s; }
.spinner-circle:nth-child(2) { animation-delay: -0.16s; }
.spinner-circle:nth-child(3) { animation-delay: -0.08s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  border: 1px dashed rgba(249, 203, 40, 0.35);
  color: #f9cb28;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.empty-state h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.empty-state .primary-button {
  margin-top: 1.25rem;
}

.table-card {
  background: rgba(24, 24, 24, 0.96);
  border: 1px solid rgba(249, 203, 40, 0.12);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

.table-scroll {
  max-height: min(560px, calc(100vh - 360px));
  overflow: auto;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.clientes-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.clientes-table th {
  background: #1f1f1f;
  color: #f9cb28;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid rgba(249, 203, 40, 0.14);
  white-space: nowrap;
}

.clientes-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.clientes-table tbody tr {
  transition: background 0.15s ease;
}

.clientes-table tbody tr:hover {
  background: rgba(249, 203, 40, 0.04);
}

.col-name {
  min-width: 220px;
}

.client-name {
  font-weight: 600;
  color: #f3f3f3;
}

.col-cnpj code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.82rem;
  color: #ccc;
}

.bank-badge {
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(249, 203, 40, 0.12);
  color: #f9cb28;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
}

.muted {
  color: #666;
  font-size: 0.82rem;
}

.col-date {
  color: #888;
  white-space: nowrap;
}

.col-actions {
  width: 1%;
  white-space: nowrap;
  text-align: right;
}

.actions-menu-wrap {
  position: relative;
  display: inline-flex;
  justify-content: flex-end;
}

.menu-trigger {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #ccc;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-trigger svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.menu-trigger:hover,
.menu-trigger[aria-expanded='true'] {
  border-color: rgba(249, 203, 40, 0.35);
  background: rgba(249, 203, 40, 0.08);
  color: #f9cb28;
}

.actions-menu {
  min-width: 160px;
  padding: 0.35rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1a1a1a;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.actions-menu-floating {
  position: fixed;
  transform: translateX(-100%);
  z-index: 1100;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #ddd;
  font-size: 0.84rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.menu-item-accent {
  color: #f9cb28;
}

.menu-item-accent:hover {
  background: rgba(249, 203, 40, 0.1);
}

.menu-item-danger {
  color: #ff8a8a;
}

.menu-item-danger:hover {
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
}

.table-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #888;
  font-size: 0.82rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: transparent;
  color: #ddd;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  min-width: 4rem;
  text-align: center;
  color: #aaa;
}

.form-dialog {
  width: min(520px, 95vw);
  background: linear-gradient(135deg, #1a1a1a 0%, #101010 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  color: #e8e8e8;
  font-family: 'Montserrat', sans-serif;
}

.form-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}

.form-header p {
  margin: 0.35rem 0 0;
  color: #888;
  font-size: 0.88rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field span {
  color: #f9cb28;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field small {
  color: #777;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.field input {
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 10, 0.95);
  color: #fff;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.15);
}

.input-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-error {
  margin: 0.85rem 0 0;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.25);
  color: #ff8a8a;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .stat-card-wide {
    grid-column: auto;
  }

  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-button {
    width: 100%;
  }

  .back-button {
    position: static;
    margin-bottom: 1rem;
    width: 100%;
  }
}
</style>
