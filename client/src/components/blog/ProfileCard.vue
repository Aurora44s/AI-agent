<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchSettings } from "@/api";

const router = useRouter();
const siteName = ref("遇梦");
const siteDesc = ref("分享技术与生活的点滴");
const avatarUrl = ref("");

onMounted(async () => {
  try {
    const res = await fetchSettings();
    siteName.value = res.data.site_name || "遇梦";
    siteDesc.value = res.data.site_description || "分享技术与生活的点滴";
    avatarUrl.value = res.data.avatar || "";
  } catch {}
});

function goAbout() {
  router.push("/about");
}
</script>

<template>
  <article
    class="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-7 pb-8
           hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
    @click="goAbout"
  >
    <!-- 方形头像 -->
    <div class="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="siteName"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-primary flex items-center justify-center"
      >
        <span class="text-5xl text-white drop-shadow">😊</span>
      </div>
    </div>

    <!-- 名称 -->
    <h3 class="text-lg font-bold text-gray-900 text-center mb-3">{{ siteName }}</h3>

    <!-- 分割线 -->
    <div class="w-12 h-0.5 bg-gradient-primary mx-auto mb-4 rounded-full"></div>

    <!-- 简介 -->
    <p class="text-sm text-gray-500 text-center leading-relaxed line-clamp-4 mb-5">
      {{ siteDesc }}
    </p>

    <!-- 底部装饰 -->
    <div class="flex justify-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-primary-300"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
    </div>
  </article>
</template>
