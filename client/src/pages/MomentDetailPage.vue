<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchMoment, type Moment } from "@/api";

const route = useRoute();
const router = useRouter();
const moment = ref<Moment | null>(null);
const loading = ref(true);
const selectedImg = ref<string | null>(null);

async function load() {
  loading.value = true;
  try {
    const id = parseInt(route.params.id as string);
    const res = await fetchMoment(id);
    moment.value = res.data;
  } catch {
    console.error("加载说说失败");
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push("/moments");
}

function fmtFull(d: string) {
  const date = new Date(d);
  return date.toLocaleString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

onMounted(load);
</script>

<template>
  <div class="min-h-screen relative bg-fixed bg-cover bg-center" style="background-image: url('/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg')">
    <div class="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
    <div class="relative max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 pt-20 md:pt-24 pb-8 md:pb-12">
      <!-- 返回按钮 -->
      <button
        class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
        @click="goBack"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回说说列表
      </button>

      <!-- 加载中 -->
      <div v-if="loading" class="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-6 md:p-8 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div class="flex gap-2">
          <div class="w-24 h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <!-- 详情 -->
      <article v-else-if="moment" class="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-6 md:p-8">
        <p class="text-gray-800 text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-6">
          {{ moment.content }}
        </p>

        <!-- 图片网格 -->
        <div v-if="moment.images && moment.images.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <img
            v-for="(img, i) in moment.images"
            :key="i"
            :src="img"
            :alt="`图片 ${i + 1}`"
            class="w-full aspect-square object-cover rounded-xl border border-white/40 cursor-pointer hover:scale-105 transition-transform duration-200"
            @click="selectedImg = img"
          />
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <time class="text-sm text-gray-400">{{ fmtFull(moment.createdAt) }}</time>
        </div>
      </article>

      <!-- 不存在 -->
      <div v-else class="text-center py-16">
        <div class="text-4xl mb-3">😕</div>
        <p class="text-gray-400">该说说不存在或已被删除</p>
        <button class="mt-4 text-primary-500 hover:text-primary-600 text-sm" @click="goBack">← 返回列表</button>
      </div>
    </div>

    <!-- 图片灯箱 -->
    <Teleport to="body">
      <div
        v-if="selectedImg"
        class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center cursor-pointer"
        @click="selectedImg = null"
      >
        <img :src="selectedImg" class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        <button
          class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
          @click="selectedImg = null"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>
