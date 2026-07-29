<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { fetchAnnouncements, type Announcement } from "@/api";

const list = ref<Announcement[]>([]);
const current = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

async function load() {
  try {
    const res = await fetchAnnouncements();
    list.value = res.data;
  } catch {}
}

function startCarousel() {
  stopCarousel();
  timer = setInterval(() => {
    if (list.value.length > 1) {
      current.value = (current.value + 1) % list.value.length;
    }
  }, 5000);
}

function stopCarousel() {
  if (timer) { clearInterval(timer); timer = null; }
}

onMounted(async () => {
  await load();
  startCarousel();
});

onUnmounted(stopCarousel);
</script>

<template>
  <Transition name="announce-fade">
    <article
      v-if="list.length > 0"
      class="bg-white/80 backdrop-blur-md rounded-2xl shadow-md border-2 border-white/80 p-5
             hover:shadow-glow hover:border-primary-300 hover:-translate-y-1 transition-all duration-300"
    >
      <Transition name="slide" mode="out-in">
        <p
          :key="current"
          class="text-sm md:text-base text-center leading-relaxed text-gradient max-h-28 overflow-y-auto whitespace-pre-wrap"
        >
          {{ list[current]?.content }}
        </p>
      </Transition>

      <!-- 指示点 -->
      <div v-if="list.length > 1" class="flex justify-center gap-1.5 mt-3">
        <span
          v-for="(_, i) in list"
          :key="i"
          :class="[
            'w-1.5 h-1.5 rounded-full transition-all duration-300',
            i === current ? 'bg-primary-500 scale-125' : 'bg-gray-300',
          ]"
        ></span>
      </div>
    </article>
  </Transition>
</template>

<style scoped>
.announce-fade-enter-active {
  transition: all 0.6s ease-out;
}
.announce-fade-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
