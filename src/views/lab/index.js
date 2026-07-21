/**
 * 动效文章组件注册表
 *
 * 文章正文 content_markdown 写一行 `lab:<名>`(如 `lab:SteamButton`),
 * PostDetail 检测到该前缀就渲染此处注册的组件,跳过 v-html。
 *
 * 新增动效(三步):
 *   1. 在本目录写 XxxEffect.vue
 *   2. 在下方 labComponents 注册一行
 *   3. 后台文章正文填 `lab:XxxEffect`
 *
 * 组件须自包含(样式、资源、交互),不依赖文章正文容器。
 */
import { defineAsyncComponent } from "vue";

export const labComponents = {
  SteamButton: defineAsyncComponent(() => import("./SteamButton.vue")),
  PlanetAnimation: defineAsyncComponent(() => import("./PlanetAnimation.vue")),
};
