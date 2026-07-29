<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchSettings } from "@/api";
import Guestbook from "@/components/blog/Guestbook.vue";

const enabled = ref(true);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetchSettings();
    enabled.value = res.data.guestbook_enabled !== "0";
  } catch {} finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen relative bg-fixed bg-cover bg-center" style="background-image: url('/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg')">
    <div class="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
    <div class="relative pt-20 md:pt-24 pb-8 md:pb-12">
      <Guestbook v-if="enabled" />
      <div v-else-if="!loading" class="flex items-center justify-center" style="min-height: 60vh;">
        <div class="text-center">
          <div class="text-5xl mb-4">🔧</div>
          <h2 class="text-xl font-bold text-gray-700 mb-2">留言板已关闭</h2>
          <p class="text-sm text-gray-400">管理员维护中，请稍后再来</p>
        </div>
      </div>
    </div>
  </div>
</template>
