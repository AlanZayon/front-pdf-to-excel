<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { computed, onMounted, ref } from 'vue'
import LoadingScreen from './interfaces/ui/LoadingScreen.vue'

const authStore = useAuthStore()
const router = useRouter()
const initialLoad = ref(true)

onMounted(async () => {
  try {
    await authStore.checkAuth()
  } finally {
    initialLoad.value = false
    authStore.markPageReady()
  }
})

const showLoading = computed(() => {
  return (initialLoad.value || authStore.isLoading) && !authStore.isPageReady
})

router.beforeEach(async (to, from, next) => {
  // Não reinicie o estado se for a mesma rota
  if (to.path !== from.path) {
    authStore.isPageReady = false
  }
  next()
})

router.afterEach(() => {
  authStore.markPageReady()
})
</script>

<template>
  <RouterView />
  <transition name="fade">
    <LoadingScreen v-if="showLoading" :visible="true"/>
  </transition>
</template>

<style>
/* Reset básico para remover margens e paddings padrão */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100vh;
  overflow: auto;
    scrollbar-width: thin;
  scrollbar-color: #f9cb28 #2a2a2a;
}

#app::-webkit-scrollbar {
  width: 10px;
}

#appe::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 5px;
}

#app::-webkit-scrollbar-thumb {
  background: #f9cb28;
  border-radius: 5px;
  border: 2px solid #2a2a2a;
}

#app::-webkit-scrollbar-thumb:hover {
  background: #ff8a00;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>

<style scoped>
/* Seus estilos específicos do componente */
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>