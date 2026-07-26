# 方案 02 — 读者面板「我的空间」(轻量双态)

> 范围:`shabox-blog-web`(新建组件 + 接入右栏)+ `shabox-blog-api`(一行后端,暴露注册时间)。
> 目标:首页右栏加一张**读者面板**(不是名片),双态——未登录=引导卡,已登录=轻量身份(头像 monogram / 昵称 / 邮箱 / 加入于)+「敬请期待」占位。
> 设计原则(why):左上站主名片是「卖身份」(谁的站),本面板是「卖关系」(你在这里的痕迹),**数据-led 非肖像-led**,所以不与名片冲突。轻量版先立形态,行为数据(点赞/收藏/通知)后续后端铺好再填。

---

## A. 后端 — `formatUser` 补 `createdAt`

> 仓库:**`shabox-blog-api`**(注意是另一个仓)。
> 文件:`src/routes/account.js`,函数 `formatUser`(约 24–31 行)。
> 为什么:`/me` 现在只返回 `{ id, email, displayName, emailVerified }`,没有注册时间。`requireUser` 取的是完整 User 记录(含 `createdAt`),所以只需在这里透传一行,`/me`、`/login`、`/register` 自动都带上。

### 改前

```js
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName || null,
    emailVerified: user.emailVerified,
  };
}
```

### 改后

```js
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName || null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}
```

> `createdAt` 经 JSON 序列化为 ISO 字符串,前端格式化。

---

## B. 前端 — 新建组件 `UserPanel.vue`

> 仓库:`shabox-blog-web`。
> 文件:**新建** `src/components/widgets/UserPanel.vue`(整文件如下,直接抄)。
> 依赖:复用全局 `Nav.vue` 已 boot 的登录态(`App.vue` 挂的 Nav 在 `onMounted` 调 `fetchMe`),本组件**只读 store**,不重复 fetch。

```vue
<!-- # 我的空间小组件(读者面板·轻量双态) -->
<template>
  <div class="user-panel">
    <div class="card-title">我的空间</div>

    <!-- ▼ 未登录:引导卡 -->
    <div v-if="!userStore.isAuthed" class="panel-body guest">
      <p class="guest-hint">登录后可同步你的点赞、收藏与足迹</p>
      <router-link :to="{ path: '/account/login' }" class="guest-cta">
        登录 / 注册
      </router-link>
    </div>

    <!-- ▼ 已登录:轻量身份面板 -->
    <div v-else class="panel-body authed">
      <div class="head-row">
        <div class="avatar">{{ initial }}</div>
        <div class="greet">
          <span class="hello">你好,</span>
          <strong class="name">{{ displayName }}</strong>
        </div>
      </div>

      <div class="meta">
        <div class="meta-item">
          <span>邮箱</span>
          <b class="meta-val">{{ userStore.user.email }}</b>
        </div>
        <div class="meta-item">
          <span>加入于</span>
          <b class="meta-val">{{ joinDate }}</b>
        </div>
      </div>

      <div class="soon">点赞 · 收藏 · 通知 · 敬请期待</div>

      <router-link :to="{ path: '/account/profile' }" class="to-profile">
        账户详情 →
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/store/user.js";

// 只读全局 Nav 已 boot 的登录态,不重复 fetch
const userStore = useUserStore();

const displayName = computed(() => {
  const u = userStore.user;
  return u?.displayName || (u?.email ? u.email.split("@")[0] : "访客");
});

// 首字母 monogram 头像(无需后端真头像,也强化「这不是肖像名片」)
const initial = computed(() => {
  const n = displayName.value;
  return n ? n.charAt(0).toUpperCase() : "?";
});

// createdAt 由后端 formatUser 提供(ISO 字符串),格式化为 YYYY-MM-DD
const joinDate = computed(() => {
  const c = userStore.user?.createdAt;
  if (!c) return "—";
  const d = new Date(c);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
});
</script>

<style scoped>
.user-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题:与 PinnedCard / TimeProbe / QuoteCard 的 .card-title 完全一致 */
.card-title {
  font-size: 16px;
  font-weight: bold;
  padding: 15px 20px 10px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

.panel-body {
  padding: 18px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ▼ 未登录态 */
.guest {
  align-items: center;
  justify-content: center;
  text-align: center;
}
.guest-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
}
.guest-cta {
  display: inline-block;
  padding: 8px 22px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  border-radius: 10px;
  background: linear-gradient(145deg, #80c934, #6ca92c);
  box-shadow: 4px 4px 14px #66a02a, -4px -4px 14px #8ad838;
  transition: all 0.2s ease-out;
}
.guest-cta:hover {
  border-radius: 20px;
  background: linear-gradient(145deg, #6ca92c, #80c934);
}

/* ▼ 已登录态 */
.head-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #a8e063, #56ab2f);
  box-shadow: 0 0 5px #5c7b1e, 0 0 3px #d8ff46;
}
.greet {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  overflow: hidden;
}
.hello {
  font-size: 12px;
  color: var(--text-muted);
}
.name {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.meta-item span {
  color: var(--text-muted);
  flex-shrink: 0;
}
.meta-val {
  color: var(--text-main);
  font-weight: normal;
  font-family: "Consolas", monospace;
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere; /* 长邮箱兜底换行,不撑破卡片 */
}

.soon {
  margin-top: auto;
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  border-radius: 8px;
  background: var(--article-bg);
}

.to-profile {
  text-align: center;
  font-size: 13px;
  font-weight: bold;
  color: #56ab2f;
  transition: all 0.2s ease-out;
}
.to-profile:hover {
  transform: translateX(3px);
}
</style>
```

> 标题默认「我的空间」(前瞻:行为数据上线后它自然变成足迹面板,不用改名)。你随意换,只要别叫「我的名片」。
> SSG:构建期 `user=null` 预渲染成未登录态;hydration 后 `fetchMe` 解析,响应式切到已登录态——无 mismatch,无 Element Plus,不踩预渲染坑。

---

## C. 前端 — 接入右栏 `SidebarRight.vue`

> 文件:`src/components/layout/SidebarRight.vue`。
> 放**右栏顶部**(让「我的空间」最先可见;左栏=站主身份/站点 meta,右栏=你的空间 + 内容精选,职责分明)。你后续可调顺序。

### 改前

```vue
<template>
  <div>
    <QuoteCard class="side-card" />
    <PinnedCard class="side-card" />
  </div>
</template>

<script setup>
   import QuoteCard from '@/components/widgets/QuoteCard.vue'
   import PinnedCard from '@/components/widgets/PinnedCard.vue'
</script>
```

### 改后

```vue
<template>
  <div>
    <UserPanel class="side-card" />
    <QuoteCard class="side-card" />
    <PinnedCard class="side-card" />
  </div>
</template>

<script setup>
   import UserPanel from '@/components/widgets/UserPanel.vue'
   import QuoteCard from '@/components/widgets/QuoteCard.vue'
   import PinnedCard from '@/components/widgets/PinnedCard.vue'
</script>
```

> `class="side-card"` 必加——全局 `.side-card`(定义在 `src/assets/index.css:108`)提供卡片外壳(底色/阴影/圆角/过渡),靠 Vue 属性穿透落到组件根元素。

---

## 落地后我会审的点

- 后端 `formatUser` 是否加上 `createdAt`,且 `requireUser` 的 `findUnique` 没加 `select`(否则要补 select)——已确认当前无 select,透传即可。
- 前端 `userStore.user?.createdAt` 是否真拿到(可在浏览器 Network 看 `/v1/account/me` 响应)。
- 未登录态下首页右栏顶部是否显示引导卡;登录后是否切到身份面板。
- 长邮箱是否撑破右栏(已加 `overflow-wrap:anywhere` 兜底)。
- 左名片(肖像)与本面板(monogram + 数据)视觉上是否读作两类物件(应明显不同)。
