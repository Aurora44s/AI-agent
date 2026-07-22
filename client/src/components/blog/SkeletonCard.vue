<template>
  <div class="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-white/60 p-4 md:p-5 animate-pulse flex gap-4">
    <!-- 左侧方形占位 -->
    <div class="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-xl shrink-0"></div>
    <!-- 右侧内容占位 -->
    <div class="flex-1 min-w-0">
      <div class="h-5 md:h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div class="h-5 md:h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div class="h-3 bg-gray-100 rounded w-full mb-1.5"></div>
      <div class="h-3 bg-gray-100 rounded w-full mb-1.5"></div>
      <div class="h-3 bg-gray-100 rounded w-2/3 mb-3"></div>
      <div class="flex gap-2">
        <div class="h-5 w-14 bg-gray-100 rounded-full"></div>
        <div class="h-5 w-12 bg-gray-100 rounded-full"></div>
      </div>
    </div>
  </div>
</template>
