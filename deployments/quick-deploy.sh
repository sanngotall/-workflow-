#!/bin/bash

# 端端通快速部署脚本
# 执行操纵: [[AGENTS.md]]
# 用法: ./quick-deploy.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户或 sudo 执行此脚本"
        exit 1
    fi
}

# 检查系统环境
check_environment() {
    log_info "检查系统环境..."
    
    # 检查操作系统
    if [ ! -f /etc/os-release ]; then
        log_error "无法检测操作系统版本"
        exit 1
    fi
    
    OS=$(cat /etc/os-release | grep "^ID=" | cut -d'=' -f2)
    log_info "操作系统: $OS"
    
    # 检查必要的命令
    commands=("docker" "docker-compose" "node" "npm" "curl" "wget")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_warning "缺少命令: $cmd"
            log_info "正在安装依赖..."
            install_dependencies
        fi
    done
    
    log_success "系统环境检查完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装系统依赖..."
    
    apt update && apt upgrade -y
    
    # 安装 Docker
    if ! command -v docker &> /dev/null; then
        log_info "安装 Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $SUDO_USER
    fi
    
    # 安装 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "安装 Docker Compose..."
        apt install docker-compose-plugin -y
    fi
    
    # 安装 Node.js
    if ! command -v node &> /dev/null; then
        log_info "安装 Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    
    # 安装 FRP
    if ! command -v frpc &> /dev/null; then
        log_info "安装 FRP 客户端..."
        wget -q https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz
        tar -xzf frp_0.61.1_linux_amd64.tar.gz
        mv frp_0.61.1_linux_amd64/frpc /usr/local/bin/
        chmod +x /usr/local/bin/frpc
        rm -rf frp_0.61.1_linux_amd64*
    fi
    
    log_success "依赖安装完成"
}

# 配置环境变量
configure_environment() {
    log_info "配置环境变量..."
    
    cd /opt/duanduantong-core/gateway-server
    
    # 检查是否存在 .env 文件
    if [ -f .env ]; then
        log_warning ".env 文件已存在，跳过配置"
        return
    fi
    
    # 生成随机密钥
    DB_PASSWORD=$(openssl rand -base64 16)
    JWT_SECRET=$(openssl rand -base64 32)
    AES_KEY=$(openssl rand -base64 32 | cut -c1-32)
    
    # 创建 .env 文件
    cat > .env << EOF
# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=ddt_gateway

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=${JWT_SECRET}

# AES 加密密钥（32字节）
AES_KEY=${AES_KEY}

# 服务端口
PORT=3000
NODE_ENV=production

# 前端管理后台URL
ADMIN_DASHBOARD_URL=http://139.155.143.173:8080
EOF
    
    log_success "环境变量配置完成"
    log_info "数据库密码: ${DB_PASSWORD}"
    log_info "JWT密钥: ${JWT_SECRET}"
    log_info "AES密钥: ${AES_KEY}"
}

# 构建前端
build_frontend() {
    log_info "构建前端管理后台..."
    
    cd /opt/duanduantong-core/admin-dashboard
    
    # 检查 node_modules
    if [ ! -d node_modules ]; then
        log_info "安装前端依赖..."
        npm install
    fi
    
    # 配置生产环境变量
    cat > .env.production << EOF
VITE_API_BASE_URL=http://139.155.143.173:3000
VITE_APP_TITLE=端端通管理后台
EOF
    
    # 构建
    log_info "执行前端构建..."
    npm run build
    
    if [ -d dist ]; then
        log_success "前端构建完成"
        ls -la dist/
    else
        log_error "前端构建失败"
        exit 1
    fi
}

# 配置 FRP
configure_frp() {
    log_info "配置 FRP 内网穿透..."
    
    # 创建配置目录
    mkdir -p /etc/frp
    
    # 检查配置文件是否存在
    if [ -f /opt/duanduantong-core/deployments/frpc.toml ]; then
        log_info "使用项目中的 FRP 配置文件"
        cp /opt/duanduantong-core/deployments/frpc.toml /etc/frp/frpc.toml
    else
        log_warning "创建默认 FRP 配置文件"
        cat > /etc/frp/frpc.toml << 'EOF'
transport.protocol = "tcp"
serverAddr = "139.155.143.173"
serverPort = 7000
auth.token = "iuadbi@983$*(#)"

[[proxies]]
name = "ddt-gateway-api"
type = "tcp"
localIP = "127.0.0.1"
localPort = 3000
remotePort = 3000
transport.useCompression = true
transport.useEncryption = true

[[proxies]]
name = "ddt-admin-dashboard"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8080
remotePort = 8080
transport.useCompression = true
transport.useEncryption = true

[[proxies]]
name = "ddt-ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 3022
transport.useCompression = true
transport.useEncryption = true
EOF
    fi
    
    # 创建 systemd 服务
    cat > /etc/systemd/system/frpc.service << 'EOF'
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
    
    # 启动服务
    systemctl daemon-reload
    systemctl enable frpc
    systemctl start frpc
    
    if systemctl is-active --quiet frpc; then
        log_success "FRP 服务启动成功"
    else
        log_error "FRP 服务启动失败"
        systemctl status frpc
        exit 1
    fi
}

# 启动 Docker 服务
start_docker_services() {
    log_info "启动 Docker 服务..."
    
    cd /opt/duanduantong-core/deployments
    
    # 检查 docker-compose.yml
    if [ ! -f docker-compose.yml ]; then
        log_error "docker-compose.yml 文件不存在"
        exit 1
    fi
    
    # 停止现有容器
    docker-compose down -v 2>/dev/null || true
    
    # 构建并启动
    log_info "构建并启动容器..."
    docker-compose up -d --build
    
    # 等待容器启动
    sleep 10
    
    # 检查容器状态
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker 服务启动成功"
        docker-compose ps
    else
        log_error "Docker 服务启动失败"
        docker-compose logs
        exit 1
    fi
}

# 初始化数据库
initialize_database() {
    log_info "初始化数据库..."
    
    cd /opt/duanduantong-core/deployments
    
    # 等待 PostgreSQL 启动
    log_info "等待 PostgreSQL 启动..."
    until docker-compose exec -T postgres pg_isready -U postgres; do
        sleep 2
    done
    
    log_success "PostgreSQL 已就绪"
    
    # 执行数据库迁移
    log_info "执行数据库迁移..."
    docker-compose exec -T gateway-server npm run migrate:run || {
        log_warning "数据库迁移失败，可能需要手动执行"
    }
    
    log_success "数据库初始化完成"
}

# 验证服务
verify_services() {
    log_info "验证服务状态..."
    
    # 检查端口监听
    ports=("3000" "8080" "5432" "6379")
    for port in "${ports[@]}"; do
        if netstat -tlnp | grep -q ":$port "; then
            log_success "端口 $port 正常监听"
        else
            log_warning "端口 $port 未监听"
        fi
    done
    
    # 测试网关 API
    log_info "测试网关 API..."
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "网关 API 正常响应"
    else
        log_warning "网关 API 未响应（可能需要等待启动完成）"
    fi
    
    # 测试前端
    log_info "测试前端访问..."
    if curl -f http://localhost:8080 &> /dev/null; then
        log_success "前端正常访问"
    else
        log_warning "前端未响应（可能需要等待启动完成）"
    fi
    
    # 测试 FRP 连接
    log_info "测试 FRP 连接..."
    if systemctl is-active --quiet frpc; then
        log_success "FRP 服务正常运行"
        journalctl -u frpc -n 10 --no-pager
    else
        log_error "FRP 服务异常"
    fi
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 检查 UFW 是否安装
    if ! command -v ufw &> /dev/null; then
        log_warning "UFW 未安装，跳过防火墙配置"
        return
    fi
    
    # 启用防火墙
    ufw --force enable
    
    # 允许必要端口
    ufw allow 22/tcp
    ufw allow 3000/tcp
    ufw allow 8080/tcp
    
    # 拒绝数据库端口（仅内部访问）
    ufw deny 5432/tcp
    ufw deny 6379/tcp
    
    log_success "防火墙配置完成"
    ufw status
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "========================================="
    echo "  端端通部署完成"
    echo "========================================="
    echo ""
    echo "访问地址："
    echo "  管理后台: http://139.155.143.173:8080"
    echo "  网关 API: http://139.155.143.173:3000"
    echo "  SSH 访问: ssh root@139.155.143.173 -p 3022"
    echo ""
    echo "本地访问："
    echo "  管理后台: http://192.168.31.40:8080"
    echo "  网关 API: http://192.168.31.40:3000"
    echo ""
    echo "日志查看："
    echo "  Docker 日志: docker-compose logs -f"
    echo "  FRP 日志: journalctl -u frpc -f"
    echo ""
    echo "服务管理："
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose down"
    echo "  查看状态: docker-compose ps"
    echo ""
    echo "========================================="
}

# 主函数
main() {
    log_info "开始端端通快速部署..."
    
    check_root
    check_environment
    configure_environment
    build_frontend
    configure_frp
    start_docker_services
    initialize_database
    verify_services
    configure_firewall
    show_deployment_info
    
    log_success "部署完成！"
}

# 执行主函数
main