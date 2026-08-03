<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { fetchSettings } from "@/api";
import MobileTagSidebar from "@/components/blog/MobileTagSidebar.vue";
import { HomeIcon, BookOpenIcon, InformationCircleIcon, CameraIcon } from "@heroicons/vue/20/solid";

const router = useRouter();
const siteName = ref("遇梦");
const siteDesc = ref("千里之行，始于足下");
const avatarUrl = ref("");
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
    avatarUrl.value = settingsRes.data.avatar || "";
  } catch {}
});

// 移动端菜单项
const menuItems = [
  { label: "首页", to: "/", icon: HomeIcon },
  { label: "文章", to: "/", icon: BookOpenIcon },
  { label: "说说", to: "/moments", icon: BookOpenIcon },
  { label: "留言", to: "/guestbook", icon: BookOpenIcon },
  { label: "照片", to: "/photos", icon: CameraIcon },
  { label: "关于", to: "/about", icon: InformationCircleIcon },
];

</script>

<template>
  <header class="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-lg shadow-sm border-b border-white/20 z-40">
    <nav class="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-4 relative">
      <!-- 移动端搜索图标 -->
      <button
        class="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        @click="searchOpen = true"
      >
        <svg class="w-6 h-6 text-sakura-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Logo（移动端绝对居中，桌面端正常流） -->
      <RouterLink to="/" class="text-lg font-bold text-gradient hover:opacity-80 transition-opacity shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
        {{ siteName }}
      </RouterLink>

      <!-- 桌面端导航：首页 + 横向标签pill + 关于 -->
      <div class="hidden md:flex items-center gap-1.5 text-base flex-1 min-w-0 justify-center">
        <RouterLink
          to="/"
          class="shrink-0 px-2.5 py-1.5 text-sakura font-semibold rounded-lg hover:bg-pink-50 transition-all"
        >
          首页
        </RouterLink>

        <RouterLink
          to="/moments"
          class="shrink-0 px-2.5 py-1.5 text-sakura font-semibold rounded-lg hover:bg-pink-50 transition-all"
        >
          说说
        </RouterLink>
        <RouterLink
          to="/guestbook"
          class="shrink-0 px-2.5 py-1.5 text-sakura font-semibold rounded-lg hover:bg-pink-50 transition-all"
        >
          留言
        </RouterLink>
        <RouterLink
          to="/photos"
          class="shrink-0 px-2.5 py-1.5 text-sakura font-semibold rounded-lg hover:bg-pink-50 transition-all"
        >
          照片
        </RouterLink>
        <RouterLink
          to="/about"
          class="shrink-0 px-2.5 py-1.5 text-sakura font-semibold rounded-lg hover:bg-pink-50 transition-all"
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
          <svg class="w-6 h-6 text-sakura-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <!-- 移动端菜单按钮 -->
      <button
        class="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        @click="menuOpen = !menuOpen"
      >
        <svg class="w-6 h-6 text-sakura-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          class="md:hidden fixed top-0 right-0 h-screen w-48 z-50 bg-white/40 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
          @click.stop
        >
          <!-- 个人名片区 -->
          <div class="px-5 pt-12 pb-6 text-center">
            <!-- 方形头像 -->
            <div class="w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-white/60 shadow-md">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="siteName"
                class="w-full h-full object-cover"
              />
              <img
                v-else
                src="/E6B32D5F013AE2F162FD8AAD53308339.jpg"
                :alt="siteName"
                class="w-full h-full object-cover"
              />
            </div>
            <!-- 博客名 -->
            <RouterLink to="/" class="text-lg font-bold" style="background: linear-gradient(135deg, #ffffff 0%, #f8c8d8 40%, #e898b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;" @click="menuOpen = false">
              Suyuxi
            </RouterLink>
            <!-- 标语 -->
            <p class="text-sm text-gray-500 mt-1.5 leading-relaxed font-semibold">{{ siteDesc }}</p>
          </div>
          <!-- 菜单项 -->
          <div class="flex-1 overflow-y-auto flex flex-col items-center px-4 pt-6 pb-8 space-y-3">
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
