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
      placeholder="搜索文章..."
      class="flex-1 sm:flex-none px-3 py-1.5 border rounded-lg text-sm sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      @keyup.enter="doSearch"
    />
    <button
      @click="doSearch"
      class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
    >
      搜索
    </button>
  </div>
</template>
