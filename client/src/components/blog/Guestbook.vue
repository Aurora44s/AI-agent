<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchComments, createComment, type Comment } from "@/api";
import { CloudArrowUpIcon } from "@heroicons/vue/20/solid";

const comments = ref<Comment[]>([]);
const loading = ref(true);
const submitting = ref(false);
const error = ref("");

const form = ref({ nickname: "", content: "" });
const nicknameEl = ref<HTMLInputElement | null>(null);

async function loadComments() {
  loading.value = true;
  try {
    const res = await fetchComments();
    comments.value = res.data;
  } catch {
    error.value = "加载留言失败";
  } finally {
    loading.value = false;
  }
}

async function submit() {
  const n = form.value.nickname.trim();
  const c = form.value.content.trim();
  if (!n || !c) {
    error.value = "请填写昵称和留言内容";
    return;
  }
  error.value = "";
  submitting.value = true;
  try {
    await createComment({ nickname: n, email: "", content: c });
    form.value.nickname = "";
    form.value.content = "";
    await loadComments();
  } catch {
    error.value = "提交失败，请重试";
  } finally {
    submitting.value = false;
  }
}

function fmtTime(d: string) {
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

onMounted(loadComments);
</script>

<template>
  <section class="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-8 md:py-12">
    <!-- 标题 -->
    <h2 class="text-center text-gray-700 text-lg mb-8">留言板</h2>

    <!-- 留言列表 -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-white/60 p-4 animate-pulse">
        <div class="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div class="h-4 bg-gray-100 rounded w-full"></div>
        <div class="h-2 bg-gray-50 rounded w-32 mt-2"></div>
      </div>
    </div>

    <div v-else-if="comments.length > 0" class="space-y-3">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/60 p-4 hover:shadow-lg transition-shadow duration-200"
      >
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {{ comment.nickname.charAt(0).toUpperCase() }}
          </div>
          <span class="text-sm font-semibold text-gray-800">{{ comment.nickname }}</span>
          <span class="text-xs text-gray-400 ml-auto">{{ fmtTime(comment.createdAt) }}</span>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400">
      <div class="text-3xl mb-2">📭</div>
      <p class="text-sm">还没有留言，来抢沙发吧！</p>
    </div>

    <!-- 提交表单 -->
    <div class="bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/60 p-4 md:p-6 mt-6">
      <div class="mb-3">
        <input
          ref="nicknameEl"
          v-model="form.nickname"
          type="text"
          placeholder="昵称 *"
          maxlength="50"
          class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
        />
      </div>
      <textarea
        v-model="form.content"
        placeholder="说点什么吧..."
        maxlength="2000"
        rows="3"
        class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none mb-3"
      ></textarea>
      <div v-if="error" class="text-xs text-rose-500 mb-2">{{ error }}</div>
      <button
        :disabled="submitting"
        class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-primary text-white text-sm font-medium rounded-xl hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="submit"
      >
        <CloudArrowUpIcon class="w-4 h-4" />
        <span>{{ submitting ? "提交中..." : "提交留言" }}</span>
      </button>
    </div>
  </section>
</template>
