<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchTags, type Tag } from "@/api";
import { RouterLink } from "vue-router";

const tags = ref<Tag[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetchTags();
    tags.value = res.data;
  } catch {
    console.error("加载标签失败");
  } finally {
    loading.value = false;
  }
});

const colorClasses = (id: number) => {
  const palettes = [
    "bg-primary-50 text-primary-700 hover:bg-primary-100",
    "bg-pink-50 text-pink-700 hover:bg-pink-100",
    "bg-amber-50 text-amber-700 hover:bg-amber-100",
    "bg-accent-50 text-accent-700 hover:bg-accent-100",
    "bg-purple-50 text-purple-700 hover:bg-purple-100",
    "bg-rose-50 text-rose-700 hover:bg-rose-100",
    "bg-sky-50 text-sky-700 hover:bg-sky-100",
  ];
  return palettes[id % palettes.length];
};
</script>

<template>
  <div
    class="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-4
           hover:shadow-xl hover:-translate-y-0.5 hover:border-primary-200 transition-all duration-300"
  >
    <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
      标签
      <span v-if="!loading" class="text-gray-300 font-normal ml-1">· {{ tags.length }}</span>
    </h3>

    <!-- 加载骨架 -->
    <div v-if="loading" class="flex flex-wrap gap-2">
      <div v-for="i in 6" :key="i" class="h-6 w-14 bg-gray-100 rounded-full animate-pulse"></div>
    </div>

    <!-- 空状态 -->
    <p v-else-if="!tags.length" class="text-xs text-gray-300">暂无标签</p>

    <!-- 标签列表 -->
    <div v-else class="flex flex-wrap gap-2">
      <RouterLink
        v-for="tag in tags"
        :key="tag.id"
        :to="`/tag/${tag.slug}`"
        :class="[
          'inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-all duration-200',
          colorClasses(tag.id),
        ]"
      >
        #{{ tag.name }}
      </RouterLink>
    </div>
  </div>
</template>
