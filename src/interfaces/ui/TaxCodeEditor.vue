<script lang="ts" setup>
import type { TaxCodes } from '../../application/interfaces/TaxCodes'
import type { ImpostoDto } from '../../application/dtos/ImpostoDto'
import {
  formatTaxName,
  getCreditoValue,
  getDebitoValue,
  isLinkedTax,
  LINKED_TAXES,
  syncLinkedTaxCodes,
} from '../../shared/composables/useTaxCodeLinkage'

const props = defineProps<{
  taxCodes: TaxCodes
  taxTypes: ImpostoDto[]
  disabled?: boolean
  showHeader?: boolean
}>()

const emit = defineEmits<{
  'update:taxCodes': [value: TaxCodes]
}>()

const displayedTaxTypes = () => props.taxTypes.filter((imposto) => imposto.Code)

const getDebitoValueForTax = (code: string): string =>
  getDebitoValue(code, props.taxCodes as Record<string, { debito?: string; credito?: string }>)

const getCreditoValueForTax = (code: string): string =>
  getCreditoValue(code, props.taxCodes as Record<string, { debito?: string; credito?: string }>)

const handleInput = (event: Event, taxCode: string, field: 'debito' | 'credito') => {
  if (taxCode === LINKED_TAXES.IRRF) return

  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(0, 5)
  target.value = value

  const updated = syncLinkedTaxCodes(
    props.taxCodes as Record<string, { debito?: string; credito?: string }>,
    taxCode,
    field,
    value || '_'
  )

  emit('update:taxCodes', updated as TaxCodes)
}
</script>

<template>
  <div class="tax-codes-section" :class="{ embedded: showHeader === false }">
    <div v-if="showHeader !== false" class="section-header">
      <div class="account-types-header">
        <span class="tax-label-spacer">TIPO DE IMPOSTO</span>
        <div class="account-types">
          <span class="account-type-label">DÉBITO</span>
          <span class="account-type-label">CRÉDITO</span>
        </div>
      </div>
    </div>

    <div v-for="tax in displayedTaxTypes()" :key="tax.id" class="tax-code-row">
      <label class="tax-label" :class="{ 'linked-tax': isLinkedTax(tax.Code!) }">
        {{ formatTaxName(tax.nome) }}
        <span v-if="isLinkedTax(tax.Code!)" class="linked-badge">(DCTFWEB)</span>
      </label>
      <div class="account-inputs">
        <input
          :value="getDebitoValueForTax(tax.Code!)"
          type="text"
          class="tax-input"
          :class="{ 'linked-input': isLinkedTax(tax.Code!) }"
          placeholder="Débito"
          :disabled="disabled || (isLinkedTax(tax.Code!) && tax.Code === 'IRRF')"
          maxlength="5"
          onkeypress="return event.charCode >= 48 && event.charCode <= 57"
          @input="handleInput($event, tax.Code!, 'debito')"
        >
        <input
          :value="getCreditoValueForTax(tax.Code!)"
          type="text"
          class="tax-input"
          :class="{ 'linked-input': isLinkedTax(tax.Code!) }"
          placeholder="Crédito"
          :disabled="disabled || (isLinkedTax(tax.Code!) && tax.Code === 'IRRF')"
          maxlength="5"
          onkeypress="return event.charCode >= 48 && event.charCode <= 57"
          @input="handleInput($event, tax.Code!, 'credito')"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.tax-codes-section {
  max-width: 1040px;
  margin: 0 auto;
  background: rgba(24, 24, 24, 0.96);
  border: 1px solid rgba(249, 203, 40, 0.12);
  border-radius: 0 0 18px 18px;
  padding: 1.25rem 1.25rem 0.75rem;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  box-sizing: border-box;
  overflow: hidden;
}

.tax-codes-section.embedded {
  max-width: 100%;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.section-header {
  margin-bottom: 1rem;
}

.account-types-header {
  display: grid;
  grid-template-columns: minmax(150px, 210px) minmax(0, 220px);
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.35rem;
  padding: 0 0 0.9rem;
  border-bottom: 1px solid rgba(249, 203, 40, 0.14);
  column-gap: 1.25rem;
  align-items: center;
}

.tax-label-spacer {
  color: #aaa;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
}

.account-types {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
}

.account-type-label {
  color: #aaa;
  font-size: 0.8rem;
  width: 96px;
  text-align: center;
  display: inline-block;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.tax-code-row {
  display: grid;
  grid-template-columns: minmax(150px, 210px) minmax(0, 220px);
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
  padding: 0.85rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  width: 100%;
  column-gap: 1.25rem;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
  box-sizing: border-box;
}

.tax-code-row:hover {
  border-color: rgba(249, 203, 40, 0.18);
  background: linear-gradient(90deg, rgba(249, 203, 40, 0.06), rgba(255, 255, 255, 0.02));
  transform: translateY(-1px);
}

.tax-code-row:last-child {
  border-bottom: none;
}

.tax-label {
  color: #ddd;
  font-weight: 600;
  font-size: 0.9rem;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  line-height: 1.25;
}

.linked-badge {
  font-size: 0.75rem;
  color: #f9cb28;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.account-inputs {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
}

.tax-input {
  width: 96px;
  padding: 0.65rem 0.5rem;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.15s ease;
  text-align: center;
  font-weight: 600;
  box-sizing: border-box;
  max-width: 100%;
}

.tax-input:focus {
  outline: none;
  border-color: #f9cb28;
  box-shadow: 0 0 0 2px rgba(249, 203, 40, 0.2);
  background: rgba(40, 40, 40, 0.95);
}

.tax-input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.tax-input::-webkit-inner-spin-button,
.tax-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@media (max-width: 768px) {
  .tax-code-row {
    grid-template-columns: 1fr;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.85rem;
  }

  .account-inputs {
    width: 100%;
    justify-content: flex-start;
    gap: 0.75rem;
  }

  .tax-input {
    width: calc(50% - 0.375rem);
  }

  .account-types-header {
    display: none;
  }

  .account-types {
    display: none;
  }
}
</style>
