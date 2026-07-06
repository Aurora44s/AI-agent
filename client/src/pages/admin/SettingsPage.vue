<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchSettings, updateSettings, createTag, deleteTag, fetchTags, type Tag } from "@/api";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";

const siteName = ref("");
const siteDescription = ref("");
const aboutMe = ref("");
const github = ref("");
const saved = ref(false);

const tags = ref<Tag[]>([]);
const newTagName = ref("");
const newTagSlug = ref("");

onMounted(async () => {
  try {
    const res = await fetchSettings();
    siteName.value = res.data.site_name || "";
    siteDescription.value = res.data.site_description || "";
    aboutMe.value = res.data.about_me || "";
    github.value = res.data.github || "";
  } catch {}

  try {
    const tagsRes = await fetchTags();
    tags.value = tagsRes.data;
  } catch {}
});

async function save() {
  try {
    await updateSettings({
      site_name: siteName.value,
      site_description: siteDescription.value,
      about_me: aboutMe.value,
      github: github.value,
    });
    saved.value = true;
    setTimeout(() => (saved.value = false), 2000);
  } catch {
    alert("保存失败");
  }
}

async function addTag() {
  if (!newTagName.value || !newTagSlug.value) return;
  try {
    await createTag(newTagName.value, newTagSlug.value);
    tags.value.push({ id: Date.now(), name: newTagName.value, slug: newTagSlug.value });
    newTagName.value = "";
    newTagSlug.value = "";
  } catch {
    alert("添加标签失败");
  }
}

async function removeTag(id: number) {
  if (!confirm("确定删除此标签？")) return;
  try {
    await deleteTag(id);
    tags.value = tags.value.filter((t) => t.id !== id);
  } catch {
    alert("删除标签失败");
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminSidebar />
    <div class="lg:ml-56 p-4 lg:p-8 pt-16 lg:pt-8 transition-all">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-900 mb-6">站点设置</h1>

      <div class="bg-white rounded-lg shadow-sm border p-4 lg:p-6 space-y-4 max-w-2xl">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">站点名称</label>
          <input v-model="siteName" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">站点描述</label>
          <input v-model="siteDescription" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">关于我 (Markdown)</label>
          <textarea v-model="aboutMe" rows="8" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">GitHub 链接</label>
          <input v-model="github" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button @click="save" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          保存设置
        </button>
        <span v-if="saved" class="text-green-600 text-sm ml-3">✅ 已保存</span>
      </div>

      <!-- 标签管理 -->
      <h2 class="text-lg lg:text-xl font-bold text-gray-900 mt-8 mb-4">标签管理</h2>
      <div class="bg-white rounded-lg shadow-sm border p-4 lg:p-6 max-w-2xl space-y-4">
        <div class="flex flex-col sm:flex-row gap-2">
          <input v-model="newTagName" placeholder="标签名" class="px-3 py-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="newTagSlug" placeholder="slug" class="px-3 py-2 border rounded-lg sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button @click="addTag" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap">添加</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in tags" :key="tag.id" class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
            {{ tag.name }}
            <button @click="removeTag(tag.id)" class="text-red-400 hover:text-red-600 ml-1">&times;</button>
          </span>
          <span v-if="tags.length === 0" class="text-gray-400 text-sm">暂无标签</span>
        </div>
      </div>
    </div>
  </div>
</template>
