<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { fetchTags, fetchSettings, type Tag } from "@/api";
import MobileTagSidebar from "@/components/blog/MobileTagSidebar.vue";
import { HomeIcon, BookOpenIcon, InformationCircleIcon } from "@heroicons/vue/20/solid";

const router = useRouter();
const siteName = ref("遇梦");
const siteDesc = ref("分享技术与生活的点滴");
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
    if (settingsRes.data.site_name) siteName.value = settingsRes.data.site_name;
    if (settingsRes.data.site_description) siteDesc.value = settingsRes.data.site_description;
  } catch {}

  try {
    const tagsRes = await fetchTags();
    tagList.value = tagsRes.data;
  } catch {}
});

// 移动端菜单项
const menuItems = [
  { label: "首页", to: "/", icon: HomeIcon },
  { label: "文章", to: "/", icon: BookOpenIcon },
  { label: "关于", to: "/about", icon: InformationCircleIcon },
];

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
  <header class="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-lg shadow-sm border-b border-white/20 z-40">
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

    <!-- 移动端菜单（Teleport 到 body 避免 backdrop-filter 裁剪） -->
    <Teleport to="body">
      <!-- 遮罩 -->
      <transition name="menu-mask">
        <div
          v-if="menuOpen"
          class="md:hidden fixed inset-0 z-50 bg-black/30"
          @click="menuOpen = false"
        ></div>
      </transition>
      <!-- 抽屉面板 -->
      <transition name="menu-slide">
        <div
          v-if="menuOpen"
          class="md:hidden fixed top-0 right-0 h-screen w-1/2 z-50 bg-white shadow-2xl flex flex-col"
          @click.stop
        >
          <!-- Logo 区 -->
          <div class="px-4 py-5 text-center">
            <!-- Logo 图片 -->
            <RouterLink to="/" @click="menuOpen = false">
              <img src="/favicon.svg" :alt="siteName" class="w-16 h-16 mx-auto rounded-full shadow-md mb-4 object-cover" />
            </RouterLink>
            <!-- 博客名 -->
            <RouterLink to="/" class="text-base font-bold text-gray-800" @click="menuOpen = false">
              {{ siteName }}
            </RouterLink>
            <!-- 标语 -->
            <p class="text-sm text-primary-500 font-semibold mt-2">{{ siteDesc }}</p>
          </div>
          <!-- 菜单项 -->
          <div class="flex-1 flex flex-col items-center justify-center px-4 space-y-4">
            <RouterLink
              v-for="(item, idx) in menuItems"
              :key="item.label"
              :to="item.to"
              class="flex items-center gap-2.5 py-3 text-lg text-primary-600 font-semibold tracking-wide"
              :style="{ animation: `menuItemIn 0.4s ease-out ${idx * 0.1 + 0.1}s both` }"
              @click="menuOpen = false"
            >
              <component :is="item.icon" class="w-5 h-5 text-primary-500 shrink-0" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </div>
        </div>
      </transition>
    </Teleport>

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

<style>
/* ===== 全局样式（Teleport 到 body 的元素需要非 scoped） ===== */
.menu-mask-enter-active { transition: opacity 0.3s ease-out; }
.menu-mask-leave-active { transition: opacity 0.25s ease-in; }
.menu-mask-enter-from,
.menu-mask-leave-to { opacity: 0; }

.menu-slide-enter-active { transition: transform 0.3s ease-out; }
.menu-slide-leave-active { transition: transform 0.25s ease-in; }
.menu-slide-enter-from,
.menu-slide-leave-to {
  transform: translateX(100%);
}

@keyframes menuItemIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

<style scoped>
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
