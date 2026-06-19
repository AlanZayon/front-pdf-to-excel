<script lang="ts" setup>
import { computed } from 'vue'

export type JourneyStep = {
  id: string
  label: string
}

const props = defineProps<{
  steps: JourneyStep[]
  currentStepId: string
}>()

const currentIndex = computed(() => props.steps.findIndex((s) => s.id === props.currentStepId))

function stepState(index: number): 'done' | 'current' | 'upcoming' {
  if (index < currentIndex.value) return 'done'
  if (index === currentIndex.value) return 'current'
  return 'upcoming'
}
</script>

<template>
  <nav class="journey-stepper" aria-label="Progresso do fluxo">
    <ol class="stepper-list">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="stepper-item"
        :class="stepState(index)"
      >
        <span class="step-index">{{ index + 1 }}</span>
        <span class="step-label">{{ step.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.journey-stepper {
  margin-bottom: 1.5rem;
}

.stepper-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.stepper-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  border: 1px solid #333;
}

.stepper-item.done {
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.4);
}

.stepper-item.current {
  color: #f9cb28;
  border-color: rgba(249, 203, 40, 0.5);
  background: rgba(249, 203, 40, 0.08);
}

.step-index {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.65rem;
}

@media (max-width: 768px) {
  .stepper-list {
    flex-direction: column;
  }

  .stepper-item {
    width: 100%;
  }
}
</style>
