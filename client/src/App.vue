<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, watch, onUnmounted, onMounted } from "vue";
import AppHeader from "./components/layout/AppHeader.vue";
import AppFooter from "./components/layout/AppFooter.vue";
import ChatWidget from "@/components/chat/ChatWidget.vue";
import MusicPlayer from "@/components/music/MusicPlayer.vue";
import { useClickParticles } from "@/composables/useClickParticles";
import { useFallingParticles } from "@/composables/useFallingParticles";
import { fetchSettings } from "@/api";

const route = useRoute();
const isAdmin = computed(() => route.path.startsWith("/admin"));

// 前台页面启用粒子动画，管理后台禁用
let particlesCleanup: (() => void) | null = null;
let fallingCleanup: (() => void) | null = null;
watch(isAdmin, (admin) => {
  if (!admin && !particlesCleanup) {
    particlesCleanup = useClickParticles();
    fallingCleanup = useFallingParticles();
  } else if (admin && particlesCleanup) {
    particlesCleanup();
    particlesCleanup = null;
    fallingCleanup?.();
    fallingCleanup = null;
  }
}, { immediate: true });
onUnmounted(() => {
  particlesCleanup?.();
  fallingCleanup?.();
});

// 功能开关
const chatEnabled = ref(true);

onMounted(async () => {
  try {
    const res = await fetchSettings();
    chatEnabled.value = res.data.chat_enabled !== "0";
  } catch {}
});

// 聊天室和音乐播放器互斥
const chatOpen = ref(false);
const musicOpen = ref(false);

function onChatToggle(val: boolean) {
  chatOpen.value = val;
  if (val) musicOpen.value = false;
}

function onMusicToggle(val: boolean) {
  musicOpen.value = val;
  if (val) chatOpen.value = false;
}
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
    <ChatWidget v-if="!isAdmin && chatEnabled" :model-value="chatOpen" @update:model-value="onChatToggle" />
    <MusicPlayer v-if="!isAdmin" :model-value="musicOpen" @update:model-value="onMusicToggle" @close-chat="chatOpen = false" />
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
