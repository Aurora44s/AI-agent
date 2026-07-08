<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { fetchTags, fetchSettings, type Tag } from "@/api";
import MobileTagSidebar from "@/components/blog/MobileTagSidebar.vue";

const router = useRouter();
const siteName = ref("个人博客");
const tagList = ref<Tag[]>([]);
const menuOpen = ref(false);
const tagsSidebarOpen = ref(false);

// 移动端搜索
const searchOpen = ref(false);
const searchQuery = ref("");
const searchInputEl = ref<HTMLInputElement | null>(null);
const searchPanelEl = ref<HTMLDivElement | null>(null);

function doSearch() {
  const q = searchQuery.value.trim();
  if (q) {
    searchOpen.value = false;
    searchQuery.value = "";
    router.push({ path: "/search", query: { q } });
  }
}

// 点击搜索面板外部关闭
function onDocumentClick(e: MouseEvent) {
  if (!searchPanelEl.value || !searchOpen.value) return;
  if (!searchPanelEl.value.contains(e.target as Node)) {
    searchOpen.value = false;
  }
}

watch(searchOpen, (val) => {
  if (val) {
    // 延迟注册，避免当前点击事件触发关闭
    setTimeout(() => {
      document.addEventListener("click", onDocumentClick);
      searchInputEl.value?.focus();
    }, 0);
  } else {
    document.removeEventListener("click", onDocumentClick);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
});

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

// 标签颜色轮换
function tagColor(idx: number) {
  const palettes = [
    "bg-primary-50 text-primary-700 hover:bg-primary-100",
    "bg-pink-50 text-pink-700 hover:bg-pink-100",
    "bg-amber-50 text-amber-700 hover:bg-amber-100",
    "bg-accent-50 text-accent-700 hover:bg-accent-100",
    "bg-purple-50 text-purple-700 hover:bg-purple-100",
    "bg-rose-50 text-rose-700 hover:bg-rose-100",
    "bg-sky-50 text-sky-700 hover:bg-sky-100",
  ];
  return palettes[idx % palettes.length];
}
</script>

<template>
  <header class="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
    <nav class="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-4 relative">
      <!-- 移动端搜索图标 -->
      <button
        class="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        @click="searchOpen = true"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Logo（移动端绝对居中，桌面端正常流） -->
      <RouterLink to="/" class="text-lg font-bold text-gradient hover:opacity-80 transition-opacity shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
        {{ siteName }}
      </RouterLink>

      <!-- 桌面端导航：首页 + 横向标签pill + 关于 -->
      <div class="hidden md:flex items-center gap-1.5 text-sm flex-1 min-w-0 justify-center">
        <RouterLink
          to="/"
          class="shrink-0 px-2.5 py-1.5 text-gray-600 hover:text-primary-600 transition-colors font-medium rounded-lg hover:bg-primary-50"
        >
          首页
        </RouterLink>

        <!-- 横向滚动标签 -->
        <div
          v-if="tagList.length > 0"
          class="flex items-center gap-1 overflow-x-auto scrollbar-hide mx-1"
        >
          <RouterLink
            v-for="(tag, idx) in tagList"
            :key="tag.id"
            :to="`/tag/${tag.slug}`"
            :class="['shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 hover:scale-105', tagColor(idx)]"
          >
            {{ tag.name }}
          </RouterLink>
        </div>

        <RouterLink
          to="/about"
          class="shrink-0 px-2.5 py-1.5 text-gray-600 hover:text-primary-600 transition-colors font-medium rounded-lg hover:bg-primary-50"
        >
          关于
        </RouterLink>
      </div>

      <!-- 右侧：桌面端搜索 + 占位 -->
      <div class="hidden md:flex items-center shrink-0">
        <button
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          @click="searchOpen = true"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <!-- 移动端菜单按钮 -->
      <button
        class="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        @click="menuOpen = !menuOpen"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <!-- 移动端遮罩 -->
    <transition name="slide-down">
      <div
        v-if="menuOpen"
        class="md:hidden fixed inset-0 z-40"
        @click="menuOpen = false"
      >
        <!-- 半透明背景 -->
        <div class="absolute inset-0 bg-black/20"></div>
        <!-- 菜单面板 -->
        <div
          class="absolute top-14 right-0 w-1/3 bg-white shadow-xl rounded-bl-2xl border-b border-l border-gray-100 px-3 py-3 space-y-1"
          @click.stop
        >
          <RouterLink to="/" class="block py-2 text-gray-600 font-medium" @click="menuOpen = false">
            首页
          </RouterLink>
          <button
            class="block w-full text-left py-2 text-gray-600 font-medium"
            @click="menuOpen = false; tagsSidebarOpen = true"
          >
            标签
          </button>
          <RouterLink to="/about" class="block py-2 text-gray-600 font-medium" @click="menuOpen = false">
            关于
          </RouterLink>
        </div>
      </div>
    </transition>

    <!-- 搜索面板 -->
    <transition name="search-fade">
      <div
        v-if="searchOpen"
        class="fixed inset-0 z-50"
      >
        <!-- 半透明遮罩 -->
        <div class="absolute inset-0 bg-black/30"></div>
        <!-- 搜索栏 -->
        <div ref="searchPanelEl" class="relative z-10 bg-white shadow-lg rounded-b-2xl px-4 py-4">
          <div class="max-w-xl mx-auto flex gap-2">
            <input
              ref="searchInputEl"
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章..."
              class="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              @keyup.enter="doSearch"
            />
            <button
              @click="doSearch"
              class="px-4 py-2.5 bg-gradient-primary text-white text-sm font-medium rounded-xl hover:shadow-glow transition-all duration-300 whitespace-nowrap"
            >
              搜索
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 移动端标签侧边栏 -->
    <MobileTagSidebar v-model="tagsSidebarOpen" />
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

/* 搜索面板过渡 */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: all 0.25s ease;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

/* 隐藏横向滚动条 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
