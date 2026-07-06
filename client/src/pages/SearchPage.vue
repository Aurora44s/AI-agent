<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchPosts, type Post } from "@/api";
import PostCard from "@/components/blog/PostCard.vue";
import SkeletonCard from "@/components/blog/SkeletonCard.vue";
import RevealWrapper from "@/components/blog/RevealWrapper.vue";

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
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl md:text-2xl font-bold text-gray-900 mb-1">
        搜索：<span class="text-gradient">{{ query }}</span>
      </h1>
      <p class="text-gray-400 text-sm">找到 {{ postList.length }} 篇文章</p>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="grid gap-4 md:gap-6">
      <SkeletonCard v-for="i in 2" :key="i" />
    </div>

    <div v-else-if="postList.length > 0" class="grid gap-4 md:gap-6">
      <RevealWrapper v-for="(post, idx) in postList" :key="post.id" :delay="idx * 80">
        <PostCard :post="post" />
      </RevealWrapper>
    </div>
    <div v-else class="text-center py-16">
      <div class="text-4xl mb-3">🔍</div>
      <p class="text-gray-400">未找到相关文章</p>
    </div>
  </div>
</template>
