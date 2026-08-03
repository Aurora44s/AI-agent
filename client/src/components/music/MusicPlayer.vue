<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { fetchSongs, type Song } from "@/api";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean]; closeChat: [] }>();

// ----- 状态 -----
const expanded = ref(false);
const panelVisible = ref(false);
const bubblePhase = ref<"collapsed" | "popping" | "sliding-up" | "at-target" | "moving-back">("collapsed");
const songList = ref<Song[]>([]);
const currentIdx = ref(0);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const showPlaylist = ref(false);
const lyrics = ref<{ time: number; text: string }[]>([]);
const currentLyricIdx = ref(-1);
const audioEl = ref<HTMLAudioElement | null>(null);
const lyricsContainer = ref<HTMLDivElement | null>(null);
const panelEl = ref<HTMLDivElement | null>(null);
const playlistBtnEl = ref<HTMLButtonElement | null>(null);
const playlistEl = ref<HTMLDivElement | null>(null);

const playlistPos = computed(() => {
  if (!playlistBtnEl.value) return {};
  const rect = playlistBtnEl.value.getBoundingClientRect();
  return { top: rect.top - 8 + "px", right: window.innerWidth - rect.right + "px" };
});

// ----- 计算 -----
const currentSong = computed(() => songList.value[currentIdx.value] ?? null);
const progress = computed(() => (duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0));

// ----- 自动播放：首次用户交互后即播 -----
let autoplayDone = false;
let userPaused = false;
function tryAutoplay() {
  if (autoplayDone || userPaused || !currentSong.value) return;
  autoplayDone = true;
  document.removeEventListener("click", tryAutoplay);
  play();
}

// ----- 加载歌曲 -----
async function loadSongs() {
  try {
    const res = await fetchSongs();
    songList.value = res.data;
    if (songList.value.length > 0) {
      await nextTick();
      // 解析第一首歌的歌词
      const song = songList.value[0];
      if (song?.lrcContent) parseLRC(song.lrcContent);
      // 注册一次性点击监听，用户首次点击页面任意位置即开始播放
      document.addEventListener("click", tryAutoplay, { once: true });
    }
  } catch { console.error("加载歌曲失败"); }
}
onMounted(loadSongs);
onUnmounted(() => {
  document.removeEventListener("click", tryAutoplay);
  document.removeEventListener("click", onDocumentClick);
  onPlayPause();
});

// 半圆位置（三段式动画）
const bubbleStyle = computed(() => {
  const target = { left: "1rem", bottom: "calc(420px + 1rem - 3.25rem)" };
  const popped = { left: "1rem", bottom: "calc(33vh - 2.5rem)" };
  const collapsed = { left: "-2rem", bottom: "calc(33vh - 2.5rem)" };

  switch (bubblePhase.value) {
    case "collapsed":
    case "moving-back":
      return collapsed;
    case "popping":
      return popped;
    case "sliding-up":
    case "at-target":
      return target;
  }
});

// ----- 展开/折叠（两段式动画：弹出 → 上移）-----
function open() {
  if (bubblePhase.value !== "collapsed") return;
  emit("closeChat");
  // 第一阶段：向右弹出，露出完整圆形
  bubblePhase.value = "popping";
  setTimeout(() => {
    // 第二阶段：向上滑动到面板位置
    bubblePhase.value = "sliding-up";
    setTimeout(() => {
      bubblePhase.value = "at-target";
      panelVisible.value = true;
      requestAnimationFrame(() => {
        expanded.value = true;
        emit("update:modelValue", true);
      });
    }, 350);
  }, 300);
}

function close() {
  expanded.value = false;
  emit("update:modelValue", false);
  setTimeout(() => {
    panelVisible.value = false;
    bubblePhase.value = "sliding-up";
    requestAnimationFrame(() => {
      bubblePhase.value = "popping";
      setTimeout(() => {
        bubblePhase.value = "collapsed";
      }, 350);
    });
  }, 300);
}

// 点击面板外部关闭
function onDocumentClick(e: MouseEvent) {
  if (!panelEl.value || !expanded.value) return;
  const target = e.target as Node;
  if (!panelEl.value.contains(target) && !playlistEl.value?.contains(target)) close();
}
watch(panelVisible, (val) => {
  if (val) {
    document.addEventListener("click", onDocumentClick);
  } else {
    document.removeEventListener("click", onDocumentClick);
  }
});

watch(() => props.modelValue, (val) => {
  if (!val && expanded.value) close();
});

// ----- 播放 -----
async function play() {
  if (!audioEl.value) return;
  try {
    await audioEl.value.play();
    isPlaying.value = true;
  } catch {
    // 移动端可能拒绝 Promise，但 @play 事件仍会触发
  }
}
function pause() {
  userPaused = true;
  audioEl.value?.pause();
  isPlaying.value = false;
}
function togglePlay() {
  isPlaying.value ? pause() : play();
}
function prev() {
  if (!songList.value.length) return;
  currentIdx.value = (currentIdx.value - 1 + songList.value.length) % songList.value.length;
  syncLyrics();
}
function next() {
  if (!songList.value.length) return;
  currentIdx.value = (currentIdx.value + 1) % songList.value.length;
  syncLyrics();
}
function selectSong(idx: number) {
  currentIdx.value = idx;
  showPlaylist.value = false;
  syncLyrics();
}

// ----- 进度条（rAF 方式，移动端兼容）-----
let progressAnimId: number | null = null;
let lastTick = 0;
let lastTickTime = 0;

function onPlayStart() {
  // 初始化时间戳，避免从 0 开始跳跃
  if (audioEl.value) {
    lastTick = performance.now();
    lastTickTime = audioEl.value.currentTime;
    currentTime.value = lastTickTime;
  }
  startProgressPolling();
}

function onPlayPause() {
  stopProgressPolling();
}

function startProgressPolling() {
  stopProgressPolling();
  function tick() {
    if (!audioEl.value) { stopProgressPolling(); return; }
    if (isPlaying.value) {
      const elapsed = (performance.now() - lastTick) / 1000;
      currentTime.value = Math.min(lastTickTime + elapsed, duration.value || Infinity);
      updateLyricIdx();
    }
    progressAnimId = requestAnimationFrame(tick);
  }
  progressAnimId = requestAnimationFrame(tick);
}

function stopProgressPolling() {
  if (progressAnimId) { cancelAnimationFrame(progressAnimId); progressAnimId = null; }
}

function onTimeUpdate() {
  if (!audioEl.value) return;
  lastTick = performance.now();
  lastTickTime = audioEl.value.currentTime;
}

function updateLyricIdx() {
  const t = currentTime.value;
  let idx = -1;
  for (let i = 0; i < lyrics.value.length; i++) {
    if (lyrics.value[i].time <= t) idx = i; else break;
  }
  currentLyricIdx.value = idx;
}

// 歌词平滑滚动动画
function smoothScrollTo(target: number) {
  const el = lyricsContainer.value;
  if (!el) return;
  const start = el.scrollTop;
  const distance = target - start;
  const duration = 500;
  let startTime: number;

  function step(ts: number) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el!.scrollTop = start + distance * eased;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// 歌词自动滚动
watch(currentLyricIdx, async (idx) => {
  if (idx < 0 || !lyricsContainer.value) return;
  await nextTick();
  const active = lyricsContainer.value.querySelector(`[data-lyric="${idx}"]`) as HTMLElement | null;
  if (active) {
    const cRect = lyricsContainer.value.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    const relativeTop = aRect.top - cRect.top + lyricsContainer.value.scrollTop;
    const target = relativeTop - lyricsContainer.value.clientHeight / 2 + aRect.height / 2;
    smoothScrollTo(target);
  }
});

function onLoaded() {
  if (audioEl.value) duration.value = audioEl.value.duration;
}
function onEnded() { onPlayPause(); next(); }
function seek(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const pct = (e.clientX - el.getBoundingClientRect().left) / el.offsetWidth;
  if (audioEl.value) audioEl.value.currentTime = pct * duration.value;
}

// ----- LRC 歌词 -----
function parseLRC(lrc: string) {
  const result: { time: number; text: string }[] = [];
  for (const line of lrc.split("\n")) {
    const m = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (m) {
      const time = parseInt(m[1]) * 60 + parseInt(m[2]) + parseInt(m[3]) / (m[3].length === 2 ? 100 : 1000);
      const text = m[4].trim();
      if (text) result.push({ time, text });
    }
  }
  lyrics.value = result.sort((a, b) => a.time - b.time);
}
async function syncLyrics() {
  const song = songList.value[currentIdx.value];
  lyrics.value = [];
  currentLyricIdx.value = -1;
  if (song?.lrcContent) parseLRC(song.lrcContent);
  await nextTick();
  play();
}

function fmtTime(t: number) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
</script>

<template>
  <!-- ===== 半圆气泡（位置动态过渡） ===== -->
  <div
    v-if="bubblePhase !== 'at-target'"
    :class="[
      'fixed z-50 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
      bubblePhase === 'collapsed' ? 'cursor-pointer group' : 'pointer-events-none',
    ]"
    :style="{ ...bubbleStyle }"
    @click="bubblePhase === 'collapsed' && open()"
  >
    <!-- 外层黑胶大圆 -->
    <div
      :class="[
        'w-20 h-20 rounded-full bg-gray-900 border-2 border-gray-700',
        'flex items-center justify-center shadow-xl',
        'group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300',
        isPlaying ? 'animate-spin' : '',
      ]"
      style="animation-duration: 6s;"
    >
      <!-- 唱片沟槽纹理 -->
      <div
        class="w-20 h-20 rounded-full absolute inset-0"
        style="background: repeating-radial-gradient(circle at center, transparent 0px, transparent 3px, rgba(255,255,255,0.06) 3px, rgba(255,255,255,0.06) 4px);"
      ></div>
      <!-- 内层封面小圆 -->
      <div class="relative z-10 w-9 h-9 rounded-full overflow-hidden border-2 border-gray-600 bg-gradient-primary flex items-center justify-center shadow-inner">
        <img
          v-if="currentSong?.coverPath"
          :src="currentSong.coverPath"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-2.5 h-2.5 rounded-full bg-white"></div>
      </div>
    </div>
  </div>

  <!-- ===== 展开面板 ===== -->
  <transition name="panel-slide">
    <div
      ref="panelEl"
      v-if="panelVisible"
      :class="[
        'fixed z-50 left-4 bottom-28 w-80 md:w-96 rounded-3xl shadow-2xl border border-white/50 flex flex-col overflow-hidden transition-all duration-400',
        expanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      ]"
      style="height: 420px;"
    >
      <!-- 封面模糊背景（overflow-hidden 保持圆角） -->
      <div class="absolute inset-0 z-0 rounded-3xl overflow-hidden">
        <div
          v-if="currentSong?.coverPath"
          class="absolute inset-0"
          :style="{
            backgroundImage: `url(${currentSong.coverPath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
            transform: 'scale(1.2)',
          }"
        ></div>
        <!-- 半透明遮罩 -->
        <div class="absolute inset-0" style="background: rgba(255,255,255,0.55);"></div>
      </div>

      <!-- 内容 -->
      <div class="relative z-10 flex flex-col h-full" style="backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);">
      <!-- 顶部栏 -->
      <div class="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-white/40">
        <!-- 双层圆盘（同半圆尺寸） -->
        <div
          :class="['relative w-20 h-20 rounded-full bg-gray-900 border-2 border-gray-700 shrink-0 flex items-center justify-center', isPlaying ? 'animate-spin' : '']"
          style="animation-duration: 4s;"
        >
          <div class="absolute inset-0 rounded-full" style="background: repeating-radial-gradient(circle at center, transparent 0px, transparent 3px, rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 4px);"></div>
          <div class="relative z-10 w-9 h-9 rounded-full overflow-hidden border-2 border-gray-600 bg-gradient-primary flex items-center justify-center">
            <img v-if="currentSong?.coverPath" :src="currentSong.coverPath" class="w-full h-full object-cover" />
            <div v-else class="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
        </div>

        <!-- 歌名歌手 -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-gray-900 truncate">{{ currentSong?.title || '暂无歌曲' }}</p>
          <p class="text-xs text-gray-500 truncate">{{ currentSong?.artist || '---' }}</p>
        </div>

        <!-- 歌单按钮 -->
        <div class="relative">
          <button ref="playlistBtnEl" class="p-1.5 rounded-lg hover:bg-white/40 transition-colors" @click="showPlaylist = !showPlaylist">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <Teleport to="body">
            <div
              ref="playlistEl"
              v-if="showPlaylist"
              :style="{ top: playlistPos.top, right: playlistPos.right }"
              class="fixed z-[60] w-52 bg-white/60 backdrop-blur-xl rounded-xl shadow-xl border border-white/40 py-1 max-h-56 overflow-y-auto"
            >
              <!-- 关闭按钮 -->
              <div class="flex items-center justify-between px-3 py-1.5 border-b border-white/30">
                <span class="text-xs font-semibold text-gray-500">歌单</span>
                <button class="p-0.5 rounded hover:bg-white/50 transition-colors" @click.stop="showPlaylist = false">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-if="!songList.length" class="px-3 py-2 text-xs text-gray-400">暂无歌曲</div>
              <button
                v-for="(song, idx) in songList"
                :key="song.id"
                :class="['w-full text-left px-3 py-1.5 text-xs truncate hover:bg-white/40 transition-colors', idx === currentIdx ? 'text-primary-600 font-bold' : 'text-gray-800']"
                @click.stop="selectSong(idx)"
              >
                {{ song.title }} - {{ song.artist }}
              </button>
            </div>
          </Teleport>
        </div>

        <!-- 关闭 -->
        <button class="p-1.5 rounded-lg hover:bg-white/40 transition-colors" @click="close">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 歌词区 -->
      <div ref="lyricsContainer" class="flex-1 overflow-y-auto px-4 py-3 text-center">
        <div v-if="lyrics.length > 0" class="space-y-1.5">
          <p
            v-for="(line, idx) in lyrics"
            :key="idx"
            :data-lyric="idx"
            :class="['transition-all duration-300 text-xs', idx === currentLyricIdx ? 'text-primary-600 font-bold text-sm scale-105' : 'text-gray-400']"
          >
            {{ line.text }}
          </p>
        </div>
        <div v-else class="flex items-center justify-center h-full text-gray-300 text-sm">
          <span v-if="currentSong?.lrcContent">🎵</span>
          <span v-else>🎵 暂无歌词</span>
        </div>
      </div>

      <!-- 底部控制 -->
      <div class="px-4 py-3 shrink-0 border-t border-white/40">
        <!-- 进度条 -->
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[10px] text-gray-400 w-8 text-right">{{ fmtTime(currentTime) }}</span>
          <div class="flex-1 h-1.5 bg-white/60 rounded-full cursor-pointer overflow-hidden" @click="seek">
            <div class="h-full bg-gradient-primary rounded-full transition-all duration-200" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="text-[10px] text-gray-400 w-8">{{ fmtTime(duration) }}</span>
        </div>

        <!-- 播放按钮 -->
        <div class="flex items-center justify-center gap-5">
          <button class="p-1.5 rounded-full hover:bg-white/40 transition-colors" @click="prev">
            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>
          <button class="p-2.5 rounded-full bg-gradient-primary text-white shadow-lg hover:shadow-glow hover:scale-105 transition-all" @click="togglePlay">
            <svg v-if="!isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          </button>
          <button class="p-1.5 rounded-full hover:bg-white/40 transition-colors" @click="next">
            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>
      </div>

      </div><!-- /内容 -->
    </div>
  </transition>

  <!-- Audio（始终挂载，不受面板显隐影响） -->
  <audio
    ref="audioEl"
    v-if="currentSong"
    :src="currentSong.filePath"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoaded"
    @ended="onEnded"
    @play="isPlaying = true; onPlayStart()"
    @pause="isPlaying = false; onPlayPause()"
  ></audio>
</template>

<style scoped>
.panel-slide-enter-active { transition: all 0.4s ease-out; }
.panel-slide-leave-active { transition: all 0.3s ease-in; }
.panel-slide-enter-from { opacity: 0; transform: translateY(20px); }
.panel-slide-leave-to { opacity: 0; transform: translateY(20px); }

.duration-400 { transition-duration: 0.4s; }
</style>
