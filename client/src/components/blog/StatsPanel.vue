<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchSettings, fetchPosts } from "@/api";

const postCount = ref(0);
const runDays = ref(0);
const loading = ref(true);

onMounted(async () => {
  try {
    const [settingsRes, postsRes] = await Promise.all([
      fetchSettings(),
      fetchPosts({ limit: 1 }),
    ]);
    postCount.value = postsRes.data.total;
    const startDate = settingsRes.data.site_start_date || "2025-06-01";
    runDays.value = Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / 86400000));
  } catch {
    postCount.value = 0;
    runDays.value = 1;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div
    class="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-6
           hover:shadow-xl transition-all duration-300"
  >
    <div v-if="loading" class="flex justify-center gap-6">
      <div class="text-center animate-pulse">
        <div class="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
        <div class="h-3 w-6 bg-gray-100 rounded mx-auto"></div>
      </div>
      <div class="text-center animate-pulse">
        <div class="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
        <div class="h-3 w-6 bg-gray-100 rounded mx-auto"></div>
      </div>
    </div>
    <div v-else class="flex justify-center gap-8">
      <div class="text-center">
        <p class="text-xl font-extrabold text-gradient">{{ postCount }}</p>
        <p class="text-[11px] text-gray-400 mt-0.5">文章</p>
      </div>
      <div class="w-px bg-gray-100"></div>
      <div class="text-center">
        <p class="text-xl font-extrabold text-gradient">{{ runDays }}</p>
        <p class="text-[11px] text-gray-400 mt-0.5">天</p>
      </div>
    </div>
  </div>
</template>
