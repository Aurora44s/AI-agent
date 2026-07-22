<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchPosts, type Post } from "@/api";
import PostCard from "@/components/blog/PostCard.vue";
import SkeletonCard from "@/components/blog/SkeletonCard.vue";
import RevealWrapper from "@/components/blog/RevealWrapper.vue";
import Guestbook from "@/components/blog/Guestbook.vue";
import ProfileCard from "@/components/blog/ProfileCard.vue";
import StatsPanel from "@/components/blog/StatsPanel.vue";

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
    <!-- 背景图（sticky 固定，内容上滑覆盖） -->
    <div class="sticky top-0 z-0">
      <section class="relative overflow-hidden h-[80vh] md:h-screen">
        <!-- 背景图片 -->
        <img
          src="/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- 暗色遮罩 -->
        <div class="absolute inset-0 bg-black/40"></div>
        <!-- 浮动装饰 -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-20 -left-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float" style="animation-delay: 0s"></div>
          <div class="absolute top-1/2 -right-16 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-float" style="animation-delay: 2s"></div>
          <div class="absolute -bottom-16 left-1/3 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-float" style="animation-delay: 4s"></div>
        </div>
        <!-- 文字 -->
        <div class="relative h-full flex flex-col items-center justify-center px-4 text-center text-white">
          <span class="text-4xl md:text-6xl mb-4 md:mb-6">🚀</span>
          <h1 class="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 drop-shadow-lg">
            欢迎来到遇梦
          </h1>
          <p class="text-sm md:text-lg text-white/80 max-w-md drop-shadow">
            分享技术与生活的点滴
          </p>
        </div>
      </section>
    </div>

    <!-- 文章列表（紧接海浪下方） -->
    <div class="relative z-10 bg-gray-50 backdrop-blur-xl">
      <!-- 海浪效果 - 向上溢出到轮播图区域 -->
      <div class="absolute bottom-full left-0 right-0 pointer-events-none overflow-hidden wave-container">
        <!-- 波层3 (最后/最淡,高振幅) -->
        <div class="wave-layer wave-layer--back">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C180,0 420,100 720,40 C1020,-10 1260,100 1440,30 L1440,100 L0,100 Z"
                  fill="rgba(249,250,251,0.25)" />
          </svg>
        </div>
        <!-- 波层2 (中间,中高振幅) -->
        <div class="wave-layer wave-layer--mid">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 C240,5 480,95 720,35 C960,0 1200,90 1440,40 L1440,100 L0,100 Z"
                  fill="rgba(249,250,251,0.45)" />
          </svg>
        </div>
        <!-- 波层1 (最前/最浓) -->
        <div class="wave-layer wave-layer--front">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,55 C300,15 600,85 900,45 C1150,10 1380,60 1440,40 L1440,100 L0,100 Z"
                  fill="rgba(249,250,251,1)" />
          </svg>
        </div>
      </div>

    <div class="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pt-8 md:pt-12 pb-8 md:pb-12 relative">
      <!-- 左侧: 个人名片 (桌面端在文章区域左侧外部) -->
      <aside class="hidden lg:block absolute right-full mr-8 top-8 md:top-12 w-60">
        <div class="sticky top-20 space-y-4">
          <RevealWrapper :delay="0">
            <ProfileCard />
          </RevealWrapper>
          <RevealWrapper :delay="100">
            <StatsPanel />
          </RevealWrapper>
        </div>
      </aside>

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

    <!-- 留言板 -->
    <Guestbook />
    </div>
  </div>
</template>
