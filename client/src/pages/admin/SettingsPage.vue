<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchSettings, updateSettings, createTag, deleteTag, fetchTags, fetchSongs, uploadSong, deleteSong, type Tag, type Song } from "@/api";
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

  loadSongs();
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

// ----- 歌曲管理 -----
const songList = ref<Song[]>([]);
const songTitle = ref("");
const songArtist = ref("");
const songLrc = ref("");
const songFile = ref<File | null>(null);
const songCover = ref<File | null>(null);
const uploading = ref(false);

async function loadSongs() {
  try {
    const res = await fetchSongs();
    songList.value = res.data;
  } catch {}
}

async function addSong() {
  if (!songFile.value || !songTitle.value) {
    alert("请填写歌名并选择音乐文件");
    return;
  }
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("music", songFile.value);
    fd.append("title", songTitle.value);
    fd.append("artist", songArtist.value || "未知歌手");
    fd.append("lrc_content", songLrc.value);
    if (songCover.value) fd.append("cover", songCover.value);
    await uploadSong(fd);
    songTitle.value = "";
    songArtist.value = "";
    songLrc.value = "";
    songFile.value = null;
    songCover.value = null;
    await loadSongs();
  } catch {
    alert("上传失败");
  } finally {
    uploading.value = false;
  }
}

async function removeSong(id: number) {
  if (!confirm("确定删除此歌曲？")) return;
  try {
    await deleteSong(id);
    songList.value = songList.value.filter((s) => s.id !== id);
  } catch {
    alert("删除失败");
  }
}

function onFileChange(e: Event, target: "file" | "cover") {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (target === "file") songFile.value = file ?? null;
  else songCover.value = file ?? null;
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

      <!-- 歌曲管理 -->
      <h2 class="text-lg lg:text-xl font-bold text-gray-900 mt-8 mb-4">歌单管理</h2>
      <div class="bg-white rounded-lg shadow-sm border p-4 lg:p-6 max-w-2xl space-y-4">
        <!-- 上传表单 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">歌名 *</label>
            <input v-model="songTitle" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="歌曲名称" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">歌手</label>
            <input v-model="songArtist" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="歌手/乐队" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">LRC 歌词（可选）</label>
          <textarea v-model="songLrc" rows="4" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" placeholder="[00:00.00]歌词内容&#10;[00:05.00]下一行歌词" />
        </div>
        <div class="flex flex-wrap gap-3">
          <label class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm">
            🎵 选择音乐
            <input type="file" accept="audio/*" class="hidden" @change="onFileChange($event, 'file')" />
          </label>
          <span v-if="songFile" class="self-center text-sm text-gray-500">{{ songFile.name }}</span>
          <label class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm">
            🖼️ 封面图
            <input type="file" accept="image/*" class="hidden" @change="onFileChange($event, 'cover')" />
          </label>
          <span v-if="songCover" class="self-center text-sm text-gray-500">{{ songCover.name }}</span>
        </div>
        <button
          @click="addSong"
          :disabled="uploading"
          class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ uploading ? '上传中...' : '上传歌曲' }}
        </button>

        <!-- 歌曲列表 -->
        <div v-if="songList.length > 0" class="border-t pt-4 mt-4 space-y-2">
          <div
            v-for="song in songList"
            :key="song.id"
            class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-800 truncate">{{ song.title }}</p>
              <p class="text-xs text-gray-400 truncate">{{ song.artist }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <audio :src="song.filePath" controls class="h-8 w-32" preload="none"></audio>
              <button @click="removeSong(song.id)" class="text-red-400 hover:text-red-600 text-xs px-2 py-1">删除</button>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm pt-2">暂无歌曲，请上传</div>
      </div>
    </div>
  </div>
</template>
