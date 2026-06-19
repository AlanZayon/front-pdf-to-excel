<script lang="ts" setup>
import { isValidFileType } from '../composables/useTransactionGroups'

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

defineProps<{
  isDragging: boolean
  hasFile: boolean
  fileTypeHint?: string
}>()

const emit = defineEmits<{
  dragover: []
  dragleave: []
  drop: [event: DragEvent]
  click: []
  change: [event: Event]
  validationError: [message: string]
}>()

function validateAndEmit(event: Event, file: File | undefined) {
  if (!file) return

  if (!isValidFileType(file)) {
    emit('validationError', 'Tipo de arquivo inválido. Use PDF ou OFX.')
    return
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    emit('validationError', 'Arquivo excede o tamanho máximo permitido (100 MB).')
    return
  }

  emit('change', event)
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  validateAndEmit(event, target.files?.[0])
}

function onDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    if (!isValidFileType(file)) {
      emit('validationError', 'Tipo de arquivo inválido. Use PDF ou OFX.')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      emit('validationError', 'Arquivo excede o tamanho máximo permitido (100 MB).')
      return
    }
  }
  emit('drop', event)
}
</script>

<template>
  <div
    class="drop-zone"
    :class="{ dragging: isDragging, 'has-file': hasFile }"
    @dragover.prevent="$emit('dragover')"
    @dragleave.prevent="$emit('dragleave')"
    @drop.prevent="onDrop"
    @click="$emit('click')"
  >
    <div class="drop-zone-content">
      <svg class="upload-icon" viewBox="0 0 24 24">
        <path d="M19,13H13V19H11V13H5V11H13V5H13V11H19V13Z" />
      </svg>
      <p class="drop-text">ARRASTE E SOLTE SEU ARQUIVO AQUI</p>
      <p class="drop-subtext">ou clique para selecionar (PDF ou OFX, máx. 100 MB)</p>
      <p v-if="fileTypeHint === 'OFX'" class="drop-hint">
        Para OFX, você precisará informar CNPJ e código do banco.
      </p>
    </div>
    <input
      type="file"
      accept=".pdf,.ofx,application/pdf,application/x-ofx"
      class="hidden-input"
      @change="onChange"
    >
  </div>
</template>

<style scoped>
@import '@/interfaces/views/upload/upload-shared.css';

.drop-hint {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #f9cb28;
}
</style>
