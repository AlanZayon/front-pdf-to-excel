<script lang="ts" setup>
import AppModal from './AppModal.vue'
import { useUnsavedWorkGuard } from '../../shared/composables/useUnsavedWorkGuard'

const { dialogState, resolveConfirm } = useUnsavedWorkGuard()
</script>

<template>
  <AppModal
    :visible="dialogState.visible"
    title-id="confirm-dialog-title"
    :close-on-escape="false"
    @close="resolveConfirm(false)"
  >
    <div class="confirm-dialog">
      <h3 id="confirm-dialog-title">{{ dialogState.title }}</h3>
      <p>{{ dialogState.message }}</p>
      <div class="confirm-actions">
        <button type="button" class="cancel-btn" @click="resolveConfirm(false)">
          {{ dialogState.cancelLabel }}
        </button>
        <button type="button" class="confirm-btn" @click="resolveConfirm(true)">
          {{ dialogState.confirmLabel }}
        </button>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.confirm-dialog {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 420px;
  width: 100%;
  color: #ddd;
  font-family: 'Montserrat', sans-serif;
}

.confirm-dialog h3 {
  margin: 0 0 0.75rem;
  color: #fff;
  font-size: 1.1rem;
}

.confirm-dialog p {
  margin: 0 0 1.25rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 0.65rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
}

.confirm-btn {
  background: #ff4d4d;
  color: #fff;
}
</style>
