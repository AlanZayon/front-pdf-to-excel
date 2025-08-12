<template>
  <div class="landing-container">
    <!-- Barra de navegação -->
    <div class="nav-bar">
      <div class="logo">
        <span class="logo-text">FISCAL2CSV</span>
        <span class="logo-subtext">CONTABILIDADE</span>
      </div>
      <div class="nav-buttons">
        <button @click="goToLogin" class="nav-button">ACESSAR</button>
        <button @click="goToRegister" class="nav-button primary">TESTE GRÁTIS</button>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">CONVERSÃO AUTOMÁTICA DE DOCUMENTOS FISCAIS</h1>
        <h2 class="hero-subtitle">DARF, DAS E OUTROS TRIBUTOS PARA SEU SISTEMA CONTÁBIL</h2>

        <div class="hero-description">
          <p>Solução especializada para escritórios de contabilidade que precisam integrar comprovantes de arrecadação ao sistema Domínio.</p>
          <p>Estrutura padrão de CSV com mapeamento correto de impostos e campos contábeis.</p>
        </div>

        <div class="cta-buttons">
          <button @click="goToRegister" class="cta-button primary">
            <svg class="cta-icon" viewBox="0 0 24 24">
              <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z"/>
            </svg>
            EXPERIMENTE
          </button>
          <button @click="scrollToFeatures" class="cta-button secondary">
            <svg class="cta-icon" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,10.5A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10.5Z"/>
            </svg>
            DETALHES
          </button>
        </div>
      </div>
      <div class="hero-image">
        <div class="image-placeholder">
          <svg class="placeholder-icon" viewBox="0 0 24 24">
            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
          </svg>
          <span>DARF/DAS → CSV</span>
        </div>
      </div>
    </div>

    <!-- Seção de recursos -->
    <div class="features-section" ref="featuresSection">
      <h2 class="section-title">PARA PROFISSIONAIS DE CONTABILIDADE</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"/>
            </svg>
          </div>
          <h3>MAPEAMENTO FISCAL</h3>
          <p>Reconhecimento automático de tributos (INSS, IRPJ, CSLL, PIS, COFINS, ISS) com classificação correta nos campos débito/crédito.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24">
              <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z"/>
            </svg>
          </div>
          <h3>FORMATO CONTÁBIL</h3>
          <p>Geração do CSV no layout exato para importação no Domínio:<br>
            <strong>Data; Débito; Crédito; Valor; Histórico; Centro de Custo</strong></p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
          </div>
          <h3>SEGURANÇA FISCAL</h3>
          <p>Validação de dados e manutenção da integridade das informações contábeis durante a conversão.</p>
        </div>
      </div>
    </div>

    <!-- Seção de exemplo -->
    <div class="example-section">
      <h2 class="section-title">SAÍDA PRONTA PARA O DOMÍNIO</h2>
      <div class="code-block">
        <pre>08/01/2024;191;;145,20;PG. INSS XX;1
08/01/2024;;5;;145,20;PG. INSS XX;</pre>
      </div>
      <p class="example-note">* Estrutura otimizada para importação direta no sistema Domínio Contábil</p>
    </div>

    <!-- Rodapé -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <span class="logo-text">FISCAL2CSV</span>
          <span class="logo-subtext">SOLUÇÕES CONTÁBEIS</span>
        </div>
        <div class="footer-links">
          <button @click="goToLogin" class="footer-link">Para Escritórios</button>
          <button @click="goToRegister" class="footer-link">Planos</button>
          <button @click="scrollToTop" class="footer-link">Contato</button>
        </div>
      </div>
      <div class="footer-copyright">
        © 2025 Solução especializada para contadores - Todos os direitos reservados
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LandingPage',
  setup() {
    const router = useRouter();
    const featuresSection = ref<HTMLElement | null>(null);

    const goToLogin = () => {
      router.push('/access');
    };

    const goToRegister = () => {
      router.push('/register');
    };

    const scrollToFeatures = () => {
      featuresSection.value?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
      goToLogin,
      goToRegister,
      scrollToFeatures,
      scrollToTop,
      featuresSection
    };
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap');

.landing-container {
  min-height: 100vh;
  background: #000;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  overflow-x: hidden;
}

/* Barra de navegação */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: rgba(17, 17, 17, 0.8);
  backdrop-filter: blur(10px);
  position: fixed;
  width: 95%;
  top: 0;
  left: 0;
  z-index: 100;
  border-bottom: 1px solid #333;
}

.logo {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 3px;
  color: #f9cb28;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.logo-subtext {
  font-size: 0.7rem;
  letter-spacing: 2px;
  color: #aaa;
  text-transform: uppercase;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
}

.nav-button {
  padding: 0.7rem 1.5rem;
  background: transparent;
  border: 2px solid #f9cb28;
  color: #f9cb28;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button.primary {
  background: linear-gradient(to right, #ff4d4d, #f9cb28);
  color: #000;
  border: none;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.4);
}

/* Seção hero */
.hero-section {
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: 8rem 3rem 4rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
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

.hero-content {
  flex: 1;
  max-width: 600px;
  z-index: 2;
}

.hero-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.5rem;
  letter-spacing: 3px;
  line-height: 1.1;
  margin-bottom: 1rem;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.hero-subtitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 3px;
  color: #f9cb28;
  margin-bottom: 2rem;
  text-transform: uppercase;
}

.hero-description {
  margin-bottom: 2.5rem;
  line-height: 1.6;
  color: #aaa;
}

.hero-description p {
  margin-bottom: 1rem;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  min-height: 300px;
}

.image-placeholder {
  width: 100%;
  max-width: 500px;
  height: 300px;
  background: rgba(30, 30, 30, 0.5);
  border: 2px dashed #f9cb28;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #f9cb28;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.image-placeholder:hover {
  background: rgba(249, 203, 40, 0.1);
  transform: translateY(-5px);
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  fill: #f9cb28;
  margin-bottom: 1rem;
  opacity: 0.7;
}

/* Botões CTA */
.cta-buttons {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
}

.cta-button {
  padding: 1rem 2rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.cta-button.primary {
  background: linear-gradient(to right, #ff4d4d, #f9cb28);
  color: #000;
  border: none;
}

.cta-button.secondary {
  background: transparent;
  color: #f9cb28;
  border: 2px solid #f9cb28;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.4);
}

.cta-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* Seção de recursos */
.features-section {
  padding: 6rem 3rem;
  background: #111;
  position: relative;
}

.section-title {
  text-align: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.5rem;
  letter-spacing: 3px;
  margin-bottom: 3rem;
  color: #f9cb28;
  text-transform: uppercase;
  position: relative;
}

.section-title::after {
  content: "";
  display: block;
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, #ff4d4d, #f9cb28);
  margin: 1rem auto 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  border-color: #f9cb28;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: rgba(249, 203, 40, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-icon svg {
  width: 30px;
  height: 30px;
  fill: #f9cb28;
}

.feature-card h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  color: #fff;
}

.feature-card p {
  color: #aaa;
  line-height: 1.6;
}

/* Seção de exemplo */
.example-section {
  padding: 6rem 3rem;
  background: #1a1a1a;
}

.code-block {
  max-width: 800px;
  margin: 0 auto;
  background: #111;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #333;
  overflow-x: auto;
}

.code-block pre {
  color: #f9cb28;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

.example-note {
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  margin-top: 1rem;
}

/* Rodapé */
.footer {
  background: #000;
  padding: 3rem 0 0;
  border-top: 1px solid #333;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem 2rem;
}

.footer-logo {
  display: flex;
  flex-direction: column;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  background: none;
  border: none;
  color: #aaa;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  transition: color 0.2s ease;
  padding: 0.5rem 0;
}

.footer-link:hover {
  color: #f9cb28;
}

.footer-copyright {
  text-align: center;
  padding: 1.5rem;
  color: #555;
  font-size: 0.8rem;
  border-top: 1px solid #333;
}

/* Responsividade */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding-top: 6rem;
  }

  .hero-content {
    margin-bottom: 3rem;
    max-width: 100%;
  }

  .cta-buttons {
    justify-content: center;
  }

  .hero-image {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .nav-bar {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    text-align: center;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>