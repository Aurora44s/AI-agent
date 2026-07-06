<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const query = ref("");

function doSearch() {
  const q = query.value.trim();
  if (q) {
    router.push({ path: "/search", query: { q } });
  }
}

// 从 URL 同步搜索框内容
watch(
  () => router.currentRoute.value.query.q,
  (val) => {
    if (val && typeof val === "string") query.value = val;
  }
);
</script>

<template>
  <div class="flex gap-2 w-full sm:w-auto">
    <input
      v-model="query"
      type="text"
      placeholder="🔍 搜索文章..."
      class="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-xl text-sm sm:w-52
             bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
             transition-all duration-200"
      @keyup.enter="doSearch"
    />
    <button
      @click="doSearch"
      class="px-4 py-2 bg-gradient-primary text-white text-sm font-medium rounded-xl
             hover:shadow-glow transition-all duration-300 whitespace-nowrap"
    >
      搜索
    </button>
  </div>
</template>
