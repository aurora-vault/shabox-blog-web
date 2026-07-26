# 方案 01 — 导航栏剥离「退出」按钮

> 范围:仅 `shabox-blog-web`。属于「账户系统 UI 重设计」第一步。
> 目标:nav 登录后只保留**一个**账户名单按钮,删掉「退出」(退出移到账户详情页,后话)。
> 不动:登录按钮、账户名单按钮的样式(那是后续重设计的事,本方案只做结构剥离)。

## 目标文件

`src/components/layout/Nav.vue`

---

## 改动 A — 模板:折叠 `v-else`,删掉「退出」`<a>`

定位:`<div class="menuBar">` 内的登录/账户区块(约 24–40 行)。

### 改前

```html
      <router-link
        v-if="!userStore.isAuthed"
        :to="{ path: '/account/login' }"
        class="account-link"
        >登录</router-link
      >
      <template v-else>
        <router-link :to="{ path: '/account/profile' }" class="account-link">{{
          displayName
        }}</router-link>
        <a
          href="javascript:void(0)"
          class="account-link"
          @click="onLogout"
          >退出</a
        >
      </template>
```

### 改后

```html
      <router-link
        v-if="!userStore.isAuthed"
        :to="{ path: '/account/login' }"
        class="account-link"
        >登录</router-link
      >
      <router-link
        v-else
        :to="{ path: '/account/profile' }"
        class="account-link"
        >{{ displayName }}</router-link
      >
```

说明:把 `<template v-else>` 里的两条缩成一条 `<router-link v-else>`(账户名单按钮),整段删掉「退出」`<a>`。逻辑等价于「未登录显登录;登录后只显账户名」。

---

## 改动 B — 脚本:删掉变成死代码的 `onLogout`

定位:`<script setup>` 内(约 71–74 行)。

### 改前

```js
const onLogout = async () => {
  await userStore.logout();
  isOpen.value = false;
};
```

### 改后

整段删除。

说明:退出按钮没了,这个函数不再被引用。`userStore.logout` 本身保留(store 里还挂着,`Profile.vue` 自己的退出在用)。`displayName` / `userStore` / `fetchMe` / 路由 `watch` 全部不动。

---

## 落地后我会审的点

- 模板里是否还残留 `onLogout` 引用(应无)。
- `<template v-else>` 是否干净折叠成单条 `v-else`(别留下空 `<template>`)。
- 移动端汉堡菜单展开后,登录态下是否只剩一个账户名项(不再有退出)。
