<script setup lang="ts">
import type { Tag } from "@/api";
import { RouterLink } from "vue-router";
import { computed } from "vue";

const props = defineProps<{ tag: Tag }>();

// 根据 tag id 循环不同颜色
const colorClasses = computed(() => {
  const palettes = [
    "bg-primary-50 text-primary-700 hover:bg-primary-100",
    "bg-pink-50 text-pink-700 hover:bg-pink-100",
    "bg-amber-50 text-amber-700 hover:bg-amber-100",
    "bg-accent-50 text-accent-700 hover:bg-accent-100",
    "bg-purple-50 text-purple-700 hover:bg-purple-100",
    "bg-rose-50 text-rose-700 hover:bg-rose-100",
    "bg-sky-50 text-sky-700 hover:bg-sky-100",
  ];
  return palettes[props.tag.id % palettes.length];
});
</script>

<template>
  <RouterLink
    :to="`/tag/${tag.slug}`"
    :class="['tag-pill', colorClasses]"
  >
    #{{ tag.name }}
  </RouterLink>
</template>
