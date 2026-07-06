<script setup lang="ts">
import type { Post as PostType } from "@/api";
import { RouterLink } from "vue-router";
import TagBadge from "./TagBadge.vue";

defineProps<{ post: PostType }>();
</script>

<template>
  <article class="bg-white rounded-lg shadow-sm border p-4 md:p-6 hover:shadow-md transition-shadow">
    <RouterLink :to="`/post/${post.slug}`" class="block">
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="w-full h-40 md:h-48 object-cover rounded-lg mb-3 md:mb-4"
      />
      <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
        {{ post.title }}
      </h2>
      <p class="text-gray-500 text-xs md:text-sm mb-3 line-clamp-3">
        {{ post.excerpt || post.content.slice(0, 200) }}
      </p>
    </RouterLink>
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex flex-wrap gap-1.5 md:gap-2">
        <TagBadge v-for="tag in post.tags" :key="tag.id" :tag="tag" />
      </div>
      <time class="text-xs text-gray-400">{{ post.createdAt?.slice(0, 10) }}</time>
    </div>
  </article>
</template>
