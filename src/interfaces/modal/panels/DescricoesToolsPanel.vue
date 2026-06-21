<script lang="ts" setup>
import { ref } from 'vue'
import { ImpostoService } from '../../../infrastructure/services/ImpostoService'
import { ClienteService } from '../../../infrastructure/services/ClienteService'
import { notifyError, notifySuccess } from '../../../shared/composables/useToast'

const searchCnpj = ref('')
const codigoBanco = ref('')
const cnpjDestino = ref('')
const importInput = ref<HTMLInputElement | null>(null)

async function exportCsv() {
  const cnpj = ClienteService.normalizeCnpj(searchCnpj.value)
  if (cnpj.length !== 14) {
    notifyError('Informe um CNPJ válido para exportar')
    return
  }
  try {
    const blob = await ImpostoService.exportDescricoesCsv(cnpj, codigoBanco.value ? Number(codigoBanco.value) : null)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mapeamentos-ofx.csv'
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    notifyError('Erro ao exportar mapeamentos')
  }
}

async function importCsv(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const cnpj = ClienteService.normalizeCnpj(searchCnpj.value)
  if (cnpj.length !== 14) {
    notifyError('Informe um CNPJ válido para importar')
    return
  }

  try {
    const { count } = await ImpostoService.importDescricoesCsv(
      cnpj,
      file,
      codigoBanco.value ? Number(codigoBanco.value) : null
    )
    notifySuccess(`${count} mapeamentos importados`)
  } catch {
    notifyError('Erro ao importar CSV')
  } finally {
    input.value = ''
  }
}

async function copyMappings() {
  const origem = ClienteService.normalizeCnpj(searchCnpj.value)
  const destino = ClienteService.normalizeCnpj(cnpjDestino.value)
  if (origem.length !== 14 || destino.length !== 14) {
    notifyError('Informe CNPJs válidos de origem e destino')
    return
  }
  try {
    const count = await ImpostoService.copyDescricoes({
      cnpjOrigem: origem,
      cnpjDestino: destino,
      codigoBancoOrigem: codigoBanco.value ? Number(codigoBanco.value) : null,
    })
    notifySuccess(`${count} mapeamentos copiados`)
  } catch {
    notifyError('Erro ao copiar mapeamentos')
  }
}
</script>

<template>
  <section class="descricoes-tools">
    <h3>Ferramentas de mapeamento</h3>
    <div class="tools-grid">
      <label>CNPJ origem</label>
      <input v-model="searchCnpj" placeholder="00.000.000/0000-00">
      <label>Banco (opcional)</label>
      <input v-model="codigoBanco" maxlength="4" placeholder="0000">
      <div class="tool-actions">
        <button type="button" @click="exportCsv">Exportar CSV</button>
        <button type="button" @click="importInput?.click()">Importar CSV</button>
        <input ref="importInput" type="file" accept=".csv" hidden @change="importCsv">
      </div>
      <label>CNPJ destino (copiar)</label>
      <input v-model="cnpjDestino" placeholder="00.000.000/0000-00">
      <button type="button" class="copy-button" @click="copyMappings">Copiar mapeamentos</button>
    </div>
  </section>
</template>

<style scoped>
.descricoes-tools {
  max-width: 900px;
  margin: 0 auto 1rem;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #111;
}

.tools-grid {
  display: grid;
  gap: 0.5rem;
}

.tools-grid input {
  padding: 0.6rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: #1a1a1a;
  color: #fff;
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

button {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #555;
  background: #222;
  color: #fff;
  cursor: pointer;
}

.copy-button {
  justify-self: start;
}
</style>
