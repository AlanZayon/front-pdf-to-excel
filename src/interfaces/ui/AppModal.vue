<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  visible: boolean
  titleId?: string
  closeOnEscape?: boolean
  /** When false, the panel does not scroll; inner content should manage overflow. */
  panelScroll?: boolean
  /** Raised above standard modals (e.g. confirm over bank modal). */
  elevated?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !panelRef.value) return

  const focusable = getFocusableElements(panelRef.value)
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!props.visible) return
  if (event.key === 'Escape' && props.closeOnEscape !== false) {
    emit('close')
  }
  trapFocus(event)
}

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      const focusable = panelRef.value ? getFocusableElements(panelRef.value) : []
      focusable[0]?.focus()
    } else if (previouslyFocused) {
      previouslyFocused.focus()
      previouslyFocused = null
    }
  }
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="app-modal-overlay"
      :class="{
        'app-modal-overlay--contained': panelScroll === false,
        'app-modal-overlay--elevated': elevated,
      }"
      role="presentation"
      @click.self="$emit('close')"
    >
      <div
        ref="panelRef"
        class="app-modal-panel"
        :class="{ 'app-modal-panel--contained': panelScroll === false }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.app-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.app-modal-panel {
  max-height: 96vh;
  overflow: auto;
}

.app-modal-overlay--contained {
  padding: 8px;
}

.app-modal-overlay--elevated {
  z-index: 3000;
}

.app-modal-panel--contained {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100dvh - 16px);
  max-height: calc(100dvh - 16px);
}

.app-modal-panel--contained > :slotted(*) {
  flex: 1;
  min-height: 0;
}
</style>
