# 方案 06 — PageFrame 公共页框

> 范围:仅 `shabox-blog-web`。抽一个页面级页框组件,收敛各终端页重复的 `inner + MottoHeader`。
> 定位:页面级、**可选**(各页 import 才用)。不与 `index.html`(文档骨架)/ `App.vue`(应用壳)重合——填的是「单页页框」中间层。
> **PageFrame 只管布局(inner + MottoHeader),不管 h1**。h1 是页面独有内容,归各页自己写(放 slot 里)——这样无双 h1 风险、所有页用法统一、PageFrame 单一职责。

## Step 1 — 新建 `src/components/layout/PageFrame.vue`

```vue
<template>
  <div class="inner">
    <MottoHeader :showBack="showBack" :darkText="mottoDark" :lightText="mottoLight" />
    <slot />
  </div>
</template>

<script setup>
import MottoHeader from "@/components/layout/MottoHeader.vue";

defineProps({
  showBack: { type: Boolean, default: true },   // 返回键(首页 false)
  mottoDark: String,                             // 不传 = 默认「🌙 月光如梦」
  mottoLight: String,                            // 不传 = 默认「☀️ 晨光微熹」
});
</script>
```

> 无 `<style>`——`inner` 是全局类,MottoHeader 自带样式,PageFrame 只组合。
> **没有 title / 不渲染 h1**——h1 是页面内容,各页在 slot 里自己写(见下)。

### h1 规则(简单:各页自己写,放 slot)

- **标准页**(Album/About/Home/account/Pomodoro):slot 第一行写 `<h1 class="visually-hidden">文案</h1>`(隐藏,给 SEO)。
- **PostDetail**:slot 里放自己的可见文章标题 h1(本就有,不动)。
- PageFrame 不渲染任何 h1 → **不可能双 h1**(除非某页自己写两个,那是该页的 bug)。

---

## Step 2 — 迁移清单(9 页)

| 页 | `showBack` | `mottoDark/Light` | slot 里的 h1 |
|---|---|---|---|
| Album | true | — | `ShaBox - 像素人的相册与画廊`(隐藏) |
| About | true | `🌙 宁静致远` / `☀️ 不忘初心` | `ShaBox - 像素人的个人博客与代码沙盒`(隐藏) |
| Home | **false** | — | `ShaBox - 像素人的个人博客与代码沙盒`(隐藏) |
| Login | true | — | `登录沙盒屋`(隐藏) |
| Register | true | — | `注册沙盒屋`(隐藏) |
| Forgot | true | — | `找回密码`(隐藏) |
| Reset | true | — | `重置密码`(隐藏) |
| Pomodoro | true | — | `代码实验室`(隐藏) |
| PostDetail | true | `🌙 月光入梦` / `☀️ 日暮浅眠` | 文章标题(**可见**,动态) |

> `—` = 不传 motto,用默认诗。隐藏 h1 = `class="visually-hidden"`。

### 2A. 标准页(Album)—— 改前 / 改后

改前:
```vue
<template>
  <div class="inner">
    <h1 class="visually-hidden">ShaBox - 像素人的相册与画廊</h1>
    <MottoHeader :showBack="true" />

    <div class="album-tabs">
      ...
```

改后:
```vue
<template>
  <PageFrame>
    <h1 class="visually-hidden">ShaBox - 像素人的相册与画廊</h1>
    <div class="album-tabs">
      ...
    </div>
  </PageFrame>
</template>

<script setup>
import PageFrame from "@/components/layout/PageFrame.vue";
// 去掉 MottoHeader import(PageFrame 内部用了)
...
```

> h1 从 MottoHeader 前挪到 slot 第一行(MottoHeader 后)。它是 visually-hidden,不显示,位置不影响视觉/SEO。

### 2B. 自定义诗(About)

```vue
<PageFrame mottoDark="🌙 宁静致远" mottoLight="☀️ 不忘初心">
  <h1 class="visually-hidden">ShaBox - 像素人的个人博客与代码沙盒</h1>
  <div class="about-layout">...</div>
</PageFrame>
```

### 2C. 首页不返回(Home)

```vue
<PageFrame :showBack="false">
  <h1 class="visually-hidden">ShaBox - 像素人的个人博客与代码沙盒</h1>
  <div class="home-layout">...</div>
</PageFrame>
```

> 原 `<MottoHeader />` 没传 showBack(默认 false),`:showBack="false"` 一致。`<!-- 首页用这个 -->` 注释删掉。

### 2D. account 四页(PageFrame 套 AuthPanel)

以 Login 为例:
```vue
<template>
  <PageFrame>
    <h1 class="visually-hidden">登录沙盒屋</h1>
    <AuthPanel title="登录">
      <el-form ...>...</el-form>
      <p v-if="error" class="auth-err">{{ error }}</p>
      <div class="auth-links">...</div>
    </AuthPanel>
  </PageFrame>
</template>

<script setup>
import "./auth-form.css";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageFrame from "@/components/layout/PageFrame.vue";    // ← 换成 PageFrame
import AuthPanel from "@/components/widgets/AuthPanel.vue";
// 去掉 MottoHeader import
...
```

> 四页同理,只换隐藏 h1 文案(登录沙盒屋 / 注册沙盒屋 / 找回密码 / 重置密码)。AuthPanel + auth-form.css 不动。

### 2E. Pomodoro —— 顺手修遗留

改前(有 bug):
```vue
<MottoHeader text="代码实验室" :showBack="true" />
```
> `text` 不是 MottoHeader 的 prop,无效传参,「代码实验室」根本没显示。且 Pomodoro 原本**没有 h1**。

改后:
```vue
<PageFrame>
  <h1 class="visually-hidden">代码实验室</h1>
  <div class="lab-container">...</div>
</PageFrame>
```
> 「代码实验室」进无障碍 h1(补上原本缺失的 h1,SEO 友好),无效 `text` 清除。

---

## Step 3 — PostDetail(可见 h1,本就在 slot 里)

PostDetail 的 h1 是可见的文章标题(动态),直接放 slot——和标准页的隐藏 h1 同样位置,只是可见、且三态互斥:

```vue
<template>
  <PageFrame mottoDark="🌙 月光入梦" mottoLight="☀️ 日暮浅眠">
    <div class="content" v-if="currentPost">
      <h1 class="title">{{ currentPost.title }}</h1>
      ...
    </div>
    <div class="content not-found" v-else-if="isLoading">
      <h1 class="title">文章内容正在加载中...</h1>
    </div>
    <div class="content not-found" v-else>
      <h1 class="title">哎呀,找不到这篇帖子了...</h1>
    </div>
  </PageFrame>
</template>

<script setup>
import PageFrame from "@/components/layout/PageFrame.vue";
// 去掉 MottoHeader import
...
```

> PostDetail 用法和标准页**完全统一**了(都是 PageFrame + slot 放 h1),不再是特例。三态 h1 互斥保留,SEO 同现状。
> 注:PageFrame 只解决结构统一;PostDetail 的 SSG 数据预取(SEO 真正的坑)见 **doc 07**,两件独立。

---

## 落地后我会审的点

- **PageFrame** 在 `components/layout/`,**无 h1 / 无 title prop**(只 inner + MottoHeader + slot),无自带样式。
- **各页 slot 写了 h1**:8 个标准页都有 `<h1 class="visually-hidden">`(文案对得上表);PostDetail 有可见文章标题 h1。**全站每页恰好一个 h1,无遗漏、无双 h1**。
- **9 页迁移**:各自 `inner+h1+MottoHeader` → `<PageFrame>` + slot 放 h1;MottoHeader import 换成 PageFrame import。
- **参数对**:About 自定义诗透传;Home `:showBack="false"`;account 四页 PageFrame 套 AuthPanel;Pomodoro 无效 `text` 清除。
- **PostDetail**:三态 h1 互斥保留;MottoHeader 自定义诗透传;`useHead`/数据加载未动。
- **视觉零变化**:页框渲染和迁移前一致。

## 不做

- 这轮只抽 PageFrame + 迁移 9 页。
- 不碰 MottoHeader 本体。
- PostDetail 的 SSG 预取是 doc 07 的事。
