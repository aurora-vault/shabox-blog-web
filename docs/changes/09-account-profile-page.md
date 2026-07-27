# 方案 09 — 登录后用户信息页(Profile 重写)

> 范围:`src/views/account/Profile.vue`(重写)+ 后端 `shabox-blog-api/src/routes/account.js`(加一个端点)+ 前端 `api/account.js`/`store/user.js`(各加一个方法)。
> 动机:**Login/Register/Forgot/Reset 已全部迁到 `PageFrame + AuthPanel` 框架,唯独 Profile 还是 AI 原始的居中 `el-card`**——和四件套割裂、和站点风格(Album/About)完全不同。本方案把 Profile 补齐到同款框架,让它真正像一个「登录后的个人领地」,而不是一个 Element Plus 默认弹窗。
> 性质:登录后的**用户信息页**——身份展示 + 昵称编辑 + 账户操作(退出)。

---

## 一、现状诊断(为什么现在的 Profile 不对)

当前 `Profile.vue` 的问题(逐条对风格):

| 问题 | 现状 | 应该是 |
|---|---|---|
| 无页框 | 裸 `<div class="auth-page">` + `min-height:100vh` 自己撑满 | `<PageFrame>` 包裹(和 Login 同款) |
| 无诗句头 | 无 `MottoHeader` | PageFrame 自带,可传专属诗句 |
| 无 h1 | 只有可见 `<h2>我的账户</h2>` | `visually-hidden` 的 `<h1>`(读屏/SEO) |
| 样式 | Element Plus 默认 `el-card`(灰底 #f5f7fa、不换肤) | `.side-card` 换肤变量(`--bg-card`/`--text-main`/`--card-shadow`),和 About 一致 |
| 内容 | 只读邮箱/昵称 + 退出 | 身份卡 + **可改昵称** + 退出(个人页要有「信息」的编辑力,否则是死名片) |
| 空状态 | 无 | 未登录该跳登录页(现在没守卫,直接进会报错) |

> 一句话:它是 AI 写的「能用就行」,不是站点风格的「个人页」。重写,不是改样式。

---

## 二、页面骨架(PageFrame + 两列 grid,对齐 About)

```vue
<template>
  <PageFrame mottoDark="🌙 此心安处" mottoLight="☀️ 归去来兮">
    <h1 class="visually-hidden">我的账户 - 沙盒屋</h1>

    <div v-if="userStore.user" class="profile-layout">
      <!-- 左:身份卡(展示) -->
      <section class="side-card profile-identity"> … </section>

      <!-- 右:操作区(昵称编辑 + 退出) -->
      <section class="profile-actions">
        <div class="side-card profile-edit"> … 昵称表单 … </div>
        <div class="side-card profile-security"> … 退出登录 … </div>
      </section>
    </div>

    <!-- 未登录/加载中:留空或 skeleton,见 §五守卫 -->
  </PageFrame>
</template>
```

**布局(对齐 About 的「移动端单列 / PC 端 grid」模式):**

```css
/* 移动端:单列瀑布,信息聚焦 */
.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* PC 端:左身份卡 sticky / 右操作区,贴近 About 的拼图感但更轻 */
@media (min-width: 992px) {
  .profile-layout {
    display: grid;
    grid-template-columns: 32% 1fr;
    gap: 20px;
    align-items: start;
  }
  .profile-identity {
    position: sticky;
    top: 110px; /* 和 Home 侧栏吸顶一致 */
  }
}
```

> `.side-card` 复用 `assets/index.css` 已有的全局换肤基础类(和 About/Home 侧栏同一套)。诗句、配色、栏宽你拍板——以上是建议值,不是定稿。
> 内容比 About 少,故**不抄 About 的 3×3 阵法**,用简化两列,避免空旷。

---

## 三、内容区块

### 区块 A · 身份卡(只读展示)

```vue
<section class="side-card profile-identity">
  <div class="identity-name">
    {{ userStore.user.displayName || "未署名的旅人" }}
  </div>
  <div class="identity-email">{{ userStore.user.email }}</div>

  <ul class="identity-meta">
    <li>
      <span class="meta-label">邮箱</span>
      <b :class="userStore.user.emailVerified ? 'ok' : 'warn'">
        {{ userStore.user.emailVerified ? "已验证" : "未验证" }}
      </b>
    </li>
    <li>
      <span class="meta-label">加入</span>
      <b>{{ formatDate(userStore.user.createdAt) }}</b>
    </li>
    <li v-if="userStore.user.lastLoginAt">
      <span class="meta-label">上次登录</span>
      <b>{{ formatDate(userStore.user.lastLoginAt) }}</b>
    </li>
  </ul>
</section>
```

- 展示字段全部来自后端 `GET /me` 已返回的 `formatUser`:`email`/`displayName`/`emailVerified`/`createdAt`(`lastLoginAt` 现在 `formatUser` 没返回,见 §四小改)。
- 昵称为空用诗意空状态(「未署名的旅人」之类,你定文案),不要露骨地写「(未设置)」。
- `formatDate` 是页面内一个本地工具函数(格式化 ISO → 「2026年7月」),纯展示,不引第三方。

### 区块 B · 昵称编辑(可写,核心交互)

```vue
<div class="side-card profile-edit">
  <h2 class="profile-h2">昵称</h2>
  <form @submit.prevent="onSaveName">
    <input
      v-model="nameForm.displayName"
      class="profile-input"
      maxlength="32"
      placeholder="给自己起个名字"
    />
    <el-button :loading="saving" native-type="submit" type="primary">保存</el-button>
  </form>
  <p v-if="nameMsg" class="auth-info">{{ nameMsg }}</p>
  <p v-if="nameErr" class="auth-err">{{ nameErr }}</p>
</div>
```

- 提示/错误**复用** `account/auth-form.css` 的 `.auth-info` / `.auth-err`(Profile 属于 account 领域,领域样式本来就该共享——见 directory-style.md §样式归属)。
- 校验:trim 后 ≤ 32 字符(和后端 register 的 `slice(0,32)` 对齐);空串 = 清空昵称(传 `null`)。
- 保存成功后写回 `userStore.user`,页面即时更新,无需刷新。

### 区块 C · 安全/退出

```vue
<div class="side-card profile-security">
  <h2 class="profile-h2">账户</h2>
  <el-button plain @click="goForgot">修改密码</el-button>
  <el-button type="danger" plain :loading="loggingOut" @click="onLogout">
    退出登录
  </el-button>
</div>
```

- **退出登录**:沿用现有 `userStore.logout()`,成功后 `router.replace("/")`。
- **修改密码**:本期**复用现有忘记密码流程**——跳 `/account/forgot`(邮箱验证码重置)。不在本期新做「旧密码改密」端点(见 §七不做)。这一步零后端改动。

---

## 四、后端改动(仅 1 个端点 + 1 个字段补全)

> 后端仓 `shabox-blog-api`。只动 `src/routes/account.js`,不碰库/迁移。

### 1. 新增 `PATCH /account/me`(改昵称)

加在现有 `router.get("/me", ...)` 后面:

```js
// ----- 更新当前用户(目前仅 displayName)-----
router.patch("/me", requireUser, async (req, res) => {
  const next = req.body.displayName;
  // null/空串 → 清空昵称;字符串 → trim + 截 32;不传该字段 → 不动
  const displayName =
    next === undefined
      ? undefined
      : (String(next).trim().slice(0, 32) || null);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: displayName === undefined ? {} : { displayName },
    select: { /* 同 formatUser 的字段 */ },
  });
  res.json(formatUser(user));
});
```

> `select` 字段要和 `formatUser` 用的一致(id/email/displayName/emailVerified/createdAt)——直接 `select` 再 `formatUser`,或全量 findUnique。你按现有写法走。

### 2. `formatUser` 补 `lastLoginAt`(可选,为了让身份卡显示上次登录)

```js
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName || null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null, // 👈 补这一行
  };
}
```

> 不改库结构(`lastLoginAt` 字段早就在 User 模型里,login 时已写入,只是没往外吐)。

---

## 五、前端联动(api + store + 守卫)

### 1. `src/api/account.js` — 加一个方法

```js
export const accountUpdateMe = (payload) =>
  userHttp("/account/me", { method: "PATCH", body: JSON.stringify(payload || {}) });
```

> `createHttp` 已封装 PATCH;`userHttp` 已带 token 注入,照抄现有 `post` 写法。

### 2. `src/store/user.js` — 加一个 action

```js
async function updateProfile({ displayName }) {
  const u = await accountUpdateMe({ displayName });
  user.value = u;
  return u;
}
// 并在 return { ... } 里暴露 updateProfile
```

### 3. `Profile.vue` 守卫 + 数据

```js
import { useUserStore } from "@/store/user.js";

const userStore = useUserStore();
const router = useRouter();

onMounted(async () => {
  // SSG 不预渲染此页;刷新后 store 可能空 → fetchMe 拉取,401 则回登录
  if (!userStore.user) {
    const u = await userStore.fetchMe();
    if (!u) {
      router.replace("/account/login?redirect=/account/profile");
      return;
    }
  }
});
```

> 这条守卫同样适用于给 Login/Register 等已登录不该进的页加反向守卫——本期只做 Profile,不扩散。

---

## 六、落地清单(文件改动表)

| 文件 | 仓 | 改动 | 手改量 |
|---|---|---|---|
| `src/views/account/Profile.vue` | web | **整页重写**(template+script+style) | 大 |
| `src/api/account.js` | web | 加 `accountUpdateMe` | 2 行 |
| `src/store/user.js` | web | 加 `updateProfile` action + 暴露 | ~6 行 |
| `src/routes/account.js` | api | 加 `PATCH /me` + `formatUser` 补 lastLoginAt | ~15 行 |

> 路由 `/account/profile` 已存在(router/index.js),不用动。入口在 `Nav`(登录态显示),也不用动。

---

## 七、不做(范围控制,避免爆炸)

1. **「旧密码改密」端点**:不做。本期改密码走 `/account/forgot`(邮箱验证码)。已登录态用旧密码改密需新端点 + 新表单,留后续。
2. **头像 / 简介 / 个人简介**:User 模型没有这些字段,加字段 = 改库 + 迁移 + 上传链路,远超「页面重写」范围。本期不碰。(若以后要做,ProfileCard 那种博主名片卡可作为视觉参考,但登录用户卡是不同语义,不复用。)
3. **我的文章 / 收藏 / 评论**:访客账户是读者身份,博客侧没有这些数据。留空状态或后续。
4. **整页 TS 化 / index.css 拆分**:和你确认过的「以后慢慢做」,不在本期。

---

## 八、我会审的点(你改完发我读)

- **框架对齐**:Profile 用 `<PageFrame>` 包裹 + `visually-hidden` h1 + `.side-card` 换肤(肉眼看不出是 el 默认皮)。
- **守卫生效**:未登录访问 `/account/profile` → 跳 `/account/login?redirect=/account/profile`;登录后回来不丢。
- **改昵称闭环**:改昵称 → 保存 → 身份卡即时更新 + 刷新仍在(`PATCH /me` 落库 + store 同步)。
- **边界**:空昵称 → 清空(显示诗意空状态);超 32 字符 → 后端截断不报错;非法 token → 401。
- **退出**:退出后回首页,token 清掉,再进 Profile 被守卫拦回登录。
- **视觉**:和 Login/About 同一套换肤变量、同一套卡片质感,昼夜切换正常。

---

## 附:给文案/配色的拍板点(我不擅自定)

- 诗句头 `mottoDark/mottoLight`:给了「此心安处 / 归去来兮」作占位,你可换任何更贴你风格的句子。
- 昵称空状态文案:「未署名的旅人」是建议,你可改成更你的表达(或干脆「未设置」)。
- 栏宽(32% / sticky top 110px)、按钮排布:按 About/Home 既有节奏调,以上是建议值。
