<template>
    <div class="account-codes-page">
        <!-- Botão de Avançar no topo -->
        <button @click="router.push('/')" class="advance-button">
            AVANÇAR
        </button>

        <!-- Cabeçalho da Página -->
        <div class="page-header">
            <h1>CÓDIGOS DE CONTA</h1>
            <p class="page-subtitle">CONFIGURAÇÃO DOS TIPOS DE IMPOSTO</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Carregando códigos de conta...</p>
        </div>

        <!-- Tabela de Códigos de Conta -->
        <div v-else class="tax-codes-section">
            <div class="section-header">
                <div class="account-types-header">
                    <span class="tax-label-spacer">TIPO DE IMPOSTO</span>
                    <div class="account-types">
                        <span class="account-type-label">DÉBITO</span>
                        <span class="account-type-label">CRÉDITO</span>
                    </div>
                </div>
            </div>

<div class="tax-code-row" v-for="tax in taxTypes" :key="tax.id">
    <label class="tax-label">
        {{ tax.nome
            .replace('SIMPLES_NACIONAL', 'SIMPLES NACIONAL')
            .replace('MULTA_JUROS', 'MULTA E JUROS') }}
    </label>
    <div class="account-inputs">
        <input
            :value="taxCodes[tax.Code].debito === '_' ? '' : taxCodes[tax.Code].debito"
            @input="handleDebitoInput($event, tax.Code)"
            type="text"
            class="tax-input"
            :placeholder="'Débito'"
            :disabled="isSaving"
            maxlength="5"
            onkeypress="return event.charCode >= 48 && event.charCode <= 57"
        >
        <input
            :value="taxCodes[tax.Code].credito === '_' ? '' : taxCodes[tax.Code].credito"
            @input="handleCreditoInput($event, tax.Code)"
            type="text"
            class="tax-input"
            :placeholder="'Crédito'"
            :disabled="isSaving"
            maxlength="5"
            onkeypress="return event.charCode >= 48 && event.charCode <= 57"
        >
    </div>
</div>
        </div>

        <!-- Ações da Página -->
        <div class="page-actions">
            <button @click="cancel" class="cancel-button" :disabled="isSaving || isLoading">
                CANCELAR
            </button>
            <button @click="saveAccountCodes" class="save-button" :disabled="isSaving || isLoading"
                :class="{ 'loading': isSaving }">
                <span v-if="!isSaving">SALVAR CÓDIGOS</span>
                <span v-else class="button-loading">
                    <svg class="spinner" viewBox="0 0 50 50">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                    </svg>
                    SALVANDO...
                </span>
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ImpostoService } from '../../infrastructure/services/ImpostoService';
import { LoadImpostosCommand } from '../../application/commands/LoadImpostosCommand';
import { UpdateImpostosCommand } from '../../application/commands/UpdateImpostosCommand';
import type { TaxCodes } from '../../application/interfaces/TaxCodes';
import type { ImpostoDto } from '../../application/dtos/ImpostoDto';
import { useAuthStore } from '../../stores/authStore'

const router = useRouter();
const authStore = useAuthStore()

onMounted(() => {
    authStore.markPageReady()
})

// Dados reativos
const taxCodes = ref<TaxCodes>({});
const originalTaxCodes = ref<TaxCodes>({});
const taxTypes = ref<ImpostoDto[]>([]);
const isSaving = ref(false);
const isLoading = ref(true);

const cancel = () => {
    router.push('/');
};

const handleDebitoInput = (event: Event, taxCode: string) => {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, '').slice(0, 5);
    
    if (!taxCodes.value[taxCode]) {
        taxCodes.value[taxCode] = { debito: '_', credito: '_' };
    }
    taxCodes.value[taxCode].debito = value || '_';
    
    const taxType = taxTypes.value.find(t => t.Code === taxCode);
    if (taxType && taxType.codigoDebito) {
        taxType.codigoDebito.codigo = value || '_';
    }
    
    target.value = value;
};

const handleCreditoInput = (event: Event, taxCode: string) => {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, '').slice(0, 5);
    
    if (!taxCodes.value[taxCode]) {
        taxCodes.value[taxCode] = { debito: '_', credito: '_' };
    }
    taxCodes.value[taxCode].credito = value || '_';
    
    const taxType = taxTypes.value.find(t => t.Code === taxCode);
    if (taxType && taxType.codigoCredito) {
        taxType.codigoCredito.codigo = value || '_';
    }
    
    target.value = value;
};

const loadTaxCodes = async () => {
    try {
        isLoading.value = true;
        const command = LoadImpostosCommand.create();
        const result = await ImpostoService.loadImpostos(command);

        if (!result.success) {
            throw new Error(result.message);
        }

        if (result.data) {
            taxTypes.value = result.data.impostos.filter(imposto => imposto.Code);

            const codes: TaxCodes = {};
            result.data.impostos.forEach(imposto => {
                if (imposto.Code) {
                    codes[imposto.Code] = {
                        debito: imposto.codigoDebito?.codigo || '_',
                        credito: imposto.codigoCredito?.codigo || '_'
                    };
                }
            });

            taxCodes.value = codes;
            originalTaxCodes.value = JSON.parse(JSON.stringify(codes));
        }

    } catch (error) {
        console.error('Erro ao carregar códigos:', error);
        alert(error instanceof Error ? error.message : 'Erro ao carregar os códigos');
    } finally {
        isLoading.value = false;
    }
};

// Salva as alterações no backend
const saveAccountCodes = async () => {
    isSaving.value = true;
    try {
        // Filtra apenas os impostos que foram modificados
        const changes = taxTypes.value.filter(imposto => {
            const original = originalTaxCodes.value[imposto.Code];
            return (
                imposto.codigoDebito.codigo !== original?.debito ||
                imposto.codigoCredito.codigo !== original?.credito
            );
        });

        if (changes.length === 0) {
            alert('Nenhuma alteração para salvar.');
            router.push('/');
            return;
        }

        const command = UpdateImpostosCommand.create(changes);
        const result = await ImpostoService.updateImpostos(command);

        if (!result.success) {
            throw new Error(result.message);
        }

        // Atualiza os valores originais
        changes.forEach(change => {
            if (change.Code) {
                originalTaxCodes.value[change.Code] = {
                    debito: change.codigoDebito.codigo,
                    credito: change.codigoCredito.codigo
                };
            }
        });

        alert('Códigos salvos com sucesso!');

    } catch (error) {
        console.error('Erro ao salvar códigos:', error);
        alert(error instanceof Error ? error.message : 'Erro desconhecido ao salvar');
    } finally {
        isSaving.value = false;
    }
};
onMounted(() => {
    loadTaxCodes();
});
</script>

<style scoped>
/* Estilos base */
.account-codes-page {
    margin: 0 auto;
    padding: 2rem;
    background: #1a1a1a;
    position: relative;
}

/* Botão de Avançar */
.advance-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #4CAF50;
    border-radius: 4px;
    color: #4CAF50;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
}

.advance-button:hover {
    background: rgba(76, 175, 80, 0.1);
    transform: translateY(-1px);
}

/* Cabeçalho */
.page-header {
    margin-bottom: 2rem;
    text-align: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #333;
}

.page-header h1 {
    color: #f9cb28;
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 2px;
    font-size: 2.2rem;
    margin: 0;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.page-subtitle {
    color: #aaa;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

/* Seção de códigos fiscais */
.tax-codes-section {
    margin: 2rem 0;
}

.section-header {
    margin-bottom: 1.5rem;
}

.account-types-header {
    display: flex;
    width: 100%;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #333;
}

.tax-label-spacer {
    width: 180px;
    flex-shrink: 0;
    color: #aaa;
    font-weight: 600;
    font-size: 0.9rem;
}

.account-types {
    display: flex;
    flex: 1;
    gap: 1rem;
    justify-content: flex-end;
    padding-right: 12px;
}

.account-type-label {
    color: #aaa;
    font-size: 0.9rem;
    width: 80px;
    text-align: start;
    display: inline-block;
    font-weight: 600;
}

/* Linhas de códigos fiscais */
.tax-code-row {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(51, 51, 51, 0.5);
    width: 100%;
}

.tax-code-row:last-child {
    border-bottom: none;
}

.tax-label {
    color: #ddd;
    font-weight: 600;
    font-size: 0.9rem;
    width: 180px;
    flex-shrink: 0;
    padding-left: 4px;
}

.account-inputs {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex: 1;
    padding-right: 10px;
    align-items: center;
}

.tax-input {
    width: 80px;
    padding: 0.65rem 0.5rem;
    background: rgba(30, 30, 30, 0.7);
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    transition: all 0.15s ease;
    text-align: center;
}

.tax-input:focus {
    outline: none;
    border-color: #f9cb28;
    box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.2);
}

.tax-input::-webkit-inner-spin-button,
.tax-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Ações da página */
.page-actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #333;
    gap: 1rem;
}

.cancel-button {
    padding: 0.85rem 2rem;
    background: transparent;
    border: 1px solid #f9cb28;
    border-radius: 4px;
    color: #f9cb28;
    font-weight: 700;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    min-width: 200px;
}

.cancel-button:hover:not(:disabled) {
    background: rgba(249, 203, 40, 0.1);
    transform: translateY(-2px);
}

.cancel-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.save-button {
    padding: 0.85rem 2rem;
    background: linear-gradient(to right, #f9cb28, #ff8a00);
    border: none;
    border-radius: 4px;
    color: #1a1a1a;
    font-weight: 700;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    min-width: 200px;
}

.save-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(249, 203, 40, 0.3);
}

.save-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.save-button.loading {
    color: transparent;
}

/* Loading */
.button-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.spinner {
    animation: rotate 2s linear infinite;
    width: 20px;
    height: 20px;
}

.spinner .path {
    stroke: #1a1a1a;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
}

/* Animações */
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

/* Responsividade */
@media (max-width: 768px) {
    .account-codes-page {
        padding: 1rem;
    }

    .advance-button {
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.3rem 0.7rem;
        font-size: 0.7rem;
    }

    .tax-code-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .tax-label {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .account-inputs {
        width: 100%;
        justify-content: space-between;
        padding-right: 0;
    }

    .tax-input {
        width: 48%;
    }

    .account-types-header {
        display: none;
    }

    .account-types {
        display: none;
    }

    .page-actions {
        flex-direction: column;
    }
    
    .cancel-button,
    .save-button {
        width: 100%;
    }
}
</style>