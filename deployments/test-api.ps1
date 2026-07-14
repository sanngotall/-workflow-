# 端端通 test-harness 核心 API 验证脚本（§1-§5）
# 用法：powershell -ExecutionPolicy Bypass -File deployments/test-api.ps1

$BASE = "http://localhost:13000"
$adminPwd = "f4T}&eGU`$3Y7l=pk"  # 从 bootstrap 日志读取
$headers = @{}

function Post-Json($url, $body) {
    return Invoke-RestMethod -Uri "$BASE$url" -Method Post -ContentType "application/json" -Body $body -Headers $headers
}
function Get-Json($url) {
    return Invoke-RestMethod -Uri "$BASE$url" -Method Get -Headers $headers
}

Write-Host "=== §1 鉴权登录 ==="
$loginBody = @{ username = "admin"; password = $adminPwd } | ConvertTo-Json
try {
    $login = Post-Json "/api/auth/login" $loginBody
    $token = $login.data.accessToken
    $headers["Authorization"] = "Bearer $token"
    Write-Host "[OK] login success, token=$($token.Substring(0,20))..."
} catch {
    Write-Host "[FAIL] login: $_"
    exit 1
}

Write-Host "`n=== §2 项目管理 ==="
$projBody = @{ name = "演示项目-网页中转"; description = "Phase 1 端到端验证" } | ConvertTo-Json
try {
    $proj = Post-Json "/api/api/admin/v1/projects" $projBody
    $projectId = $proj.data.id
    Write-Host "[OK] project created id=$projectId"
} catch {
    Write-Host "[FAIL] create project: $_"
    exit 1
}

Write-Host "`n=== §3 中转创建（Mock 模式）==="
$routeBody = @{
    projectId   = $projectId
    method      = "POST"
    path        = "/demo-chat"
    environment = "prod"
    isMock      = $true
    mockResponse = @{ message = "mock_response_from_test_harness" }
} | ConvertTo-Json -Depth 5
try {
    $route = Post-Json "/api/api/admin/v1/projects/$projectId/routes" $routeBody
    $transitId = $route.data.id
    Write-Host "[OK] transit created transitId=$transitId"
} catch {
    Write-Host "[FAIL] create transit: $_"
    exit 1
}

Write-Host "`n=== §4 Mock 模式调用 ==="
$invokeBody = @{ message = "你好"; userId = "user_001" } | ConvertTo-Json
try {
    $mockRes = Post-Json "/v1/transit/$transitId/invoke" $invokeBody
    Write-Host "[OK] mock invoke response: $($mockRes | ConvertTo-Json -Depth 5)"
} catch {
    Write-Host "[FAIL] mock invoke: $_"
    exit 1
}

Write-Host "`n=== §5 网关入口（不存在的 transitId）==="
try {
    $notExist = Post-Json "/v1/transit/nonexistent-id/invoke" $invokeBody
    Write-Host "[WARN] expected error but got: $($notExist | ConvertTo-Json)"
} catch {
    $errResp = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "[OK] expected error code=$($errResp.error.code) msg=$($errResp.error.message)"
}

Write-Host "`n=== 验证完成 ==="
Write-Host "projectId=$projectId"
Write-Host "transitId=$transitId"
Write-Host "下一步：用 transitId 测试 SSE 流式透传（需准备下游 SSE 端点）"
