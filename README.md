# shabox-blog-web

沙盒屋个人博客前端,基于 `Vue 3 + Vite + Vite SSG`,文章内容来自 `src/posts` 下的 Markdown,构建期预渲染成静态站部署。

后端见 [`shabox-blog-api`](https://github.com/aurora-vault/shabox-blog-api),前端通过子域 `api.shabox.fun/v1` 调用。

## 技术栈

- Vue 3 + Vue Router + Pinia
- Vite + Vite SSG(构建期把 `src/posts/*.md` 预渲染成静态站)
- Element Plus(后台)、marked / sanitize-html / md-editor-v3(正文渲染与编辑)
- 打包:多阶段 Dockerfile 打成专属镜像 `shabox/blog-web`,nginx 托管 `dist/`

## 目录说明

- `src/views`:页面级视图(含 `admin/` 后台:登录 / 文章列表 / 编辑器 / 标签 / 素材库)
- `src/components`:可复用组件(`layout` / `widgets` / `common`)
- `src/api`:后端调用封装(`http.js` 基础 fetch + 双 token 刷新,`admin.js` / `posts.js`)
- `src/store`:Pinia 状态(`blog` / `admin` / `user`)
- `src/data`:文章索引、文案与本地数据
- `src/posts`:Markdown 文章内容
- `nginx-conf`:站点 Nginx 配置(静态资源 + SPA 回退 + 安全头)
- `.github/workflows`:部署流水线

## 本地开发

```bash
npm install
npm run dev      # 默认连 http://localhost:3001/v1,需先起后端
```

后端地址由 `VITE_API_BASE_URL` 控制,本地默认 `http://localhost:3001/v1`(见 `.env.example`);生产构建读 `.env.production`(指向 `https://api.shabox.fun/v1`)。

常用命令:

```bash
npm run build        # vite-ssg 构建 dist/
npm run preview      # 本地预览构建结果
npm run docker:up    # 以容器方式启动(用仓库内 docker-compose.yml)
npm run docker:down  # 停止本地容器
npm run docker:logs  # 跟随容器日志
```

## 部署

- 镜像:`shabox/blog-web:latest`(多阶段 Dockerfile,build 产物 COPY 进 nginx)
- 容器:`shabox-blog-web`,接入外部网络 `nginx-proxy-manager_npm-net`
- 触发:推 `main` → self-hosted runner `aurora` 在服务器本地 `git fetch` + `docker compose up -d --build`
- 域名:`shabox.fun` / `www.shabox.fun` 由 Nginx Proxy Manager 反代到容器

部署机制与命名约定的权威正文见工作区 `.core/ai-context/05_部署规范.md` 与 `04_命名与打包规范.md`;本项目细节见 `DEPLOYMENT.md`。
