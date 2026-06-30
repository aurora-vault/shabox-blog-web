# 部署说明

## 目标

本项目遵循以下部署原则：

- 业务站点以容器方式运行，禁止使用 PM2、nohup、systemd 等散装进程管理。
- 反向代理、HTTPS 与证书由独立基建 `Nginx Proxy Manager` 统一处理。
- 业务仓库只维护博客站点自身代码、静态产物生成逻辑与运行配置。
- 线上变更优先通过 GitHub Actions 触发，避免手工热修。

## 仓库内的部署文件

- `docker-compose.yml`：博客容器编排，运行镜像为 `nginx:alpine`。
- `nginx-conf/default.conf`：站点 Nginx 配置，负责静态资源服务、SPA 路由回退与缓存头。
- `.github/workflows/deploy.yml`：CI/CD 流水线，负责构建并同步运行配置。

## 运行结构

- 构建产物目录：`dist/`
- 线上部署目录：`/opt/projects/shabox-blog`
- 容器名称：`shabox-blog`
- 外部网络：`nginx-proxy-manager_npm-net`

博客容器通过外部 Docker 网络接入 `Nginx Proxy Manager`，域名、SSL 证书与公网入口由基建侧统一管理。

## 流水线行为

每次推送到 `master` 时，GitHub Actions 会执行以下步骤：

1. 安装依赖并执行 `npm run build`
2. 将 `dist/`、`docker-compose.yml`、`nginx-conf/default.conf` 同步到服务器
3. 在服务器执行 `docker compose up -d`，使运行状态与仓库配置保持一致

## 本地命令

- `npm run dev`：启动本地开发环境
- `npm run build`：构建静态产物
- `npm run preview`：本地预览构建结果
- `npm run docker:up`：以容器方式启动站点
- `npm run docker:down`：停止本地容器
- `npm run docker:logs`：查看容器日志

## 约束说明

- 不提交 `.env`、证书、私钥与服务器数据目录。
- 不在仓库中维护网关、证书签发和安全组等基建配置。
- 若需要变更域名、SSL 或网关策略，应在独立基建环境中调整，而不是直接改业务容器。
