import { ref, onMounted, onUnmounted, type Ref } from "vue";

/**
 * 滚动渐入动画 composable
 * 当元素进入视口时触发可见状态
 */
export function useScrollReveal(
  target?: Ref<HTMLElement | null>,
  options?: { threshold?: number; rootMargin?: string }
) {
  const isVisible = ref(false);
  const el = ref<HTMLElement | null>(null);

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const element = target?.value ?? el.value;
    if (!element) return;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          // 可见后停止观察，保持显示
          observer?.unobserve(entry.target);
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? "0px 0px -40px 0px",
      }
    );

    observer.observe(element);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { isVisible, el };
}
