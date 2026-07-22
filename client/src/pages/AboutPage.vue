<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchSettings } from "@/api";
import MarkdownIt from "markdown-it";

const aboutContent = ref("");
const github = ref("");
const siteName = ref("");
const loading = ref(true);

const md = new MarkdownIt({ html: true });

onMounted(async () => {
  try {
    const res = await fetchSettings();
    aboutContent.value = res.data.about_me || "暂无介绍";
    github.value = res.data.github || "";
    siteName.value = res.data.site_name || "遇梦";
  } catch {
    console.error("加载关于页面失败");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen relative bg-fixed bg-cover bg-center" style="background-image: url('/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg')">
    <div class="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
    <div class="relative max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8">
      <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
    <div v-else>
      <!-- 页头 -->
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
          <span class="text-gradient">关于</span>
        </h1>
        <p class="text-gray-400 text-sm">了解更多关于我和这个博客的故事</p>
      </div>

      <!-- 内容卡片 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
        <div class="prose max-w-none" v-html="md.render(aboutContent)"></div>
      </div>

      <!-- GitHub 链接 -->
      <div v-if="github" class="mt-6 text-center">
        <a
          :href="github"
          target="_blank"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>
    </div>
  </div>
</template>
