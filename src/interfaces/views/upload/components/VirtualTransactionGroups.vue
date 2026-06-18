<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

const props = defineProps<{
  groups: any[]
  side: 'positive' | 'negative'
}>()

const parentRef = ref<HTMLElement | null>(null)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.groups.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => 120,
    overscan: 8,
  }))
)

const virtualItems = computed(() => virtualizer.value.getVirtualItems())
</script>

<template>
  <div ref="parentRef" class="virtual-groups-list">
    <div :style="{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }">
      <div
        v-for="virtualRow in virtualItems"
        :key="`${side}-${virtualRow.index}`"
        class="description-group"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <slot :group="groups[virtualRow.index]" :index="virtualRow.index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-groups-list {
  max-height: 420px;
  overflow-y: auto;
}
</style>
