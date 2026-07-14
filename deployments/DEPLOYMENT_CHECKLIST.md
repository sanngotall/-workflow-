# 端端通项目部署检查清单

> **执行操纵:** [[AGENTS.md]]
> **创建日期:** 2026-06-23
> **目标服务器:** 192.168.31.40
> **云服务器:** 139.155.143.173

---

## 🔧 环境准备检查

### 1. 基础环境
- [ ] Ubuntu 24.04 系统已安装
- [ ] Docker Engine 已安装（版本 >= 24.x）
- [ ] Docker Compose 已安装（版本 >= 2.x）
- [ ] Git 已安装

### 2. 端口防火墙
- [ ] 13000 端口已开放（网关 API）
- [ ] 18880 端口已开放（Nginx HTTP）
- [ ] 18443 端口已开放（Nginx HTTPS）
- [ ] 15432 端口已开放（PostgreSQL）
- [ ] 16379 端口已开放（Redis）
- [ ] 7000 端口已开放（FRP Server）
- [ ] 3022 端口已开放（SSH 映射）

### 3. 目录结构
- [ ] 部署目录 `/opt/duanduantong-core` 已创建
- [ ] 目录权限已设置为 `root`
- [ ] 前端构建目录 `admin-dashboard/dist` 已存在

---

## 📝 配置文件检查

### 1. 环境变量
- [ ] `gateway-server/.env` 文件已创建
- [ ] `JWT_SECRET` 已配置（至少 32 位随机字符串）
- [ ] `AES_KEY` 已配置（32 位 AES 密钥）
- [ ] 数据库密码已修改（非默认值）

### 2. Docker Compose
- [ ] [docker-compose.yml](deployments/docker-compose.yml) 端口映射正确
- [ ] PostgreSQL 端口: `15432:5432`
- [ ] Redis 端口: `16379:6379`
- [ ] Gateway 端口: `13000:3000`
- [ ] Nginx 端口: `18880:80`, `18443:443`

### 3. FRP 配置
- [ ] [frpc.toml](deployments/frpc.toml) 配置正确
- [ ] FRP Server 地址: `139.155.143.173:7000`
- [ ] auth.token 已修改（非默认值）
- [ ] 所有业务端口穿透已配置

### 4. Nginx 配置
- [ ] [nginx/default.conf](deployments/nginx/default.conf) 反向代理正确
- [ ] `/api/` → `http://gateway-server:3000/api/`
- [ ] `/gw/` → `http://gateway-server:3000/gw/`
- [ ] SSL 证书路径已配置（生产环境）

---

## 🚀 部署步骤

### 第一步：克隆代码
```bash
cd /opt
git clone <仓库地址> duanduantong-core
cd duanduantong-core
```

### 第二步：创建环境变量
```bash
cp gateway-server/.env.example gateway-server/.env
# 编辑 .env 文件，设置 JWT_SECRET 和 AES_KEY
```

### 第三步：构建前端
```bash
cd admin-dashboard
npm install
npm run build
cd ..
```

### 第四步：启动 Docker Compose
```bash
cd deployments
docker-compose up -d
```

### 第五步：配置 FRP
```bash
cp deployments/frpc.toml /etc/frp/frpc.toml
# 启动 frpc 服务
```

---

## ✅ 验证检查

### 1. Docker 容器状态
- [ ] `ddt-postgres` 容器运行中
- [ ] `ddt-redis` 容器运行中
- [ ] `ddt-gateway` 容器运行中
- [ ] `ddt-nginx` 容器运行中

### 2. 端口监听验证
- [ ] `netstat -tlnp | grep 13000` → Gateway 端口监听中
- [ ] `netstat -tlnp | grep 18880` → Nginx HTTP 端口监听中
- [ ] `netstat -tlnp | grep 18443` → Nginx HTTPS 端口监听中
- [ ] `netstat -tlnp | grep 15432` → PostgreSQL 端口监听中
- [ ] `netstat -tlnp | grep 16379` → Redis 端口监听中

### 3. 服务健康检查
- [ ] `curl http://localhost:13000/health` → 返回 `{"success":true}`
- [ ] `curl http://localhost:18880/health` → 返回 `{"success":true}`

### 4. 数据库连接测试
- [ ] PostgreSQL 连接: `psql -h localhost -p 15432 -U postgres ddt_gateway`
- [ ] Redis 连接: `redis-cli -h localhost -p 16379 ping` → `PONG`

### 5. 远程访问测试（通过 FRP）
- [ ] 通过 `http://139.155.143.173:18880` 访问前端管理后台
- [ ] 通过 `http://139.155.143.173:13000/health` 访问网关健康检查

---

## 📊 端口汇总表

| 服务 | 外部端口 | 内部端口 | 状态 |
|------|----------|----------|------|
| Nginx HTTP | 18880 | 80 | 🔲 |
| Nginx HTTPS | 18443 | 443 | 🔲 |
| Gateway API | 13000 | 3000 | 🔲 |
| PostgreSQL | 15432 | 5432 | 🔲 |
| Redis | 16379 | 6379 | 🔲 |
| FRP Server | 7000 | - | 🔲 |
| SSH 映射 | 3022 | 22 | 🔲 |

---

## ⚠️ 注意事项

1. **首次部署**：需要等待数据库初始化完成（约 30 秒）
2. **FRP 连接**：确保云服务器 FRP Server 已启动并监听 7000 端口
3. **SSL 证书**：生产环境需要配置有效的 SSL 证书
4. **日志查看**：使用 `docker-compose logs -f` 查看服务日志
5. **资源监控**：使用 `docker stats` 监控容器资源使用情况

---

## 📁 部署文件清单

| 文件路径 | 用途 |
|----------|------|
| `deployments/docker-compose.yml` | Docker Compose 编排文件 |
| `deployments/nginx/default.conf` | Nginx 反向代理配置 |
| `deployments/nginx/ssl.conf` | SSL/TLS 配置 |
| `deployments/frpc.toml` | FRP 内网穿透配置 |
| `deployments/quick-deploy.sh` | 一键部署脚本 |
| `deployments/verify-deployment.sh` | 部署验证脚本 |
| `gateway-server/.env` | 环境变量配置 |
| `admin-dashboard/dist/` | 前端构建产物 |