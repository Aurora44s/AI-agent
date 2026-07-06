<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { fetchTags, fetchSettings, type Tag } from "@/api";

const siteName = ref("个人博客");
const tagList = ref<Tag[]>([]);
const menuOpen = ref(false);

onMounted(async () => {
  try {
    const settingsRes = await fetchSettings();
    if (settingsRes.data.site_name) {
      siteName.value = settingsRes.data.site_name;
    }
  } catch {}

  try {
    const tagsRes = await fetchTags();
    tagList.value = tagsRes.data;
  } catch {}
});
</script>

<template>
  <header class="bg-white shadow-sm border-b sticky top-0 z-40">
    <nav class="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between">
      <RouterLink to="/" class="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
        {{ siteName }}
      </RouterLink>

      <!-- 桌面端导航 -->
      <div class="hidden md:flex items-center gap-6 text-sm">
        <RouterLink to="/" class="text-gray-600 hover:text-blue-600 transition-colors">首页</RouterLink>
        <div class="relative group">
          <span class="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">标签</span>
          <div
            class="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
          >
            <div class="bg-white shadow-lg rounded-lg border py-2 min-w-32">
              <RouterLink
                v-for="tag in tagList"
                :key="tag.id"
                :to="`/tag/${tag.slug}`"
                class="block px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              >
                {{ tag.name }}
              </RouterLink>
              <div v-if="tagList.length === 0" class="px-4 py-1.5 text-sm text-gray-400">
                暂无标签
              </div>
            </div>
          </div>
        </div>
        <RouterLink to="/about" class="text-gray-600 hover:text-blue-600 transition-colors">关于</RouterLink>
      </div>

      <!-- 移动端菜单按钮 -->
      <button
        class="md:hidden p-1.5 rounded hover:bg-gray-100"
        @click="menuOpen = !menuOpen"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <!-- 移动端菜单 -->
    <div v-if="menuOpen" class="md:hidden border-t bg-white px-4 py-3 space-y-2">
      <RouterLink to="/" class="block py-1.5 text-gray-600" @click="menuOpen = false">首页</RouterLink>
      <p class="py-1.5 text-gray-400 text-sm">标签</p>
      <RouterLink
        v-for="tag in tagList"
        :key="tag.id"
        :to="`/tag/${tag.slug}`"
        class="block pl-3 py-1 text-gray-600"
        @click="menuOpen = false"
      >
        {{ tag.name }}
      </RouterLink>
      <RouterLink to="/about" class="block py-1.5 text-gray-600" @click="menuOpen = false">关于</RouterLink>
    </div>
  </header>
</template>
