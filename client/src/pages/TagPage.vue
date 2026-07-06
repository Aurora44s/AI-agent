<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchPosts, type Post } from "@/api";
import PostCard from "@/components/blog/PostCard.vue";

const route = useRoute();
const postList = ref<Post[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const slug = route.params.slug as string;
    const res = await fetchPosts({ tag: slug });
    postList.value = res.data.posts;
  } catch {
    console.error("加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => route.params.slug, load);
</script>

<template>
  <div class="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8">
    <h1 class="text-xl md:text-2xl font-bold text-gray-900 mb-1">
      标签：{{ route.params.slug }}
    </h1>
    <p class="text-gray-500 text-sm mb-6 md:mb-8">共 {{ postList.length }} 篇文章</p>

    <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
    <div v-else-if="postList.length > 0" class="grid gap-4 md:gap-6">
      <PostCard v-for="post in postList" :key="post.id" :post="post" />
    </div>
    <div v-else class="text-center py-12 text-gray-400">该标签下暂无文章</div>
  </div>
</template>
