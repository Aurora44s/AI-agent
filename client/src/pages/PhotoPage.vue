<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { fetchPhotos, type Photo } from "@/api";

const photos = ref<Photo[]>([]);
const loading = ref(true);
const openedAlbum = ref<string | null>(null);

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

function openAlbum(name: string) {
  openedAlbum.value = name;
}
function closeAlbum() {
  openedAlbum.value = null;
}

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
<div class="min-h-screen relative bg-fixed bg-cover bg-center" style="background-image: url('/c25bdb2a33bf1021a05d4317d3fec6f6_720.jpg')">
  <div class="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>

  <div class="relative z-10 max-w-5xl mx-auto px-4 pt-20 md:pt-24 pb-12">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">📸 照片墙</h1>
    <p class="text-gray-400 text-center text-sm mb-10">每一张照片，都是一段故事</p>

    <!-- 加载中 -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      <div v-for="i in 8" :key="i" class="bg-white/60 rounded-2xl overflow-hidden animate-pulse">
        <div class="aspect-square bg-gray-200"></div>
        <div class="p-3 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          <div class="h-3 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="albums.length === 0" class="text-center py-20">
      <div class="text-5xl mb-4">📸</div>
      <p class="text-gray-400">还没有照片，去后台添加吧</p>
    </div>

    <!-- 相册网格 -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      <div
        v-for="([album, albumPhotos]) in albums"
        :key="album"
        class="group rounded-2xl cursor-pointer shadow-lg
               hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        @click="openAlbum(album)"
      >
        <!-- 封面图：三张堆叠 + 文字覆盖 -->
        <div class="aspect-[3/4] relative rounded-2xl">
          <!-- 底图 -->
          <img
            v-if="albumPhotos[2]"
            :src="albumPhotos[2].url"
            class="absolute w-[94%] h-[94%] object-cover rounded-xl pointer-events-none z-0
                   -rotate-[5deg] -translate-x-[3%] translate-y-[2%]
                   group-hover:-rotate-[12deg] group-hover:-translate-x-[8%] group-hover:translate-y-[4%]
                   transition-all duration-400 ease-out"
            loading="lazy"
          />
          <!-- 中图 -->
          <img
            v-if="albumPhotos[1]"
            :src="albumPhotos[1].url"
            class="absolute w-[94%] h-[94%] object-cover rounded-xl pointer-events-none z-[5]
                   rotate-[3deg] translate-x-[2%] -translate-y-[1%]
                   group-hover:rotate-[10deg] group-hover:translate-x-[6%] group-hover:-translate-y-[4%]
                   transition-all duration-400 ease-out"
            loading="lazy"
          />
          <!-- 顶图 -->
          <img
            :src="albumPhotos[0].url"
            :alt="album"
            class="absolute w-[94%] h-[94%] object-cover rounded-xl pointer-events-none z-10
                   group-hover:scale-105
                   transition-all duration-400 ease-out"
            loading="lazy"
          />

          <!-- 底部渐变文字覆盖层 -->
          <div class="absolute bottom-0 inset-x-0 z-20 px-3 pb-3 pt-10"
               style="background: linear-gradient(transparent, rgba(0,0,0,0.6));">
            <h3 class="text-sm md:text-base font-bold text-white truncate">{{ album }}</h3>
            <p class="text-xs text-white/70 mt-0.5">{{ albumPhotos.length }} 张照片</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ====== 展开面板 ====== -->
  <Teleport to="body">
    <div
      v-if="openedAlbum"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click="closeAlbum">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div
        class="relative w-fit max-w-[95vw] max-h-[90vh] overflow-auto rounded-2xl shadow-2xl"
        style="background: linear-gradient(135deg, rgba(254,250,240,0.98) 0%, rgba(248,240,225,0.98) 100%);"
        @click.stop>
        <div class="sticky top-0 z-10 flex items-center gap-3 px-5 py-3 border-b border-amber-200/40 shrink-0"
          style="background: linear-gradient(180deg, rgba(254,250,240,0.99) 0%, rgba(248,240,225,0.97) 100%); backdrop-filter: blur(8px);">
          <span class="text-xl">📂</span>
          <h2 class="text-lg font-extrabold" style="color: #4a2c0a; font-family: 'Georgia', serif;">{{ openedAlbum }}</h2>
          <span class="text-sm" style="color: #8b6914;">{{ albums.find(([a]) => a === openedAlbum)?.[1].length }} 张</span>
        </div>

        <div class="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-fit mx-auto">
          <div
            v-for="(photo, idx) in albums.find(([a]) => a === openedAlbum)?.[1] || []"
            :key="photo.id"
            class="cursor-pointer"
            :style="{ animation: `foldIn 0.45s ease-out both`, animationDelay: `${idx * 0.06}s` }"
          >
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
