import { ViteSSG } from "vite-ssg";
import App from "@/App.vue";
import { routes } from "@/router/index.js";
import { createPinia } from "pinia";
import "prismjs/themes/prism-tomorrow.css"; // 经典的暗色极客代码主题

import "@/assets/reset.css";
import "@/assets/index.css";
import { useAdminStore } from "@/store/admin.js";

export const createApp = ViteSSG(App, { routes }, ({ app, router }) => {
  // 每次 SSG 渲染或客户端水合（Hydration）时，生成独立的 Pinia 实例，避免跨请求状态污染
  app.use(createPinia());
  // 👇 新增魔法：将 Vite 编译期的常量，强行注入到 Vue 模板的全局渲染上下文中
  // 这样所有的 <template> 都能直接认识并使用 __CDN__ 了！
  app.config.globalProperties.__CDN__ = __CDN__;

  // admin 路由鉴权守卫：未登录访问 /admin/* → 跳登录页
  router.beforeEach(async (to) => {
    if (!to.path.startsWith("/admin")) return true;
    const admin = useAdminStore();
    if (to.path === "/admin/login") {
      return admin.isAuthed ? "/admin/posts" : true;
    }
    if (!admin.isAuthed) {
      await admin.fetchMe();
    }
    return admin.isAuthed ? true : "/admin/login";
  });
});
