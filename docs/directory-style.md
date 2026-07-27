# shabox-blog-web 目录风格(我的理解,待你校对)

> 这是我从探索代码 + 几轮账户页设计里总结出的站点目录组织规律。
> 写出来给你对照——**哪里和你认知不一致,告诉我,我修正。**

## 一句话原则

**文件放哪,看「谁用它」(作用域),不看「它叫什么」(种类)。**
一个叫 Layout 的东西不一定要进 layout/ 目录;一个叫 Panel 的东西也不一定是 chrome。归属由作用域决定。

---

## 顶层目录

| 目录 | 职责 | 现有成员 |
|---|---|---|
| `views/` | 页面(路由组件,对应 URL) | 终端页 + 领域子目录 |
| `components/` | 可复用件(**非路由**) | layout / widgets / common 三档 |
| `assets/` | 全局静态资源 | `index.css`(换肤变量 + 通用页框) |
| `data/` | 纯前端数据 | `nameBank.js` |
| `store/` | pinia 状态 | `user.js` |
| `router/` | 路由配置 | `index.js` |

---

## views/ —— 按「是否终端页 + 领域」分

- **根目录 = 顶层独立终端页**(各自一个 URL,直接访问,自给自足)
  `Home` / `Album` / `About` / `PostDetail`
- **领域子目录 = 该领域的页面族 + 共享资源**(自洽包,内部统一管理)
  - `account/`:`Login` / `Register` / `Forgot` / `Reset` / `Profile`(终端页)+ `auth-form.css`(领域共享样式)
  - `lab/`:`Pomodoro`

> 终端页与领域子目录的区别:根目录的页是「直接访问的独立终端」;领域子目录是「一族相关页 + 它们共享的资源」收在一起。

---

## components/ —— 复用件按「作用域/性质」分三档

| 档 | 定位 | 现有成员 |
|---|---|---|
| `layout/` | **全站 chrome / 公共页框** | `Nav` / `Footer` / `MottoHeader` / `SidebarLeft` / `SidebarRight` / **`PageFrame`** |

> `layout/` 里有两类用法:① `Nav`/`Footer` 被 `App.vue` 全局装配(全站 chrome);② `PageFrame` 是**终端页主动 import 包裹**的公共页框(`.inner` + `MottoHeader` + `<slot/>`),终端页自己装配、不在 App 里。`SidebarLeft`/`SidebarRight` 则是 Home 专属侧栏。
| `widgets/` | **可复用内容卡片**(独立语义 + 样式封装) | `AlbumSection` / `QrCard` / `QuoteCard` / `TimeProbe` / `PostCard` / `PinnedCard` / `UserPanel` / `AuthPanel` / `MusicPlayer` / `ProfileCard` / `TagCloud` / `UpdateLog` |
| `common/` | **通用基础件**(跨域底层,不绑具体业务) | `GlassCard` / `Lightbox` |

**widgets vs common 的边界(我的理解)**:
- `widgets/` = 具体**内容卡片**(有明确语义:二维码卡、引用卡、时间探针……)
- `common/` = 通用 **UI 基础件**(任何业务都能复用的底层:玻璃容器、灯箱)

---

## 样式归属(四层,作用域递减)

| 层 | 放哪 | 例子 |
|---|---|---|
| 全站通用 | `assets/index.css` | `.inner` / `.visually-hidden` / `.side-card` + 换肤 CSS 变量 |
| 领域共享 | **领域目录下的 css**,各页 `import`,**带前缀防污染** | `account/auth-form.css`(`.auth-err`/`.auth-info`/`.auth-links`/`.auth-hint`) |
| 组件专属 | 组件 `<style scoped>` | `AuthPanel` 的 `.auth-stage`/`.auth-panel`/`.auth-heading` |
| 单页专属 | 该页 `<style scoped>` | `Register` 的 `.code-row`/`.name-row`/`.rolled-name` |

> 关键:**领域专属样式不进 `index.css`**。带前缀 + 放领域目录,既 DRY 又不污染全局。

---

## 终端页写法约定(Album / Home / About / Login 同款)

终端页用 **`PageFrame` 包裹**,不再手写 `div.inner` + `MottoHeader`:

```vue
<template>
  <PageFrame mottoDark="🌙 诗句" mottoLight="☀️ 诗句" :showBack="true">
    <h1 class="visually-hidden">页面名</h1>
    <!-- 内容:引入 widgets 组合,或直接写 -->
  </PageFrame>
</template>

<script setup>
import PageFrame from "@/components/layout/PageFrame.vue";
// ...
</script>
```

- `PageFrame` = 公共页框(`.inner` + `MottoHeader` + `<slot/>`),终端页主动 import 包裹。`mottoDark/mottoLight` 传专属诗句(不传走默认),`showBack` 控制返回键(首页传 false)。
- **`PageFrame` 只管布局,不渲染 `h1`** —— h1 是页面**内容**,归各页自己写在 `<slot/>` 里(每页一个 `visually-hidden` h1,给读屏/SEO)。布局与内容职责分离,也避免双 h1。
- 内容靠引入 `widgets/` 卡片组合(Album 引入 `AlbumSection`+`Lightbox`;About 引入 `ProfileCard`+`GlassCard`+`TimeProbe`+`QuoteCard`+`QrCard`+`UpdateLog`;Login 引入 `AuthPanel`)。

---

## 我提炼的几条判据

1. **归属看作用域**:全站 → 全局/common;单领域 → 领域目录;单页 → 该页 scoped。
2. **widget 该不该组件化**:看「复用 + 独立语义 + 样式封装」,**不看「有无逻辑」**——`QrCard`/`QuoteCard` 无重逻辑也是 widget。
3. **领域子目录自洽**:页面 + 共享资源(+ 若有父 layout)放一起,不散到根。
4. **平级路由为主**:不滥用嵌套路由;只有同构领域页确实需要共享 chrome + 独立 URL 时才考虑。
5. **全局样式克制**:`index.css` 只放真全站的;领域专属带前缀进领域 css,不往全局塞。
6. **布局与内容职责分离**:`PageFrame`/`MottoHeader` 这类只管**壳与布局**,不渲染页面**内容**(尤其 h1)。h1 是每页独有的内容,归页面自己。组件不自作主张替页面决定标题语义。
7. **widget 内的导航用 `router-link`,不用 `<div @click>`**:`PostCard` 整卡是 `<router-link :to>`(渲染 `<a href>`)——SEO 内链 + 键盘/读屏可达 + Ctrl 新标签。整卡跳转就该是链接,不是 JS 模拟。组件改一处,全站卡片自动变 `<a>`。

---

## 待你确认的点

1. 上面分层(顶层 / views / components 三档 / 样式四层)和你认知一致吗?
2. **widgets vs common 的边界**你怎么划?我现在的划法:widgets=具体内容卡片,common=通用 UI 底层件。
3. 终端页「内联页框 + 引入 widgets」的写法,是不是你认可的主流模式?
4. 有没有我没观察到的惯例(命名、文件粒度、别的约定)?
