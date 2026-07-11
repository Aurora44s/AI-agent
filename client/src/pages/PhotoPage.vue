<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { fetchPhotos, type Photo } from "@/api";
import { useSEO } from "@/composables/useSEO";

useSEO(() => ({ title: "照片", slug: "", content: "", excerpt: null, coverImage: null, isPublished: 1, createdAt: "", updatedAt: "", tags: [] } as any));

const photos = ref<Photo[]>([]);
const loading = ref(true);
const openedAlbum = ref<string | null>(null);
const animating = ref(false);

const lightboxOpen = ref(false);
const lightboxIdx = ref(0);
const allPhotos = computed(() => photos.value);

const albums = computed(() => {
  const map = new Map<string, Photo[]>();
  for (const p of photos.value) {
    const key = p.album || "默认相册";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return [...map.entries()];
});

// 每个信封的悬挂角度（基于 album 名稳定生成）
function envelopeRotation(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 7;
  return h - 3; // -3° ~ +3°
}

function envelopeOffset(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 17 + name.charCodeAt(i)) % 16;
  return (h - 8) + "px"; // -8 ~ +7
}

async function openAlbum(name: string) {
  if (animating.value) return;
  animating.value = true;
  openedAlbum.value = name;
  await nextTick();
}

function closeAlbum() {
  openedAlbum.value = null;
  animating.value = false;
}

// 灯箱
function openLightbox(photoId: number, e?: MouseEvent) {
  e?.stopPropagation();
  const idx = allPhotos.value.findIndex((p) => p.id === photoId);
  if (idx >= 0) { lightboxIdx.value = idx; lightboxOpen.value = true; }
}
function closeLightbox() { lightboxOpen.value = false; }
function prevPhoto(e?: MouseEvent) { e?.stopPropagation(); lightboxIdx.value = (lightboxIdx.value - 1 + allPhotos.value.length) % allPhotos.value.length; }
function nextPhoto(e?: MouseEvent) { e?.stopPropagation(); lightboxIdx.value = (lightboxIdx.value + 1) % allPhotos.value.length; }
function onKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prevPhoto();
  if (e.key === "ArrowRight") nextPhoto();
}

onMounted(async () => {
  try { const res = await fetchPhotos(); photos.value = res.data; }
  catch { console.error("加载照片失败"); }
  finally { loading.value = false; }
  window.addEventListener("keydown", onKeydown);
});
</script>

<template>
<div class="min-h-screen relative">
  <!-- 背景墙 -->
  <div v-if="allPhotos.length > 0" class="fixed inset-0 z-0"
    :style="{ backgroundImage: `url(${allPhotos[0].url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(80px) brightness(0.4)', transform: 'scale(1.1)' }"></div>
  <div class="fixed inset-0 z-[1] bg-black/30"></div>

  <!-- 墙面纹理 -->
  <div class="fixed inset-0 z-[2] opacity-[0.03] pointer-events-none"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.5) 40px, rgba(0,0,0,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(0,0,0,0.3) 60px, rgba(0,0,0,0.3) 61px);"></div>

  <!-- 内容 -->
  <div class="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
    <h1 class="text-3xl md:text-5xl font-extrabold text-white text-center mb-2 drop-shadow-lg">📮 信封墙</h1>
    <p class="text-white/50 text-center text-sm mb-12">每封信封，都是一段回忆</p>

    <div v-if="loading" class="text-center text-white/50 py-20">加载中...</div>
    <div v-else-if="allPhotos.length === 0" class="text-center py-20">
      <div class="text-6xl mb-4">📮</div>
      <p class="text-white/50">还没有照片，去后台添加吧</p>
    </div>

    <!-- ====== 信封墙 ====== -->
    <div v-else class="flex flex-wrap justify-center gap-8 md:gap-12">
      <div v-for="([album, albumPhotos]) in albums" :key="album" class="relative">

        <!-- 图钉 -->
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-4 h-4 rounded-full shadow-lg"
          :style="{ background: `radial-gradient(circle at 35% 30%, ${['#ff6b6b','#74b9ff','#ffeaa7','#55efc4','#fd79a8','#a29bfe'][albums.findIndex(([a]) => a === album) % 6]}, ${['#c0392b','#2980b9','#f39c12','#00b894','#e84393','#6c5ce7'][albums.findIndex(([a]) => a === album) % 6]})` }">
          <div class="absolute top-[30%] left-[30%] w-1 h-1 rounded-full bg-white/40"></div>
        </div>

        <!-- 信封卡片 -->
        <div
          :class="['transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]', openedAlbum === album ? 'scale-0 opacity-0 pointer-events-none' : '']"
          :style="{ transform: `rotate(${envelopeRotation(album)}deg) translateY(${envelopeOffset(album)})` }">
          <div class="cursor-pointer group" @click="openAlbum(album)">
            <div class="w-48 md:w-56 relative rounded-md overflow-hidden"
              style="background: linear-gradient(150deg, #f7eedd 0%, #eed9c4 40%, #e4c9ad 100%);
                     box-shadow: 4px 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5);">

              <!-- 纸张纹理 -->
              <div class="absolute inset-0 opacity-[0.04]"
                style="background-image: repeating-linear-gradient(0deg, transparent, transparent 4px, #5c3d1a 4px, #5c3d1a 5px);"></div>

              <!-- 封口三角 -->
              <div class="absolute top-0 left-0 w-full h-20 z-10 transition-transform duration-300 group-hover:rotate-x-[15deg]"
                style="background: linear-gradient(180deg, #f0dcc8 0%, #e8cfb8 100%); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); transform-origin: top;">
                <div class="absolute bottom-0 inset-x-0 h-[1px] bg-amber-900/15"></div>
              </div>

              <!-- 邮票 -->
              <div class="absolute top-4 right-3 z-20 w-10 h-12 bg-white shadow flex flex-col items-center justify-center rotate-2"
                style="border: 1.5px dashed #d4a574;">
                <div class="w-7 h-7 rounded-full bg-rose-400 flex items-center justify-center text-white text-[7px] font-bold">❤</div>
                <span class="text-[6px] text-gray-400 mt-0.5">POST</span>
              </div>

              <!-- 露出照片角 -->
              <div class="absolute top-[35%] left-2 z-0 w-14 h-10 bg-white rounded-sm shadow rotate-[-5deg] opacity-75">
                <img v-if="albumPhotos[0]" :src="albumPhotos[0].url" class="w-full h-full object-cover rounded-sm" />
              </div>
              <div class="absolute top-[40%] right-3 z-0 w-12 h-9 bg-white rounded-sm shadow rotate-[7deg] opacity-65">
                <img v-if="albumPhotos[1]" :src="albumPhotos[1].url" class="w-full h-full object-cover rounded-sm" />
              </div>
              <div v-if="albumPhotos.length > 2" class="absolute top-[32%] left-1/2 -translate-x-1/2 z-0 w-10 h-7 bg-white rounded-sm shadow rotate-[2deg] opacity-55">
                <img v-if="albumPhotos[2]" :src="albumPhotos[2].url" class="w-full h-full object-cover rounded-sm" />
              </div>

              <!-- 信息区 -->
              <div class="relative z-10 px-4 pt-24 pb-4 text-center">
                <h3 class="text-base font-extrabold tracking-wide" style="color: #4a2c0a; font-family: 'Georgia', serif;">{{ album }}</h3>
                <p class="text-[11px] mt-0.5" style="color: #8b6914;">{{ albumPhotos.length }} 张</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ====== 展开面板（点击外部关闭） ====== -->
        <Teleport to="body">
          <div
            v-if="openedAlbum === album"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
            @click="closeAlbum">
            <!-- 半透明背景遮罩 -->
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            <!-- 面板（内容紧凑包裹照片） -->
            <div
              class="relative w-fit max-w-[95vw] max-h-[90vh] overflow-auto rounded-2xl shadow-2xl"
              style="background: linear-gradient(135deg, rgba(254,250,240,0.98) 0%, rgba(248,240,225,0.98) 100%);"
              @click.stop>
              <!-- 顶部栏 -->
              <div class="sticky top-0 z-10 flex items-center gap-3 px-5 py-3 border-b border-amber-200/40 shrink-0"
                style="background: linear-gradient(180deg, rgba(254,250,240,0.99) 0%, rgba(248,240,225,0.97) 100%); backdrop-filter: blur(8px);">
                <span class="text-xl">📂</span>
                <h2 class="text-lg font-extrabold" style="color: #4a2c0a; font-family: 'Georgia', serif;">{{ album }}</h2>
                <span class="text-sm" style="color: #8b6914;">{{ albumPhotos.length }} 张</span>
              </div>

              <!-- 照片网格（紧凑包裹） -->
              <div class="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-fit mx-auto">
                <div
                  v-for="(photo, idx) in albumPhotos" :key="photo.id"
                  class="cursor-pointer"
                  :style="{
                    animation: `foldIn 0.45s ease-out both`,
                    animationDelay: `${idx * 0.06}s`,
                  }">
                  <div class="bg-white p-2 md:p-2.5 pb-5 md:pb-6 rounded-sm shadow-lg hover:shadow-2xl
                              hover:scale-105 transition-all duration-300 ease-out"
                    :style="{ transform: `rotate(${((photo.id * 73 + 29) % 5) - 2}deg)` }"
                    @click="openLightbox(photo.id, $event)">
                    <div class="w-32 md:w-40 aspect-[4/3] overflow-hidden bg-gray-100">
                      <img :src="photo.url" :alt="photo.title"
                        class="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
                    </div>
                    <p class="text-center text-[10px] md:text-xs text-gray-400 mt-1.5 truncate px-1"
                      style="font-family: 'KaiTi', cursive;">{{ photo.title || '——' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Teleport>

      </div>
    </div>
  </div>

  <!-- 灯箱 -->
  <Teleport to="body">
    <transition name="lightbox">
      <div v-if="lightboxOpen" class="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" @click="closeLightbox">
        <button class="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" @click="closeLightbox">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button class="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" @click.stop="prevPhoto($event)">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div class="max-w-[90vw] max-h-[85vh]" @click.stop>
          <img :src="allPhotos[lightboxIdx]?.url" :alt="allPhotos[lightboxIdx]?.title" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          <p class="text-white/70 text-center text-sm mt-3">{{ allPhotos[lightboxIdx]?.title || '' }}</p>
        </div>
        <button class="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" @click.stop="nextPhoto($event)">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">{{ lightboxIdx + 1 }} / {{ allPhotos.length }}</div>
      </div>
    </transition>
  </Teleport>
</div>
</template>

<style>
/* 全局 keyframes（Teleport 到 body 需要非 scoped） */
@keyframes foldIn {
  from { opacity: 0; transform: scale(0.3) rotate(15deg); }
  to   { opacity: 1; transform: scale(1) rotate(0deg); }
}
</style>

<style scoped>
.lightbox-enter-active { transition: all 0.3s ease-out; }
.lightbox-leave-active { transition: all 0.2s ease-in; }
.lightbox-enter-from,
.lightbox-leave-to { opacity: 0; }
</style>
