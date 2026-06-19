<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'fiscal2csv_onboarding_dismissed'
const visible = ref(false)

const emit = defineEmits<{ dismiss: [] }>()

onMounted(() => {
  visible.value = localStorage.getItem(STORAGE_KEY) !== 'true'
})

function dismiss() {
  localStorage.setItem(STORAGE_KEY, 'true')
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <div v-if="visible" class="onboarding-banner" role="status">
    <div class="banner-content">
      <p>
        <strong>PDF</strong> — guias DARF/DAS convertidos automaticamente.
        <strong>OFX</strong> — extratos bancários podem exigir classificação manual por descrição.
      </p>
      <button type="button" class="dismiss-btn" aria-label="Fechar dica" @click="dismiss">×</button>
    </div>
  </div>
</template>

<style scoped>
.onboarding-banner {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(249, 203, 40, 0.1);
  border: 1px solid rgba(249, 203, 40, 0.35);
  border-radius: 4px;
}

.banner-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.banner-content p {
  margin: 0;
  color: #ddd;
  font-size: 0.85rem;
  line-height: 1.5;
  flex: 1;
}

.banner-content strong {
  color: #f9cb28;
}

.dismiss-btn {
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  min-width: 44px;
  min-height: 44px;
}
</style>
