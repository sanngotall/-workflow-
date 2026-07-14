#!/bin/bash
# 端端通（DDT）一键部署脚本
# 使用方式：
#   1. 将 ddt-deploy.tar.gz 上传到服务器任意目录
#   2. 解压：tar -xzf ddt-deploy.tar.gz -C /opt/ddt（或任意目录）
#   3. 进入解压目录执行：bash deploy.sh
# 前置条件：已安装 Docker Engine + Docker Compose
# 本脚本在当前解压目录直接运行，不复制文件到其他位置

set -e

# 当前目录（解压后 deploy.sh 所在目录）
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_DIR"

echo "========================================="
echo "  端端通（DDT）部署脚本"
echo "  部署目录: $DEPLOY_DIR"
echo "========================================="

# 1. 加载后端镜像
echo "[1/5] 加载 ddt-gateway 镜像 ..."
docker load -i images/ddt-gateway.tar
echo "镜像加载完成"

# 2. 配置国内镜像加速器（若服务器无法直连 Docker Hub）
echo "[2/5] 检查 Docker 基础镜像 ..."
if ! docker images | grep -q "^postgres.*16-alpine"; then
  echo "拉取基础镜像（使用国内源 daocloud）..."
  docker pull docker.m.daocloud.io/library/postgres:16-alpine
  docker tag docker.m.daocloud.io/library/postgres:16-alpine postgres:16-alpine
  docker pull docker.m.daocloud.io/library/redis:7-alpine
  docker tag docker.m.daocloud.io/library/redis:7-alpine redis:7-alpine
  docker pull docker.m.daocloud.io/library/nginx:1.25-alpine
  docker tag docker.m.daocloud.io/library/nginx:1.25-alpine nginx:1.25-alpine
  echo "基础镜像就绪"
else
  echo "基础镜像已存在，跳过拉取"
fi

# 3. 生成环境变量配置
# docker-compose.yml 中的 ${DB_PASSWORD} 是 compose 文件变量插值，
# 需要宿主机的 .env 文件提供（不是 env_file 指令，那个只注入容器内部）。
# 因此同时生成 gateway.env（容器注入）和 .env（compose 插值），两者内容一致。
echo "[3/5] 生成环境变量配置 ..."
FIRST_DEPLOY=0
if [ ! -f gateway.env ]; then
  FIRST_DEPLOY=1
  echo "首次部署，从模板生成 gateway.env ..."
  cp gateway.env.example gateway.env

  # 生成随机密钥
  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
  JWT=$(openssl rand -hex 32)
  AES_KEY=$(openssl rand -hex 32)
  AES_IV=$(openssl rand -hex 16)

  sed -i "s/请修改为强密码/$DB_PASS/" gateway.env
  sed -i "s/请修改为64位随机字符串/$JWT/" gateway.env
  sed -i "s/请修改为64位hex密钥/$AES_KEY/" gateway.env
  sed -i "s/请修改为32位hex向量/$AES_IV/" gateway.env

  echo "gateway.env 已自动生成（含随机密钥）"
else
  echo "gateway.env 已存在，跳过生成"
fi

# 首次部署时清理遗留数据卷（避免旧密码与新 gateway.env 不匹配）
if [ "$FIRST_DEPLOY" = "1" ]; then
  if docker volume inspect ddt_postgres_data >/dev/null 2>&1; then
    echo "检测到遗留的 postgres 数据卷，清理以避免密码冲突..."
    docker compose down -v 2>/dev/null || true
    docker volume rm ddt_postgres_data 2>/dev/null || true
    echo "遗留数据卷已清理"
  fi
fi

# 无条件同步 .env 文件（供 docker compose 变量插值使用）
cp -f gateway.env .env
echo ".env 已同步生成"
echo "配置预览（脱敏）："
grep -E "^(DB_PASSWORD|JWT_SECRET|AES_KEY|AES_IV)" .env | sed 's/=.*/=***/'

# 4. 启动服务
echo ""
echo "[4/5] 启动 Docker 服务 ..."
# 清理可能存在的同名旧容器（避免容器名冲突）
docker rm -f ddt-redis ddt-postgres ddt-gateway ddt-nginx 2>/dev/null && echo "已清理旧容器" || echo "无旧容器需要清理"
docker compose up -d

# 5. 等待健康检查并验证
echo "[5/5] 等待健康检查（最多 90 秒）..."
sleep 5
for i in $(seq 1 18); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' ddt-gateway 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    echo "gateway 健康检查通过"
    break
  fi
  echo "  等待中... ($i/18) 状态: $STATUS"
  sleep 5
done

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "服务状态："
docker compose ps
echo ""
echo "访问地址：http://$(hostname -I | awk '{print $1}'):18880"
echo ""
echo "管理员账号：admin"
echo "管理员密码：$(docker exec ddt-gateway cat /app/.ddt-admin-password 2>/dev/null || echo '（请执行: docker logs ddt-gateway 2>&1 | grep admin:）')"
echo ""
echo "常用命令（在 $DEPLOY_DIR 目录执行）："
echo "  查看日志：docker compose logs -f"
echo "  重启服务：docker compose restart"
echo "  停止服务：docker compose down"
echo "  启动服务：docker compose up -d"
