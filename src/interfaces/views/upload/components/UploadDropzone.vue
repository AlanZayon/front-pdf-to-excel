<script lang="ts" setup>
defineProps<{
  isDragging: boolean
  hasFile: boolean
}>()

defineEmits<{
  dragover: []
  dragleave: []
  drop: [event: DragEvent]
  click: []
  change: [event: Event]
}>()
</script>

<template>
  <div
    class="drop-zone"
    :class="{ dragging: isDragging, 'has-file': hasFile }"
    @dragover.prevent="$emit('dragover')"
    @dragleave.prevent="$emit('dragleave')"
    @drop.prevent="$emit('drop', $event)"
    @click="$emit('click')"
  >
    <div class="drop-zone-content">
      <svg class="upload-icon" viewBox="0 0 24 24">
        <path d="M19,13H13V19H11V13H5V11H13V5H13V11H19V13Z" />
      </svg>
      <p class="drop-text">ARRASTE E SOLTE SEU ARQUIVO AQUI</p>
      <p class="drop-subtext">ou clique para selecionar (PDF ou OFX)</p>
    </div>
    <input
      type="file"
      accept=".pdf,.ofx,application/pdf,application/x-ofx"
      class="hidden-input"
      @change="$emit('change', $event)"
    >
  </div>
</template>

<style scoped>
@import '@/interfaces/views/upload/upload-shared.css';
</style>
