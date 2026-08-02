<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { fetchMoments, type Moment } from "@/api";

const router = useRouter();
const moments = ref<Moment[]>([]);
const total = ref(0);
const page = ref(1);
const limit = 5;
const loading = ref(true);
const loadingMore = ref(false);
const search = ref("");

const hasMore = computed(() => moments.value.length < total.value);

async function loadMoments(reset = false) {
  if (reset) {
    page.value = 1;
    loading.value = true;
  } else {
    loadingMore.value = true;
  }
  try {
    const res = await fetchMoments({ page: reset ? 1 : page.value, limit, search: search.value || undefined });
    if (reset) {
      moments.value = res.data.moments;
    } else {
      moments.value.push(...res.data.moments);
    }
    total.value = res.data.total;
  } catch {
    console.error("加载说说失败");
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function loadMore() {
  page.value++;
  loadMoments(false);
}

function onSearch() {
  loadMoments(true);
}

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

onMounted(() => loadMoments(true));
</script>

<template>
  <div class="min-h-screen relative bg-fixed bg-cover bg-center" style="background-image: url('/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg')">
    <div class="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
    <div class="relative max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 pt-20 md:pt-24 pb-8 md:pb-12">
      <!-- 标题 -->
      <h1 class="text-center text-gray-700 text-lg mb-4">说说</h1>
      <!-- 搜索 -->
      <div class="flex justify-center mb-10">
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

      <!-- 时间线 -->
      <div v-if="moments.length > 0" class="relative">
        <!-- 中间竖线 -->
        <div class="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-rose-300 via-pink-300 to-rose-300 -translate-x-1/2"></div>

        <div v-for="(m, idx) in moments" :key="m.id" class="relative mb-8 timeline-item" :style="{ animationDelay: `${idx * 1}s` }">
          <!-- 时间线节点 -->
          <div class="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-rose-300 shadow-sm z-10"
               :style="{ top: '24px' }"></div>

          <!-- 卡片 - 奇数左边，偶数右边 -->
          <div :class="['flex', idx % 2 === 0 ? 'justify-start pr-[calc(50%+1rem)]' : 'justify-end pl-[calc(50%+1rem)]']">
            <article
              class="w-full bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-3 md:p-4
                     hover:shadow-md hover:border-rose-200 transition-all duration-300 cursor-pointer"
              @click="goDetail(m.id)"
            >
              <div class="flex gap-3 items-center">
                <!-- 图片缩略图 -->
                <div v-if="m.images && m.images.length > 0" class="flex gap-1.5 shrink-0">
                  <img
                    v-for="(img, i) in m.images.slice(0, 2)"
                    :key="i"
                    :src="img"
                    class="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl border border-white/40"
                    @click.stop
                  />
                  <div
                    v-if="m.images.length > 2"
                    class="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0"
                  >
                    +{{ m.images.length - 2 }}
                  </div>
                </div>
                <!-- 文字内容 -->
                <div class="flex-1 min-w-0">
                  <p class="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap line-clamp-2">
                    {{ m.content }}
                  </p>
                  <time class="text-xs text-rose-400 mt-1.5 block">{{ fmtDate(m.createdAt) }}</time>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="text-center py-16">
        <div class="text-4xl mb-3">💬</div>
        <p class="text-gray-400">还没有说说，去后台发布第一条吧！</p>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="text-center mt-6">
        <button
          :disabled="loadingMore"
          class="px-6 py-2.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-xl text-sm text-primary-500 font-medium
                 hover:shadow-glow hover:border-primary-300 transition-all duration-300 disabled:opacity-50"
          @click="loadMore"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>
