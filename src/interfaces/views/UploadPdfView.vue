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
      <h1 class="title">UPLOAD DE ARQUIVOS</h1>
      <p class="subtitle">UPLOAD PDF E OFX</p>

      <form class="upload-form">
        <div class="drop-zone" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop" :class="{ 'dragging': isDragging, 'has-file': file }" @click="triggerFileInput">
          <div class="drop-zone-content">
            <svg class="upload-icon" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <p class="drop-text">ARRASTE E SOLTE SEU ARQUIVO AQUI</p>
            <p class="drop-subtext">ou clique para selecionar (PDF ou OFX)</p>
          </div>
          <input ref="fileInput" type="file" accept=".pdf,.ofx,application/pdf,application/x-ofx" @change="onFileChange"
            class="hidden-input" />
        </div>

        <div v-if="fileName || ofxFileName" class="file-info">
          <svg class="file-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span class="file-name">{{ fileName || ofxFileName }}</span>
          <span class="file-type">({{ fileType }})</span>
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
          :class="{ 'error': uploadResult?.message === 'Erro ao enviar o arquivo' }">
          <svg v-if="uploadResult && uploadResult?.message !== 'Erro ao enviar o arquivo'" class="result-icon"
            viewBox="0 0 24 24">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
          <svg v-else class="result-icon" viewBox="0 0 24 24">
            <path
              d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <p>{{ uploadResult?.message?.toUpperCase() }}</p>
        </div>

        <button v-if="uploadResult && uploadResult?.message !== 'Erro ao enviar o arquivo'" @click="handleDownload"
          class="download-button">
          <svg class="download-icon" viewBox="0 0 24 24">
            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
          </svg>
          BAIXAR ARQUIVO {{ fileType.toUpperCase() }}
        </button>
      </form>
    </div>

    <!-- Modal de dados bancários -->
    <div v-if="showBankDataModal" class="modal-overlay" @click.self="closeBankDataModal">
      <div class="bank-data-modal">
        <div class="modal-header">
          <h2>INFORMAÇÕES BANCÁRIAS</h2>
          <button class="close-button" @click="closeBankDataModal">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="file-info-modal">
            <svg class="file-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>{{ fileName || ofxFileName }} - Arquivo OFX</span>
          </div>

          <div class="bank-fields">
            <div class="input-group">
              <label>Código do Banco:</label>
              <input type="text" v-model="bankCode" v-maska="'####'" placeholder="0001" maxlength="4">
            </div>

            <div class="input-group">
              <label>CNPJ:</label>
              <input type="text" v-model="cnpj" v-maska="'##.###.###/####-##'" placeholder="00.000.000/0000-00">
            </div>
          </div>

          <!-- Filtro de Data/Período -->
          <div class="date-filter-section">
            <div class="filter-toggle-header" @click="toggleDateFilterVisibility">
              <h3>FILTRAR POR PERÍODO</h3>
              <svg class="filter-toggle-icon" :class="{ 'rotated': showDateFilter }" viewBox="0 0 24 24">
                <path d="M7,10L12,15L17,10H7Z" />
              </svg>
            </div>
            <div v-if="showDateFilter" class="date-filter-controls">
              <div class="date-input-group">
                <label>Data Inicial:</label>
                <input type="date" v-model="dateFilter.startDate" class="date-input">
              </div>
              <div class="date-input-group">
                <label>Data Final:</label>
                <input type="date" v-model="dateFilter.endDate" class="date-input">
              </div>
              <div class="date-filter-actions">
                <button @click="applyDateFilter" :disabled="!isDateFilterValid" class="filter-apply-button">
                  APLICAR FILTRO
                </button>
                <button @click="clearDateFilter" class="filter-clear-button">
                  LIMPAR FILTRO
                </button>
                <div class="filter-status" v-if="dateFilter.isActive">
                  <span class="active-filter-badge">FILTRO ATIVO</span>
                  <span class="filter-dates">{{ formatDateRange() }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="proceedWithOfxProcessing" :disabled="!isBankFormValid || isProcessingOfx"
              class="confirm-button" :class="{ 'loading': isProcessingOfx }">
              <div v-if="isProcessingOfx" class="button-loading">
                <svg class="spinner" viewBox="0 0 50 50" width="18" height="18">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                PROCESSANDO...
              </div>
              <span v-else>CONFIRMAR E PROCESSAR</span>
            </button>
            <button @click="closeBankDataModal" class="cancel-button" :disabled="isProcessingOfx">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Classificação OFX -->
    <div v-if="showClassificationModal" class="modal-overlay" @click.self="closeClassificationModal">
      <div class="classification-modal">
        <div class="modal-header">
          <h2>CLASSIFICAÇÃO DE TRANSAÇÕES OFX</h2>
          <button class="close-button" @click="closeClassificationModal">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="file-info-modal">
            <svg class="file-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>{{ fileName }} - {{ filteredGroupedTransactions.length }} descrições para classificar</span>

            <!-- Indicador de Filtro Ativo -->
            <div v-if="dateFilter.isActive" class="active-date-filter-indicator">
              <span class="filter-badge">FILTRO ATIVO</span>
              <span class="filter-range">{{ formatDateRange() }}</span>
              <button @click="clearDateFilter" class="clear-filter-button">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <div class="input-group-codeBank">
              <div class="combobox-container">
                <input type="text" v-model="bankCodeInput" @input="filterBanks" @focus="showBankDropdown = true"
                  placeholder="Código Não Classificados" class="combobox-input">

                <!-- Botão para aplicar a seleção -->
                <button @click="onBankCodeApply" class="save-individual-button">
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          <!-- Sistema de Filtros -->
          <div class="filters-section">
            <div class="filters-container">
              <div class="filter-buttons">
                <button @click="setFilter('all')" class="filter-button" :class="{ 'active': currentFilter === 'all' }">
                  TODAS AS DESCRIÇÕES
                </button>
                <button @click="setFilter('classified')" class="filter-button"
                  :class="{ 'active': currentFilter === 'classified' }">
                  CLASSIFICADAS
                </button>
                <button @click="setFilter('pending')" class="filter-button"
                  :class="{ 'active': currentFilter === 'pending' }">
                  NÃO CLASSIFICADAS
                </button>
                <button @click="setFilter('individual')" class="filter-button"
                  :class="{ 'active': currentFilter === 'individual' }">
                  CLASSIFICAÇÕES INDIVIDUAIS
                </button>
              </div>

              <div class="filter-stats">
                <span class="filter-stat">Total de Históricos: {{ groupedTransactions.length }}</span>
                <span class="filter-stat classified">Classificadas: {{ classifiedCount }}</span>
                <span class="filter-stat pending">Pendentes: {{ pendingCount }}</span>
                <span class="filter-stat individual"> Transações Individuais: {{ individualTransactionsCount }}</span>
                <span class="filter-stat individual"> Transações Totais: {{ individualClassificationsCount }}</span>
              </div>
            </div>
          </div>

          <!-- Filtro de Data/Período dentro do Modal -->
          <div class="date-filter-modal-section">
            <div class="filter-toggle-header" @click="toggleDateFilterVisibility">
              <h3>FILTRAR TRANSAÇÕES POR PERÍODO</h3>
              <svg class="filter-toggle-icon" :class="{ 'rotated': showDateFilter }" viewBox="0 0 24 24">
                <path d="M7,10L12,15L17,10H7Z" />
              </svg>
            </div>
            <div v-if="showDateFilter" class="date-filter-controls-modal">
              <div class="date-input-group-modal">
                <label>Data Inicial:</label>
                <input type="date" v-model="dateFilter.startDate" class="date-input-modal">
              </div>
              <div class="date-input-group-modal">
                <label>Data Final:</label>
                <input type="date" v-model="dateFilter.endDate" class="date-input-modal">
              </div>
              <div class="date-filter-actions-modal">
                <button @click="applyDateFilter" :disabled="!isDateFilterValid" class="filter-apply-button-modal">
                  APLICAR FILTRO
                </button>
                <button @click="clearDateFilter" class="filter-clear-button-modal">
                  LIMPAR FILTRO
                </button>
              </div>
            </div>
          </div>

          <!-- BARRA DE PESQUISA ÚNICA COM ALTERNÂNCIA E TOGGLE -->
          <div class="single-search-section">
            <div class="search-toggle-header" @click="toggleSearchVisibility">
              <div class="search-header-title">
                <svg class="search-toggle-icon" :class="{ 'rotated': showSearchSection }" viewBox="0 0 24 24">
                  <path d="M7,10L12,15L17,10H7Z" />
                </svg>
                BARRA DE PESQUISA
              </div>
            </div>

            <div v-if="showSearchSection" class="search-content">
              <div class="search-type-selector">
                <button @click="setSearchType('description')" class="search-type-button"
                  :class="{ 'active': currentSearchType === 'description' }">
                  PESQUISAR POR DESCRIÇÃO
                </button>
                <button @click="setSearchType('value')" class="search-type-button"
                  :class="{ 'active': currentSearchType === 'value' }">
                  PESQUISAR POR VALOR
                </button>
              </div>

              <div class="search-container">
                <div class="search-header">
                  {{ currentSearchType === 'description' ? 'PESQUISAR POR DESCRIÇÃO' : 'PESQUISAR POR VALOR' }}
                </div>
                <div class="search-input-group">
                  <svg class="search-icon" viewBox="0 0 24 24">
                    <path
                      d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                  </svg>
                  <input v-if="currentSearchType === 'description'" type="text" v-model="searchByDescription"
                    @input="performSearch" placeholder="Digite a descrição..." class="search-input">
                  <input v-else type="text" v-model="searchByValue" @input="performSearch"
                    placeholder="Digite o valor (ex: 150.50)..." class="search-input">
                  <button
                    v-if="(currentSearchType === 'description' && searchByDescription) || (currentSearchType === 'value' && searchByValue)"
                    @click="clearCurrentSearch" class="clear-search-button">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Classificação em Lote -->
              <div v-if="searchByDescription && searchResults.length > 0" class="batch-classification-section">
                <div class="search-results">
                  <div class="search-stats">
                    Encontradas {{ searchResults.length }} descrições
                    <span v-if="searchResultsPositive.length > 0">
                      ({{ searchResultsPositive.length }} positivas, {{ searchResultsNegative.length }} negativas)
                    </span>
                  </div>

                  <div v-if="searchResultsPositive.length > 0" class="batch-classification-group">
                    <h4 class="batch-group-title positive"> ({{ searchResultsPositive.length }})
                    </h4>
                    <div class="batch-input-fields">
                      <div class="code-input-group">
                        <label>Código Crédito (Positivas):</label>
                        <input type="text" v-model="batchCodesPositive.credito" placeholder="Ex: 5678"
                          class="batch-input">
                      </div>
                      <button @click="applyBatchClassification('positive')" :disabled="!batchCodesPositive.credito"
                        class="batch-apply-button">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                        </svg>
                        APLICAR PARA {{ searchResultsPositive.length }} ENTRADAS
                      </button>
                    </div>
                  </div>

                  <div v-if="searchResultsNegative.length > 0" class="batch-classification-group">
                    <h4 class="batch-group-title negative">SAÍDAS ({{ searchResultsNegative.length }})
                    </h4>
                    <div class="batch-input-fields">
                      <div class="code-input-group">
                        <label>Código Débito (Negativas):</label>
                        <input type="text" v-model="batchCodesNegative.debito" placeholder="Ex: 1234"
                          class="batch-input">
                      </div>
                      <button @click="applyBatchClassification('negative')" :disabled="!batchCodesNegative.debito"
                        class="batch-apply-button">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                        </svg>
                        APLICAR PARA {{ searchResultsNegative.length }} SAÍDAS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de Transações - LAYOUT DE DUAS COLUNAS -->
          <div class="transactions-container">
            <!-- LAYOUT ALTERNATIVO: Quando pesquisar por valor OU quando filtro individual está ativo -->
            <div v-if="(searchByValue && valueSearchResults.length > 0) || currentFilter === 'individual'">
              <div v-if="currentFilter === 'individual'" class="value-search-results-header">
                CLASSIFICAÇÕES INDIVIDUAIS: {{ individualTransactions.length }} transação(ões) com classificação
                individual
              </div>
              <div v-else class="value-search-results-header">
                RESULTADOS POR VALOR: {{ valueSearchResults.length }} transação(ões) encontrada(s)
              </div>

              <div v-for="(result, idx) in currentFilter === 'individual' ? individualTransactions : valueSearchResults"
                :key="`value-${idx}`" class="value-search-item"
                :class="{ 'has-individual-classification': result.hasIndividualClassification }">
                <div class="value-search-main">
                  <div class="value-search-left">
                    <span class="value-date">{{ result.data }}</span>
                    <span class="value-description">{{ result.descricao }}</span>
                  </div>
                  <div class="value-search-right">
                    <span class="value-amount" :class="{ 'negative': result.valor < 0, 'positive': result.valor >= 0 }">
                      {{ formatCurrency(result.valor) }}
                    </span>
                  </div>
                </div>

                <div class="individual-classification-info" v-if="result.hasIndividualClassification">
                  <span class="individual-badge">
                    ⚠️ CLASSIFICAÇÃO INDIVIDUAL
                  </span>
                </div>

                <!-- Classificação Individual -->
                <div class="individual-classification-fields">
                  <div class="code-input-group">
                    <label>Código Débito:</label>
                    <input type="text" v-model="result.codigoDebito" placeholder="Ex: 1234"
                      :readonly="result.valor >= 0">
                  </div>
                  <div class="code-input-group">
                    <label>Código Crédito:</label>
                    <input type="text" v-model="result.codigoCredito" placeholder="Ex: 5678"
                      :readonly="result.valor < 0">
                  </div>
                  <button @click="saveIndividualClassification(result)"
                    :disabled="!result.codigoDebito || !result.codigoCredito" class="save-individual-button">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                    SALVAR
                  </button>
                </div>
              </div>

              <div v-if="currentFilter === 'individual' && individualTransactions.length === 0" class="no-transactions">
                Nenhuma transação com classificação individual encontrada.
              </div>
            </div>

            <!-- LAYOUT NORMAL COM DUAS COLUNAS: Descrições agrupadas -->
            <div v-else class="two-columns-layout">
              <!-- Coluna 1: Descrições com valores positivos -->
              <div class="column positive-column">
                <div class="column-header">
                  <h3>ENTRADAS</h3>
                  <span class="column-count">{{ positiveGroups.length }} descrição(ões)</span>
                </div>

                <div class="description-group" v-for="(group, index) in positiveGroups" :key="`positive-${index}`"
                  :class="{
                    'classified': isDescriptionClassified(group),
                    'search-highlight': isInSearchResults(group),
                    'filtered-out': shouldFilterOut(group),
                    'has-individual-classifications': hasIndividualClassifications(group),
                    'single-transaction': group.transacoesDetalhadas.length === 1
                  }" v-show="!shouldFilterOut(group)">

                  <!-- NOVO LAYOUT PARA DESCRIÇÕES COM APENAS UMA TRANSAÇÃO -->
                  <div v-if="group.transacoesDetalhadas.length === 1" class="single-transaction-layout">
                    <div class="single-transaction-header">
                      <span class="single-transaction-date">{{ group.transacoesDetalhadas[0].data }}</span>
                      <span class="single-transaction-value" :class="{
                        'negative': group.transacoesDetalhadas[0].valor < 0,
                        'positive': group.transacoesDetalhadas[0].valor >= 0
                      }">
                        {{ formatCurrency(group.transacoesDetalhadas[0].valor) }}
                      </span>
                    </div>
                    <div class="single-transaction-description">
                      {{ group.descricao }}
                    </div>
                    <!-- EXIBIR TOTAL DE TRANSAÇÕES NO CARD -->
                    <div class="transaction-count-badge">
                      {{ group.transacoesDetalhadas.length }} transação(ões)
                    </div>
                    <div v-if="hasIndividualClassifications(group)" class="individual-count-badge-single">
                      {{ getIndividualClassificationCount(group) }} individual(is)
                    </div>
                  </div>

                  <!-- LAYOUT ORIGINAL PARA DESCRIÇÕES COM MÚLTIPLAS TRANSAÇÕES -->
                  <div v-else class="description-header" @click="toggleDescription(group)">
                    <div class="description-main">
                      <span class="description-text">{{ group.descricao }}</span>
                      <!-- EXIBIR TOTAL DE TRANSAÇÕES NO HEADER -->
                      <span class="transaction-count-badge-header">
                        {{ group.transacoesDetalhadas.length }} transação(ões)
                      </span>
                      <span v-if="hasIndividualClassifications(group)" class="individual-count-badge">
                        {{ getIndividualClassificationCount(group) }} individual(is)
                      </span>
                    </div>
                    <div class="description-controls">
                      <div class="description-status" :class="getStatusClass(group)">
                        {{ getStatusText(group) }}
                      </div>
                      <svg class="description-arrow" :class="{ 'rotated': group.expanded }" viewBox="0 0 24 24">
                        <path d="M7,10L12,15L17,10H7Z" />
                      </svg>
                    </div>
                  </div>

                  <div class="classification-fields">
                    <div class="code-input-group">
                      <label>Código Débito:</label>
                      <input type="text" v-model="group.codigoDebito" @input="validateGroupCode(group, 'debito')"
                        placeholder="Ex: 1234" :class="{ error: group.debitoError }"
                        :readonly="positiveGroups.length > 0" @focus="handleGroupDebitoFocus(group, $event)">
                      <span class="error-message" v-if="group.debitoError">{{ group.debitoError }}</span>
                    </div>

                    <div class="code-input-group">
                      <label>Código Crédito:</label>
                      <input type="text" v-model="group.codigoCredito" @input="validateGroupCode(group, 'credito')"
                        placeholder="Ex: 5678" :class="{ error: group.creditoError }" :readonly="group.creditoLocked || (selectedBankCode !== '' && group.total < 0) || (group.transacoesDetalhadas.length === 1
                          && group.transacoesDetalhadas[0].hasIndividualClassification)"
                        @focus="handleGroupCreditoFocus(group, $event)">
                      <span class="error-message" v-if="group.creditoError">{{ group.creditoError }}</span>
                    </div>
                  </div>

                  <div v-if="group.expanded && group.transacoesDetalhadas.length > 1" class="transactions-details">
                    <div class="transactions-list scrollable">
                      <div v-for="(transacao, i) in group.transacoesDetalhadas" :key="i" class="transaction-detail"
                        :class="{ 'has-individual-class': transacao.hasIndividualClassification }">
                        <span class="transaction-date">{{ transacao.data }}</span>
                        <span v-if="transacao.hasIndividualClassification" class="individual-marker">
                          ⚠️ Classificação Individual
                        </span>
                        <span class="transaction-value"
                          :class="{ negative: transacao.valor < 0, positive: transacao.valor >= 0 }">
                          {{ formatCurrency(transacao.valor) }}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Coluna 2: Descrições com valores negativos -->
              <div class="column negative-column">
                <div class="column-header">
                  <h3>SAÍDAS</h3>
                  <span class="column-count">{{ negativeGroups.length }} descrição(ões)</span>
                </div>

                <div class="description-group" v-for="(group, index) in negativeGroups" :key="`negative-${index}`"
                  :class="{
                    'classified': isDescriptionClassified(group),
                    'search-highlight': isInSearchResults(group),
                    'filtered-out': shouldFilterOut(group),
                    'has-individual-classifications': hasIndividualClassifications(group),
                    'single-transaction': group.transacoesDetalhadas.length === 1
                  }" v-show="!shouldFilterOut(group)">

                  <!-- NOVO LAYOUT PARA DESCRIÇÕES COM APENAS UMA TRANSAÇÃO -->
                  <div v-if="group.transacoesDetalhadas.length === 1" class="single-transaction-layout">
                    <div class="single-transaction-header">
                      <span class="single-transaction-date">{{ group.transacoesDetalhadas[0].data }}</span>
                      <span class="single-transaction-value" :class="{
                        'negative': group.transacoesDetalhadas[0].valor < 0,
                        'positive': group.transacoesDetalhadas[0].valor >= 0
                      }">
                        {{ formatCurrency(group.transacoesDetalhadas[0].valor) }}
                      </span>
                    </div>
                    <div class="single-transaction-description">
                      {{ group.descricao }}
                    </div>
                    <!-- EXIBIR TOTAL DE TRANSAÇÕES NO CARD -->
                    <div class="transaction-count-badge">
                      {{ group.transacoesDetalhadas.length }} transação(ões)
                    </div>
                    <div v-if="hasIndividualClassifications(group)" class="individual-count-badge-single">
                      {{ getIndividualClassificationCount(group) }} individual(is)
                    </div>
                  </div>

                  <!-- LAYOUT ORIGINAL PARA DESCRIÇÕES COM MÚLTIPLAS TRANSAÇÕES -->
                  <div v-else class="description-header" @click="toggleDescription(group)">
                    <div class="description-main">
                      <span class="description-text">{{ group.descricao }}</span>
                      <!-- EXIBIR TOTAL DE TRANSAÇÕES NO HEADER -->
                      <span class="transaction-count-badge-header">
                        {{ group.transacoesDetalhadas.length }} transação(ões)
                      </span>
                      <span v-if="hasIndividualClassifications(group)" class="individual-count-badge">
                        {{ getIndividualClassificationCount(group) }} individual(is)
                      </span>
                    </div>
                    <div class="description-controls">
                      <div class="description-status" :class="getStatusClass(group)">
                        {{ getStatusText(group) }}
                      </div>
                      <svg class="description-arrow" :class="{ 'rotated': group.expanded }" viewBox="0 0 24 24">
                        <path d="M7,10L12,15L17,10H7Z" />
                      </svg>
                    </div>
                  </div>

                  <div class="classification-fields">
                    <div class="code-input-group">
                      <label>Código Débito:</label>
                      <input type="text" v-model="group.codigoDebito" @input="validateGroupCode(group, 'debito')"
                        placeholder="Ex: 1234" :class="{ error: group.debitoError }" :readonly="group.debitoLocked || (selectedBankCode !== '' && group.total >= 0) || (group.transacoesDetalhadas.length === 1
                          && group.transacoesDetalhadas[0].hasIndividualClassification)"
                        @focus="handleGroupDebitoFocus(group, $event)">
                      <span class="error-message" v-if="group.debitoError">{{ group.debitoError }}</span>
                    </div>

                    <div class="code-input-group">
                      <label>Código Crédito:</label>
                      <input type="text" v-model="group.codigoCredito" @input="validateGroupCode(group, 'credito')"
                        placeholder="Ex: 5678" :class="{ error: group.creditoError }"
                        :readonly="negativeGroups.length > 0" @focus="handleGroupCreditoFocus(group, $event)">
                      <span class="error-message" v-if="group.creditoError">{{ group.creditoError }}</span>
                    </div>
                  </div>

                  <div v-if="group.expanded && group.transacoesDetalhadas.length > 1" class="transactions-details">
                    <div class="transactions-list scrollable">
                      <div v-for="(transacao, i) in group.transacoesDetalhadas" :key="i" class="transaction-detail"
                        :class="{ 'has-individual-class': transacao.hasIndividualClassification }">
                        <span class="transaction-date">{{ transacao.data }}</span>
                        <span v-if="transacao.hasIndividualClassification" class="individual-marker">
                          ⚠️ Classificação Individual
                        </span>
                        <span class="transaction-value"
                          :class="{ negative: transacao.valor < 0, positive: transacao.valor >= 0 }">
                          {{ formatCurrency(transacao.valor) }}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="filteredGroupedTransactions.length === 0 && !(searchByValue && valueSearchResults.length > 0) && currentFilter !== 'individual'"
              class="no-transactions">
              Nenhuma descrição encontrada com os filtros atuais.
            </div>
          </div>

          <div class="modal-actions">
            <button @click="saveClassification" :disabled="isSavingClassification || !isFormValid" class="save-button"
              :class="{ 'loading': isSavingClassification }">
              <div v-if="isSavingClassification" class="button-loading">
                <svg class="spinner" viewBox="0 0 50 50" width="18" height="18">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                SALVANDO...
              </div>
              <div v-else class="button-content">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                </svg>
                SALVAR CLASSIFICAÇÃO
              </div>
            </button>
            <button @click="closeClassificationModal" class="cancel-button" :disabled="isSavingClassification">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { UploadCommand } from '../../application/commands/UploadCommand'
import { UploadService } from '../../infrastructure/services/UploadService'
import { FileDownloadService } from '../../infrastructure/services/FileDownloadService'
import defaultAvatar from '../../images/avatar-sistema-pdf.png'
import EditEmployeeModal from '../modal/EditEmployeeModal.vue'
import { useAuthStore } from '../../stores/authStore'
import type { UploadResult } from '../../domain/models/UploadResult'
import { vMaska } from "maska/vue"

const authStore = useAuthStore()
onMounted(() => {
  authStore.markPageReady()
})

const user = computed(() => authStore.user)

// Controles de visibilidade
const showDateFilter = ref(false)
const showSearchSection = ref(false)

// Funções para alternar visibilidade
const toggleDateFilterVisibility = () => {
  showDateFilter.value = !showDateFilter.value
}

const toggleSearchVisibility = () => {
  showSearchSection.value = !showSearchSection.value
}

// Filtro de Data/Período
const dateFilter = ref({
  startDate: '',
  endDate: '',
  isActive: false
})

const isDateFilterValid = computed(() => {
  return dateFilter.value.startDate && dateFilter.value.endDate
})

const applyDateFilter = () => {
  if (!isDateFilterValid.value) return

  dateFilter.value.isActive = true

  // Aqui você pode adicionar lógica adicional se necessário
}

const clearDateFilter = () => {
  dateFilter.value = {
    startDate: '',
    endDate: '',
    isActive: false
  }
}

const formatDateRange = () => {
  if (!dateFilter.value.startDate || !dateFilter.value.endDate) return ''

  const start = new Date(dateFilter.value.startDate).toLocaleDateString('pt-BR')
  const end = new Date(dateFilter.value.endDate).toLocaleDateString('pt-BR')
  return `${start} a ${end}`
}

// Função para filtrar transações por data
const filterTransactionsByDate = (transactions: any[]) => {
  if (!dateFilter.value.isActive || !dateFilter.value.startDate || !dateFilter.value.endDate) {
    return transactions
  }

  const startDate = new Date(dateFilter.value.startDate)
  const endDate = new Date(dateFilter.value.endDate)

  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.data)
    return transactionDate >= startDate && transactionDate <= endDate
  })
}

const positiveGroups = computed(() => {
  const filtered = filteredGroupedTransactions.value.filter(group => group.total >= 0)
  return dateFilter.value.isActive ? filterGroupsByDate(filtered) : filtered
})

const negativeGroups = computed(() => {
  const filtered = filteredGroupedTransactions.value.filter(group => group.total < 0)
  return dateFilter.value.isActive ? filterGroupsByDate(filtered) : filtered
})

const filterGroupsByDate = (groups: any[]) => {
  const parseBrDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(NaN);
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
  };

  const parseIsoDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(NaN);
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
  };

  const startDate = parseIsoDate(dateFilter.value.startDate);
  const endDate = parseIsoDate(dateFilter.value.endDate);

  const filteredGroups = groups.map(group => {
    const filteredTransacoesDetalhadas = group.transacoesDetalhadas.filter((transacao: any) => {
      const transactionDate = parseBrDate(transacao.data);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    if (filteredTransacoesDetalhadas.length === 0) return null;

    const reactiveGroup = reactive({
      ...group,
      transacoesDetalhadas: filteredTransacoesDetalhadas,
      transacoes: filteredTransacoesDetalhadas.map((t: any) => ({
        data: t.data,
        valor: t.valor
      })),
      total: filteredTransacoesDetalhadas.reduce((sum: number, t: any) => sum + t.valor, 0)
    });

    return reactiveGroup;
  }).filter(group => group !== null);

  return reactive(filteredGroups);
};

const filteredGroupedTransactions = computed(() => {
  let filtered = groupedTransactions.value

  if (currentFilter.value === 'classified') {
    filtered = filtered.filter(group => isDescriptionClassified(group))
  } else if (currentFilter.value === 'pending') {
    filtered = filtered.filter(group => !isDescriptionClassified(group))
  } else if (currentFilter.value === 'individual') {
    filtered = filtered.filter(group => hasIndividualClassifications(group))
  }

  if (searchByDescription.value) {
    const searchTerm = searchByDescription.value.toLowerCase()
    filtered = filtered.filter(group =>
      group.descricao.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
})

// NOVO: Controle do tipo de pesquisa atual
const currentSearchType = ref<'description' | 'value'>('description')

const setSearchType = (type: 'description' | 'value') => {
  currentSearchType.value = type
  // Limpar a pesquisa anterior quando trocar o tipo
  if (type === 'description') {
    searchByValue.value = ''
    valueSearchResults.value = []
  } else {
    searchByDescription.value = ''
    searchResults.value = []
    batchCodesPositive.value = { debito: '', credito: '' }
    batchCodesNegative.value = { debito: '', credito: '' }
  }
}

const clearCurrentSearch = () => {
  if (currentSearchType.value === 'description') {
    clearDescriptionSearch()
  } else {
    clearValueSearch()
  }
}

// NOVO: Computed para contar transações individuais
const individualTransactionsCount = computed(() => {
  let count = 0
  groupedTransactions.value.forEach(group => {
    group.transacoesDetalhadas.forEach((transacao: any) => {
      if (transacao.hasIndividualClassification) {
        count++
      }
    })
  })
  return count
})

const showUserMenu = ref(false)
const showEditModal = ref(false)

const openEditModal = () => {
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  await authStore.logout()
}

const file = ref<File | null>(null)
const fileName = ref<string | null>(null)
const fileType = ref<string>('')
const uploadResult = ref<UploadResult | null>(null)
const isLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const showClassificationModal = ref(false)
const ofxTransactions = ref<any[]>([])
const groupedTransactions = ref<any[]>([])
const ofxFileName = ref('')
const ofxResponse = ref<any>(null)

const showBankDataModal = ref(false)
const cnpj = ref('')
const bankCode = ref('')
const cnpjFormatted = ref('')
const selectedBankCode = ref('')
const availableBanks = ref<any[]>([])

const bankCodeInput = ref('')
const showBankDropdown = ref(false)
const filteredBanks = ref<any[]>([])

const isProcessingOfx = ref(false)
const isSavingClassification = ref(false)

const searchByDescription = ref('')
const searchByValue = ref('')
const searchResults = ref<any[]>([])
const valueSearchResults = ref<any[]>([])

const batchCodesPositive = ref({
  debito: '',
  credito: ''
})
const batchCodesNegative = ref({
  debito: '',
  credito: ''
})

const currentFilter = ref<'all' | 'classified' | 'pending' | 'individual'>('all')

const individualClassifications = ref<Map<string, any>>(new Map())

const individualTransactions = computed(() => {
  const results: any[] = []

  groupedTransactions.value.forEach(group => {
    group.transacoesDetalhadas.forEach((transacao: any) => {
      if (transacao.hasIndividualClassification) {
        const individualClass = individualClassifications.value.get(transacao.transactionKey)

        results.push({
          descricao: group.descricao,
          data: transacao.data,
          valor: transacao.valor,
          transactionKey: transacao.transactionKey,
          codigoDebito: individualClass?.codigoDebito || '',
          codigoCredito: individualClass?.codigoCredito || '',
          hasIndividualClassification: true,
          isClassificacaoIndividual: true,
          groupRef: group
        })
      }
    })
  })

  // Aplicar filtro de data se estiver ativo
  if (dateFilter.value.isActive) {
    return filterTransactionsByDate(results)
  }

  return results
})

const setFilter = (filter: 'all' | 'classified' | 'pending' | 'individual') => {
  currentFilter.value = filter
}

const shouldFilterOut = (group: any) => {
  const isClassified = isDescriptionClassified(group)
  const hasIndividual = hasIndividualClassifications(group)

  if (currentFilter.value === 'classified') {
    return !isClassified
  } else if (currentFilter.value === 'pending') {
    return isClassified
  } else if (currentFilter.value === 'individual') {
    return !hasIndividual
  }

  return false
}

const getStatusClass = (group: any) => {
  return isDescriptionClassified(group) ? 'classified' : 'pending'
}

const getStatusText = (group: any) => {
  return isDescriptionClassified(group) ? 'CLASSIFICADA' : 'PENDENTE'
}

const createTransactionKey = (descricao: string, data: string, valor: number) => {
  return `${descricao}|${data}|${valor}`
}

const groupTransactionsByDescription = (transactions: any[]) => {
  const groupsMap = new Map()

  transactions.forEach(transaction => {
    const isAlreadyGrouped = transaction.datas && transaction.datas.length > 0 &&
      transaction.valores && transaction.valores.length > 0

    const descricao = transaction.descricao
    const tipo = transaction.tipoValor

    const groupKey = tipo ? `${descricao}_${tipo}` : descricao

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        descricao: descricao,
        tipo: tipo || 'MISTO',
        transacoes: [],
        transacoesDetalhadas: [],
        total: 0,
        codigoDebito: transaction.codigoDebito || '',
        codigoCredito: transaction.codigoCredito || '',
        debitoError: transaction.debitoError || '',
        creditoError: transaction.creditoError || '',
        debitoLocked: transaction.debitoLocked || false,
        creditoLocked: transaction.creditoLocked || false,
        classificada: transaction.classificada || false,
        expanded: false,
        codigosDebito: transaction.codigosDebito || [],
        codigosCredito: transaction.codigosCredito || [],
        codigosBanco: transaction.codigosBanco || [],
        dividido: !!tipo
      })
    }

    const group = groupsMap.get(groupKey)

    if (isAlreadyGrouped) {
      transaction.datas.forEach((data: string, index: number) => {
        const valor = transaction.valores[index]

        group.transacoes.push({
          data: data,
          valor: valor
        })

        const transKey = createTransactionKey(descricao, data, valor)
        const hasIndividual = individualClassifications.value.has(transKey)

        group.transacoesDetalhadas.push({
          descricao: descricao,
          data: data,
          valor: valor,
          transactionKey: transKey,
          hasIndividualClassification: hasIndividual,
          isClassificacaoIndividual: hasIndividual,
          codigoDebito: transaction.codigosDebito?.[index] || '',
          codigoCredito: transaction.codigosCredito?.[index] || '',
          codigoBanco: transaction.codigosBanco?.[0] || '',
          tipo: tipo
        })

        group.total += valor
      })
    } else {
      group.transacoes.push({
        data: transaction.data,
        valor: transaction.valor
      })

      const transKey = createTransactionKey(descricao, transaction.data, transaction.valor)
      const hasIndividual = individualClassifications.value.has(transKey)

      group.transacoesDetalhadas.push({
        descricao: descricao,
        data: transaction.data,
        valor: transaction.valor,
        transactionKey: transKey,
        hasIndividualClassification: hasIndividual,
        isClassificacaoIndividual: hasIndividual,
        codigoDebito: transaction.codigoDebito || '',
        codigoCredito: transaction.codigoCredito || '',
        codigoBanco: transaction.codigoBanco || '',
        tipo: tipo
      })

      group.total += transaction.valor
    }
  })

  return Array.from(groupsMap.values())
}

const hasIndividualClassifications = (group: any) => {
  return group.transacoesDetalhadas.some((transacao: any) =>
    transacao.hasIndividualClassification
  )
}

const getIndividualClassificationCount = (group: any) => {
  return group.transacoesDetalhadas.filter((transacao: any) =>
    transacao.hasIndividualClassification
  ).length
}

const getIndividualCount = (group: any) => {
  return group.transacoesDetalhadas.length;
}

const individualClassificationsCount = computed(() => {
  let count = 0
  groupedTransactions.value.forEach(group => {
    count += getIndividualCount(group)
  })
  console.log('Contagem de classificações individuais:', groupedTransactions.value)
  return count
})

const performSearch = () => {
  if (currentSearchType.value === 'value' && searchByValue.value.trim()) {
    searchByValueFunction()
  } else if (currentSearchType.value === 'description' && searchByDescription.value.trim()) {
    searchByDescriptionFunction()
  } else {
    searchResults.value = []
    valueSearchResults.value = []
  }
}

const searchByDescriptionFunction = () => {
  if (!searchByDescription.value.trim()) {
    searchResults.value = []
    return
  }

  const searchLower = searchByDescription.value.toLowerCase()
  const exactMatchRegex = new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')

  searchResults.value = groupedTransactions.value.filter(group => {
    return exactMatchRegex.test(group.descricao)
  })
}

const searchByValueFunction = () => {
  if (!searchByValue.value.trim()) {
    valueSearchResults.value = []
    return
  }

  const searchValue = parseFloat(searchByValue.value.replace(',', '.'))
  if (isNaN(searchValue)) {
    valueSearchResults.value = []
    return
  }

  const searchValueInCents = Math.round(searchValue * 100)
  const results: any[] = []

  // Usar os grupos filtrados por data quando o filtro estiver ativo
  const groupsToSearch = dateFilter.value.isActive
    ? [...positiveGroups.value, ...negativeGroups.value]
    : groupedTransactions.value

  groupsToSearch.forEach(group => {
    group.transacoesDetalhadas.forEach((transacao: any) => {
      const transactionValueInCents = Math.round(transacao.valor * 100)

      if (Math.abs(transactionValueInCents) === Math.abs(searchValueInCents)) {
        const transKey = transacao.transactionKey
        const individualClass = individualClassifications.value.get(transKey)

        results.push({
          descricao: group.descricao,
          data: transacao.data,
          valor: transacao.valor,
          transactionKey: transKey,
          codigoDebito: individualClass?.codigoDebito || '',
          codigoCredito: individualClass?.codigoCredito || '',
          hasIndividualClassification: individualClassifications.value.has(transKey),
          isClassificacaoIndividual: individualClassifications.value.has(transKey),
          groupRef: group
        })
      }
    })
  })

  // Não precisa mais aplicar filterTransactionsByDate aqui, pois já estamos usando grupos filtrados
  valueSearchResults.value = results
}

const clearDescriptionSearch = () => {
  searchByDescription.value = ''
  searchResults.value = []
  batchCodesPositive.value = { debito: '', credito: '' }
  batchCodesNegative.value = { debito: '', credito: '' }
}

const clearValueSearch = () => {
  searchByValue.value = ''
  valueSearchResults.value = []
}

const saveIndividualClassification = (result: any) => {
  if (!result.codigoDebito || !result.codigoCredito) {
    alert('Por favor, preencha ambos os códigos')
    return
  }

  individualClassifications.value.set(result.transactionKey, {
    codigoDebito: result.codigoDebito,
    codigoCredito: result.codigoCredito,
    descricao: result.descricao,
    data: result.data,
    valor: result.valor,
    isClassificacaoIndividual: true
  })

  result.hasIndividualClassification = true
  result.isClassificacaoIndividual = true

  const group = result.groupRef
  if (group && group.transacoesDetalhadas) {
    const transacao = group.transacoesDetalhadas.find((t: any) => t.transactionKey === result.transactionKey)
    if (transacao) {
      transacao.hasIndividualClassification = true
      transacao.isClassificacaoIndividual = true
    }
  }

  alert('Classificação individual salva com sucesso!')
}

const applyBankCodeToGroups = () => {
  if (!selectedBankCode.value) return

  groupedTransactions.value.forEach(group => {
    if (group.total >= 0 && group.codigoCredito === '') {
      group.codigoCredito = selectedBankCode.value.toString()
    } else if (group.total < 0 && group.codigoDebito === '') {
      group.codigoDebito = selectedBankCode.value.toString()
    }

    if (group.codigoDebito) validateGroupCode(group, 'debito')
    if (group.codigoCredito) validateGroupCode(group, 'credito')
  })
}

watch(
  () => groupedTransactions.value,
  (groups) => {
    groups.forEach(group => {
      if (
        Array.isArray(group.transacoesDetalhadas) &&
        group.transacoesDetalhadas.length === 1 &&
        group.transacoesDetalhadas[0].isClassificacaoIndividual === true
      ) {
        validateGroupCode(group, 'debito')
        validateGroupCode(group, 'credito')
      }
    })
  },
  { deep: true }
)

watch(valueSearchResults, (newResults) => {
  newResults.forEach(result => {
    if (result.groupRef &&
      result.groupRef.codigosBanco &&
      result.groupRef.codigosBanco.length > 0) {

      if (result.valor < 0) {
        result.codigoCredito = result.groupRef.codigosBanco[0]
      } else {
        result.codigoDebito = result.groupRef.codigosBanco[0]
      }
    } else {
      console.warn('GroupRef or codigosBanco not available for result:', result)
    }
  })
}, { deep: true })

watch(selectedBankCode, (newCode) => {
  if (newCode) {
    applyBankCodeToGroups()
  }
})

const handleGroupDebitoFocus = (group: any, event: FocusEvent) => {
  if (group.debitoLocked || (selectedBankCode.value !== '' && group.total >= 0)) {
    (event.target as HTMLInputElement).blur()
  }
}

const handleGroupCreditoFocus = (group: any, event: FocusEvent) => {
  if (group.creditoLocked || (selectedBankCode.value !== '' && group.total < 0)) {
    (event.target as HTMLInputElement).blur()
  }
}

const toggleDescription = (group: any) => {
  group.expanded = !group.expanded
}

const filterBanks = () => {
  if (!bankCodeInput.value.trim()) {
    filteredBanks.value = availableBanks.value
    return
  }

  const searchTerm = bankCodeInput.value.toLowerCase()
  filteredBanks.value = availableBanks.value.filter(bank =>
    String(bank.code).toLowerCase().includes(searchTerm) ||
    String(bank.name).toLowerCase().includes(searchTerm)
  )
}

const onBankCodeApply = () => {
  setTimeout(() => {
    showBankDropdown.value = false

    if (/^\d+$/.test(bankCodeInput.value)) {
      const bank = availableBanks.value.find(b => b.code === bankCodeInput.value)
      if (bank) {
        selectedBankCode.value = bank.code
        bankCodeInput.value = `${bank.code} - ${bank.name}`
      } else {
        selectedBankCode.value = bankCodeInput.value
      }
    } else if (bankCodeInput.value.includes(' - ')) {
      const parts = bankCodeInput.value.split(' - ')
      if (parts.length > 0) {
        selectedBankCode.value = parts[0]
      }
    }
  }, 200)
}

watch(availableBanks, (newBanks) => {
  filteredBanks.value = newBanks
}, { immediate: true })

const isValidFileType = (file: File): boolean => {
  const validTypes = [
    'application/pdf',
    'application/x-ofx',
    'text/xml',
    'application/xml'
  ]
  const validExtensions = ['.pdf', '.ofx']

  const extension = '.' + file.name.split('.').pop()?.toLowerCase()

  return validTypes.includes(file.type) || validExtensions.includes(extension)
}

const getFileType = (file: File): string => {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return 'PDF'
  } else if (file.type === 'application/x-ofx' || file.name.toLowerCase().endsWith('.ofx') ||
    file.type.includes('xml') || file.name.toLowerCase().endsWith('.xml')) {
    return 'OFX'
  }
  return ''
}

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const selectedFile = target.files[0]

    if (!isValidFileType(selectedFile)) {
      uploadResult.value = { success: false, message: 'Tipo de arquivo inválido. Use PDF ou OFX.' }
      return
    }

    file.value = selectedFile
    fileName.value = selectedFile.name
    fileType.value = getFileType(selectedFile)
    await handleUpload()
  }
}

const onDrop = async (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const droppedFile = event.dataTransfer.files[0]

    if (!isValidFileType(droppedFile)) {
      uploadResult.value = { success: false, message: 'Tipo de arquivo inválido. Use PDF ou OFX.' }
      return
    }

    file.value = droppedFile
    fileName.value = droppedFile.name
    fileType.value = getFileType(droppedFile)
    await handleUpload()
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const clearFile = () => {
  file.value = null
  fileName.value = null
  ofxFileName.value = ''
  fileType.value = ''
  uploadResult.value = null
  clearDateFilter() // Limpa o filtro também quando limpar arquivo
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleUpload = async () => {
  if (!file.value) return

  isLoading.value = true
  uploadResult.value = null

  try {
    if (fileType.value === 'PDF') {
      const command = new UploadCommand(file.value)
      const result = await UploadService.execute(command)
      uploadResult.value = result
    } else if (fileType.value === 'OFX') {
      showBankDataModal.value = true
    }
  } catch (error) {
    uploadResult.value = { success: false, message: 'Erro ao processar arquivo' }
  } finally {
    isLoading.value = false
  }
}

const closeBankDataModal = () => {
  showBankDataModal.value = false
  cnpj.value = ''
  selectedBankCode.value = ''
  valueSearchResults.value = []
  clearDateFilter() // Limpa o filtro ao fechar modal
  clearFile()
}

function validarCNPJ(cnpj: string): boolean {
  const cleanedCnpj = cnpj.replace(/[^\d]+/g, '')

  if (cleanedCnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleanedCnpj)) return false

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let soma = 0
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cleanedCnpj.charAt(i)) * pesos1[i]
  }

  let resto = soma % 11
  let digito1 = resto < 2 ? 0 : 11 - resto

  if (digito1 !== parseInt(cleanedCnpj.charAt(12))) return false

  soma = 0
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cleanedCnpj.charAt(i)) * pesos2[i]
  }

  resto = soma % 11
  let digito2 = resto < 2 ? 0 : 11 - resto

  return digito2 === parseInt(cleanedCnpj.charAt(13))
}

const isBankFormValid = computed(() => {
  const cnpjValido = validarCNPJ(cnpj.value)
  const codigoBancoValido = validarCodigoBanco(bankCode.value)

  return cnpjValido && codigoBancoValido
})

const validarCodigoBanco = (codigo: string): boolean => {
  if (!codigo) return false

  const codigoLimpo = codigo.replace(/\D/g, '')

  return (codigoLimpo.length === 3 || codigoLimpo.length === 4) &&
    /^\d+$/.test(codigoLimpo) &&
    !/^0+$/.test(codigoLimpo)
}

interface OfxTransaction {
  descricao: string
  datas: string[]
  valores: number[]
  codigosDebito?: (string | number)[]
  codigosCredito?: (string | number)[]
  codigosBanco?: (string | number)[]
  classificada?: boolean
  codigoDebito?: string
  codigoCredito?: string
  debitoError?: string
  creditoError?: string
  debitoLocked?: boolean
  creditoLocked?: boolean
  data?: string
  valor?: number
  dividida?: boolean
  tipo?: string
}

interface OfxResult {
  success: boolean
  type?: string
  status?: string
  outputPath?: string
  message?: string
  transacoesClassificadas?: OfxTransaction[]
  pendingTransactions?: OfxTransaction[]
}

interface Bank {
  code: string | number
  name: string
}

const proceedWithOfxProcessing = async (): Promise<void> => {
  if (!file.value || !isBankFormValid.value) return

  isProcessingOfx.value = true
  cnpjFormatted.value = cnpj.value.replace(/\D/g, '')

  // Incluir filtro de data no comando se estiver ativo
  const dateFilterData = dateFilter.value.isActive ? {
    startDate: dateFilter.value.startDate,
    endDate: dateFilter.value.endDate
  } : undefined

  const command = new UploadCommand(
    file.value,
    cnpj.value.replace(/\D/g, ''),
    bankCode.value.replace(/\D/g, ''),
    dateFilterData
  )

  try {
    const result = await UploadService.execute(command) as OfxResult

    if (result.success && result.type === 'ofx') {
      ofxResponse.value = result

      let allTransactions: OfxTransaction[] = [
        ...(result.transacoesClassificadas || []).map((transaction: OfxTransaction) => {
          const firstValue = transaction.valores?.[0] || 0;
          const isPositive = firstValue > 0;

          return {
            ...transaction,
            classificada: true,
            codigoDebito: transaction.codigosDebito?.[0]?.toString() || transaction.codigoDebito || '',
            codigoCredito: transaction.codigosCredito?.[0]?.toString() || transaction.codigoCredito || '',
            debitoError: '',
            creditoError: '',
            debitoLocked: isPositive,
            creditoLocked: !isPositive
          };
        })
      ];

      if (result.status === 'pending_classification') {
        const descricoesComValoresMistos = new Set<string>();
        const analiseDescricoes = new Map<string, { temPositivo: boolean; temNegativo: boolean }>();

        result.pendingTransactions?.forEach((transaction: OfxTransaction) => {
          const descricao = transaction.descricao;

          if (!analiseDescricoes.has(descricao)) {
            analiseDescricoes.set(descricao, {
              temPositivo: false,
              temNegativo: false
            });
          }

          const analise = analiseDescricoes.get(descricao)!;

          transaction.valores.forEach((valor: number) => {
            if (valor >= 0) analise.temPositivo = true;
            if (valor < 0) analise.temNegativo = true;
          });

          if (analise.temPositivo && analise.temNegativo) {
            descricoesComValoresMistos.add(descricao);
          }
        });

        const pendingTransactionsProcessed: OfxTransaction[] = (result.pendingTransactions || []).flatMap((transaction: OfxTransaction) => {
          const descricao = transaction.descricao;
          const deveDividir = descricoesComValoresMistos.has(descricao);

          if (!deveDividir) {
            const valorPositivo = transaction.valores[0] >= 0;
            return [{
              ...transaction,
              classificada: false,
              codigoDebito: valorPositivo ? (transaction.codigosBanco?.[0]?.toString() || '') : '',
              codigoCredito: !valorPositivo ? (transaction.codigosBanco?.[0]?.toString() || '') : '',
              debitoError: '',
              creditoError: '',
              debitoLocked: false,
              creditoLocked: false
            }];
          }

          const transacoesDivididas: OfxTransaction[] = [];

          transaction.datas.forEach((data: string, index: number) => {
            const valor = transaction.valores[index];
            const tipo = valor >= 0 ? 'POSITIVO' : 'NEGATIVO';

            transacoesDivididas.push({
              ...transaction,
              descricao: transaction.descricao,
              data: data,
              valor: valor,
              datas: [data],
              valores: [valor],
              codigosDebito: transaction.codigosDebito ? [transaction.codigosDebito[index]] : [],
              codigosCredito: transaction.codigosCredito ? [transaction.codigosCredito[index]] : [],
              codigosBanco: transaction.codigosBanco ? [transaction.codigosBanco[0]] : [],
              classificada: false,
              codigoDebito: valor >= 0 ? (transaction.codigosBanco?.[0]?.toString() || '') : '',
              codigoCredito: valor < 0 ? (transaction.codigosBanco?.[0]?.toString() || '') : '',
              debitoError: '',
              creditoError: '',
              debitoLocked: false,
              creditoLocked: false,
              dividida: true,
              tipo: tipo
            });
          });

          return transacoesDivididas;
        });

        allTransactions = [
          ...allTransactions,
          ...pendingTransactionsProcessed
        ];
      }

      ofxTransactions.value = allTransactions
      groupedTransactions.value = groupTransactionsByDescription(allTransactions)
      ofxFileName.value = file.value.name

      availableBanks.value = allTransactions
        .flatMap((t: OfxTransaction) => t.codigosBanco || [])
        .filter((code: string | number, index: number, self: (string | number)[]) => code != null && self.indexOf(code) === index)
        .sort((a: string | number, b: string | number) => Number(a) - Number(b))
        .map((code: string | number): Bank => ({ code, name: `Banco ${code}` }))

      showBankDataModal.value = false
      showClassificationModal.value = true

    } else {
      uploadResult.value = {
        success: true,
        status: 'completed',
        type: 'ofx',
        outputPath: 'outputPath' in result && typeof result.outputPath === 'string'
          ? result.outputPath
          : '',
        message: result.message || 'Nenhuma transação encontrada no arquivo OFX',
        transacoesClassificadas: [],
      };

      showBankDataModal.value = false
    }
  } catch (error) {
    console.error('Erro ao processar OFX:', error)
    uploadResult.value = { success: false, message: 'Erro ao processar arquivo OFX' }
  } finally {
    isProcessingOfx.value = false
  }
}

const handleDownload = async (event: Event) => {
  event.preventDefault()

  try {
    await FileDownloadService.execute()
  } catch (error) {
    uploadResult.value = { success: false, message: 'DOWNLOAD FAILED - TRY AGAIN' }
  }
}

const closeClassificationModal = () => {
  showClassificationModal.value = false
  ofxTransactions.value = []
  groupedTransactions.value = []
  ofxFileName.value = ''
  cnpj.value = ''
  bankCodeInput.value = ''
  selectedBankCode.value = ''
  currentFilter.value = 'all'
  searchByDescription.value = ''
  searchByValue.value = ''
  searchResults.value = []
  valueSearchResults.value = []
  individualClassifications.value.clear()
  currentSearchType.value = 'description' // Reset para pesquisa por descrição
  clearDateFilter() // Limpa o filtro ao fechar modal
  clearFile()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const validateGroupCode = (group: any, type: 'debito' | 'credito') => {
  const errorField = type === 'debito' ? 'debitoError' : 'creditoError'

  if (
    Array.isArray(group.transacoesDetalhadas) &&
    group.transacoesDetalhadas.length === 1 &&
    group.transacoesDetalhadas[0].isClassificacaoIndividual === true
  ) {
    group[errorField] = ''
    return true
  }

  const code = type === 'debito' ? group.codigoDebito : group.codigoCredito

  if (!code || code.trim() === '') {
    group[errorField] = 'Código é obrigatório'
    return false
  }

  if (!/^\d+$/.test(code)) {
    group[errorField] = 'Apenas números são permitidos'
    return false
  }

  group[errorField] = ''
  return true
}

const isFormValid = computed(() => {
  // Se o filtro de data está ativo, validar apenas os grupos visíveis
  const groupsToValidate = dateFilter.value.isActive
    ? [...positiveGroups.value, ...negativeGroups.value]
    : groupedTransactions.value;

  return groupsToValidate.every(group => {
    // Caso 1: Transação única com classificação individual - sempre válida
    if (group.transacoesDetalhadas.length === 1) {
      const unicaTransacao = group.transacoesDetalhadas[0];
      if (unicaTransacao.hasIndividualClassification) {
        return true;
      }
    }

    // Caso 2: Grupo com múltiplas transações - validar códigos
    const hasValidDebito = group.codigoDebito &&
      group.codigoDebito.trim() !== '' &&
      !group.debitoError;

    const hasValidCredito = group.codigoCredito &&
      group.codigoCredito.trim() !== '' &&
      !group.creditoError;

    return hasValidDebito && hasValidCredito;
  }) && groupsToValidate.length > 0; // Garante que há pelo menos um grupo para validar
});

const searchResultsPositive = computed(() => {
  return searchResults.value.filter(group => group.total >= 0)
})

const searchResultsNegative = computed(() => {
  return searchResults.value.filter(group => group.total < 0)
})

const applyBatchClassification = (type: 'positive' | 'negative') => {
  const codes = type === 'positive' ? batchCodesPositive.value : batchCodesNegative.value
  const targetGroups = type === 'positive' ? searchResultsPositive.value : searchResultsNegative.value

  if (!codes.credito && type === 'positive') {
    alert('Por favor, preencha código de crédito antes de aplicar.')
    return
  }

  if (!codes.debito && type === 'negative') {
    alert('Por favor, preencha código de débito antes de aplicar.')
    return
  }

  targetGroups.forEach(group => {
    if (type === 'positive') {
      group.codigoCredito = codes.credito
      if (!group.codigoDebito) {
        group.codigoDebito = selectedBankCode.value
      }
    } else {
      group.codigoDebito = codes.debito
      if (!group.codigoCredito) {
        group.codigoCredito = selectedBankCode.value
      }
    }

    group.debitoError = ''
    group.creditoError = ''
    group.debitoLocked = false
    group.creditoLocked = false
  })

  if (type === 'positive') {
    batchCodesPositive.value = { debito: '', credito: '' }
  } else {
    batchCodesNegative.value = { debito: '', credito: '' }
  }

  alert(`Códigos aplicados para ${targetGroups.length} descrições ${type === 'positive' ? 'positivas' : 'negativas'}!`)
}

const isInSearchResults = (group: any) => {
  return searchResults.value.includes(group)
}

const isDescriptionClassified = (group: any) => {
  if (group.transacoesDetalhadas.length === 1 && group.transacoesDetalhadas[0].hasIndividualClassification) {
    return true
  }
  return !!group.codigoDebito && !!group.codigoCredito
}

const classifiedCount = computed(() => {
  return groupedTransactions.value.filter(group =>
    (group.transacoesDetalhadas.length === 1 && group.transacoesDetalhadas[0].hasIndividualClassification)
    || (group.codigoDebito && group.codigoCredito)
  ).length
})

const pendingCount = computed(() => {
  return groupedTransactions.value.length - classifiedCount.value
})

const saveClassification = async () => {
  let isValid = true

  // Validar apenas as transações visíveis (considerando filtro)
  const visibleGroups = dateFilter.value.isActive
    ? [...positiveGroups.value, ...negativeGroups.value]
    : groupedTransactions.value

  visibleGroups.forEach(group => {
    const debitoValid = group.debitoTouched ? validateGroupCode(group, 'debito') : true
    const creditoValid = group.creditoTouched ? validateGroupCode(group, 'credito') : true

    if (!debitoValid || !creditoValid) {
      isValid = false
    }
  })

  if (!isValid) {
    alert('Por favor, corrija os erros antes de salvar.')
    return
  }

  isSavingClassification.value = true

  interface ClassifiedTransaction {
    descricao: string
    data: string
    valor: number
    codigoDebito: string
    codigoCredito: string
    codigoBanco: string
    isClassificacaoIndividual: boolean
  }

  const classifiedData: ClassifiedTransaction[] = []

  // Coletar apenas as transações visíveis (filtradas por data)
  visibleGroups.forEach(group => {
    group.transacoesDetalhadas.forEach((transacao: any) => {
      const transKey = transacao.transactionKey
      const individualClass = individualClassifications.value.get(transKey)
      const isIndividual = individualClassifications.value.has(transKey)

      classifiedData.push({
        descricao: group.descricao,
        data: transacao.data,
        valor: transacao.valor,
        codigoDebito: individualClass?.codigoDebito || group.codigoDebito,
        codigoCredito: individualClass?.codigoCredito || group.codigoCredito,
        codigoBanco: group.codigosBanco?.[0],
        isClassificacaoIndividual: isIndividual
      })
    })
  })

  try {
    const filterTransactionsByDateRange = (transactions: any[]) => {
      if (!dateFilter.value.isActive || !dateFilter.value.startDate || !dateFilter.value.endDate) {
        return transactions
      }

      const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

      const parseToDateOnly = (input: string | Date): Date | null => {
        if (!input) return null

        if (input instanceof Date && !isNaN(input.getTime())) {
          return dateOnly(input)
        }

        if (typeof input === 'string') {
          const s = input.trim()

          if (s.includes('/')) {
            const parts = s.split('/').map(p => parseInt(p, 10))
            if (parts.length === 3 && parts.every(n => !isNaN(n))) {
              const [day, month, year] = parts
              return new Date(year, month - 1, day)
            }
          }

          const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
          if (isoMatch) {
            const year = parseInt(isoMatch[1], 10)
            const month = parseInt(isoMatch[2], 10)
            const day = parseInt(isoMatch[3], 10)
            return new Date(year, month - 1, day)
          }

          const parsed = new Date(s)
          if (!isNaN(parsed.getTime())) {
            return dateOnly(parsed)
          }
        }

        return null
      }

      const startRaw = dateFilter.value.startDate
      const endRaw = dateFilter.value.endDate

      const start = parseToDateOnly(startRaw)
      const end = parseToDateOnly(endRaw)

      if (!start || !end) {
        return transactions
      }

      const startTs = dateOnly(start).getTime()
      const endTs = dateOnly(end).getTime()

      const filteredTransactions = transactions.map(transaction => {
        const filteredDatas: string[] = []
        const filteredValores: number[] = []
        const filteredCodigosDebito: any[] = []
        const filteredCodigosCredito: any[] = []

        transaction.datas.forEach((data: string, index: number) => {
          if (!data) return

          const transactionDateObj = parseToDateOnly(data)
          if (!transactionDateObj) return

          const txTs = transactionDateObj.getTime()

          if (txTs >= startTs && txTs <= endTs) {
            filteredDatas.push(data)
            filteredValores.push(transaction.valores[index])

            if (transaction.codigosDebito && transaction.codigosDebito[index] !== undefined) {
              filteredCodigosDebito.push(transaction.codigosDebito[index])
            }
            if (transaction.codigosCredito && transaction.codigosCredito[index] !== undefined) {
              filteredCodigosCredito.push(transaction.codigosCredito[index])
            }
          }
        })

        if (filteredDatas.length === 0) return null

        return {
          ...transaction,
          datas: filteredDatas,
          valores: filteredValores,
          codigosDebito: filteredCodigosDebito.length > 0 ? filteredCodigosDebito : (transaction.codigosDebito || []),
          codigosCredito: filteredCodigosCredito.length > 0 ? filteredCodigosCredito : (transaction.codigosCredito || [])
        }
      }).filter(t => t !== null)

      return filteredTransactions
    }


    const transacoesClassificadasFiltradas = filterTransactionsByDateRange(
      ofxResponse.value?.transacoesClassificadas || []
    )


    const transacoesPendentesFiltradas = filterTransactionsByDateRange(
      ofxResponse.value?.pendingTransactions || []
    )


    const payload = {
      TransacoesClassificadas: transacoesClassificadasFiltradas,
      Classificacoes: classifiedData,
      TransacoesPendentes: transacoesPendentesFiltradas,
      cnpj: cnpjFormatted.value,
      dateFilter: dateFilter.value.isActive ? {
        startDate: dateFilter.value.startDate,
        endDate: dateFilter.value.endDate,
        isActive: dateFilter.value.isActive
      } : undefined
    }

    const result = await UploadService.saveClassification(payload)

    if (result.success) {
      uploadResult.value = {
        success: true,
        message: 'Classificação salva com sucesso',
        status: 'completed',
        type: 'ofx',
        outputPath: '',
        transacoesClassificadas: [],
      }
      showClassificationModal.value = false
    } else {
      throw new Error(result.message || 'Erro ao salvar classificação')
    }
  } catch (error) {
    console.error('Erro ao salvar classificação:', error)
    alert('Erro ao salvar classificação. Tente novamente.')
  } finally {
    isSavingClassification.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap');

.app-container {
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

input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
  border-color: #ddd;
  color: #555;
}

.transaction-item.classified .classification-fields input[readonly] {
  background-color: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

/* Estilos para os botões com loading */
.confirm-button,
.save-button {
  position: relative;
  transition: all 0.3s ease;
}

.confirm-button.loading,
.save-button.loading {
  background-color: #666;
  cursor: not-allowed;
}

.confirm-button:disabled,
.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  animation: spin 1s linear infinite;
}

.spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
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

/* Estilos para desabilitar botões durante loading */
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Estilos para o modal de classificação */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.classification-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  border: 1px solid #333;
  position: relative;
}

.classification-modal::before {
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  background: rgba(30, 30, 30, 0.8);
}

.modal-header h2 {
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.close-button {
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

.close-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: rotate(90deg);
}

.close-button svg {
  fill: #aaa;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.batch-classification-section {
  margin-bottom: 2rem;
}

.search-container {
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
}

.search-input-group {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  fill: #aaa;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.clear-search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
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

.clear-search-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: translateY(-50%) rotate(90deg);
}

.clear-search-button svg {
  fill: #aaa;
}

.search-results {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid #444;
}

.search-stats {
  color: #f9cb28;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.batch-classification-group {
  margin-bottom: 2rem;
  background: rgba(50, 50, 50, 0.3);
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #555;
}

.batch-group-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.batch-group-title.positive {
  color: #4CAF50;
  border-left: 3px solid #4CAF50;
  padding-left: 1rem;
}

.batch-group-title.negative {
  color: #ff4d4d;
  border-left: 3px solid #ff4d4d;
  padding-left: 1rem;
}

.batch-input-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.batch-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.batch-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.batch-apply-button {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.batch-apply-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.batch-apply-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.no-results {
  text-align: center;
  color: #aaa;
  font-style: italic;
  padding: 2rem;
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #444;
}

/* Estilos para as estatísticas */
.classification-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #aaa;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.stat-value {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
}

.stat-value.classified {
  color: #4CAF50;
}

.stat-value.pending {
  color: #ff4d4d;
}

.transactions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 5px;
}

.transactions-container::-webkit-scrollbar {
  width: 6px;
}

.transactions-container::-webkit-scrollbar-track {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 3px;
}

.transactions-container::-webkit-scrollbar-thumb {
  background: #f9cb28;
  border-radius: 3px;
}

.transactions-container::-webkit-scrollbar-thumb:hover {
  background: #ff4d4d;
}

.transaction-item {
  background: rgba(40, 40, 40, 0.7);
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  border-color: #f9cb28;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.2);
}

.transaction-item.classified {
  border-left: 3px solid #4CAF50;
  background: rgba(40, 60, 40, 0.3);
}

.transaction-item.search-highlight {
  border-color: #f9cb28;
  box-shadow: 0 0 15px rgba(249, 203, 40, 0.3);
  background: rgba(249, 203, 40, 0.1);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.transaction-date {
  color: #aaa;
  font-size: 0.9rem;
}

.transaction-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.transaction-value.negative {
  color: #ff4d4d;
}

.transaction-value.positive {
  color: #4CAF50;
}

.transaction-description {
  color: #ddd;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.classification-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.code-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.code-input-group label {
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.code-input-group input {
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

.code-input-group input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.code-input-group input.error {
  border-color: #ff4d4d;
  box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.3);
}

.error-message {
  color: #ff4d4d;
  font-size: 0.8rem;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.save-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
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

  .classification-modal {
    width: 98%;
    margin: 5px;
    max-height: 98vh;
  }

  .modal-header h2 {
    font-size: 1.4rem;
  }

  .classification-fields,
  .batch-input-fields {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .save-button,
  .cancel-button {
    width: 100%;
    justify-content: center;
  }

  .classification-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }

  .transactions-container {
    max-height: 30vh;
  }

  .search-container {
    padding: 1rem;
  }

  .batch-classification-group {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1rem;
  }

  .search-input {
    padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  }

  .batch-apply-button {
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
  }
}

/* Estilos melhorados para o modal de dados bancários */
.bank-data-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border-radius: 8px;
  width: 95%;
  max-width: 500px;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  border: 1px solid #333;
  position: relative;
}

.bank-data-modal::before {
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  background: rgba(30, 30, 30, 0.8);
}

.modal-header h2 {
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.5);
}

.close-button {
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

.close-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
  transform: rotate(90deg);
}

.close-button svg {
  fill: #aaa;
}

.file-info-modal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(40, 40, 40, 0.8);
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border-left: 3px solid #f9cb28;
  font-size: 0.95rem;
  color: #ddd;
}

.bank-fields {
  padding: 0;
}

.input-group {
  margin-bottom: 1.5rem;

}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.input-group input::placeholder {
  color: #777;
}

.input-group-codeBank input,
.input-group-codeBank select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group-codeBank input:focus,
.input-group-codeBank select:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.input-group-codeBank input::placeholder {
  color: #777;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.confirm-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.confirm-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.cancel-button:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
}

/* Ajuste para mobile */
@media (max-width: 768px) {
  .bank-data-modal {
    width: 98%;
    margin: 5px;
    max-height: 98vh;
  }

  .modal-header h2 {
    font-size: 1.4rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .confirm-button,
  .cancel-button {
    width: 100%;
    justify-content: center;
  }
}

/* Animações */
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

/* Estilos para o combobox */
.combobox-container {
  position: relative;
  width: 100%;
  display: flex;
}

.combobox-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 10px;
}

.combobox-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 1000;
  margin-top: 4px;
}

.combobox-option {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  color: #000;
}

.combobox-option:hover {
  background-color: #f5f5f5;
}

.combobox-option:last-child {
  border-bottom: none;
}

.combobox-no-results {
  padding: 8px 12px;
  color: #666;
  font-style: italic;
}

.description-group {
  border: 1px solid #333;
  border-radius: 6px;
  margin-bottom: 1rem;
  background: rgba(40, 40, 40, 0.7);
  transition: all 0.3s ease;
  position: relative;
}

.description-group.classified {
  border-left: 3px solid #4CAF50;
  background: rgba(40, 60, 40, 0.3);
}

.description-group.search-highlight {
  background: rgba(249, 203, 40, 0.1);
  border-color: #f9cb28;
  box-shadow: 0 0 15px rgba(249, 203, 40, 0.3);
}

.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
}

.description-header:hover {
  background: rgba(50, 50, 50, 0.8);
  border-color: #f9cb28;
}

.description-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.description-text {
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.description-count {
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 600;
}

.description-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.description-total {
  font-weight: 700;
  font-size: 1.1rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
}

.description-total.positive {
  color: #4CAF50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.description-total.negative {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
}

.description-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  fill: #f9cb28;
}

.description-arrow.rotated {
  transform: rotate(180deg);
}

.classification-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #333;
  background: rgba(30, 30, 30, 0.5);
}

.transactions-details {
  border-top: 1px solid #333;
  background: rgba(40, 40, 40, 0.5);
  overflow-y: auto;
}

.transactions-list {
  padding: 0.75rem 1rem;
}

.transactions-list.scrollable {
  max-height: 300px;
  /* ou o que fizer sentido */
  overflow-y: auto;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e2e2;
  border-radius: 8px;
}


.transaction-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #444;
  transition: all 0.3s ease;
}

.transaction-detail:hover {
  background: rgba(255, 255, 255, 0.05);
}

.transaction-detail:last-child {
  border-bottom: none;
}

.transaction-date {
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 600;
}

.transaction-value {
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
}

.transaction-value.positive {
  color: #4CAF50;
}

.transaction-value.negative {
  color: #ff4d4d;
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .description-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .description-controls {
    width: 100%;
    justify-content: space-between;
  }

  .classification-fields {
    grid-template-columns: 1fr;
  }
}

/* Estilos para os campos de código */
.code-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.code-input-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.code-input-group input {
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.9rem;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

.code-input-group input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.code-input-group input.error {
  border-color: #ff4d4d;
  box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.3);
}

.error-message {
  font-size: 0.8rem;
  color: #ff4d4d;
  font-weight: 600;
}

/* Estilos para os botões de classificação em lote */
.batch-classification-group {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px;
  border-left: 3px solid #f9cb28;
}

.batch-group-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-left: 0.75rem;
}

.batch-group-title.positive {
  color: #4CAF50;
  border-left-color: #4CAF50;
}

.batch-group-title.negative {
  color: #ff4d4d;
  border-left-color: #ff4d4d;
}

.batch-input-fields {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: end;
}

.batch-apply-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.batch-apply-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.batch-apply-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

/* Estatísticas */
.classification-stats {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px;
  border: 1px solid #333;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  color: #fff;
}

.stat-value.classified {
  color: #4CAF50;
}

.stat-value.pending {
  color: #ff4d4d;
}

/* Animações */
.description-group {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estilos para os filtros */
.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #f9cb28;
  background: rgba(30, 30, 30, 0.8);
  color: #f9cb28;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.filter-button:hover {
  background: #f9cb28;
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 203, 40, 0.4);
}

.filter-button.active {
  background: #f9cb28;
  color: #000;
  box-shadow: 0 0 15px rgba(249, 203, 40, 0.6);
}

.filter-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.filter-stat {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  color: white;
}

.filter-stat.classified {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.filter-stat.pending {
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
}

/* Estilos para os códigos nas descrições */
.description-codes {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.code-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Montserrat', sans-serif;
}

.code-tag.debito {
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
  border: 1px solid rgba(255, 77, 77, 0.3);
}

.code-tag.credito {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.code-tag.misto {
  background: rgba(249, 203, 40, 0.1);
  color: #f9cb28;
  border: 1px solid rgba(249, 203, 40, 0.3);
}

/* Estilos para o status */
.description-status {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-right: 0.75rem;
  font-family: 'Montserrat', sans-serif;
}

.description-status.classified {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.description-status.pending {
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
  border: 1px solid rgba(255, 77, 77, 0.3);
}

.description-status.partial {
  background: rgba(249, 203, 40, 0.1);
  color: #f9cb28;
  border: 1px solid rgba(249, 203, 40, 0.3);
}

/* Ajustes no cabeçalho da descrição */
.description-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
  padding: 1.5rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  position: relative;
}

.description-header:hover {
  background: rgba(50, 50, 50, 0.8);
  border-color: #f9cb28;
}

.description-main {
  flex: 1;
  min-width: 0;
}

.description-text {
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.3;
}

.description-count {
  font-size: 0.85rem;
  color: #aaa;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.description-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.description-total {
  font-weight: 700;
  font-size: 1.2rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.3);
}

.description-total.positive {
  color: #4CAF50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.description-total.negative {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
}

.description-total.mixed {
  color: #f9cb28;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.3);
}

.description-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  fill: #f9cb28;
  flex-shrink: 0;
}

.description-arrow.rotated {
  transform: rotate(180deg);
}

/* Melhorias na pesquisa */
.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.no-transactions {
  text-align: center;
  padding: 3rem;
  color: #aaa;
  font-style: italic;
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  border: 1px solid #444;
  font-size: 1.1rem;
}

/* Estados especiais para grupos */
.description-group.search-highlight {
  background: rgba(249, 203, 40, 0.1);
  border-color: #f9cb28;
  box-shadow: 0 0 20px rgba(249, 203, 40, 0.4);
}

.description-group.classified {
  border-left: 3px solid #4CAF50;
  background: rgba(40, 60, 40, 0.3);
}

.description-group.pending {
  border-left: 3px solid #ff4d4d;
  background: rgba(60, 40, 40, 0.3);
}

.description-group.partial {
  border-left: 3px solid #f9cb28;
  background: rgba(60, 60, 40, 0.3);
}

/* Badge de contador */
.count-badge {
  background: #f9cb28;
  color: #000;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-buttons {
    justify-content: center;
  }

  .filter-stats {
    justify-content: center;
    flex-wrap: wrap;
  }

  .description-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .description-controls {
    align-self: stretch;
    justify-content: space-between;
    border-top: 1px solid #333;
    padding-top: 1rem;
  }

  .description-text {
    font-size: 0.9rem;
  }

  .description-codes {
    justify-content: center;
  }

  .filter-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.75rem;
  }

  .filter-stat {
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .filters-section {
    padding: 1rem;
  }

  .description-header {
    padding: 1rem;
  }

  .description-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-buttons {
    gap: 0.5rem;
  }

  .filter-button {
    flex: 1;
    min-width: calc(50% - 0.5rem);
    text-align: center;
  }
}

/* Animações */
.filters-section {
  animation: slideDown 0.5s ease;
}

.description-group {
  animation: fadeInUp 0.5s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estados de hover melhorados */
.filter-button {
  position: relative;
  overflow: hidden;
}

.filter-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.filter-button:hover::before {
  left: 100%;
}

/* Scrollbar personalizada para a seção de filtros */
.filters-section::-webkit-scrollbar {
  width: 6px;
}

.filters-section::-webkit-scrollbar-track {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 3px;
}

.filters-section::-webkit-scrollbar-thumb {
  background: #f9cb28;
  border-radius: 3px;
}

.filters-section::-webkit-scrollbar-thumb:hover {
  background: #ff4d4d;
}

/* Estilos para as duas barras de pesquisa */
.dual-search-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 6px;
  border: 1px solid #333;
}

.search-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f9cb28;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Layout alternativo para pesquisa por valor */
.value-search-results-header {
  background: linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%);
  color: #000;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
}

.value-search-item {
  background: rgba(40, 40, 40, 0.7);
  border: 1px solid #333;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.value-search-item:hover {
  border-color: #f9cb28;
  box-shadow: 0 3px 10px rgba(249, 203, 40, 0.2);
  transform: translateY(-1px);
}

.value-search-item.has-individual-classification {
  border-color: #f9cb28;
  background: rgba(60, 60, 40, 0.3);
  border-left: 3px solid #f9cb28;
}

.value-search-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.value-search-left {
  font-size: 0.8rem;
  color: #aaa;
  font-weight: 600;
}

.value-date {
  background: rgba(249, 203, 40, 0.1);
  color: #f9cb28;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-weight: 600;
  font-size: 0.75rem;
}

.value-search-right {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
}

.value-amount.negative {
  color: #ff4d4d;
}

.value-amount.positive {
  color: #4CAF50;
}

.value-search-description {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.individual-badge {
  background: linear-gradient(135deg, #f9cb28, #ff4d4d);
  color: #000;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-weight: 700;
}

.individual-classification-fields {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #444;
}

.save-individual-button {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.3s ease;
  align-self: end;
  font-size: 0.8rem;
  min-width: 100px;
}

.save-individual-button:hover:not(:disabled) {
  background: linear-gradient(to right, #45a049, #1b5e20);
  transform: translateY(-1px);
}

.save-individual-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
}

/* Marcação no dropdown normal */
.transaction-detail.has-individual-class {
  background: rgba(60, 60, 40, 0.3);
  border-left: 3px solid #f9cb28;
  padding-left: 0.75rem;
}

.individual-marker {
  color: #f9cb28;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Estados de loading para o botão individual */
.spinner {
  width: 14px;
  height: 14px;
}

/* Responsividade */
@media (max-width: 768px) {
  .dual-search-section {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .individual-classification-fields {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .save-individual-button {
    width: 100%;
    font-size: 0.75rem;
  }

  .value-search-results-header {
    font-size: 1rem;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .value-search-item {
    padding: 0.75rem;
  }

  .value-search-description {
    font-size: 0.85rem;
  }

  .dual-search-section {
    margin-bottom: 1rem;
    padding: 0.5rem;
  }
}

/* Estilos existentes permanecem os mesmos, apenas adicionando os novos */
.individual-count-badge {
  background: #ff6b35;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 8px;
  font-weight: 600;
  width: 50%;
}

.filter-stat.individual {
  color: #ff6b35;
  font-weight: 600;
}

.description-group.has-individual-classifications {
  border-left: 3px solid #ff6b35;
}

.individual-badge {
  background: #ff6b35;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-left: 8px;
  font-weight: 600;
}

.value-search-item.has-individual-classification {
  border-left: 3px solid #ff6b35;
}

/* Adicione estes estilos para melhorar a aparência dos campos readonly */
input[readonly] {
  background-color: #0c0808;
  cursor: not-allowed;
  opacity: 0.7;
}

.combobox-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.two-columns-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.column-header {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid;
  display: flex;
  justify-content: between;
  align-items: center;
}

.positive-column .column-header {
  border-left-color: #28a745;
  background: #000000;
}

.negative-column .column-header {
  border-left-color: #dc3545;
  background: #000000;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.column-count {
  font-size: 12px;
  color: white;
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

/* Responsividade */
@media (max-width: 1200px) {
  .two-columns-layout {
    grid-template-columns: 1fr;
  }
}

/* Estilos para o filtro de data/periodo */
.date-filter-section {
  margin: 20px 0;
  padding: 1.5rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.date-filter-section h3 {
  margin-bottom: 1rem;
  color: #f9cb28;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bebas Neue', sans-serif;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.3);
}

.date-filter-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.9rem;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  min-width: 150px;
}

.date-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.date-input::placeholder {
  color: #777;
}

.date-filter-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-apply-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.filter-apply-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.filter-apply-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.filter-clear-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.filter-clear-button:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
  transform: translateY(-2px);
}

.filter-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 0.75rem;
}

.active-filter-badge {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bebas Neue', sans-serif;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.filter-dates {
  font-size: 0.8rem;
  color: #f9cb28;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Estilos para o filtro dentro do modal */
.date-filter-modal-section {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  border-left: 3px solid #f9cb28;
}

.date-filter-modal-section h3 {
  margin-bottom: 0.75rem;
  color: #f9cb28;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.date-filter-controls-modal {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.date-input-group-modal {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-input-group-modal label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.date-input-modal {
  padding: 0.5rem 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.8rem;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  min-width: 140px;
}

.date-input-modal:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.date-filter-actions-modal {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-apply-button-modal {
  padding: 0.5rem 1rem;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.7rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.filter-apply-button-modal:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
}

.filter-apply-button-modal:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.filter-clear-button-modal {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.7rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.filter-clear-button-modal:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  border-color: #ff4d4d;
}

/* Indicador de filtro ativo no header do modal */
.active-date-filter-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(40, 60, 40, 0.3);
  border: 1px solid #4CAF50;
  border-radius: 4px;
}

.filter-badge {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filter-range {
  font-size: 0.7rem;
  color: #4CAF50;
  font-weight: 600;
  flex-grow: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-filter-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;
  color: #aaa;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-filter-button:hover {
  background-color: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.clear-filter-button svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

/* Estados de loading para os botões */
.filter-apply-button.loading,
.filter-apply-button-modal.loading {
  position: relative;
  background: #666;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  animation: rotate 1.5s linear infinite;
  width: 16px;
  height: 16px;
}

.spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

/* Animações */
.date-filter-section {
  animation: slideDown 0.5s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividade */
@media (max-width: 768px) {

  .date-filter-controls,
  .date-filter-controls-modal {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .date-input-group,
  .date-input-group-modal {
    width: 100%;
  }

  .date-input,
  .date-input-modal {
    min-width: auto;
    width: 100%;
  }

  .date-filter-actions,
  .date-filter-actions-modal {
    justify-content: center;
    width: 100%;
  }

  .filter-status {
    margin-left: 0;
    justify-content: center;
    width: 100%;
  }

  .active-date-filter-indicator {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .date-filter-section {
    padding: 1rem;
    margin: 1rem 0;
  }

  .date-filter-modal-section {
    padding: 0.75rem;
  }

  .date-filter-actions,
  .date-filter-actions-modal {
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-apply-button,
  .filter-clear-button,
  .filter-apply-button-modal,
  .filter-clear-button-modal {
    width: 100%;
    justify-content: center;
  }
}

/* Estilos para a nova seção de pesquisa única */
.single-search-section {
  margin-bottom: 2rem;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.single-search-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff4d4d, #f9cb28, #ff4d4d);
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.search-type-selector {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #333;
  background: rgba(40, 40, 40, 0.8);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.search-type-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 600;
  color: #aaa;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  overflow: hidden;
}

.search-type-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(249, 203, 40, 0.1), transparent);
  transition: left 0.5s;
}

.search-type-button:hover::before {
  left: 100%;
}

.search-type-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #f9cb28;
}

.search-type-button.active {
  color: #f9cb28;
  border-bottom-color: #f9cb28;
  background-color: rgba(249, 203, 40, 0.1);
  font-weight: 700;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.3);
}

.search-container {
  width: 100%;
  box-sizing: border-box;
}

.search-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f9cb28;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bebas Neue', sans-serif;
  text-shadow: 0 0 10px rgba(249, 203, 40, 0.3);
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  fill: #f9cb28;
  z-index: 2;
  filter: drop-shadow(0 0 5px rgba(249, 203, 40, 0.5));
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border: 1px solid #444;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: rgba(40, 40, 40, 0.8);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.3);
}

.search-input::placeholder {
  color: #777;
}

.clear-search-button {
  position: absolute;
  right: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 2;
}

.clear-search-button:hover {
  background-color: rgba(255, 77, 77, 0.3);
}

.clear-search-button svg {
  fill: #aaa;
  width: 16px;
  height: 16px;
}

.clear-search-button:hover svg {
  fill: #ff4d4d;
}

/* Estados de loading e desabilitado */
.search-type-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-input:disabled {
  background-color: rgba(30, 30, 30, 0.5);
  color: #666;
  cursor: not-allowed;
}

/* Animações */
.single-search-section {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ajustes para manter a responsividade */
@media (max-width: 768px) {
  .single-search-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
  }

  .search-type-selector {
    flex-direction: column;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .search-type-button {
    margin-bottom: 0;
    border-bottom: 1px solid #333;
    border-radius: 0;
    border-bottom-width: 1px;
    border-right: none;
  }

  .search-type-button:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  .search-type-button:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border-bottom: none;
  }

  .search-type-button.active {
    border-bottom-color: #f9cb28;
    border-right: none;
  }

  .search-input {
    padding: 0.75rem 0.75rem 0.75rem 3rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .single-search-section {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .search-type-button {
    padding: 0.6rem 0.75rem;
    font-size: 0.75rem;
  }

  .search-header {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .search-input {
    padding: 0.6rem 0.6rem 0.6rem 2.5rem;
  }

  .search-icon {
    left: 10px;
    width: 16px;
    height: 16px;
  }

  .clear-search-button {
    padding: 0.4rem;
    right: 6px;
  }

  .clear-search-button svg {
    width: 14px;
    height: 14px;
  }
}

/* Estados especiais para integração com o sistema existente */
.single-search-section.search-highlight {
  border-color: #f9cb28;
  box-shadow: 0 0 20px rgba(249, 203, 40, 0.4);
  background: rgba(249, 203, 40, 0.05);
}

.single-search-section.classified {
  border-left: 3px solid #4CAF50;
  background: rgba(40, 60, 40, 0.3);
}

/* Garantir que não haja vazamentos globais */
.single-search-section * {
  box-sizing: border-box;
}

/* Integração com o sistema de filtros existente */
.filters-section+.single-search-section {
  margin-top: -1rem;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: none;
}

.single-search-section+.classification-stats {
  margin-top: 1rem;
}

.filter-toggle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.filter-toggle-header:hover {
  background-color: rgba(50, 50, 50, 0.8);
  border-color: #f9cb28;
}

.filter-toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  fill: #f9cb28;
}

.filter-toggle-icon.rotated {
  transform: rotate(180deg);
}

.search-toggle-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.search-toggle-header:hover {
  background-color: rgba(50, 50, 50, 0.8);
  border-color: #f9cb28;
}

.search-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Montserrat', sans-serif;
}

.search-toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  fill: #f9cb28;
}

.search-toggle-icon.rotated {
  transform: rotate(180deg);
}

.search-content {
  margin-top: 12px;
  padding: 16px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
}

/* Ajustes para os containers de filtro quando estão recolhidos */
.date-filter-controls,
.date-filter-controls-modal {
  transition: all 0.3s ease;
}

/* Estilos existentes mantidos com cores do tema */
.date-filter-section,
.date-filter-modal-section {
  margin: 20px 0;
  padding: 16px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
}

.single-search-section {
  margin: 20px 0;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  border: 1px solid #333;
  overflow: hidden;
}

/* NOVOS ESTILOS PARA LAYOUT DE TRANSAÇÃO ÚNICA */
.single-transaction-layout {
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(40, 40, 40, 0.7);
  transition: all 0.3s ease;
}

.single-transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.single-transaction-date {
  font-size: 12px;
  color: #aaa;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.single-transaction-value {
  font-size: 14px;
  font-weight: bold;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
}

.single-transaction-value.positive {
  color: #4CAF50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.single-transaction-value.negative {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
}

.single-transaction-description {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.3;
}

.individual-count-badge-single {
  background: #ff6b35;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Ajustes para grupos com transação única */
.description-group.single-transaction {
  background: rgba(40, 40, 40, 0.7);
  border: 1px solid #333;
}

.description-group.single-transaction .classification-fields {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #333;
}

.description-group.classified {
  border-left: 4px solid #4caf50;
  background: rgba(40, 60, 40, 0.3);
}

.transaction-count-badge {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
  display: inline-block;
}

.transaction-count-badge-header {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 8px;
}

/* Ajustes no layout para acomodar os novos badges */
.single-transaction-layout {
  position: relative;
  padding-bottom: 8px;
}

.description-main {
  display: flex;
  align-items: start;
  flex-wrap: wrap;
  gap: 8px;
}
</style>