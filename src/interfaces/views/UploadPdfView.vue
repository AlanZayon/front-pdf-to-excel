<template>
  <div class="upload-container">
    <h2 class="title">Upload de PDF</h2>
    <p class="subtitle">Selecione seu arquivo para processamento</p>

    <form class="upload-form">
      <div
        class="drop-zone"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        :class="{ 'dragging': isDragging, 'has-file': file }"
        @click="triggerFileInput"
      >
        <div class="drop-zone-content">
          <svg class="upload-icon" viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          <p class="drop-text">Arraste e solte seu PDF aqui</p>
          <p class="drop-subtext">ou clique para selecionar</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf"
          @change="onFileChange"
          class="hidden-input"
        />
      </div>

      <div v-if="fileName" class="file-info">
        <svg class="file-icon" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
        <span class="file-name">{{ fileName }}</span>
        <button @click="clearFile" class="clear-button" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
      </div>

      <div v-if="isLoading" class="upload-button">
        <span class="button-loading">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
          Processando...
        </span>
      </div>

      <div v-if="uploadResult" class="result-message" :class="{ 'error': uploadResult.message === 'Erro ao enviar o PDF' }">
        <svg v-if="uploadResult.message !== 'Erro ao enviar o PDF'" class="result-icon" viewBox="0 0 24 24">
          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
        </svg>
        <svg v-else class="result-icon" viewBox="0 0 24 24">
          <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
        <p>{{ uploadResult.message }}</p>
      </div>

      <button
        v-if="uploadResult && uploadResult.message !== 'Erro ao enviar o PDF'"
        @click="handleDownload"
        class="download-button"
      >
        <svg class="download-icon" viewBox="0 0 24 24">
          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
        </svg>
        Baixar Arquivo Processado
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { UploadPdfCommand } from '../../application/commands/UploadPdfCommand'
import { PdfUploadService } from '../../infrastructure/services/PdfUploadService'
import { FileDownloadService } from '../../infrastructure/services/FileDownloadService'

const file = ref<File | null>(null)
const fileName = ref<string | null>(null)
const uploadResult = ref<{ message: string } | null>(null)
const isLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
    fileName.value = target.files[0].name
    await handleUpload() // Chama o upload automaticamente
  }
}

const onDrop = async (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile.type === "application/pdf") {
      file.value = droppedFile
      fileName.value = droppedFile.name
      await handleUpload() // Chama o upload automaticamente
    } else {
      uploadResult.value = { message: 'Por favor, selecione um arquivo PDF válido.' }
    }
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const clearFile = () => {
  file.value = null
  fileName.value = null
  uploadResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleUpload = async () => {
  if (!file.value) return

  isLoading.value = true
  uploadResult.value = null

  try {
    const command = new UploadPdfCommand(file.value)
    const result = await PdfUploadService.execute(command)
    uploadResult.value = result
  } catch (error) {
    uploadResult.value = { message: 'Erro ao enviar o PDF' }
  } finally {
    isLoading.value = false
  }
}

const handleDownload = async (event: Event) => {
    event.preventDefault()

  try {
    await FileDownloadService.execute()
  } catch (error) {
    uploadResult.value = { message: 'Erro ao baixar o arquivo' }
  }
}
</script>

<style scoped>
.upload-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2.5rem;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.title {
  color: #2c3e50;
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.upload-form {
  display: flex;
  flex-direction: column;
}

.drop-zone {
  border: 2px dashed #bdc3c7;
  padding: 2.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.drop-zone.dragging {
  background-color: #e8f4f8;
  border-color: #3498db;
}

.drop-zone.has-file {
  border-color: #2ecc71;
  background-color: #e8f8f0;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.upload-icon {
  width: 48px;
  height: 48px;
  fill: #7f8c8d;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.drop-zone:hover .upload-icon,
.drop-zone.dragging .upload-icon {
  fill: #3498db;
}

.drop-zone.has-file .upload-icon {
  fill: #2ecc71;
}

.drop-text {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
  margin: 0;
}

.drop-subtext {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.hidden-input {
  display: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: #f1f3f4;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.file-icon {
  width: 20px;
  height: 20px;
  fill: #3498db;
}

.file-name {
  flex: 1;
  font-size: 0.95rem;
  color: #2c3e50;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.clear-button:hover {
  background-color: #e0e0e0;
}

.clear-button svg {
  fill: #7f8c8d;
}

.upload-button {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 48px;
}

.upload-button:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.upload-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  animation: rotate 1.5s linear infinite;
  width: 20px;
  height: 20px;
}

.spinner .path {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.result-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  background-color: #e8f8f0;
  color: #27ae60;
}

.result-message.error {
  background-color: #fdecea;
  color: #e74c3c;
}

.result-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.result-message p {
  margin: 0;
  font-size: 0.95rem;
}

.download-button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.download-button:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
}

.download-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

@media (max-width: 600px) {
  .upload-container {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
}
</style>