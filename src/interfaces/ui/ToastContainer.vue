<script lang="ts" setup>
import { useToast } from '@/shared/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-container" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
      role="status"
    >
      <span>{{ toast.message }}</span>
      <button type="button" class="toast-close" aria-label="Fechar" @click="dismiss(toast.id)">×</button>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  min-width: 240px;
  max-width: 420px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.toast.success { background: #1f7a45; }
.toast.error { background: #b42318; }
.toast.info { background: #344054; }

.toast-close {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  margin-left: 0.75rem;
}
</style>
