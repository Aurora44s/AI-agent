<script setup lang="ts">
import { onMounted, watch, ref } from "vue";

const props = defineProps<{
  repo: string;        // e.g. "username/repo"
  repoId: string;      // e.g. "R_kgxxxxx"
  category: string;    // e.g. "General"
  categoryId: string;  // e.g. "DIC_kwxxxxx"
  term: string;        // post slug
}>();

const container = ref<HTMLElement | null>(null);
const loaded = ref(false);

function loadGiscus() {
  if (loaded.value) {
    // 如果已加载，用 iframe 通信切换讨论
    const iframe = document.querySelector<HTMLIFrameElement>(".giscus-frame");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: { term: props.term },
          },
        },
        "https://giscus.app"
      );
    }
    return;
  }

  loaded.value = true;
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", props.repo);
  script.setAttribute("data-repo-id", props.repoId);
  script.setAttribute("data-category", props.category);
  script.setAttribute("data-category-id", props.categoryId);
  script.setAttribute("data-mapping", "specific");
  script.setAttribute("data-term", props.term);
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", "light");
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("crossorigin", "anonymous");
  script.async = true;

  if (container.value) {
    container.value.innerHTML = "";
    container.value.appendChild(script);
  }
}

onMounted(loadGiscus);
watch(() => props.term, loadGiscus);
</script>

<template>
  <div ref="container" class="giscus-container mt-8"></div>
</template>
