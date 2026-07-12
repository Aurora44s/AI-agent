<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { fetchPost, fetchSettings, fetchComments, createComment, type Post, type Comment } from "@/api";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import TagBadge from "@/components/blog/TagBadge.vue";
import GiscusComment from "@/components/blog/GiscusComment.vue";
import SkeletonPost from "@/components/blog/SkeletonPost.vue";
import { useSEO } from "@/composables/useSEO";
import "highlight.js/styles/github-dark.css";

const route = useRoute();
const post = ref<Post | null>(null);
const loading = ref(true);
const siteSettings = ref<Record<string, string>>({});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch {}
    }
    return "";
  },
});

const giscusConfig = computed(() => ({
  repo: siteSettings.value.giscus_repo || "",
  repoId: siteSettings.value.giscus_repo_id || "",
  category: siteSettings.value.giscus_category || "General",
  categoryId: siteSettings.value.giscus_category_id || "",
  term: post.value?.slug || "",
}));

const showGiscus = computed(() => !!giscusConfig.value.repo);

onMounted(async () => {
  try {
    const slug = route.params.slug as string;
    const [postRes, settingsRes] = await Promise.all([
      fetchPost(slug),
      fetchSettings(),
    ]);
    post.value = postRes.data;
    siteSettings.value = settingsRes.data;
    loadComments();
  } catch {
    console.error("加载文章失败");
  } finally {
    loading.value = false;
  }
});

// 文章评论
const comments = ref<Comment[]>([]);
const commentForm = ref({ nickname: "", email: "", content: "" });
const commentSubmitting = ref(false);

async function loadComments() {
  if (!post.value) return;
  try {
    const res = await fetchComments(post.value.id);
    comments.value = res.data;
  } catch {}
}

async function submitComment() {
  if (!post.value) return;
  const n = commentForm.value.nickname.trim();
  const c = commentForm.value.content.trim();
  if (!n || !c) return;
  commentSubmitting.value = true;
  try {
    await createComment({ nickname: n, email: commentForm.value.email.trim(), content: c, postId: post.value.id });
    commentForm.value.content = "";
    await loadComments();
  } catch { alert("评论失败"); }
  finally { commentSubmitting.value = false; }
}

function fmtTime(d: string) {
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

useSEO(() => post.value);
</script>

<template>
  <div class="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8">
    <!-- 骨架屏 -->
    <SkeletonPost v-if="loading" />

    <div v-else-if="post">
      <!-- 封面图 -->
      <div v-if="post.coverImage" class="overflow-hidden rounded-2xl mb-6 md:mb-8 shadow-lg">
        <img
          :src="post.coverImage"
          :alt="post.title"
          class="w-full h-48 sm:h-56 md:h-72 object-cover"
        />
      </div>

      <!-- 标题 -->
      <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
        {{ post.title }}
      </h1>

      <!-- 元信息 -->
      <div class="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400 mb-6 md:mb-8 flex-wrap">
        <time class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ post.createdAt?.slice(0, 10) }}
        </time>
        <div class="flex gap-2">
          <TagBadge v-for="tag in post.tags" :key="tag.id" :tag="tag" />
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
        <div class="prose max-w-none" v-html="md.render(post.content)"></div>
      </div>

      <!-- 评论区 -->
      <div class="mt-10">
        <div class="h-1 bg-gradient-primary rounded-full mb-8"></div>
        <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-6">💬 评论</h2>

        <!-- Giscus -->
        <div v-if="showGiscus" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
          <GiscusComment v-bind="giscusConfig" />
        </div>

        <!-- 本地评论表单 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
          <p class="text-sm font-semibold text-gray-700 mb-3">发表评论</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <input v-model="commentForm.nickname" type="text" placeholder="昵称 *" maxlength="50"
              class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            <input v-model="commentForm.email" type="email" placeholder="邮箱（选填）" maxlength="200"
              class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <textarea v-model="commentForm.content" placeholder="写下你的想法..." maxlength="2000" rows="2"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none mb-2"></textarea>
          <button :disabled="commentSubmitting"
            class="px-4 py-2 bg-gradient-primary text-white text-sm font-medium rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
            @click="submitComment">
            {{ commentSubmitting ? '提交中...' : '发表评论' }}
          </button>
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="space-y-3">
          <div v-for="c in comments" :key="c.id"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {{ c.nickname.charAt(0).toUpperCase() }}
              </div>
              <span class="text-sm font-semibold text-gray-800">{{ c.nickname }}</span>
              <span class="text-xs text-gray-300 ml-auto">{{ fmtTime(c.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed">{{ c.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400">文章不存在</div>
  </div>
</template>
