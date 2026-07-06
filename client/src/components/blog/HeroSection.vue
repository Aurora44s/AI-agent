<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchSettings } from "@/api";

const router = useRouter();
const siteName = ref("个人博客");
const siteDesc = ref("分享技术与生活的点滴");
const searchQuery = ref("");

onMounted(async () => {
  try {
    const res = await fetchSettings();
    if (res.data.site_name) siteName.value = res.data.site_name;
    if (res.data.site_description) siteDesc.value = res.data.site_description;
  } catch {}
});

function doSearch() {
  const q = searchQuery.value.trim();
  if (q) {
    router.push({ path: "/search", query: { q } });
  }
}
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12 md:py-20 lg:py-24">
    <!-- 动态装饰背景 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- 浮动圆形 -->
      <div
        class="absolute -top-20 -left-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float"
        style="animation-delay: 0s"
      ></div>
      <div
        class="absolute top-1/2 -right-16 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-float"
        style="animation-delay: 2s"
      ></div>
      <div
        class="absolute -bottom-16 left-1/3 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-float"
        style="animation-delay: 4s"
      ></div>
      <!-- 网格点阵 -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="background-image: radial-gradient(circle, #6366f1 1px, transparent 1px); background-size: 32px 32px;"
      ></div>
    </div>

    <!-- 内容区 -->
    <div class="relative max-w-2xl mx-auto px-4 text-center">
      <!-- 小标签 -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-primary-100 rounded-full text-xs font-medium text-primary-600 mb-6 shadow-sm">
        <span class="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></span>
        欢迎来访
      </div>

      <!-- 大标题 -->
      <h1 class="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
        <span class="text-gradient">{{ siteName }}</span>
      </h1>

      <!-- 副标题 -->
      <p class="text-gray-500 text-sm md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
        {{ siteDesc }}
      </p>

      <!-- 搜索框 -->
      <div class="flex gap-2 max-w-md mx-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍  搜索感兴趣的文章..."
          class="flex-1 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm
                 shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                 transition-all duration-200"
          @keyup.enter="doSearch"
        />
        <button
          @click="doSearch"
          class="px-6 py-3 bg-gradient-primary text-white text-sm font-medium rounded-2xl
                 hover:shadow-glow hover:scale-105 active:scale-95
                 transition-all duration-300 whitespace-nowrap"
        >
          搜索
        </button>
      </div>

      <!-- 快捷标签 -->
      <div class="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400 flex-wrap">
        <span>热门标签：</span>
        <span class="px-2 py-0.5 bg-white/80 rounded-full border border-gray-100">JavaScript</span>
        <span class="px-2 py-0.5 bg-white/80 rounded-full border border-gray-100">Vue</span>
        <span class="px-2 py-0.5 bg-white/80 rounded-full border border-gray-100">生活</span>
      </div>
    </div>

    <!-- 底部波浪分割线 -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <path
          d="M0 48h1440V0c-141.6 23.2-424.8 33.6-720 19.2C424.8 4.8 141.6 8.8 0 24v24z"
          fill="currentColor"
          class="text-gray-50/80"
        />
      </svg>
    </div>
  </section>
</template>
