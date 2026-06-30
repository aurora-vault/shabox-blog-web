import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import Markdown from "unplugin-vue-markdown/vite";
import MarkdownItPrism from "markdown-it-prism";
import MarkdownItLinkAttributes from "markdown-it-link-attributes";
// 1. 引入我们刚刚安装的 Markdown 翻译官
// --- 新增：引入按需加载所需的依赖 ---
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// 引入 node 的 fs 模块，用于读取 posts 目录
import fs from "fs";

// 👇 1. 引入站点地图生成器
import generateSitemap from "vite-ssg-sitemap";

export default defineConfig({
  // 1. 【新增】全局编译时常量注入
  // 注意：字符串外部必须用 JSON.stringify 包裹，否则构建时会被当作变量名执行而报错
  define: {
    __CDN__: JSON.stringify("https://img.shabox.fun"),
  },
  plugins: [
    // 2. 告诉 Vue 插件：不仅要管 .vue 文件，还要管 .md 文件！
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    // 3. 启动 Markdown 翻译官，并让它自动提取顶部的 frontmatter（前置数据）
    Markdown({
      // 2. SEO 头部注入（保持关闭，因为我们在 PostDetail.vue 中用了更高级的动态 useHead）
      headEnabled: false,

      // 3. 核心：劫持并自定义 markdown-it 的底层 AST 解析规则
      markdownItSetup(md) {
        // 挂载代码高亮引擎
        md.use(MarkdownItPrism, {
          defaultLanguage: "text", // 如果没写语言，默认按纯文本处理
        });

        // 挂载链接安全引擎：自动为所有外部链接添加新标签页打开和防劫持属性
        md.use(MarkdownItLinkAttributes, {
          matcher: (link) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener noreferrer",
          },
        });

        // 2. 【新增】Markdown AST 图像节点拦截器
        // 底层逻辑：在 Markdown 转换为 HTML 之前，遍历语法树，精准打击 <img> 节点
        md.core.ruler.push("oss_cdn_prefix", (state) => {
          state.tokens.forEach((token) => {
            if (token.type === "inline") {
              token.children.forEach((child) => {
                // 找到图片类型节点
                if (child.type === "image") {
                  const srcIndex = child.attrIndex("src");
                  if (srcIndex >= 0) {
                    const originalSrc = child.attrs[srcIndex][1];
                    // 防御性拦截：只有以 '/' 开头的相对路径才会被加上 CDN 前缀
                    // 如果你手写了完整的 http://... 则原样放行
                    if (originalSrc.startsWith("/")) {
                      child.attrs[srcIndex][1] =
                        `https://img.shabox.fun${originalSrc}`;
                    }
                  }
                }
              });
            }
          });
        });
      },
    }),

    // --- 新增：自动导入 API 和 组件 ---
    AutoImport({
      // 👇 加上这行，Vue 和 Vue Router 的常用 API 全局自动引入！
      imports: ["vue", "vue-router"],
      resolvers: [ElementPlusResolver()],

      dts: "auto-imports.d.ts", // 👈 新增：强制在根目录生成
    }),
    Components({
      resolvers: [ElementPlusResolver()],

      dts: "components.d.ts", // 👈 新增：强制在根目录生成
    }),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  // vite.config.js 里的 ssgOptions 替换为如下：
  ssgOptions: {
    async includedRoutes(paths) {
      // 1. 保留原本的静态路径
      const staticPaths = paths.filter((path) => !path.includes(":"));

      // 2. 读取 src/posts 下的所有 .md 文件
      const postFiles = await fs.promises.readdir(
        resolve(__dirname, "src/posts"),
      );

      // 3. 【核心修改】同步你的魔法切割机逻辑！
      // vite.config.js - 极致优化版
      const dynamicPaths = postFiles
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
          // 摒弃 replace，改用 slice 截取
          const filename = file.slice(0, -3);
          // 使用和你 posts.js 完全一样的正则表达式
          const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
          // 返回正确的纯净路由，比如 /post/diyi
          return `/post/${match ? match[2] : filename}`;
        });

      return [...staticPaths, ...dynamicPaths].filter(
        (path) => !path.startsWith("/admin"),
      );
    },
    // 👇 2. 新增魔法：当 SSG 把所有 HTML 都生成完毕后，触发这个钩子
    onFinished() {
      generateSitemap({
        hostname: "https://shabox.fun", // 替换为你的真实生产域名
        readable: true, // 生成格式化后的易读 XML
      });
    },
  },
});
