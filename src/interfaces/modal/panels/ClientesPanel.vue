<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ClienteService, type Cliente } from '../../../infrastructure/services/ClienteService'
import { notifyError, notifySuccess } from '../../../shared/composables/useToast'

const router = useRouter()
const clientes = ref<Cliente[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadClientes()
})

async function loadClientes() {
  loading.value = true
  try {
    const result = await ClienteService.list(undefined, 1, 20)
    clientes.value = result.items
  } catch (error) {
    notifyError(ClienteService.handleError(error, 'Erro ao carregar clientes'))
  } finally {
    loading.value = false
  }
}

async function deactivate(id: number) {
  try {
    await ClienteService.deactivate(id)
    notifySuccess('Cliente desativado')
    await loadClientes()
  } catch (error) {
    notifyError(ClienteService.handleError(error, 'Erro ao desativar'))
  }
}
</script>

<template>
  <section class="clientes-panel">
    <div class="panel-header">
      <h3>Clientes recentes</h3>
      <button type="button" @click="router.push('/clientes')">Gerenciar todos</button>
    </div>
    <p v-if="loading">Carregando...</p>
    <ul v-else class="clientes-list">
      <li v-for="cliente in clientes" :key="cliente.id">
        <span>{{ cliente.razaoSocial }} — {{ ClienteService.formatCnpj(cliente.cnpj) }}</span>
        <button type="button" class="muted" @click="deactivate(cliente.id)">Desativar</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.clientes-panel {
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid #333;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clientes-list {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
}

.clientes-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
  border-bottom: 1px solid #222;
}

button {
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #555;
  background: transparent;
  color: #f9cb28;
  cursor: pointer;
}

button.muted {
  color: #aaa;
  border-color: #444;
}
</style>
