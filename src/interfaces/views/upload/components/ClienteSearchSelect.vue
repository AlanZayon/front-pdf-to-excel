<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ClienteService, type Cliente } from '../../../../infrastructure/services/ClienteService'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    inputId?: string
    allowDefault?: boolean
    defaultLabel?: string
    placeholder?: string
  }>(),
  {
    inputId: 'upload-cliente',
    allowDefault: true,
    defaultLabel: 'Padrão do escritório / manual',
    placeholder: 'Buscar por razão social ou CNPJ…',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  select: [cliente: Cliente | null]
}>()

const search = ref('')
const clientes = ref<Cliente[]>([])
const loading = ref(false)
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | undefined

const selectedCliente = computed(
  () => clientes.value.find((cliente) => cliente.id === props.modelValue) ?? null
)

const displayValue = computed(() => {
  if (open.value) return search.value
  if (props.modelValue == null) return props.allowDefault ? props.defaultLabel : ''
  if (!selectedCliente.value) return 'Cliente selecionado'
  return `${selectedCliente.value.razaoSocial} — ${ClienteService.formatCnpj(selectedCliente.value.cnpj)}`
})

const filteredClientes = computed(() => {
  const term = search.value.trim().toLowerCase()
  const digits = term.replace(/\D/g, '')

  return clientes.value.filter((cliente) => {
    if (!term) return true
    const nameMatch = cliente.razaoSocial.toLowerCase().includes(term)
    const cnpjDigits = ClienteService.normalizeCnpj(cliente.cnpj)
    const cnpjMatch = digits.length > 0 && cnpjDigits.includes(digits)
    return nameMatch || cnpjMatch
  })
})

async function loadClientes(query?: string) {
  loading.value = true
  try {
    const result = await ClienteService.list(query, 1, 100)
    clientes.value = result.items.filter((cliente) => cliente.ativo)
  } catch {
    clientes.value = []
  } finally {
    loading.value = false
  }
}

function scheduleSearch(query: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void loadClientes(query.trim() || undefined)
  }, 300)
}

function openDropdown() {
  open.value = true
  search.value = ''
  if (clientes.value.length === 0) void loadClientes()
}

function closeDropdown() {
  open.value = false
  search.value = ''
}

function chooseDefault() {
  emit('update:modelValue', null)
  emit('select', null)
  closeDropdown()
}

function chooseCliente(cliente: Cliente) {
  emit('update:modelValue', cliente.id)
  emit('select', cliente)
  closeDropdown()
}

function onDocumentClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

watch(search, (value) => {
  if (!open.value) return
  scheduleSearch(value)
})

watch(
  () => props.modelValue,
  (id) => {
    if (id && !selectedCliente.value) {
      void ClienteService.getById(id).then((cliente) => {
        if (!cliente) return
        if (!clientes.value.some((item) => item.id === cliente.id)) {
          clientes.value = [cliente, ...clientes.value]
        }
      })
    }
  },
  { immediate: true }
)

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  void loadClientes()
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div ref="rootRef" class="cliente-search-select">
    <div class="cliente-search-input-wrap">
      <input
        :id="inputId"
        type="search"
        class="cliente-search-input"
        :value="displayValue"
        :placeholder="placeholder"
        autocomplete="off"
        @focus="openDropdown"
        @input="search = ($event.target as HTMLInputElement).value; open = true"
      >
      <span v-if="loading" class="cliente-search-spinner" aria-hidden="true" />
    </div>

    <ul v-if="open" class="cliente-search-dropdown app-scrollbar" role="listbox">
      <li v-if="allowDefault">
        <button type="button" class="cliente-search-option" @click="chooseDefault">
          {{ defaultLabel }}
        </button>
      </li>

      <li v-if="filteredClientes.length === 0 && !loading" class="cliente-search-empty">
        Nenhum cliente encontrado.
      </li>

      <li v-for="cliente in filteredClientes" :key="cliente.id">
        <button
          type="button"
          class="cliente-search-option"
          :class="{ selected: modelValue === cliente.id }"
          @click="chooseCliente(cliente)"
        >
          <span class="cliente-search-name">{{ cliente.razaoSocial }}</span>
          <span class="cliente-search-cnpj">{{ ClienteService.formatCnpj(cliente.cnpj) }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.cliente-search-select {
  position: relative;
  width: 100%;
}

.cliente-search-input-wrap {
  position: relative;
}

.cliente-search-input {
  width: 100%;
  padding: 0.65rem 2rem 0.65rem 0.65rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: #111;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.cliente-search-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.2);
}

.cliente-search-spinner {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  width: 14px;
  height: 14px;
  margin-top: -7px;
  border: 2px solid rgba(249, 203, 40, 0.25);
  border-top-color: #f9cb28;
  border-radius: 50%;
  animation: cliente-search-spin 0.8s linear infinite;
}

.cliente-search-dropdown {
  position: absolute;
  z-index: 120;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  max-height: 240px;
  overflow: auto;
  margin: 0;
  padding: 0.35rem 0;
  list-style: none;
  background: #141414;
  border: 1px solid #444;
  border-radius: 6px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
}

.cliente-search-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: none;
  background: transparent;
  color: #eee;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.cliente-search-option:hover,
.cliente-search-option.selected {
  background: rgba(249, 203, 40, 0.12);
}

.cliente-search-name {
  font-size: 0.88rem;
  font-weight: 600;
}

.cliente-search-cnpj {
  font-size: 0.76rem;
  color: #aaa;
}

.cliente-search-empty {
  padding: 0.75rem;
  color: #888;
  font-size: 0.82rem;
  text-align: center;
}

@keyframes cliente-search-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
