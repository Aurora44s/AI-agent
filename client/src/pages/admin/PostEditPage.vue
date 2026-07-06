<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { fetchPost, createPost, updatePost, fetchTags, uploadImage, type Tag } from "@/api";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";

const route = useRoute();
const router = useRouter();
const isEdit = !!route.params.id;

const title = ref("");
const slug = ref("");
const content = ref("");
const excerpt = ref("");
const coverImage = ref("");
const isPublished = ref(false);
const allTags = ref<Tag[]>([]);
const selectedTagIds = ref<number[]>([]);
const saving = ref(false);
const error = ref("");

async function loadPost() {
  if (!isEdit) return;
  try {
    const res = await fetchPost(route.params.slug as string);
    const p = res.data;
    title.value = p.title;
    slug.value = p.slug;
    content.value = p.content;
    excerpt.value = p.excerpt || "";
    coverImage.value = p.coverImage || "";
    isPublished.value = !!p.isPublished;
    selectedTagIds.value = p.tags.map((t) => t.id);
  } catch {
    error.value = "加载文章失败";
  }
}

onMounted(async () => {
  try {
    const tagsRes = await fetchTags();
    allTags.value = tagsRes.data;
  } catch {}
  await loadPost();
});

function autoSlug() {
  if (!isEdit && title.value) {
    slug.value = title.value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w一-鿿-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
}

function toggleTag(id: number) {
  const idx = selectedTagIds.value.indexOf(id);
  if (idx === -1) {
    selectedTagIds.value.push(id);
  } else {
    selectedTagIds.value.splice(idx, 1);
  }
}

async function handleUploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const res = await uploadImage(file);
    content.value += `\n![${file.name}](${res.data.url})\n`;
  } catch {
    alert("上传失败");
  }
}

async function handleSave(publishAfter = false) {
  error.value = "";
  if (!title.value || !slug.value || !content.value) {
    error.value = "标题、slug 和内容为必填项";
    return;
  }

  saving.value = true;
  try {
    const data = {
      title: title.value,
      slug: slug.value,
      content: content.value,
      excerpt: excerpt.value || content.value.slice(0, 200),
      coverImage: coverImage.value,
      isPublished: publishAfter ? true : isPublished.value,
      tagIds: selectedTagIds.value,
    };

    if (isEdit) {
      await updatePost(Number(route.params.id), data);
    } else {
      await createPost(data);
    }
    router.push("/admin/posts");
  } catch (err: any) {
    error.value = err.response?.data?.error || "保存失败";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminSidebar />
    <div class="lg:ml-56 p-4 lg:p-8 pt-16 lg:pt-8 transition-all">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-900 mb-6">{{ isEdit ? '编辑文章' : '新建文章' }}</h1>

      <div class="bg-white rounded-lg shadow-sm border p-4 lg:p-6 space-y-4 max-w-4xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input v-model="title" @input="autoSlug" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
            <input v-model="slug" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">摘要</label>
          <textarea v-model="excerpt" rows="2" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">封面图 URL</label>
          <input v-model="coverImage" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">内容 (Markdown) *</label>
          <div class="flex gap-2 mb-2">
            <label class="inline-block px-3 py-1.5 bg-gray-100 text-sm rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
              📷 上传图片
              <input type="file" accept="image/*" class="hidden" @change="handleUploadImage" />
            </label>
          </div>
          <textarea v-model="content" rows="16" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标签</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in allTags"
              :key="tag.id"
              @click="toggleTag(tag.id)"
              :class="[
                'px-3 py-1 rounded-full text-sm transition-colors',
                selectedTagIds.includes(tag.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ]"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

        <div class="flex flex-wrap items-center gap-3 pt-4 border-t">
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="isPublished" type="checkbox" class="rounded" /> 已发布
          </label>
          <button @click="handleSave(false)" :disabled="saving" class="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50">
            {{ saving ? '保存中...' : '保存草稿' }}
          </button>
          <button @click="handleSave(true)" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {{ saving ? '发布中...' : '发布' }}
          </button>
          <RouterLink to="/admin/posts" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">取消</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
