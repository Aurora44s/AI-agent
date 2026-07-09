<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Slide {
  title: string;
  subtitle: string;
  gradient: string;
  emoji: string;
  image?: string; // 填入图片 URL 即可显示，不填则用渐变背景
}

const slides: Slide[] = [
  {
    title: "欢迎来到个人博客",
    subtitle: "分享技术与生活的点滴",
    gradient: "from-primary-500 via-purple-500 to-pink-500",
    emoji: "🚀",
    // image: "https://example.com/banner1.jpg",
  },
  {
    title: "探索精彩内容",
    subtitle: "前端开发 · 后端架构 · 生活随笔",
    gradient: "from-accent-500 via-teal-500 to-cyan-500",
    emoji: "✨",
    // image: "https://example.com/banner2.jpg",
  },
  {
    title: "用心书写每一篇文章",
    subtitle: "记录成长，分享知识",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    emoji: "📝",
    image: "/668fa499e751a1eba53f382192ec2631.jpg",
  },
  {
    title: "保持好奇心",
    subtitle: "终身学习，不断进步",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    emoji: "🔭",
    image: "/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg",
  },
];

const current = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function next() {
  current.value = (current.value + 1) % slides.length;
}
function prev() {
  current.value = (current.value - 1 + slides.length) % slides.length;
}
function goTo(idx: number) {
  current.value = idx;
}

function startAutoPlay() {
  stopAutoPlay();
  timer = setInterval(next, 4000);
}
function stopAutoPlay() {
  if (timer) { clearInterval(timer); timer = null; }
}

onMounted(startAutoPlay);
onUnmounted(stopAutoPlay);
</script>

<template>
  <section class="relative overflow-hidden h-[80vh] md:h-screen">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -left-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float" style="animation-delay: 0s"></div>
      <div class="absolute top-1/2 -right-16 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-float" style="animation-delay: 2s"></div>
      <div class="absolute -bottom-16 left-1/3 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-float" style="animation-delay: 4s"></div>
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, #6366f1 1px, transparent 1px); background-size: 32px 32px;"></div>
    </div>

    <!-- 幻灯片 -->
    <div class="relative h-full w-full">
      <transition :name="'carousel-' + (current % 2 === 0 ? 'forward' : 'backward')" mode="out-in">
        <div
          :key="current"
          class="absolute inset-0 flex items-center justify-center"
        >
          <!-- 图片模式 -->
          <div
            v-if="slides[current].image"
            class="w-full h-full relative"
          >
            <img :src="slides[current].image" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/30 flex flex-col items-center justify-center px-4 text-center text-white">
              <span class="text-3xl md:text-5xl mb-3 md:mb-4 drop-shadow">{{ slides[current].emoji }}</span>
              <h2 class="text-xl md:text-3xl lg:text-4xl font-extrabold mb-2 md:mb-3 drop-shadow-lg">
                {{ slides[current].title }}
              </h2>
              <p class="text-sm md:text-base text-white/90 max-w-md drop-shadow">
                {{ slides[current].subtitle }}
              </p>
            </div>
          </div>
          <!-- 渐变背景模式 -->
          <div
            v-else
            :class="['w-full h-full bg-gradient-to-br', slides[current].gradient]"
            class="flex flex-col items-center justify-center px-4 text-center text-white"
          >
            <span class="text-3xl md:text-5xl mb-3 md:mb-4">{{ slides[current].emoji }}</span>
            <h2 class="text-xl md:text-3xl lg:text-4xl font-extrabold mb-2 md:mb-3 drop-shadow-sm">
              {{ slides[current].title }}
            </h2>
            <p class="text-sm md:text-base text-white/80 max-w-md">
              {{ slides[current].subtitle }}
            </p>
          </div>
        </div>
      </transition>
    </div>

    <!-- 左右箭头 -->
    <button
      class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200"
      @click="prev(); stopAutoPlay(); startAutoPlay()"
    >
      <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200"
      @click="next(); stopAutoPlay(); startAutoPlay()"
    >
      <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- 底部圆点 -->
    <div class="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
      <button
        v-for="(_, idx) in slides"
        :key="idx"
        :class="[
          'w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300',
          idx === current ? 'bg-white scale-125 shadow-sm' : 'bg-white/40 hover:bg-white/60',
        ]"
        @click="goTo(idx); stopAutoPlay(); startAutoPlay()"
      ></button>
    </div>

    <!-- 下滑提示箭头（仅移动端） -->
    <div class="md:hidden absolute bottom-14 left-1/2 -translate-x-1/2 z-10 animate-bounce">
      <svg class="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>

    <!-- 底部波浪 -->
    <div class="absolute bottom-0 left-0 right-0 z-10">
      <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <path d="M0 48h1440V0c-141.6 23.2-424.8 33.6-720 19.2C424.8 4.8 141.6 8.8 0 24v24z" fill="currentColor" class="text-gray-50/80" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.carousel-forward-enter-active,
.carousel-forward-leave-active,
.carousel-backward-enter-active,
.carousel-backward-leave-active {
  transition: all 0.4s ease;
}
.carousel-forward-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.carousel-forward-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
.carousel-backward-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.carousel-backward-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
