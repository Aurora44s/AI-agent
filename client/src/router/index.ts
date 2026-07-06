import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/HomePage.vue"),
    },
    {
      path: "/post/:slug",
      name: "post",
      component: () => import("@/pages/PostPage.vue"),
    },
    {
      path: "/tag/:slug",
      name: "tag",
      component: () => import("@/pages/TagPage.vue"),
    },
    {
      path: "/search",
      name: "search",
      component: () => import("@/pages/SearchPage.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/pages/AboutPage.vue"),
    },
    // 管理后台
    {
      path: "/admin/login",
      name: "admin-login",
      component: () => import("@/pages/admin/LoginPage.vue"),
    },
    {
      path: "/admin",
      name: "admin-dashboard",
      component: () => import("@/pages/admin/DashboardPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/posts",
      name: "admin-posts",
      component: () => import("@/pages/admin/PostListPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/posts/new",
      name: "admin-post-new",
      component: () => import("@/pages/admin/PostEditPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/posts/:id/edit",
      name: "admin-post-edit",
      component: () => import("@/pages/admin/PostEditPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/settings",
      name: "admin-settings",
      component: () => import("@/pages/admin/SettingsPage.vue"),
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

// 路由守卫：后台页面需要登录
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem("token");
    if (!token) {
      next({ name: "admin-login" });
      return;
    }
  }
  next();
});

export default router;
