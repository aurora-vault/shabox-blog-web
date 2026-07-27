import { ViteSSG } from "vite-ssg";
import App from "@/App.vue";
import { routes } from "@/router/index.js";
import { createPinia } from "pinia";
import "prismjs/themes/prism-tomorrow.css"; // 经典的暗色极客代码主题

import "@/assets/reset.css";
import "@/assets/index.css";
import { useUserStore } from "@/store/user.js";
import { useBlogStore } from "@/store/blog.js"; // ← 新增 import

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, initialState }) => {
    // ← 取 initialState
    const pinia = createPinia();
    app.use(pinia);

    // SSG 写入 / 客户端恢复 Pinia 状态(让预取的数据序列化进 HTML)
    if (import.meta.env.SSR) {
      initialState.pinia = pinia.state.value;
    } else if (initialState.pinia) {
      pinia.state.value = initialState.pinia;
    }

    app.config.globalProperties.__CDN__ = __CDN__;

    router.beforeEach(async (to) => {
      const blog = useBlogStore(pinia);

      // 列表页(首页 / 相册)依赖 posts + tags —— SSG 预渲染时也预取
      if (to.name === "Home" || to.name === "Album") {
        await Promise.all([blog.ensurePosts(), blog.ensureTags()]).catch(
          () => {},
        );
      }

      // 文章详情 —— SSG 预渲染每篇 /post/<slug> 时预取(store 守卫防重复)
      if (to.name === "PostDetail") {
        const slug = to.params.id;
        if (slug && !blog.postDetails[slug]) {
          await blog.ensurePostDetail(slug).catch(() => {});
        }
      }

      // ↓↓↓ 原有鉴权,原样保留 ↓↓↓
      if (to.path === "/account/profile") {
        const userStore = useUserStore();
        if (!userStore.isAuthed) await userStore.fetchMe();
        return userStore.isAuthed
          ? true
          : "/account/login?redirect=/account/profile";
      }
    });
  },
);
