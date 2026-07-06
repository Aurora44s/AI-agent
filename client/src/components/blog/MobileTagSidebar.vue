<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { fetchTags, type Tag } from "@/api";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const router = useRouter();
const tagList = ref<Tag[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetchTags();
    tagList.value = res.data;
  } catch {
    console.error("加载标签失败");
  } finally {
    loading.value = false;
  }
});

function goTag(slug: string) {
  close();
  router.push(`/tag/${slug}`);
}

function close() {
  emit("update:modelValue", false);
}

// 打开时禁止 body 滚动
watch(
  () => props.modelValue,
  (val) => {
    document.body.style.overflow = val ? "hidden" : "";
  }
);
</script>

<template>
  <!-- 遮罩 -->
  <transition name="sidebar-fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
      @click="close"
    ></div>
  </transition>

  <!-- 侧边栏面板 -->
  <transition name="sidebar-slide">
    <div
      v-if="modelValue"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl md:hidden flex flex-col"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <h3 class="font-bold text-gray-900 text-sm">
          <span class="text-gradient">标签</span>
        </h3>
        <button
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          @click="close"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 标签列表 -->
      <div class="flex-1 overflow-y-auto py-3 px-3">
        <div v-if="loading" class="text-center text-gray-400 text-sm py-8">加载中...</div>
        <div v-else-if="tagList.length > 0" class="space-y-1">
          <button
            v-for="tag in tagList"
            :key="tag.id"
            class="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg w-full text-left justify-start bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
            @click="goTag(tag.slug)"
          >
            # {{ tag.name }}
          </button>
        </div>
        <div v-else class="text-center text-gray-400 text-sm py-8">暂无标签</div>
      </div>

      <!-- 底部装饰 -->
      <div class="h-1 bg-gradient-primary"></div>
    </div>
  </transition>
</template>

<style scoped>
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.3s ease;
}
.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}
</style>
