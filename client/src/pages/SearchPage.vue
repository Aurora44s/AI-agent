<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchPosts, type Post } from "@/api";
import PostCard from "@/components/blog/PostCard.vue";

const route = useRoute();
const postList = ref<Post[]>([]);
const loading = ref(false);
const query = ref("");

async function search() {
  const q = (route.query.q as string) || "";
  if (!q) return;
  query.value = q;
  loading.value = true;
  try {
    const res = await fetchPosts({ search: q, limit: 50 });
    postList.value = res.data.posts;
  } catch {
    console.error("搜索失败");
  } finally {
    loading.value = false;
  }
}

onMounted(search);
watch(() => route.query.q, search);
</script>

<template>
  <div class="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8">
    <h1 class="text-xl md:text-2xl font-bold text-gray-900 mb-1">
      搜索：{{ query }}
    </h1>
    <p class="text-gray-500 text-sm mb-6 md:mb-8">找到 {{ postList.length }} 篇文章</p>

    <div v-if="loading" class="text-center py-12 text-gray-400">搜索中...</div>
    <div v-else-if="postList.length > 0" class="grid gap-4 md:gap-6">
      <PostCard v-for="post in postList" :key="post.id" :post="post" />
    </div>
    <div v-else class="text-center py-12 text-gray-400">未找到相关文章</div>
  </div>
</template>
