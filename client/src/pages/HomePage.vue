<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchPosts, type Post } from "@/api";
import PostCard from "@/components/blog/PostCard.vue";
import SearchBar from "@/components/blog/SearchBar.vue";

const postList = ref<Post[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(true);

async function loadPosts() {
  loading.value = true;
  try {
    const res = await fetchPosts({ page: page.value, limit: 10 });
    postList.value = res.data.posts;
    total.value = res.data.total;
  } catch {
    console.error("加载文章失败");
  } finally {
    loading.value = false;
  }
}

onMounted(loadPosts);

const totalPages = () => Math.ceil(total.value / 10);
</script>

<template>
  <div class="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">最新文章</h1>
        <p class="text-gray-500 text-sm mt-1">分享技术与生活的点滴</p>
      </div>
      <SearchBar />
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>

    <!-- 文章列表 -->
    <div v-else-if="postList.length > 0" class="grid gap-4 md:gap-6">
      <PostCard v-for="post in postList" :key="post.id" :post="post" />
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12 text-gray-400">
      还没有文章，去管理后台写第一篇吧！
    </div>

    <!-- 分页 -->
    <div v-if="totalPages() > 1" class="flex justify-center flex-wrap gap-2 mt-6 md:mt-8">
      <button
        v-for="i in totalPages()"
        :key="i"
        @click="page = i; loadPosts(); window.scrollTo(0, 0)"
        :class="[
          'px-3 py-1.5 rounded text-sm transition-colors',
          page === i
            ? 'bg-blue-600 text-white'
            : 'bg-white border text-gray-600 hover:bg-gray-50',
        ]"
      >
        {{ i }}
      </button>
    </div>
  </div>
</template>
