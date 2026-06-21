<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useUnsavedWorkGuard } from '../../shared/composables/useUnsavedWorkGuard'

const { dialogState, resolveConfirm } = useUnsavedWorkGuard()

function onKeydown(event: KeyboardEvent) {
  if (!dialogState.value.visible) return
  if (event.key === 'Escape') {
    resolveConfirm(false)
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="dialogState.visible"
      class="confirm-overlay"
      role="presentation"
      @click.self="resolveConfirm(false)"
    >
      <div
        class="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h3 id="confirm-dialog-title">{{ dialogState.title }}</h3>
        <p id="confirm-dialog-message">{{ dialogState.message }}</p>
        <div class="confirm-actions">
          <button type="button" class="cancel-btn" @click="resolveConfirm(false)">
            {{ dialogState.cancelLabel }}
          </button>
          <button type="button" class="confirm-btn" @click="resolveConfirm(true)">
            {{ dialogState.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(4px);
  box-sizing: border-box;
}

.confirm-dialog {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  width: min(420px, 100%);
  max-height: calc(100dvh - 32px);
  overflow: auto;
  color: #ddd;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65);
  flex-shrink: 0;
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
  flex-wrap: wrap;
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

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.confirm-btn {
  background: #ff4d4d;
  color: #fff;
}

.confirm-btn:hover {
  background: #e04343;
}
</style>
