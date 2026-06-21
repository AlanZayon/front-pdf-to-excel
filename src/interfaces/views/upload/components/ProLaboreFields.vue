<script lang="ts" setup>
defineProps<{
  active: boolean
  value: string
  year: number
  isValid: boolean
}>()

defineEmits<{
  'update:active': [value: boolean]
  'update:year': [value: number]
  input: [event: Event]
}>()
</script>

<template>
  <div class="prolabore-section">
    <div class="prolabore-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          class="toggle-checkbox"
          :checked="active"
          :aria-checked="active"
          @change="$emit('update:active', ($event.target as HTMLInputElement).checked)"
        >
        <span class="toggle-switch"></span>
        <span class="toggle-text">INCLUIR PRO LABORE</span>
      </label>
      <p v-if="active" class="prolabore-info">Códigos contábeis: débito 188 / crédito 5</p>
    </div>

    <div v-if="active" class="prolabore-value-field">
      <div class="prolabore-fields-grid">
        <div class="input-group">
          <label for="proLaboreYear">Ano do Pro Labore:</label>
          <input
            id="proLaboreYear"
            type="number"
            class="prolabore-input prolabore-year-input"
            :value="year"
            min="2000"
            max="2099"
            step="1"
            inputmode="numeric"
            @input="$emit('update:year', Number(($event.target as HTMLInputElement).value))"
          >
        </div>

        <div class="input-group">
          <label for="proLaboreValue">Valor do Pro Labore:</label>
          <input
            id="proLaboreValue"
            type="text"
            :value="value"
            inputmode="decimal"
            placeholder="0,00"
            class="prolabore-input"
            @input="$emit('input', $event)"
          >
        </div>
      </div>
    </div>

    <div v-if="active && !isValid" class="validation-error">
      Informe um ano válido (2000–2099) e o valor do pro labore.
    </div>
  </div>
</template>

<style scoped>
.prolabore-section {
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(145deg, #1a1a1a, #000000);
  border-radius: 12px;
  border-left: 4px solid #f5921e;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.prolabore-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(245, 146, 30, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.prolabore-toggle {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  padding: 5px 0;
  transition: all 0.3s;
}

.toggle-label:hover {
  transform: translateX(5px);
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 28px;
  background: linear-gradient(to bottom, #333333, #1a1a1a);
  border-radius: 14px;
  transition: all 0.3s ease;
  border: 1px solid #444444;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5), 0 2px 2px rgba(0, 0, 0, 0.3);
}

.toggle-switch:before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #e0e0e0);
  top: 2px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  border: 1px solid #666666;
}

.toggle-checkbox:checked + .toggle-switch {
  background: linear-gradient(to bottom, #f5921e, #d47c15);
  border-color: #f5921e;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3), 0 0 10px rgba(245, 146, 30, 0.5);
}

.toggle-checkbox:checked + .toggle-switch:before {
  transform: translateX(28px);
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-color: #f5921e;
}

.toggle-text {
  font-size: 15px;
  letter-spacing: 0.8px;
  font-weight: 500;
  color: #f5921e;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #333333;
}

.toggle-label:hover .toggle-text {
  background: rgba(245, 146, 30, 0.2);
  border-color: #f5921e;
}

.prolabore-info {
  margin: 8px 0 0 70px;
  font-size: 13px;
  color: #aaaaaa;
  font-style: italic;
  padding: 8px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 2px solid #f5921e;
  line-height: 1.5;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
}

.prolabore-info::before {
  content: 'ⓘ';
  color: #f5921e;
  margin-right: 8px;
  font-weight: bold;
  font-style: normal;
  font-size: 14px;
  opacity: 0.9;
}

.prolabore-value-field {
  margin-top: 15px;
  padding: 20px;
  border-top: 2px solid #f5921e;
  background: linear-gradient(to bottom, #1a1a1a, #000000);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
}

.prolabore-fields-grid {
  display: grid;
  grid-template-columns: minmax(120px, 160px) minmax(0, 1fr);
  gap: 1rem;
  align-items: end;
}

.prolabore-value-field .input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prolabore-value-field label {
  font-size: 14px;
  font-weight: 700;
  color: #f5921e;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(245, 146, 30, 0.3);
}

.prolabore-input {
  padding: 12px 15px;
  border: 2px solid #333333;
  border-radius: 8px;
  font-size: 15px;
  color: #ffffff;
  background-color: #1a1a1a;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  font-weight: 500;
}

.prolabore-year-input {
  max-width: 160px;
}

.prolabore-input:focus {
  outline: none;
  border-color: #f5921e;
  background-color: #222222;
  box-shadow: 0 0 0 4px rgba(245, 146, 30, 0.2), 0 0 10px rgba(245, 146, 30, 0.3);
}

.prolabore-input:hover {
  border-color: #f5921e;
  background-color: #222222;
}

.prolabore-input::placeholder {
  color: #666666;
  font-style: italic;
  font-weight: 300;
}

.validation-error {
  color: #f5921e;
  font-size: 13px;
  margin-top: 10px;
  font-weight: 600;
  padding: 5px 10px 5px 62px;
  text-shadow: 0 0 3px rgba(245, 146, 30, 0.2);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border-left: 3px solid #f5921e;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .prolabore-section {
    padding: 15px;
    margin: 15px 0;
  }

  .prolabore-section::before {
    width: 100px;
    height: 100px;
  }

  .toggle-label {
    gap: 12px;
  }

  .toggle-switch {
    width: 50px;
    height: 24px;
  }

  .toggle-switch:before {
    width: 18px;
    height: 18px;
  }

  .toggle-checkbox:checked + .toggle-switch:before {
    transform: translateX(26px);
  }

  .toggle-text {
    font-size: 13px;
    padding: 3px 10px;
  }

  .prolabore-info {
    margin-left: 50px;
    font-size: 12px;
    padding: 6px 12px;
  }

  .prolabore-value-field {
    padding: 15px;
    margin-top: 10px;
  }

  .prolabore-fields-grid {
    grid-template-columns: 1fr;
  }

  .prolabore-value-field .input-group {
    gap: 8px;
  }

  .prolabore-value-field label {
    font-size: 13px;
  }

  .prolabore-input {
    padding: 10px 12px;
    font-size: 14px;
  }

  .prolabore-year-input {
    max-width: none;
  }

  .validation-error {
    padding-left: 10px;
    text-align: right;
    font-size: 12px;
  }
}
</style>
