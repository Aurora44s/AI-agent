<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, watch, onUnmounted } from "vue";
import AppHeader from "./components/layout/AppHeader.vue";
import AppFooter from "./components/layout/AppFooter.vue";
import { useClickParticles } from "@/composables/useClickParticles";

const route = useRoute();
const isAdmin = computed(() => route.path.startsWith("/admin"));

// 前台页面启用点击粒子动画，管理后台禁用
let particlesCleanup: (() => void) | null = null;
watch(isAdmin, (admin) => {
  if (!admin && !particlesCleanup) {
    particlesCleanup = useClickParticles();
  } else if (admin && particlesCleanup) {
    particlesCleanup();
    particlesCleanup = null;
  }
}, { immediate: true });
onUnmounted(() => particlesCleanup?.());
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50/80">
    <AppHeader v-if="!isAdmin" />
    <main class="flex-1">
      <router-view v-slot="{ Component, route: r }">
        <transition
          :name="r.meta.transition || 'fade-slide'"
          mode="out-in"
        >
          <component :is="Component" :key="r.path" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="!isAdmin" />
  </div>
</template>

<style>
/* ===== 页面过渡动画 ===== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* 快速淡入（文章详情页） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
