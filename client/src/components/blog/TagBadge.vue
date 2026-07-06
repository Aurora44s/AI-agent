<script setup lang="ts">
import type { Tag } from "@/api";
import { RouterLink } from "vue-router";

defineProps<{ tag: Tag }>();
</script>

<template>
  <RouterLink
    :to="`/tag/${tag.slug}`"
    class="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition-colors"
  >
    #{{ tag.name }}
  </RouterLink>
</template>
