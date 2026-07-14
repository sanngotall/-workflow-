#!/bin/bash

# 端端通部署验证脚本
# 执行操纵: [[AGENTS.md]]
# 用法: ./verify-deployment.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查结果统计
PASS=0
FAIL=0
WARN=0

# 日志函数
log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASS=$((PASS+1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAIL=$((FAIL+1))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARN=$((WARN+1))
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# 检查 Docker 服务
check_docker_services() {
    log_info "检查 Docker 服务状态..."
    
    cd /opt/duanduantong-core/deployments
    
    # 检查容器是否运行
    containers=("ddt-postgres" "ddt-redis" "ddt-gateway" "ddt-nginx")
    for container in "${containers[@]}"; do
        if docker ps | grep -q "$container"; then
            log_pass "容器 $container 正在运行"
        else
            log_fail "容器 $container 未运行"
        fi
    done
    
    # 检查容器健康状态
    log_info "检查容器健康状态..."
    for container in "${containers[@]}"; do
        health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "none")
        if [ "$health" = "healthy" ]; then
            log_pass "容器 $container 健康状态: $health"
        elif [ "$health" = "none" ]; then
            log_warn "容器 $container 无健康检查配置"
        else
            log_fail "容器 $container 健康状态: $health"
        fi
    done
}

# 检查端口监听
check_port_listening() {
    log_info "检查端口监听状态..."
    
    ports=("3000:网关API" "8080:管理后台" "5432:PostgreSQL" "6379:Redis" "22:SSH")
    for port_info in "${ports[@]}"; do
        port=$(echo $port_info | cut -d':' -f1)
        service=$(echo $port_info | cut -d':' -f2)
        
        if netstat -tlnp | grep -q ":$port "; then
            log_pass "端口 $port ($service) 正常监听"
        else
            log_fail "端口 $port ($service) 未监听"
        fi
    done
}

# 检查 FRP 服务
check_frp_service() {
    log_info "检查 FRP 内网穿透服务..."
    
    # 检查服务状态
    if systemctl is-active --quiet frpc; then
        log_pass "FRP 服务正在运行"
    else
        log_fail "FRP 服务未运行"
        return
    fi
    
    # 检查配置文件
    if [ -f /etc/frp/frpc.toml ]; then
        log_pass "FRP 配置文件存在"
    else
        log_fail "FRP 配置文件不存在"
    fi
    
    # 检查连接状态
    log_info "检查 FRP 连接状态..."
    frp_status=$(journalctl -u frpc -n 20 --no-pager | grep -i "start proxy" | tail -1)
    if [ -n "$frp_status" ]; then
        log_pass "FRP 已建立连接"
    else
        log_warn "FRP 连接状态未知"
    fi
}

# 检查数据库连接
check_database() {
    log_info "检查数据库连接..."
    
    cd /opt/duanduantong-core/deployments
    
    # 检查 PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        log_pass "PostgreSQL 连接正常"
    else
        log_fail "PostgreSQL 连接失败"
    fi
    
    # 检查数据库表
    log_info "检查数据库表结构..."
    tables=$(docker-compose exec -T postgres psql -U postgres -d ddt_gateway -c "\dt" 2>/dev/null | grep -c "table" || echo "0")
    if [ "$tables" -gt 0 ]; then
        log_pass "数据库表已创建 ($tables 个表)"
    else
        log_warn "数据库表未创建或无法查询"
    fi
    
    # 检查 Redis
    if docker-compose exec -T redis redis-cli ping &> /dev/null | grep -q "PONG"; then
        log_pass "Redis 连接正常"
    else
        log_fail "Redis 连接失败"
    fi
}

# 检查 API 服务
check_api_service() {
    log_info "检查网关 API 服务..."
    
    # 本地测试
    log_info "本地 API 测试..."
    if curl -f -s http://localhost:3000/health &> /dev/null; then
        log_pass "本地网关 API 正常响应"
    else
        log_fail "本地网关 API 无响应"
    fi
    
    # 云服务器测试（通过 FRP）
    log_info "云服务器 API 测试..."
    if curl -f -s http://139.155.143.173:3000/health &> /dev/null; then
        log_pass "云服务器网关 API 正常响应"
    else
        log_fail "云服务器网关 API 无响应"
    fi
    
    # 测试管理 API
    log_info "测试管理 API..."
    admin_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/v1/projects)
    if [ "$admin_response" = "401" ] || [ "$admin_response" = "200" ]; then
        log_pass "管理 API 正常响应 (HTTP $admin_response)"
    else
        log_fail "管理 API 异常响应 (HTTP $admin_response)"
    fi
}

# 检查前端服务
check_frontend() {
    log_info "检查前端管理后台..."
    
    # 本地测试
    log_info "本地前端测试..."
    if curl -f -s http://localhost:8080 &> /dev/null; then
        log_pass "本地前端正常访问"
    else
        log_fail "本地前端无法访问"
    fi
    
    # 云服务器测试（通过 FRP）
    log_info "云服务器前端测试..."
    if curl -f -s http://139.155.143.173:8080 &> /dev/null; then
        log_pass "云服务器前端正常访问"
    else
        log_fail "云服务器前端无法访问"
    fi
    
    # 检查前端静态文件
    if [ -d /opt/duanduantong-core/admin-dashboard/dist ]; then
        log_pass "前端构建产物存在"
        file_count=$(ls /opt/duanduantong-core/admin-dashboard/dist | wc -l)
        log_info "前端文件数量: $file_count"
    else
        log_fail "前端构建产物不存在"
    fi
}

# 检查环境变量
check_environment_variables() {
    log_info "检查环境变量配置..."
    
    cd /opt/duanduantong-core/gateway-server
    
    # 检查 .env 文件
    if [ -f .env ]; then
        log_pass ".env 文件存在"
    else
        log_fail ".env 文件不存在"
        return
    fi
    
    # 检查必要的环境变量
    required_vars=("DB_HOST" "DB_PORT" "DB_USERNAME" "DB_PASSWORD" "DB_DATABASE" "REDIS_HOST" "REDIS_PORT" "JWT_SECRET" "AES_KEY" "PORT")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            log_pass "环境变量 $var 已配置"
        else
            log_fail "环境变量 $var 未配置"
        fi
    done
}

# 检查日志
check_logs() {
    log_info "检查服务日志..."
    
    cd /opt/duanduantong-core/deployments
    
    # 检查错误日志
    error_count=$(docker-compose logs --tail=100 2>/dev/null | grep -i "error" | wc -l)
    if [ "$error_count" -eq 0 ]; then
        log_pass "无错误日志"
    else
        log_warn "发现 $error_count 条错误日志"
    fi
    
    # 检查警告日志
    warn_count=$(docker-compose logs --tail=100 2>/dev/null | grep -i "warn" | wc -l)
    if [ "$warn_count" -eq 0 ]; then
        log_pass "无警告日志"
    else
        log_warn "发现 $warn_count 条警告日志"
    fi
}

# 检查防火墙
check_firewall() {
    log_info "检查防火墙配置..."
    
    if ! command -v ufw &> /dev/null; then
        log_warn "UFW 未安装"
        return
    fi
    
    # 检查防火墙状态
    if ufw status | grep -q "Status: active"; then
        log_pass "防火墙已启用"
    else
        log_warn "防火墙未启用"
    fi
    
    # 检查必要端口
    allowed_ports=("22" "3000" "8080")
    for port in "${allowed_ports[@]}"; do
        if ufw status | grep -q "$port"; then
            log_pass "端口 $port 已开放"
        else
            log_fail "端口 $port 未开放"
        fi
    done
}

# 检查系统资源
check_system_resources() {
    log_info "检查系统资源使用..."
    
    # CPU 使用率
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    log_info "CPU 使用率: ${cpu_usage}%"
    
    # 内存使用率
    mem_usage=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    log_info "内存使用率: ${mem_usage}%"
    
    # 磁盘使用率
    disk_usage=$(df -h /opt | tail -1 | awk '{print $5}' | sed 's/%//')
    log_info "磁盘使用率: ${disk_usage}%"
    
    # Docker 容器资源
    log_info "Docker 容器资源使用..."
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# 功能测试
functional_test() {
    log_info "执行功能测试..."
    
    cd /opt/duanduantong-core/deployments
    
    # 测试项目创建
    log_info "测试项目创建 API..."
    project_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/admin/v1/projects \
        -H "Content-Type: application/json" \
        -d '{"name":"测试项目","description":"自动化测试"}')
    
    if [ "$project_response" = "401" ]; then
        log_pass "项目创建 API 正常（需要认证）"
    elif [ "$project_response" = "201" ]; then
        log_pass "项目创建成功"
    else
        log_fail "项目创建失败 (HTTP $project_response)"
    fi
    
    # 测试网关转发
    log_info "测试网关转发..."
    gateway_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/gw/test-project/prod/v1/test \
        -H "Content-Type: application/json" \
        -d '{"test":"data"}')
    
    if [ "$gateway_response" = "404" ] || [ "$gateway_response" = "401" ]; then
        log_pass "网关转发正常（路由不存在或需要认证）"
    else
        log_warn "网关转发异常 (HTTP $gateway_response)"
    fi
}

# 显示检查结果
show_results() {
    echo ""
    echo "========================================="
    echo "  部署验证结果"
    echo "========================================="
    echo ""
    echo "通过项: $PASS"
    echo "失败项: $FAIL"
    echo "警告项: $WARN"
    echo ""
    
    if [ "$FAIL" -eq 0 ]; then
        echo -e "${GREEN}部署验证通过！${NC}"
        echo ""
        echo "访问地址："
        echo "  管理后台: http://139.155.143.173:8080"
        echo "  网关 API: http://139.155.143.173:3000"
        echo "  SSH 访问: ssh root@139.155.143.173 -p 3022"
    else
        echo -e "${RED}部署验证失败！${NC}"
        echo ""
        echo "请检查失败项并修复问题"
        echo "查看日志: docker-compose logs -f"
        echo "查看FRP日志: journalctl -u frpc -f"
    fi
    
    echo "========================================="
}

# 主函数
main() {
    log_info "开始部署验证..."
    
    check_docker_services
    check_port_listening
    check_frp_service
    check_database
    check_api_service
    check_frontend
    check_environment_variables
    check_logs
    check_firewall
    check_system_resources
    functional_test
    show_results
}

# 执行主函数
main