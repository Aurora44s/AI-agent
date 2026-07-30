<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchSettings } from "@/api";

const router = useRouter();
const siteName = ref("Suyuxi"); // 个人名片固定名称
const siteDesc = ref("千里之行，始于足下");
const avatarUrl = ref("");

onMounted(async () => {
  try {
    const res = await fetchSettings();
    siteDesc.value = res.data.site_description || "千里之行，始于足下";
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
           hover:shadow-glow hover:border-primary-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
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
      <img
        v-else
        src="/E6B32D5F013AE2F162FD8AAD53308339.jpg"
        :alt="siteName"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- 名称 -->
    <h3 class="text-2xl font-bold text-gradient text-center mb-3">{{ siteName }}</h3>

    <!-- 简介 -->
    <p class="text-sm text-gray-500 text-center leading-relaxed line-clamp-4">
      {{ siteDesc }}
    </p>
  </article>
</template>
