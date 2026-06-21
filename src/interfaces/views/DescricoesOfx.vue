<script lang="ts" setup>
import { onMounted, defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import DescricoesToolsPanel from '../modal/panels/DescricoesToolsPanel.vue'

const EditEmployeeModal = defineAsyncComponent(() => import('../modal/EditEmployeeModal.vue'))
const router = useRouter()
const authStore = useAuthStore()
const showModal = ref(true)

onMounted(() => {
  authStore.markPageReady()
})

const close = () => {
  showModal.value = false
  router.push('/')
}
</script>

<template>
  <div class="descricoes-page">
    <div class="page-header">
      <button type="button" class="back-link" @click="router.push('/')">← Voltar ao upload</button>
      <h1>Descrições OFX</h1>
      <p>Configure mapeamentos de descrições bancárias por CNPJ e código do banco.</p>
    </div>

    <DescricoesToolsPanel />

    <EditEmployeeModal
      v-if="showModal"
      :is-open="showModal"
      descriptions-only
      @close="close"
    />
  </div>
</template>

<style scoped>
.descricoes-page {
  min-height: 100vh;
  background: #000;
  padding: 2rem 1rem;
  color: #ddd;
  font-family: 'Montserrat', sans-serif;
}

.page-header {
  max-width: 900px;
  margin: 0 auto 1rem;
}

.back-link {
  background: transparent;
  border: none;
  color: #f9cb28;
  cursor: pointer;
  margin-bottom: 1rem;
  min-height: 44px;
}

.page-header h1 {
  color: #fff;
  margin: 0 0 0.5rem;
}

.page-header p {
  color: #aaa;
  margin: 0;
}
</style>
