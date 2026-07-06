<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchPosts, type Post } from "@/api";
import PostCard from "@/components/blog/PostCard.vue";
import HeroSection from "@/components/blog/HeroSection.vue";
import SkeletonCard from "@/components/blog/SkeletonCard.vue";
import RevealWrapper from "@/components/blog/RevealWrapper.vue";

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
  <div>
    <!-- Hero 区域 -->
    <HeroSection />

    <!-- 文章列表 -->
    <div class="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-8 md:py-12">
      <!-- 区域标题 -->
      <div class="flex items-center gap-3 mb-6 md:mb-8">
        <div class="h-0.5 flex-1 bg-gray-200"></div>
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">最新文章</h2>
        <div class="h-0.5 flex-1 bg-gray-200"></div>
      </div>

      <!-- 骨架屏加载 -->
      <div v-if="loading" class="grid gap-4 md:gap-6">
        <SkeletonCard v-for="i in 3" :key="i" />
      </div>

      <!-- 文章列表 -->
      <div v-else-if="postList.length > 0" class="grid gap-4 md:gap-6">
        <RevealWrapper v-for="(post, idx) in postList" :key="post.id" :delay="idx * 80">
          <PostCard :post="post" />
        </RevealWrapper>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <div class="text-4xl mb-3">📝</div>
        <p class="text-gray-400">还没有文章，去管理后台写第一篇吧！</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages() > 1" class="flex justify-center flex-wrap gap-2 mt-8 md:mt-10">
        <button
          v-for="i in totalPages()"
          :key="i"
          @click="page = i; loadPosts(); window.scrollTo(0, 0)"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            page === i
              ? 'bg-gradient-primary text-white shadow-colored-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600',
          ]"
        >
          {{ i }}
        </button>
      </div>
    </div>
  </div>
</template>
