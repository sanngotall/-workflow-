# 端端通 Docker Compose 部署指南

> **执行操纵:** [[AGENTS.md]]
> **目标服务器:** 本地沙箱测试虚拟机 (192.168.31.40)
> **云服务器:** 139.155.143.173 (FRP 内网穿透)
> **创建日期:** 2026-06-23

---

## 📋 端口配置说明

| 服务 | 外部端口 | 内部端口 | 用途 |
|------|----------|----------|------|
| Nginx HTTP | 18880 | 80 | 前端管理后台、API 代理 |
| Nginx HTTPS | 18443 | 443 | HTTPS 加密访问 |
| Gateway API | 13000 | 3000 | 网关核心服务 |
| PostgreSQL | 15432 | 5432 | 数据库 |
| Redis | 16379 | 6379 | 缓存/队列 |
| FRP Server | 7000 | - | 内网穿透服务端 |
| SSH | 3022 | 22 | 远程管理 |

---

## 🔧 环境准备

### 1. 服务器要求

- **操作系统:** Ubuntu 24.04 LTS
- **内存:** 至少 4GB RAM
- **磁盘:** 至少 20GB 可用空间
- **网络:** 能访问外网

### 2. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 FRP 客户端
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz
tar -xzf frp_0.61.1_linux_amd64.tar.gz
sudo mv frp_0.61.1_linux_amd64/frpc /usr/local/bin/
sudo chmod +x /usr/local/bin/frpc
```

---

## 📁 项目部署

### 1. 创建部署目录

```bash
sudo mkdir -p /opt/duanduantong-core
sudo chown $USER:$USER /opt/duanduantong-core
cd /opt/duanduantong-core
```

### 2. 上传项目代码

```bash
# 在本地开发机执行，将项目上传到服务器
scp -r ./herness/* root@192.168.31.40:/opt/duanduantong-core/

# 或者使用 git clone（如果已配置代码仓库）
# git clone <your-repo-url> .
```

### 3. 配置环境变量

```bash
cd /opt/duanduantong-core/gateway-server

# 创建 .env 文件
cat > .env << 'EOF'
# 数据库配置（容器内部端口）
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_DATABASE=ddt_gateway

# Redis 配置（容器内部端口）
REDIS_HOST=redis
REDIS_PORT=6379

# JWT 配置（生产环境请使用强密钥）
JWT_SECRET=$(openssl rand -base64 32)

# AES 加密密钥（必须是32字节）
AES_KEY=$(openssl rand -base64 32 | cut -c1-32)

# 服务端口（容器内部端口）
PORT=3000
NODE_ENV=production

# 前端管理后台URL（用于CORS）
ADMIN_DASHBOARD_URL=http://139.155.143.173:18880
EOF

# 生成随机密钥
sed -i "s/your_secure_password_here/$(openssl rand -base64 16)/" .env
sed -i "s/\$(openssl rand -base64 32)/$(openssl rand -base64 32)/" .env
sed -i "s/\$(openssl rand -base64 32 | cut -c1-32)/$(openssl rand -base64 32 | cut -c1-32)/" .env
```

### 4. 构建前端

```bash
cd /opt/duanduantong-core/admin-dashboard

# 安装依赖
npm install

# 配置生产环境 API 地址
cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://139.155.143.173:13000
VITE_APP_TITLE=端端通管理后台
EOF

# 构建生产版本
npm run build

# 验证构建产物
ls -la dist/
```

---

## 🚀 使用 Docker Compose 启动

### 1. 查看 Docker Compose 配置

项目已包含完整的 `docker-compose.yml` 配置文件，位于 `deployments/docker-compose.yml`。

```bash
cd /opt/duanduantong-core/deployments
cat docker-compose.yml
```

**服务清单:**

| 服务名 | 镜像 | 端口映射 |
|--------|------|----------|
| postgres | postgres:16-alpine | 15432:5432 |
| redis | redis:7-alpine | 16379:6379 |
| gateway-server | 本地构建 | 13000:3000 |
| nginx | nginx:1.25-alpine | 18880:80, 18443:443 |

### 2. 启动服务

```bash
cd /opt/duanduantong-core/deployments

# 构建并启动所有服务
docker-compose up -d --build

# 查看容器状态
docker-compose ps
```

### 3. 初始化数据库

```bash
# 等待 PostgreSQL 启动完成（约30秒）
sleep 30

# 进入网关容器执行数据库迁移
docker-compose exec gateway-server npm run migrate:run
```

---

## 🔗 FRP 内网穿透配置

### 1. 配置 FRP 客户端

```bash
# 创建 FRP 配置目录
sudo mkdir -p /etc/frp

# 使用项目中的配置文件
sudo cp /opt/duanduantong-core/deployments/frpc.toml /etc/frp/frpc.toml
```

### 2. 创建 Systemd 服务

```bash
sudo tee /etc/systemd/system/frpc.service > /dev/null << 'EOF'
[Unit]
Description=FRP Client Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/frpc -c /etc/frp/frpc.toml
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# 启动并启用 FRP 服务
sudo systemctl daemon-reload
sudo systemctl enable frpc
sudo systemctl start frpc

# 检查服务状态
sudo systemctl status frpc
```

---

## ✅ 验证部署

### 1. 检查容器状态

```bash
docker-compose ps
```

### 2. 检查端口监听

```bash
sudo netstat -tlnp | grep -E '(13000|18880|18443|15432|16379)'
```

### 3. 测试网关 API

```bash
# 本地测试
curl http://localhost:13000/health

# 预期响应: {"success":true}
```

### 4. 测试前端访问

```bash
# 本地测试
curl http://localhost:18880

# 通过云服务器测试（需要 FRP 连接正常）
curl http://139.155.143.173:18880
```

### 5. 测试数据库连接

```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Redis
docker-compose exec redis redis-cli ping
```

---

## 📊 访问地址

部署完成后可通过以下地址访问：

### 本地访问（测试服务器）

| 服务 | 地址 |
|------|------|
| 管理后台 | http://192.168.31.40:18880 |
| 网关 API | http://192.168.31.40:13000 |
| PostgreSQL | 192.168.31.40:15432 |
| Redis | 192.168.31.40:16379 |

### 远程访问（通过 FRP）

| 服务 | 地址 |
|------|------|
| 管理后台 | http://139.155.143.173:18880 |
| 网关 API | http://139.155.143.173:13000 |
| SSH | ssh root@139.155.143.173 -p 3022 |

---

## 🛠️ 常用命令

### Docker Compose 命令

```bash
# 启动所有服务（后台模式）
docker-compose up -d

# 启动并重新构建
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f                    # 所有服务
docker-compose logs -f gateway-server     # 指定服务

# 停止服务（保留数据）
docker-compose stop

# 停止并删除容器（保留数据卷）
docker-compose down

# 停止并删除容器和数据卷
docker-compose down -v

# 重启服务
docker-compose restart

# 进入容器
docker-compose exec gateway-server sh
docker-compose exec postgres psql -U postgres -d ddt_gateway
docker-compose exec redis redis-cli
```

### FRP 命令

```bash
# 查看 FRP 状态
sudo systemctl status frpc

# 重启 FRP
sudo systemctl restart frpc

# 查看 FRP 日志
sudo journalctl -u frpc -f
```

### 数据库命令

```bash
# 执行数据库迁移
docker-compose exec gateway-server npm run migrate:run

# 创建数据库备份
docker-compose exec -T postgres pg_dump -U postgres ddt_gateway > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres ddt_gateway < backup.sql
```

---

## 🔐 安全加固

### 1. 防火墙配置

```bash
# 启用 UFW 防火墙
sudo ufw enable

# 允许必要端口
sudo ufw allow 22/tcp          # SSH
sudo ufw allow 13000/tcp       # 网关 API
sudo ufw allow 18880/tcp       # 前端管理后台
sudo ufw allow 18443/tcp       # HTTPS
sudo ufw allow 7000/tcp        # FRP Server

# 拒绝外部直接访问数据库端口
sudo ufw deny 15432/tcp
sudo ufw deny 16379/tcp

# 查看防火墙状态
sudo ufw status
```

### 2. 定期备份

```bash
# 创建备份脚本
cat > /opt/duanduantong-core/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份 PostgreSQL
docker-compose exec -T postgres pg_dump -U postgres ddt_gateway > $BACKUP_DIR/ddt_db_$DATE.sql

# 备份 Redis
docker-compose exec -T redis redis-cli BGSAVE
docker cp ddt-redis:/data/dump.rdb $BACKUP_DIR/ddt_redis_$DATE.rdb

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/duanduantong-core/backup.sh

# 添加到 crontab（每天凌晨2点执行）
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/duanduantong-core/backup.sh >> /var/log/ddt-backup.log 2>&1") | crontab -
```

---

## 🧪 故障排查

### 1. 容器无法启动

```bash
# 查看容器日志
docker-compose logs gateway-server

# 检查环境变量
docker-compose exec gateway-server env | grep -E '(DB_|REDIS_|JWT_|AES_)'

# 重新构建容器
docker-compose down -v
docker-compose up -d --build
```

### 2. FRP 连接失败

```bash
# 检查 FRP 服务状态
sudo systemctl status frpc

# 查看 FRP 日志
sudo journalctl -u frpc -n 50

# 测试云服务器连接
telnet 139.155.143.173 7000

# 重启 FRP 服务
sudo systemctl restart frpc
```

### 3. 前端无法访问后端 API

```bash
# 检查 Nginx 配置
docker-compose exec nginx nginx -t

# 检查网络连接
docker-compose exec nginx ping gateway-server

# 检查网关健康状态
docker-compose exec nginx curl http://gateway-server:3000/health
```

---

## 📝 部署检查清单

- [ ] Docker 和 Docker Compose 已安装
- [ ] Node.js 和 npm 已安装
- [ ] FRP 客户端已安装并配置
- [ ] 项目代码已上传到服务器
- [ ] 环境变量已配置（.env 文件）
- [ ] 前端已构建（dist 目录存在）
- [ ] Docker Compose 配置正确
- [ ] FRP 服务已启动
- [ ] Docker 容器已启动
- [ ] 数据库迁移已执行
- [ ] 网关健康检查通过
- [ ] 通过云服务器可访问
- [ ] 防火墙规则已配置
- [ ] 备份脚本已设置

---

## 📁 相关文件

| 文件路径 | 用途 |
|----------|------|
| `deployments/docker-compose.yml` | Docker Compose 编排文件 |
| `deployments/nginx/default.conf` | Nginx 反向代理配置 |
| `deployments/nginx/ssl.conf` | SSL/TLS 配置 |
| `deployments/frpc.toml` | FRP 内网穿透配置 |
| `deployments/quick-deploy.sh` | 一键部署脚本 |
| `deployments/verify-deployment.sh` | 部署验证脚本 |
| `deployments/DEPLOYMENT_CHECKLIST.md` | 部署检查清单 |
| `gateway-server/.env` | 环境变量配置 |
| `PORT_LIST.md` | 端口清单文档 |