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
  <header class="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
    <nav class="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between">
      <!-- Logo - 渐变色 -->
      <RouterLink to="/" class="text-lg font-bold text-gradient hover:opacity-80 transition-opacity">
        {{ siteName }}
      </RouterLink>

      <!-- 桌面端导航 -->
      <div class="hidden md:flex items-center gap-6 text-sm">
        <RouterLink
          to="/"
          class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
          active-class="text-primary-600"
        >
          首页
        </RouterLink>
        <div class="relative group">
          <span class="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer font-medium">
            标签
          </span>
          <div
            class="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
          >
            <div class="bg-white shadow-lg rounded-xl border border-gray-100 py-2 min-w-32">
              <RouterLink
                v-for="tag in tagList"
                :key="tag.id"
                :to="`/tag/${tag.slug}`"
                class="block px-4 py-1.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {{ tag.name }}
              </RouterLink>
              <div v-if="tagList.length === 0" class="px-4 py-1.5 text-sm text-gray-400">
                暂无标签
              </div>
            </div>
          </div>
        </div>
        <RouterLink
          to="/about"
          class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
          active-class="text-primary-600"
        >
          关于
        </RouterLink>
      </div>

      <!-- 移动端菜单按钮 -->
      <button
        class="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        @click="menuOpen = !menuOpen"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <!-- 移动端菜单 -->
    <transition name="slide-down">
      <div v-if="menuOpen" class="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
        <RouterLink to="/" class="block py-2 text-gray-600 font-medium" @click="menuOpen = false">首页</RouterLink>
        <p class="py-2 text-gray-400 text-sm font-medium">标签</p>
        <RouterLink
          v-for="tag in tagList"
          :key="tag.id"
          :to="`/tag/${tag.slug}`"
          class="block pl-3 py-1.5 text-gray-600"
          @click="menuOpen = false"
        >
          # {{ tag.name }}
        </RouterLink>
        <RouterLink to="/about" class="block py-2 text-gray-600 font-medium" @click="menuOpen = false">关于</RouterLink>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
