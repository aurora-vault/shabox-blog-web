# 方案 08 — PostCard 导航规范化(@click → router-link)

> 范围:仅 `src/components/widgets/PostCard.vue`。把卡片跳转从 `<div @click="router.push()">` 改成 `<router-link>`(渲染 `<a href>`)。
> 动机:SEO 内链(爬虫顺着卡片爬到文章 URL)+ 可访问性(键盘 Tab / 屏幕阅读器认链接)+ 体验(Ctrl/中键新标签、复制链接、右键菜单)。也消除之前误判的根源(没 href 可抓)。
> 影响:PostCard 所有使用处(Home 等)自动获益——组件改一处,全站卡片都变 `<a>`。

## 改动(3 处,都在 PostCard.vue)

### 1. template 外层:`<div @click>` → `<router-link :to>`

改前(行 1-2 + 闭合):
```vue
<template>
  <div class="card" @click="router.push(`/post/${post.id}`)">
    <img v-if="post.img" :src="imgUrl(post.img, IMAGE_SIZE.COVER)" alt="card-img" />
    <div v-else class="card-placeholder"></div>
    ... 中间内容不变 ...
  </div>
</template>
```

改后:
```vue
<template>
  <router-link class="card" :to="`/post/${post.id}`">
    <img v-if="post.img" :src="imgUrl(post.img, IMAGE_SIZE.COVER)" alt="card-img" />
    <div v-else class="card-placeholder"></div>
    ... 中间内容不变 ...
  </router-link>
</template>
```

> 只动两处:开头 `<div class="card" @click="router.push(...)">` → `<router-link class="card" :to="`/post/${post.id}`">`;结尾 `</div>` → `</router-link>`。中间(img / cardLeft / cardRight)原样。
> **标签的 `@click.stop="$emit('tagClick', t)"` 保留**——它在 `<a>` 内,`.stop` 阻止冒泡,点标签时只发标签事件、不触发卡片跳转(和现在行为一致)。
> `<router-link>` 全局注册(`app.use(router)` 自动),不用 import。

### 2. script:删掉不再需要的 `useRouter`

改前(行 32-43):
```js
import { useRouter } from "vue-router";
import { imgUrl, IMAGE_SIZE } from "@/lib/image.js";

defineProps({
  post: { type: Object, required: true },
  selectedTags: { type: Array, default: () => [] },
});
defineEmits(["tagClick"]);

const router = useRouter();
```

改后:
```js
import { imgUrl, IMAGE_SIZE } from "@/lib/image.js";

defineProps({
  post: { type: Object, required: true },
  selectedTags: { type: Array, default: () => [] },
});
defineEmits(["tagClick"]);
```

> 删两行:`import { useRouter }` 和 `const router = useRouter()`。导航交给 `<router-link>`,组件不再需要 router 实例。

### 3. 样式 `.card`:适配 `<a>`(router-link 渲染的是 a)

改前(行 47-55):
```css
.card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 120px;
}
```

改后(顶部加 3 行):
```css
.card {
  display: block;          /* router-link 渲染 <a>,默认 inline → 改 block 撑满 */
  text-decoration: none;   /* 去掉 <a> 默认下划线 */
  color: inherit;          /* 不用 <a> 默认蓝色,继承正文色 */
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 120px;
}
```

> 只加 3 行(display / text-decoration / color),其余不动。这 3 行保证 `<a>` 视觉和原来 `<div>` 一致(撑满、无下划线、不变蓝)。

---

## 落地后我会审的点

- **渲染为 `<a>`**:首页 HTML 里 PostCard 根元素是 `<a href="/post/xxx" class="card">`(不再是 `<div>`)。`curl https://shabox.fun/ | grep 'href="/post/'` 能抓到卡片链接(这是这次误判没抓到的东西,改完就有了)。
- **跳转正常**:点卡片进文章页;点标签只筛选、不跳转(`@click.stop` 生效)。
- **新标签**:Ctrl/中键点卡片 → 新标签打开文章(`<a>` 原生能力)。
- **键盘**:Tab 能聚焦卡片,Enter 能进。
- **视觉零变化**:卡片布局/大小/悬浮效果和现在一致(display:block + 去下划线 + 色继承保证)。

## 不做

- 只改 PostCard 一个组件。内部结构(img / cardLeft / cardRight / tags)不动。
- `:to` 用路径字符串(`` `/post/${post.id}` ``),和原 `router.push` 一致,最小改动。想更规范可改命名路由 `:to="{ name: 'PostDetail', params: { id: post.id } }"`,但非必要。
