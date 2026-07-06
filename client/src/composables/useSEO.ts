import { watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { fetchSettings, type Post } from "@/api";

export function useSEO(post?: () => Post | null) {
  const route = useRoute();
  let siteName = "个人博客";

  onMounted(async () => {
    try {
      const res = await fetchSettings();
      siteName = res.data.site_name || "个人博客";
      updateTitle();
    } catch {}
  });

  function updateTitle() {
    const p = post?.();
    if (p) {
      document.title = `${p.title} - ${siteName}`;
    } else {
      const map: Record<string, string> = {
        home: `首页 - ${siteName}`,
        tag: `标签: ${route.params.slug} - ${siteName}`,
        search: `搜索 - ${siteName}`,
        about: `关于 - ${siteName}`,
      };
      document.title = map[route.name as string] || siteName;
    }
  }

  if (post) {
    watch(post, updateTitle, { immediate: false });
  }
  watch(() => route.fullPath, updateTitle);
}
