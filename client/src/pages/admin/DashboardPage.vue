<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { fetchAdminPosts, type Post } from "@/api";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";

const postCount = ref(0);
const recentPosts = ref<Post[]>([]);

onMounted(async () => {
  try {
    const res = await fetchAdminPosts({ limit: 5 });
    postCount.value = res.data.total;
    recentPosts.value = res.data.posts;
  } catch {}
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminSidebar />
    <div class="lg:ml-56 p-4 lg:p-8 pt-16 lg:pt-8 transition-all">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <p class="text-2xl lg:text-3xl font-bold text-blue-600">{{ postCount }}</p>
          <p class="text-gray-500 text-sm mt-1">文章总数</p>
        </div>
      </div>

      <h2 class="text-lg font-bold text-gray-900 mb-4">最近文章</h2>
      <div class="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table class="w-full text-left text-sm min-w-[500px]">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-3 lg:px-4 py-3 font-medium">标题</th>
              <th class="px-3 lg:px-4 py-3 font-medium w-16 lg:w-20">状态</th>
              <th class="px-3 lg:px-4 py-3 font-medium w-24 lg:w-28">时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in recentPosts" :key="post.id" class="border-b hover:bg-gray-50">
              <td class="px-3 lg:px-4 py-3">
                <RouterLink :to="`/admin/posts/${post.id}/edit`" class="text-blue-600 hover:underline">
                  {{ post.title }}
                </RouterLink>
              </td>
              <td class="px-3 lg:px-4 py-3">
                <span v-if="post.isPublished" class="text-green-600 text-xs">已发布</span>
                <span v-else class="text-yellow-600 text-xs">草稿</span>
              </td>
              <td class="px-3 lg:px-4 py-3 text-gray-400 text-xs">{{ post.createdAt?.slice(0, 10) }}</td>
            </tr>
            <tr v-if="recentPosts.length === 0">
              <td colspan="3" class="px-4 py-8 text-center text-gray-400">暂无文章</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
