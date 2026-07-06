<script setup lang="ts">
import { useScrollReveal } from "@/composables/useScrollReveal";

const props = defineProps<{ delay?: number }>();
const { isVisible, el } = useScrollReveal();
</script>

<template>
  <div
    :ref="(v) => (el = (v as HTMLElement | null))"
    :class="['reveal-item', { 'reveal-visible': isVisible }]"
    :style="{ transitionDelay: `${props.delay ?? 0}ms` }"
  >
    <slot />
  </div>
</template>

<style scoped>
.reveal-item {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
