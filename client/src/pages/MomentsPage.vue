<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { fetchMoments, type Moment } from "@/api";
import RevealWrapper from "@/components/blog/RevealWrapper.vue";

const router = useRouter();
const moments = ref<Moment[]>([]);
const total = ref(0);
const page = ref(1);
const limit = 10;
const loading = ref(true);
const search = ref("");

async function loadMoments() {
  loading.value = true;
  try {
    const res = await fetchMoments({ page: page.value, limit, search: search.value || undefined });
    moments.value = res.data.moments;
    total.value = res.data.total;
  } catch {
    console.error("加载说说失败");
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  page.value = 1;
  loadMoments();
}

const totalPages = () => Math.ceil(total.value / limit);

function goDetail(id: number) {
  router.push(`/moments/${id}`);
}

function fmtDate(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return d.slice(0, 10);
}

onMounted(loadMoments);
</script>

<template>
  <div class="min-h-screen relative bg-fixed bg-cover bg-center" style="background-image: url('/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg')">
    <div class="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
    <div class="relative max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 pt-20 md:pt-24 pb-8 md:pb-12">
      <!-- 标题和搜索 -->
      <div class="flex items-center justify-between mb-6 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">💬 说说</h1>
        <div class="flex items-center gap-2">
          <input
            v-model="search"
            type="text"
            placeholder="搜索说说..."
            class="px-3 py-1.5 text-sm bg-white/70 backdrop-blur-md border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 w-36 md:w-48 transition-all"
            @keyup.enter="onSearch"
          />
          <button
            class="px-3 py-1.5 text-sm bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all"
            @click="onSearch"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-4 md:p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div class="flex gap-2">
            <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      <!-- 说说列表 -->
      <div v-else-if="moments.length > 0" class="space-y-4">
        <RevealWrapper v-for="(m, idx) in moments" :key="m.id" :delay="idx * 60">
          <article
            class="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-4 md:p-6
                   hover:shadow-md hover:border-primary-200 transition-all duration-300 cursor-pointer"
            @click="goDetail(m.id)"
          >
            <!-- 文字内容 -->
            <p class="text-gray-800 text-sm md:text-base leading-relaxed mb-3 whitespace-pre-wrap line-clamp-4">
              {{ m.content }}
            </p>
            <!-- 图片缩略图 -->
            <div v-if="m.images && m.images.length > 0" class="flex gap-2 flex-wrap mb-3">
              <img
                v-for="(img, i) in m.images.slice(0, 4)"
                :key="i"
                :src="img"
                class="w-20 h-20 object-cover rounded-lg border border-white/40"
                @click.stop
              />
              <div
                v-if="m.images.length > 4"
                class="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400"
              >
                +{{ m.images.length - 4 }}
              </div>
            </div>
            <!-- 时间 -->
            <div class="flex items-center justify-between">
              <time class="text-xs text-gray-400">{{ fmtDate(m.createdAt) }}</time>
              <span class="text-xs text-primary-500 hover:text-primary-600">查看详情 →</span>
            </div>
          </article>
        </RevealWrapper>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <div class="text-4xl mb-3">💬</div>
        <p class="text-gray-400">还没有说说，去后台发布第一条吧！</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages() > 1" class="flex justify-center flex-wrap gap-2 mt-8">
        <button
          v-for="i in totalPages()"
          :key="i"
          @click="page = i; loadMoments(); window.scrollTo(0, 0)"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            page === i
              ? 'bg-gradient-primary text-white shadow-colored-sm'
              : 'bg-white/70 border border-white/60 text-gray-600 hover:border-primary-300 hover:text-primary-600',
          ]"
        >
          {{ i }}
        </button>
      </div>
    </div>
  </div>
</template>
