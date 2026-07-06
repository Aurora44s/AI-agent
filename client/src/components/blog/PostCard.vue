<script setup lang="ts">
import type { Post as PostType } from "@/api";
import { RouterLink } from "vue-router";
import TagBadge from "./TagBadge.vue";

defineProps<{ post: PostType }>();
</script>

<template>
  <article
    class="card-accent group bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6
           hover:shadow-glow hover:border-primary-200 hover:-translate-y-1
           transition-all duration-300 ease-out"
  >
    <RouterLink :to="`/post/${post.slug}`" class="block">
      <!-- 封面图容器 -->
      <div v-if="post.coverImage" class="overflow-hidden rounded-lg mb-3 md:mb-4">
        <img
          :src="post.coverImage"
          :alt="post.title"
          class="w-full h-40 md:h-48 object-cover rounded-lg
                 group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>
      <!-- 无封面时的渐变占位 -->
      <div v-else class="h-2 bg-gradient-primary rounded-full mb-3 md:mb-4 w-12 group-hover:w-24 transition-all duration-500"></div>

      <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
        {{ post.title }}
      </h2>
      <p class="text-gray-500 text-xs md:text-sm mb-3 line-clamp-3 leading-relaxed">
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
