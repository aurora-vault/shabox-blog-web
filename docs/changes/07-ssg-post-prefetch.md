# 方案 07 — SSG 文章预取(修复 /post/* 预渲染空壳)

> 范围:仅 `shabox-blog-web`(`main.js` 为主)。修一个 SEO 灾难:每篇被预渲染的文章页,HTML 都是「找不到帖子」空壳。
> 长远定位:文章已转后端 API(为 admin 发布铺路)。本方案让 SSG 在 build 时正确预取后端文章,既修 SEO,又为动态内容 + 未来发布系统奠基。

## 问题诊断(链路实锤)

| 环节 | 事实 | 来源 |
|---|---|---|
| /post/* 预渲染? | **是**(读 src/posts/*.md 生成 `/post/<slug>`) | vite.config 行 99-126 |
| SSG 时取数? | **否**——`onMounted(loadPost)` 是客户端钩子,node 端不跑 | PostDetail 行 71 |
| 有预取 guard? | **否**——router.beforeEach 只做鉴权 | main.js 行 20-38 |
| 连锁 | `currentPost=null` → 渲染 `v-else`「找不到帖子」+ useHead 也不注入(title 仍是默认「沙盒屋」)| PostDetail 行 30-32 / 101-123 |

**结果**:搜索引擎/分享预览抓到的每篇文章 HTML = 「找不到帖子」空壳,无 h1/正文/正确 title。

## 长远标准态方案:guard 预取 + Pinia initialState 序列化

思路:在 **router guard** 里预取(SSG node 端 + 客户端首次进入都跑),数据进 Pinia;用 vite-ssg 的 `initialState` 把 Pinia state 序列化进 HTML,客户端 hydrate 时直接恢复、不重复请求。

一石三鸟——预取后:
1. PostDetail 渲染时 `currentPost` 有值 → **正文 + 真 h1(文章标题)** 进预渲染 HTML。
2. `useHead` 的 watchEffect 在 SSG setup 时触发 → **title/description/canonical 也注入**(原本因 currentPost null 失效)。
3. 客户端 hydrate 时 store 已从 initialState 恢复 → `ensurePostDetail` 的 `if (postDetails[slug]) return` 守卫跳过 → **不重复请求**。

---

## Step 1 — 改 `src/main.js`(核心,唯一必改)

改前(行 12-39 摘要):
```js
export const createApp = ViteSSG(App, { routes }, ({ app, router }) => {
  app.use(createPinia());
  app.config.globalProperties.__CDN__ = __CDN__;

  router.beforeEach(async (to) => {
    if (to.path === "/account/profile") { /* ... */ }
    if (!to.path.startsWith("/admin")) return true;
    /* ... admin 鉴权 ... */
  });
});
```

改后:
```js
import { useBlogStore } from "@/store/blog.js";   // ← 新增 import

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, initialState }) => {            // ← 取 initialState
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
        await Promise.all([blog.ensurePosts(), blog.ensureTags()]).catch(() => {});
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
        return userStore.isAuthed ? true : "/account/login?redirect=/account/profile";
      }
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
  },
);
```

要点:
- `({ app, router, initialState })` —— `initialState` 是 vite-ssg 提供的序列化通道。
- `import.meta.env.SSR` 为 true 时是 SSG node 端,写入 pinia 快照;客户端反之恢复。
- guard 里 `useBlogStore(pinia)` 显式传 pinia 实例(guard 不在 setup 内,需主动传)。
- `.catch(() => {})` —— 预取失败不阻塞渲染(走 PostDetail 的 loading/404 兜底,总比 build 崩了好)。

## Step 2 — PostDetail.vue 基本不用改

`onMounted(loadPost)` **保留**——作客户端兜底(直接深链进入、或 initialState 丢失时仍能取数)。因为 `ensurePostDetail` 有 `if (postDetails[slug]) return` 守卫,SSG 已预取的 hydrate 后不会重复请求。

唯一要确认:`isLoading` / 404 兜底逻辑不变(SSG 预取成功时 currentPost 有值、走主分支;预取失败时走兜底)。**无需改动**。

---

## 环境前提(部署相关,必须满足)

SSG build 时 node 端要能调通后端 API。当前:
```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/v1";  // http.js 行 3-4
```

- **生产 build**(aurora runner):`VITE_API_BASE_URL` 必须指向 **build 环境能访问到的后端地址**——公网 `https://api.shabox.fun/v1`,或同网内网地址。用默认 `localhost:3001` 只在后端同机 build 时才通。
- 确认部署的 build 步骤里 `VITE_API_BASE_URL` 已正确设置(若没设,SSG build 会连 localhost 失败 → 预取全 catch → 仍是空壳)。

> 这是 SSG 固有的「build 时取数」特性:build 环境得能访问数据源。

---

## 长远演进(本期不做,标方向)

文章转后端 + admin 发布后,内容是动态的。SSG 意味着**每次文章变动要重新 build + 部署**(发布 → trigger 前端 rebuild)。这是 SSG + 动态内容的标准工作流:

- **近期(本方案)**:guard 预取让现有 SSG 正确工作。发布文章后手动/自动 rebuild。
- **中期**:admin 发布系统接 webhook → 触发前端 CI rebuild + 部署。
- **远期(若 rebuild 频率成负担)**:演进到 **SSR**(运行时渲染,无需 rebuild)或 **ISR**(增量再生成)。这是架构升级,不在本期。

## 顺带清理(可选,非阻塞)

`src/api/posts.js` 行 1 `import { http } from "./http.js"` 用的是 **admin token 实例**(`refreshPath: /auth/refresh`)。但文章 `/blog/posts` 是**公开内容**,不需要 admin token。

- 现状能工作(公开接口忽略 token;SSG node 端无 token 也能取),但语义不对(公开内容不该绑 admin 鉴权流)。
- 长远建议:给公开内容建一个**无认证 http 实例**(不带 token/refresh),posts.js 用它。和 admin/account 三套实例彻底分清。

---

## 落地后我会审的点

- **main.js**:`initialState` 进了回调签名;SSG 写 / 客户端恢复 pinia 的分支在;guard 里 Home/Album 预取 posts+tags、PostDetail 预取详情;原鉴权逻辑未动。
- **预渲染产物**:`dist/post/<slug>/index.html` 里能搜到**文章标题**(真 h1)+ 正文片段 + `<title>文章标题 - 沙盒屋</title>` + canonical link(不再是「找不到帖子」)。
- **不重复请求**:客户端首次进入某文章(已预渲染)时,Network 里**没有** `/blog/posts/<slug>` 请求(initialState 已恢复);从首页点进新文章时才发请求。
- **build 不崩**:某篇文章后端 404/超时时,build 仍完成(走 catch),该页预渲染为兜底文案而非中断。
- **首页/相册**:`dist/index.html` 含文章列表 + 标签(不再是空列表)。
- **环境**:`VITE_API_BASE_URL` 在生产 build 时可达后端(否则预取全空)。

## 不做

- 不转 SSR/ISR(架构升级,远期)。
- 不动 PostDetail 组件逻辑(预取靠 guard + 序列化,组件零改)。
- posts.js 公开实例清理是可选项,不阻塞本方案。
