# 端端通测试服务器部署指南

> **部署环境：** 本地沙箱测试虚拟机 (192.168.31.40)
> **云服务器：** 139.155.143.173 (通过frp内网穿透)
> **执行操纵：** [[AGENTS.md]]

---

## 📋 1. 部署前准备

### 1.1 服务器要求

- **操作系统：** Ubuntu 24.04 LTS
- **内存：** 至少 4GB RAM
- **磁盘：** 至少 20GB 可用空间
- **网络：** 能访问外网，能被本地开发机访问

### 1.2 必需软件

```bash
# 更新系统包
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

# 安装 pnpm (可选，推荐)
npm install -g pnpm

# 安装 frp 客户端
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz
tar -xzf frp_0.61.1_linux_amd64.tar.gz
sudo mv frp_0.61.1_linux_amd64/frpc /usr/local/bin/
sudo chmod +x /usr/local/bin/frpc
```

---

## 🚀 2. 项目部署步骤

### 2.1 克隆项目到服务器

```bash
# 创建部署目录
sudo mkdir -p /opt/duanduantong-core
sudo chown $USER:$USER /opt/duanduantong-core

# 将项目代码上传到服务器（方式1：使用scp）
# 在本地开发机执行：
scp -r ./herness/* root@192.168.31.40:/opt/duanduantong-core/

# 或使用 git clone（方式2）
cd /opt/duanduantong-core
# git clone <your-repo-url> .
```

### 2.2 配置环境变量

```bash
cd /opt/duanduantong-core/gateway-server

# 创建 .env 文件
cat > .env << 'EOF'
# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_DATABASE=ddt_gateway

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379

# JWT 配置（生产环境请使用强密钥）
JWT_SECRET=$(openssl rand -base64 32)

# AES 加密密钥（必须是32字节）
AES_KEY=$(openssl rand -base64 32 | cut -c1-32)

# 服务端口
PORT=3000
NODE_ENV=production

# 前端管理后台URL（用于CORS）
ADMIN_DASHBOARD_URL=http://139.155.143.173:8080
EOF

# 生成随机密钥
sed -i "s/your_secure_password_here/$(openssl rand -base64 16)/" .env
sed -i "s/\$(openssl rand -base64 32)/$(openssl rand -base64 32)/" .env
sed -i "s/\$(openssl rand -base64 32 | cut -c1-32)/$(openssl rand -base64 32 | cut -c1-32)/" .env
```

### 2.3 构建前端管理后台

```bash
cd /opt/duanduantong-core/admin-dashboard

# 安装依赖
npm install

# 配置API地址（修改环境变量）
cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://139.155.143.173:3000
VITE_APP_TITLE=端端通管理后台
EOF

# 构建生产版本
npm run build

# 验证构建产物
ls -la dist/
```

### 2.4 配置 Nginx（前端静态文件服务）

```bash
# 创建 Nginx 配置目录
sudo mkdir -p /opt/duanduantong-core/deployments/nginx

# 创建 Nginx 配置文件
cat > /opt/duanduantong-core/deployments/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # 前端管理后台
    server {
        listen 8080;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        # 前端路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API 代理到网关服务
        location /api/ {
            proxy_pass http://gateway-server:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF
```

### 2.5 更新 Docker Compose 配置

```bash
cd /opt/duanduantong-core/deployments

# 备份原配置
cp docker-compose.yml docker-compose.yml.bak

# 更新配置，添加 Nginx 服务
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ddt-postgres
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: ddt_gateway
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - ddt-network

  redis:
    image: redis:7-alpine
    container_name: ddt-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - ddt-network

  gateway-server:
    build:
      context: ../gateway-server
      dockerfile: Dockerfile
    container_name: ddt-gateway
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=${DB_PASSWORD:-postgres}
      - DB_DATABASE=ddt_gateway
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - AES_KEY=${AES_KEY}
      - PORT=3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - ddt-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: ddt-nginx
    ports:
      - '8080:8080'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ../admin-dashboard/dist:/usr/share/nginx/html:ro
    depends_on:
      - gateway-server
    restart: unless-stopped
    networks:
      - ddt-network

networks:
  ddt-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
EOF
```

---

## 🔧 3. FRP 内网穿透配置

### 3.1 创建 FRP 客户端配置

```bash
# 创建 FRP 配置目录
sudo mkdir -p /etc/frp

# 创建 frpc.toml 配置文件
sudo tee /etc/frp/frpc.toml > /dev/null << 'EOF'
# FRP 客户端配置
transport.protocol = "tcp"
serverAddr = "139.155.143.173"
serverPort = 7000
auth.token = "iuadbi@983$*(#)"

# 网关 API 服务
[[proxies]]
name = "ddt-gateway-api"
type = "tcp"
localIP = "127.0.0.1"
localPort = 3000
remotePort = 3000
transport.useCompression = true
transport.useEncryption = true

# 前端管理后台
[[proxies]]
name = "ddt-admin-dashboard"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8080
remotePort = 8080
transport.useCompression = true
transport.useEncryption = true

# PostgreSQL 数据库（可选，仅用于远程调试）
[[proxies]]
name = "ddt-postgres"
type = "tcp"
localIP = "127.0.0.1"
localPort = 5432
remotePort = 5432
transport.useCompression = true
transport.useEncryption = true

# Redis 缓存（可选，仅用于远程调试）
[[proxies]]
name = "ddt-redis"
type = "tcp"
localIP = "127.0.0.1"
localPort = 6379
remotePort = 6379
transport.useCompression = true
transport.useEncryption = true

# SSH 访问
[[proxies]]
name = "ddt-ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 3022
transport.useCompression = true
transport.useEncryption = true
EOF
```

### 3.2 创建 FRP Systemd 服务

```bash
# 创建 systemd 服务文件
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

## 🏃 4. 启动服务

### 4.1 启动 Docker 容器

```bash
cd /opt/duanduantong-core/deployments

# 构建并启动所有服务
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f gateway-server
```

### 4.2 初始化数据库

```bash
# 进入网关容器执行数据库迁移
docker-compose exec gateway-server npm run migrate:run

# 或者手动连接数据库创建表结构
docker-compose exec postgres psql -U postgres -d ddt_gateway -f /path/to/init.sql
```

### 4.3 验证服务状态

```bash
# 检查所有服务是否正常运行
docker-compose ps

# 检查端口监听
sudo netstat -tlnp | grep -E '(3000|8080|5432|6379)'

# 测试网关 API
curl http://localhost:3000/health

# 测试前端访问
curl http://localhost:8080
```

---

## 🧪 5. 功能验证

### 5.1 通过云服务器访问

```bash
# 在本地开发机测试（通过云服务器访问）

# 测试网关 API
curl http://139.155.143.173:3000/health

# 访问管理后台
# 浏览器打开: http://139.155.143.173:8080
```

### 5.2 创建初始管理员账户

```bash
# 进入网关容器
docker-compose exec gateway-server sh

# 使用 Node.js REPL 创建管理员
node << 'EOF'
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
// 这里需要根据实际的认证服务实现
console.log('Admin creation script - implement based on auth service');
EOF
```

### 5.3 测试核心功能

```bash
# 1. 测试项目创建
curl -X POST http://139.155.143.173:3000/api/admin/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "测试项目",
    "description": "这是一个测试项目"
  }'

# 2. 测试路由创建
curl -X POST http://139.155.143.173:3000/api/admin/v1/projects/PROJECT_ID/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "environment": "prod",
    "method": "POST",
    "path": "/v1/chat",
    "is_async": false,
    "timeout_ms": 15000
  }'

# 3. 测试网关转发
curl -X POST http://139.155.143.173:3000/gw/PROJECT_ID/prod/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello World"
  }'
```

---

## 🔍 6. 监控与日志

### 6.1 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f gateway-server
docker-compose logs -f postgres
docker-compose logs -f redis

# 查看 FRP 日志
sudo journalctl -u frpc -f
```

### 6.2 监控容器资源

```bash
# 实时监控容器资源使用
docker stats

# 查看容器健康状态
docker-compose ps
docker inspect --format='{{.State.Health.Status}}' ddt-gateway
```

### 6.3 数据库监控

```bash
# 连接 PostgreSQL
docker-compose exec postgres psql -U postgres -d ddt_gateway

# 查看表结构
\dt

# 查看路由配置
SELECT * FROM routes;

# 查看请求日志
SELECT * FROM request_logs ORDER BY created_at DESC LIMIT 10;
```

---

## 🛠️ 7. 常见问题排查

### 7.1 容器无法启动

```bash
# 检查容器日志
docker-compose logs gateway-server

# 检查环境变量
docker-compose exec gateway-server env | grep -E '(DB_|REDIS_|JWT_|AES_)'

# 重新构建容器
docker-compose down -v
docker-compose up -d --build
```

### 7.2 FRP 连接失败

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

### 7.3 数据库连接失败

```bash
# 检查 PostgreSQL 容器状态
docker-compose ps postgres

# 测试数据库连接
docker-compose exec postgres pg_isready -U postgres

# 检查数据库日志
docker-compose logs postgres
```

### 7.4 前端无法访问后端 API

```bash
# 检查 CORS 配置
docker-compose exec gateway-server env | grep CORS

# 检查 Nginx 配置
docker-compose exec nginx nginx -t

# 检查网络连接
docker-compose exec nginx ping gateway-server
```

---

## 📊 8. 性能优化建议

### 8.1 Docker 优化

```bash
# 限制容器资源使用
# 在 docker-compose.yml 中添加：
services:
  gateway-server:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 8.2 PostgreSQL 优化

```sql
-- 在 PostgreSQL 中执行优化配置
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '2621kB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
```

### 8.3 Redis 优化

```bash
# 在 redis.conf 中添加优化配置
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## 🔐 9. 安全加固

### 9.1 防火墙配置

```bash
# 启用 UFW 防火墙
sudo ufw enable

# 允许必要端口
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 3000/tcp    # 网关 API
sudo ufw allow 8080/tcp    # 管理后台

# 拒绝外部直接访问数据库端口
sudo ufw deny 5432/tcp
sudo ufw deny 6379/tcp

# 查看防火墙状态
sudo ufw status
```

### 9.2 定期备份

```bash
# 创建备份脚本
cat > /opt/duanduantong-core/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
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

## 📝 10. 部署检查清单

- [ ] ✅ 服务器环境准备完成
- [ ] ✅ Docker 和 Docker Compose 已安装
- [ ] ✅ Node.js 和 npm 已安装
- [ ] ✅ FRP 客户端已安装并配置
- [ ] ✅ 项目代码已上传到服务器
- [ ] ✅ 环境变量已配置
- [ ] ✅ 前端已构建
- [ ] ✅ Nginx 配置已完成
- [ ] ✅ Docker Compose 配置已更新
- [ ] ✅ FRP 服务已启动
- [ ] ✅ Docker 容器已启动
- [ ] ✅ 数据库迁移已执行
- [ ] ✅ 服务健康检查通过
- [ ] ✅ 通过云服务器可访问
- [ ] ✅ 防火墙规则已配置
- [ ] ✅ 备份脚本已设置

---

## 🎉 11. 部署完成

部署完成后，您可以通过以下地址访问：

- **管理后台：** http://139.155.143.173:8080
- **网关 API：** http://139.155.143.173:3000
- **SSH 访问：** `ssh root@139.155.143.173 -p 3022`

**注意事项：**
1. 生产环境请修改所有默认密码和密钥
2. 定期检查日志和监控
3. 定期执行数据备份
4. 关注系统资源使用情况
5. 及时更新安全补丁

**技术支持：**
- 项目文档：[AGENTS.md](file:///c:/Users/sann/Documents/trae比赛/project/herness/AGENTS.md)
- 规范文档：[spec/](file:///c:/Users/sann/Documents/trae比赛/project/herness/spec/)
- 开发日志：[.workbuddy/memory/](file:///c:/Users/sann/Documents/trae比赛/project/herness/.workbuddy/memory/)