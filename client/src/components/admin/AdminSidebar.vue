<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
const sidebarOpen = ref(false);

const navItems = [
  { to: "/admin", label: "📊 仪表盘" },
  { to: "/admin/posts", label: "📝 文章管理" },
  { to: "/admin/posts/new", label: "✏️ 写文章" },
  { to: "/admin/settings", label: "⚙️ 站点设置" },
];

function isActive(path: string) {
  if (path === "/admin") return route.path === "/admin";
  return route.path.startsWith(path);
}
</script>

<template>
  <!-- 移动端顶部栏 -->
  <div class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white h-12 flex items-center px-4">
    <button @click="sidebarOpen = !sidebarOpen" class="p-1 mr-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <span class="font-bold text-sm">博客后台</span>
  </div>

  <!-- 移动端遮罩 -->
  <div
    v-if="sidebarOpen"
    class="lg:hidden fixed inset-0 z-40 bg-black/50"
    @click="sidebarOpen = false"
  />

  <!-- 侧边栏 -->
  <aside
    :class="[
      'fixed top-0 left-0 z-40 h-full bg-gray-900 text-white transition-transform duration-200',
      'w-56 p-4',
      'lg:translate-x-0', // 桌面端始终显示
      sidebarOpen ? 'translate-x-0' : '-translate-x-full', // 移动端切换
    ]"
  >
    <h2 class="text-lg font-bold mb-6 mt-2 hidden lg:block">博客后台</h2>
    <nav class="space-y-1 mt-12 lg:mt-0">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'block px-3 py-2 rounded transition-colors text-sm',
          isActive(item.to) ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-300',
        ]"
        @click="sidebarOpen = false"
      >
        {{ item.label }}
      </RouterLink>
      <a
        href="/"
        target="_blank"
        class="block px-3 py-2 rounded text-gray-300 text-sm hover:bg-gray-800 transition-colors"
      >
        🌐 查看网站
      </a>
    </nav>
  </aside>
</template>
