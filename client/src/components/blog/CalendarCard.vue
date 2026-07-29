<script setup lang="ts">
import { computed, ref } from "vue";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

const HOLIDAYS: { name: string; month: number; day: number; emoji: string }[] = [
  { name: "元旦", month: 1, day: 1, emoji: "🎉" },
  { name: "春节", month: 1, day: 29, emoji: "🧧" },
  { name: "情人节", month: 2, day: 14, emoji: "💝" },
  { name: "清明节", month: 4, day: 5, emoji: "🌿" },
  { name: "劳动节", month: 5, day: 1, emoji: "🛠️" },
  { name: "端午节", month: 5, day: 31, emoji: "🐲" },
  { name: "中秋节", month: 10, day: 6, emoji: "🥮" },
  { name: "国庆节", month: 10, day: 1, emoji: "🇨🇳" },
  { name: "圣诞节", month: 12, day: 25, emoji: "🎄" },
];

const expanded = ref(false);

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const today = now.getDate();
const todayTs = new Date(year, month, today).getTime();

const todayLabel = `${year}年${month + 1}月${today}日`;
const weekDayName = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];

const monthLabel = `${year}年${month + 1}月`;

const calendar = computed(() => {
  const firstDay = new Date(year, month, 1).getDay();
  const startDow = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
});

const upcomingHolidays = computed(() => {
  return HOLIDAYS
    .map((h) => {
      const hDate = new Date(year, h.month - 1, h.day);
      if (hDate.getTime() < todayTs) hDate.setFullYear(year + 1);
      const diffDays = Math.ceil((hDate.getTime() - todayTs) / 86400000);
      return { ...h, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 4);
});
</script>

<template>
  <div
    class="bg-white/80 backdrop-blur-md rounded-2xl shadow-md border-2 border-white/80 p-7
           hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
    @click="expanded = !expanded"
  >
    <!-- 头部：日期 + 箭头 -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <p class="text-lg font-bold text-gray-700 mb-1">{{ todayLabel }}</p>
        <p class="text-xs text-gray-400">星期{{ weekDayName }}</p>
      </div>
      <svg
        :class="['w-4 h-4 text-gray-400 transition-transform duration-300', expanded ? 'rotate-180' : '']"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- 节日列表 -->
    <div class="space-y-3 pt-1">
      <div
        v-for="h in upcomingHolidays"
        :key="h.name"
        class="flex items-center justify-between"
      >
        <span class="text-base text-gray-700">{{ h.name }}</span>
        <span class="text-sm text-rose-400 font-medium">
          {{ h.diffDays === 0 ? '今天' : h.diffDays === 1 ? '明天' : `还有${h.diffDays}天` }}
        </span>
      </div>
    </div>

    <!-- 日历抽屉 -->
    <Transition name="drawer">
      <div v-if="expanded" class="overflow-hidden">
        <div class="border-t border-gray-100 mt-3 pt-3">
          <h5 class="text-xs font-bold text-gray-600 text-center mb-2">{{ monthLabel }}</h5>
          <div class="grid grid-cols-7 gap-0.5 mb-1">
            <span v-for="d in WEEKDAYS" :key="d" class="text-xs text-gray-400 text-center py-0.5">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-0.5">
            <div v-for="(cell, i) in calendar" :key="i" class="aspect-square flex items-center justify-center">
              <span
                v-if="cell !== null"
                :class="[
                  'text-sm w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
                  cell === today
                    ? 'bg-gradient-primary text-white font-bold shadow-sm'
                    : 'text-gray-600',
                ]"
              >{{ cell }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.drawer-enter-active {
  transition: all 0.35s ease-out;
  overflow: hidden;
}
.drawer-leave-active {
  transition: all 0.25s ease-in;
  overflow: hidden;
}
.drawer-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}
.drawer-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}
.drawer-enter-to,
.drawer-leave-from {
  max-height: 300px;
  opacity: 1;
  transform: translateY(0);
}
</style>
