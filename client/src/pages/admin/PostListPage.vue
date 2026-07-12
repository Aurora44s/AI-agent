<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { fetchAdminPosts, deletePost, type Post } from "@/api";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";

const posts = ref<Post[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const res = await fetchAdminPosts({ limit: 100 });
    posts.value = res.data.posts;
  } catch {} finally {
    loading.value = false;
  }
}

async function handleDelete(id: number, title: string) {
  if (!confirm(`确定删除「${title}」？此操作不可撤销。`)) return;
  try {
    await deletePost(id);
    posts.value = posts.value.filter((p) => p.id !== id);
  } catch {
    alert("删除失败");
  }
}

onMounted(load);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminSidebar />
    <div class="lg:ml-56 p-4 lg:p-8 pt-16 lg:pt-8 transition-all">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-xl lg:text-2xl font-bold text-gray-900">文章管理</h1>
        <RouterLink to="/admin/posts/new" class="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 text-center transition-colors">
          + 新建文章
        </RouterLink>
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
      <div v-else class="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table class="w-full text-left text-sm min-w-[600px]">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-3 lg:px-4 py-3 font-medium w-8">#</th>
              <th class="px-3 lg:px-4 py-3 font-medium">标题</th>
              <th class="px-3 lg:px-4 py-3 font-medium w-16 lg:w-20">状态</th>
              <th class="px-3 lg:px-4 py-3 font-medium w-24 lg:w-28">更新时间</th>
              <th class="px-3 lg:px-4 py-3 font-medium w-24 lg:w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id" class="border-b hover:bg-gray-50">
              <td class="px-3 lg:px-4 py-3 text-gray-400">{{ post.id }}</td>
              <td class="px-3 lg:px-4 py-3">
                <RouterLink :to="`/admin/posts/${post.slug}/edit`" class="text-blue-600 hover:underline">
                  {{ post.title }}
                </RouterLink>
              </td>
              <td class="px-3 lg:px-4 py-3">
                <span v-if="post.isPublished" class="text-green-600 text-xs">已发布</span>
                <span v-else class="text-yellow-600 text-xs">草稿</span>
              </td>
              <td class="px-3 lg:px-4 py-3 text-gray-400 text-xs">{{ post.updatedAt?.slice(0, 10) }}</td>
              <td class="px-3 lg:px-4 py-3">
                <div class="flex gap-2">
                  <RouterLink :to="`/admin/posts/${post.slug}/edit`" class="text-blue-600 hover:underline text-xs">编辑</RouterLink>
                  <button @click="handleDelete(post.id, post.title)" class="text-red-500 hover:underline text-xs">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="posts.length === 0">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400">暂无文章，去写第一篇吧！</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
