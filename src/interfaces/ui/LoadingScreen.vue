<script lang="ts" setup>
defineProps<{ visible: boolean }>()
</script>

<template>
  <div v-if="visible" class="loading-container">
    <div class="loading-card">
      <div class="loading-content">
        <div class="spinner-container">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
        </div>
        <h1 class="loading-title">CARREGANDO</h1>
        <p class="loading-subtitle">POR FAVOR, AGUARDE...</p>
      </div>
    </div>
  </div>
</template>



<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  padding: 20px;
  z-index: 9999;
}

.loading-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  border-radius: 4px;
  background: #111;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Montserrat', sans-serif;
  border: 1px solid #333;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.loading-card::before {
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

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
}

.spinner-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  animation: rotate 1.5s linear infinite;
  width: 100%;
  height: 100%;
}

.spinner .path {
  stroke: #f9cb28;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.loading-title {
  color: #fff;
  text-align: center;
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.loading-subtitle {
  color: #aaa;
  text-align: center;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
  letter-spacing: 1px;
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

@media (max-width: 768px) {
  .loading-card {
    padding: 2rem 1.5rem;
  }

  .loading-title {
    font-size: 2.2rem;
  }

  .loading-subtitle {
    font-size: 0.9rem;
  }

  .spinner-container {
    width: 60px;
    height: 60px;
  }
}
</style>