<template>
  <div class="upload-container">
    <h2>Upload de PDF</h2>

    <form @submit.prevent="handleUpload" class="upload-form">
      <label class="custom-file-upload">
        <input
          ref="fileInput"
          type="file"
          accept=".pdf"
          @change="onFileChange"
        />
        Selecionar PDF
      </label>

      <p v-if="fileName" class="file-name">
        Arquivo selecionado: <strong>{{ fileName }}</strong>
      </p>

      <button :disabled="!file || isLoading" type="submit" class="upload-button">
        {{ isLoading ? 'Enviando...' : 'Enviar PDF' }}
      </button>
    </form>

    <p v-if="uploadResult" class="upload-message">
      {{ uploadResult.message }}
    </p>

    <button
      v-if="uploadResult && uploadResult.message !== 'Erro ao enviar o PDF'"
      @click="handleDownload"
      class="download-button"
    >
      Baixar Arquivo
    </button>
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

const onFileChange = (e: Event) => {
  uploadResult.value = null
  const target = e.target as HTMLInputElement
  const selectedFile = target.files?.[0] || null
  if (selectedFile) {
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande (limite 10MB)')
      return
    }
    file.value = selectedFile
    fileName.value = selectedFile.name
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
    console.error('Erro ao enviar o PDF:', error)
    uploadResult.value = { message: 'Erro ao enviar o PDF' }
  } finally {
    isLoading.value = false
    file.value = null
    fileName.value = null
    if (fileInput.value) {
      fileInput.value.value = '' 
    }
  }
}

const handleDownload = async () => {
  await FileDownloadService.execute()
}
</script>

<style scoped>
.upload-container {
  max-width: 600px;
  margin: auto;
}

.upload-button,
.download-button {
  margin-top: 1rem;
}

.upload-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

.upload-container h2 {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #333;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.custom-file-upload {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  color: #fff;
  background-color: #007bff;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.custom-file-upload:hover {
  background-color: #0056b3;
}

.custom-file-upload input[type="file"] {
  display: none;
}

.file-name {
  font-size: 0.95rem;
  color: #555;
}

.upload-button,
.download-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: #28a745;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}

.upload-button:hover:not([disabled]),
.download-button:hover {
  background-color: #218838;
}

.upload-message {
  margin-top: 1rem;
  color: #17a2b8;
  font-weight: 500;
}
</style>
