# shabox-blog

基于 `Vue 3 + Vite + Vite SSG` 的个人博客站点，文章内容来自 `src/posts` 下的 Markdown 文件，构建后以静态站方式部署。

## 技术栈

- `Vue 3`
- `Vite`
- `Vite SSG`
- `Vue Router`
- `Pinia`
- `Element Plus`

## 目录说明

- `src/views`：页面级视图
- `src/components`：可复用组件
- `src/data`：文章索引、文案与本地数据
- `src/posts`：Markdown 文章内容
- `nginx-conf`：站点 Nginx 配置
- `.github/workflows`：GitHub Actions 部署流水线

## 本地开发

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run build
npm run preview
npm run docker:up
npm run docker:down
npm run docker:logs
```

## 部署方式

项目采用静态构建加容器托管的方式：

- GitHub Actions 负责构建 `dist/`
- 仓库中的 `docker-compose.yml` 与 `nginx-conf/default.conf` 一并同步到服务器
- 服务器通过 `docker compose up -d` 保持运行状态与仓库一致
- 上层反向代理、HTTPS 和证书由独立的 `Nginx Proxy Manager` 统一管理

详细说明见 `DEPLOYMENT.md`。
