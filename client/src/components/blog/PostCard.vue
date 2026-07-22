<script setup lang="ts">
import type { Post as PostType } from "@/api";
import { RouterLink } from "vue-router";
import TagBadge from "./TagBadge.vue";

defineProps<{ post: PostType }>();
</script>

<template>
  <article
    class="card-accent group bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/60 p-4 md:p-5
           hover:shadow-glow hover:border-primary-300 hover:-translate-y-1
           transition-all duration-300 ease-out flex gap-4"
  >
    <!-- 左侧: 正方形封面图 -->
    <RouterLink :to="`/post/${post.slug}`" class="shrink-0">
      <div
        v-if="post.coverImage"
        class="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden"
      >
        <img
          :src="post.coverImage"
          :alt="post.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>
      <!-- 无封面时的渐变占位方块 -->
      <div
        v-else
        class="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 flex items-center justify-center"
      >
        <span class="text-2xl md:text-3xl opacity-40">📝</span>
      </div>
    </RouterLink>

    <!-- 右侧: 内容 -->
    <div class="flex-1 min-w-0 flex flex-col">
      <RouterLink :to="`/post/${post.slug}`" class="block">
        <h2 class="text-base md:text-lg font-bold text-gray-900 mb-1.5 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">
          {{ post.title }}
        </h2>
        <p class="text-gray-500 text-xs md:text-sm mb-2 line-clamp-2 leading-relaxed">
          {{ post.excerpt || post.content.slice(0, 200) }}
        </p>
      </RouterLink>

      <div class="flex items-center justify-between flex-wrap gap-2 mt-auto">
        <div class="flex flex-wrap gap-1.5 md:gap-2">
          <TagBadge v-for="tag in post.tags" :key="tag.id" :tag="tag" />
        </div>
        <time class="text-xs text-gray-400">{{ post.createdAt?.slice(0, 10) }}</time>
      </div>
    </div>
  </article>
</template>
