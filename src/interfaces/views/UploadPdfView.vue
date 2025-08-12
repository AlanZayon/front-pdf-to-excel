<template>
  <div class="app-container">

    <!-- Área do Usuário -->
    <div class="user-area">
      <div class="user-info" @click="toggleUserMenu">
        <img :src="defaultAvatar" class="user-avatar" alt="User Avatar">
        <span class="user-name">{{ user?.fullName || 'Rockstar User' }}</span>
        <svg class="user-dropdown-icon" viewBox="0 0 24 24" :class="{ 'rotated': showUserMenu }">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </div>

      <div v-if="showUserMenu" class="user-menu">
        <button class="user-menu-item" @click="openEditModal">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path
              d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
          </svg>
          EDITAR PERFIL
        </button>
        <EditEmployeeModal :isOpen="showEditModal" @close="closeEditModal" :userData="user ?? undefined" />
        <button class="user-menu-item" @click="handleLogout">
          <svg class="user-menu-icon" viewBox="0 0 24 24">
            <path
              d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
          </svg>
          SAIR
        </button>
      </div>
    </div>
    <div class="upload-container">


      <h1 class="title">UPLOAD DE PDF</h1>
      <p class="subtitle">UPLOAD PDF</p>

      <form class="upload-form">
        <div class="drop-zone" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop" :class="{ 'dragging': isDragging, 'has-file': file }" @click="triggerFileInput">
          <div class="drop-zone-content">
            <svg class="upload-icon" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <p class="drop-text">ARRASTE E SOLTE SEU PDF AQUI</p>
            <p class="drop-subtext">ou clique para selecionar</p>
          </div>
          <input ref="fileInput" type="file" accept=".pdf" @change="onFileChange" class="hidden-input" />
        </div>

        <div v-if="fileName" class="file-info">
          <svg class="file-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span class="file-name">{{ fileName }}</span>
          <button @click="clearFile" class="clear-button" type="button">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div v-if="isLoading" class="upload-button">
          <span class="button-loading">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            PROCESSANDO...
          </span>
        </div>

        <div v-if="uploadResult" class="result-message"
          :class="{ 'error': uploadResult.message === 'Erro ao enviar o PDF' }">
          <svg v-if="uploadResult.message !== 'Erro ao enviar o PDF'" class="result-icon" viewBox="0 0 24 24">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
          <svg v-else class="result-icon" viewBox="0 0 24 24">
            <path
              d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <p>{{ uploadResult.message.toUpperCase() }}</p>
        </div>

        <button v-if="uploadResult && uploadResult.message !== 'Erro ao enviar o PDF'" @click="handleDownload"
          class="download-button">
          <svg class="download-icon" viewBox="0 0 24 24">
            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
          </svg>
          BAIXAR ARQUIVO PDF
        </button>
      </form>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { UploadPdfCommand } from '../../application/commands/UploadPdfCommand'
import { PdfUploadService } from '../../infrastructure/services/PdfUploadService'
import { FileDownloadService } from '../../infrastructure/services/FileDownloadService'
import defaultAvatar from '../../images/avatar-sistema-pdf.png'
import EditEmployeeModal from '../modal/EditEmployeeModal.vue'
import { useAuthStore } from '../../stores/authStore'
import { computed, onMounted } from 'vue'

const authStore = useAuthStore()
onMounted(() => {
  authStore.markPageReady()
})

// Dados do usuário
const user = computed(() => authStore.user)

const showUserMenu = ref(false)
const showEditModal = ref(false)
// const selectedEmployee = ref(null)

// Abre o modal
const openEditModal = () => {
  showEditModal.value = true
}

// Fecha o modal
const closeEditModal = () => {
  showEditModal.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}



const handleLogout = async () => {
  await authStore.logout()
}

// Código existente
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
    await handleUpload()
  }
}

const onDrop = async (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile.type === "application/pdf") {
      file.value = droppedFile
      fileName.value = droppedFile.name
      await handleUpload()
    } else {
      uploadResult.value = { message: 'INVALID PDF - TRY AGAIN ROCKSTAR' }
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
    uploadResult.value = { message: 'UPLOAD FAILED - ROCK N ROLL AIN\'T NOISE POLLUTION' }
  } finally {
    isLoading.value = false
  }
}

const handleDownload = async (event: Event) => {
  event.preventDefault()

  try {
    await FileDownloadService.execute()
  } catch (error) {
    uploadResult.value = { message: 'DOWNLOAD FAILED - TRY AGAIN' }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap');

.app-container{
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #000;
  padding: 20px;
  box-sizing: border-box;
} 

.upload-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 3rem;
  border-radius: 4px;
  background: #000;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Montserrat', sans-serif;
  border: 1px solid #333;
  position: relative;
  overflow: hidden;
}

.upload-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff4d4d, #f9cb28, #ff4d4d);
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.title {
  color: #fff;
  text-align: center;
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.subtitle {
  color: #aaa;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 2rem;
  font-weight: 400;
  letter-spacing: 1px;
}

.upload-form {
  display: flex;
  flex-direction: column;
}

.drop-zone {
  border: 3px dashed #444;
  padding: 3rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  background-color: rgba(30, 30, 30, 0.5);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.drop-zone.dragging {
  background-color: rgba(50, 50, 50, 0.7);
  border-color: #f9cb28;
}

.drop-zone.has-file {
  border-color: #4CAF50;
  background-color: rgba(40, 50, 40, 0.7);
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
  fill: #f9cb28;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 5px rgba(249, 203, 40, 0.5));
}

.drop-zone:hover .upload-icon,
.drop-zone.dragging .upload-icon {
  fill: #ff4d4d;
  transform: scale(1.1);
}

.drop-zone.has-file .upload-icon {
  fill: #4CAF50;
}

.drop-text {
  font-size: 1.2rem;
  color: #fff;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
}

.drop-subtext {
  font-size: 0.9rem;
  color: #aaa;
  margin: 0;
  font-weight: 400;
}

.hidden-input {
  display: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(40, 40, 40, 0.8);
  border-radius: 4px;
  margin-top: 1rem;
  border-left: 3px solid #f9cb28;
}

.file-icon {
  width: 20px;
  height: 20px;
  fill: #f9cb28;
}

.file-name {
  flex: 1;
  font-size: 0.95rem;
  color: #ddd;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: rotate(90deg);
}

.clear-button svg {
  fill: #aaa;
}

.upload-button {
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #ff4d4d, #f9cb28);
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 50px;
  margin-top: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.4);
}

.upload-button:disabled {
  background: #444;
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
  stroke: #000;
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
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  background-color: rgba(40, 60, 40, 0.7);
  color: #4CAF50;
  border-left: 3px solid #4CAF50;
}

.result-message.error {
  background-color: rgba(60, 40, 40, 0.7);
  color: #ff4d4d;
  border-left: 3px solid #ff4d4d;
}

.result-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.result-message p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.download-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.download-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

/* Estilos para a área do usuário */
.user-area {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #333;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f9cb28;
}

.user-name {
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-dropdown-icon {
  width: 16px;
  height: 16px;
  fill: #f9cb28;
  transition: transform 0.3s ease;
}

.user-dropdown-icon.rotated {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 5px;
  background: #1a1a1a;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  overflow: hidden;
  min-width: 200px;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 15px;
  background: transparent;
  border: none;
  color: #ddd;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu-item:hover {
  background: rgba(249, 203, 40, 0.1);
  color: #f9cb28;
}

.user-menu-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* Ajuste para mobile */
@media (max-width: 768px) {
  .upload-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .title {
    font-size: 2.5rem;
  }

  .user-area {
    top: 10px;
    right: 10px;
  }

  .user-name {
    display: none;
  }

  .user-info {
    padding: 6px;
  }
}
</style>