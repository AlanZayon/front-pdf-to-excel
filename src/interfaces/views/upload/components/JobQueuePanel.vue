<script lang="ts" setup>
import type { QueueItem } from '../composables/useJobQueue'
import { getQueuePendingAction } from '../composables/useJobQueue'
import { truncateFileName } from '../../../../shared/utils/fileDisplay'

defineProps<{
  items: QueueItem[]
}>()

defineEmits<{
  preview: [item: QueueItem]
  download: [item: QueueItem]
  classify: [item: QueueItem]
  remove: [id: string]
  clearCompleted: []
}>()

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
  pending_classification: 'Classificação pendente',
}
</script>

<template>
  <section v-if="items.length > 0" class="job-queue-panel">
    <div class="job-queue-header">
      <h2>Processamentos</h2>
      <button type="button" class="link-button" @click="$emit('clearCompleted')">Limpar concluídos</button>
    </div>

    <ul class="job-queue-list">
      <li v-for="item in items" :key="item.id" class="job-queue-item" :class="item.status">
        <div class="job-main">
          <span class="status-dot" aria-hidden="true" />
          <div class="job-info">
            <span class="job-name" :title="item.fileName">{{ truncateFileName(item.fileName) }}</span>
            <span class="job-meta">{{ item.fileType }} · {{ statusLabel[item.status] || item.status }}</span>
            <span v-if="item.message && item.status !== 'completed'" class="job-message">{{ item.message }}</span>
          </div>
        </div>

        <div v-if="item.status === 'completed'" class="job-actions job-actions-three">
          <button type="button" class="action-button action-preview" title="Pré-visualizar CSV" @click="$emit('preview', item)">
            Visualizar
          </button>
          <button type="button" class="action-button action-download" title="Baixar CSV" @click="$emit('download', item)">
            Baixar
          </button>
          <button type="button" class="action-button action-remove" title="Remover da lista" @click="$emit('remove', item.id)">
            Remover
          </button>
        </div>

        <div v-else-if="getQueuePendingAction(item)" class="job-actions job-actions-two">
          <button type="button" class="action-button action-classify" @click="$emit('classify', item)">
            {{ getQueuePendingAction(item) === 'configure' ? 'Configurar' : 'Classificar' }}
          </button>
          <button type="button" class="action-button action-remove" @click="$emit('remove', item.id)">
            Remover
          </button>
        </div>

        <div v-else class="job-actions job-actions-single">
          <button type="button" class="action-button action-remove" @click="$emit('remove', item.id)">
            Remover
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.job-queue-panel {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid rgba(249, 203, 40, 0.15);
  border-radius: 10px;
  background: rgba(20, 20, 20, 0.85);
}

.job-queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.job-queue-header h2 {
  margin: 0;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
  color: #f9cb28;
  font-size: 1.15rem;
}

.link-button {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.82rem;
}

.job-queue-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.job-queue-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  background: rgba(32, 32, 32, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 3px solid #666;
}

.job-queue-item.processing { border-left-color: #f9cb28; }
.job-queue-item.completed { border-left-color: #4caf50; }
.job-queue-item.failed { border-left-color: #ff4d4d; }
.job-queue-item.pending_classification { border-left-color: #2196f3; }

.job-main {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.45rem;
  background: #666;
  flex-shrink: 0;
}

.job-queue-item.processing .status-dot { background: #f9cb28; }
.job-queue-item.completed .status-dot { background: #4caf50; }
.job-queue-item.failed .status-dot { background: #ff4d4d; }
.job-queue-item.pending_classification .status-dot { background: #2196f3; }

.job-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.job-name {
  color: #f3f3f3;
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-meta,
.job-message {
  font-size: 0.78rem;
  color: #888;
}

.job-message {
  color: #aaa;
}

.job-actions {
  display: grid;
  gap: 0.35rem;
}

.job-actions-three {
  grid-template-columns: repeat(3, minmax(72px, 1fr));
  width: min(100%, 280px);
}

.job-actions-two {
  grid-template-columns: repeat(2, minmax(88px, 1fr));
  width: min(100%, 220px);
}

.job-actions-single {
  grid-template-columns: minmax(88px, 1fr);
  width: min(100%, 110px);
}

.action-button {
  padding: 0.45rem 0.55rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #eee;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.action-preview {
  border-color: rgba(249, 203, 40, 0.35);
  color: #f9cb28;
}

.action-preview:hover {
  background: rgba(249, 203, 40, 0.1);
}

.action-download {
  border-color: rgba(76, 175, 80, 0.35);
  color: #8fd694;
}

.action-download:hover {
  background: rgba(76, 175, 80, 0.12);
}

.action-classify {
  border-color: rgba(33, 150, 243, 0.35);
  color: #7ec8ff;
}

.action-classify:hover {
  background: rgba(33, 150, 243, 0.12);
}

.action-remove {
  border-color: rgba(255, 255, 255, 0.1);
  color: #aaa;
}

.action-remove:hover {
  background: rgba(255, 77, 77, 0.1);
  border-color: rgba(255, 77, 77, 0.35);
  color: #ff8a8a;
}

@media (max-width: 720px) {
  .job-queue-item {
    grid-template-columns: 1fr;
  }

  .job-actions-three,
  .job-actions-two,
  .job-actions-single {
    width: 100%;
  }
}
</style>
