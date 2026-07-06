<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { fetchPost, fetchSettings, type Post } from "@/api";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import TagBadge from "@/components/blog/TagBadge.vue";
import GiscusComment from "@/components/blog/GiscusComment.vue";
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

// Giscus 配置（需要在 GitHub 设置 Giscus 后替换）
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
  } catch {
    console.error("加载文章失败");
  } finally {
    loading.value = false;
  }
});

useSEO(computed(() => post.value));
</script>

<template>
  <div class="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8">
    <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>

    <div v-else-if="post">
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl mb-4 md:mb-6"
      />

      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">{{ post.title }}</h1>

      <div class="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400 mb-6 md:mb-8 flex-wrap">
        <time>{{ post.createdAt?.slice(0, 10) }}</time>
        <div class="flex gap-2">
          <TagBadge v-for="tag in post.tags" :key="tag.id" :tag="tag" />
        </div>
      </div>

      <div class="prose max-w-none" v-html="md.render(post.content)"></div>

      <!-- Giscus 评论区 -->
      <div class="mt-12 border-t pt-8">
        <GiscusComment
          v-if="showGiscus"
          v-bind="giscusConfig"
        />
        <div v-else class="text-center text-gray-400 text-sm py-8">
          评论功能暂未开启，请在后台设置中配置 Giscus 参数。
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400">文章不存在</div>
  </div>
</template>
