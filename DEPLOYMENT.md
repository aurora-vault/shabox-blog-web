# 部署说明(shabox-blog-web)

> 部署机制、runner、NPM 反代的权威正文是工作区 `.core/ai-context/05_部署规范.md`。本文件只记录**本项目特有的部署事实**,不重复维护通用流程。

## 原则

- 业务站点以容器方式运行,禁用 PM2 / nohup / systemd 散装进程
- 反向代理、HTTPS、证书由 `Nginx Proxy Manager` 统一处理,业务容器不另装 Nginx 做反代
- 线上变更通过 GitHub Actions 触发,避免手工热修

## 本项目部署事实

| 项 | 值 |
|---|---|
| 标准名 | `shabox-blog-web` |
| 镜像 | `shabox/blog-web:latest`(多阶段 Dockerfile) |
| 容器名 | `shabox-blog-web` |
| compose service | `blog-web` |
| compose 文件 | `docker-compose.yml`(仓库根) |
| 服务器目录 | `/opt/projects/shabox-blog-web/` |
| 外部网络 | `nginx-proxy-manager_npm-net`(alias `shabox-blog-web`) |
| 域名 | `shabox.fun`、`www.shabox.fun` → NPM 反代到容器 |
| 后端 | `shabox-blog-api`,子域 `api.shabox.fun/v1`(前端跨域调用,见 `src/api/http.js`) |

## 仓库内文件

- `Dockerfile`:多阶段构建,`node:22-alpine` build → `nginx:alpine` 托管 `dist/`(国内镜像加速 `npm ci`)
- `docker-compose.yml`:容器编排,`build: .` + `image: shabox/blog-web:latest` + 健康检查
- `nginx-conf/default.conf`:站点配置,静态资源服务、SPA 回退、缓存头、安全头
- `.github/workflows/deploy.yml`:`runs-on: aurora`,本地 `git fetch` + `reset --hard origin/main` + `docker compose up -d --build`

## 流水线行为

推 `main`(或手动 `workflow_dispatch`)→ runner `aurora` 在服务器本地:

1. `cd /opt/projects/shabox-blog-web`
2. `git fetch --all --prune` + `git reset --hard origin/main`
3. `docker compose up -d --build`(用仓库 Dockerfile 重建镜像并起容器)
4. `docker ps --filter name=shabox-blog-web` 验证

> 无需 SERVER_HOST / SERVER_KEY 等 secrets —— runner 就在服务器本地。旧 scp / ssh-action 推送式已废弃。

## 本地命令

- `npm run dev`:本地开发(默认连 `http://localhost:3001/v1`)
- `npm run build`:`vite-ssg build` 生成 `dist/`
- `npm run preview`:本地预览构建结果
- `npm run docker:up` / `docker:down` / `docker:logs`:本地容器启停与日志

> 本地 `docker:up` 依赖外部网络 `nginx-proxy-manager_npm-net`;本地若无该网络,需先手工创建或仅用 `dev` / `preview` 调试。

## 约束

- 不提交 `.env`、证书、私钥与运行时数据
- 不在仓库维护网关、证书签发、安全组等基建配置(属 `aurora-infra`)
- 域名 / SSL / 网关策略变更在 NPM 侧调整,不改业务容器
