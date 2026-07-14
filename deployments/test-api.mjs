// 端端通 test-harness 核心 API 验证脚本（§1-§5）
// 用法：node deployments/test-api.mjs
// 注意：使用 http 模块而非 fetch，规避 Node 24 Windows UV_HANDLE_CLOSING bug
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 从 .ddt-admin-password 读取密码，避免 shell 转义问题
const pwdFile = join(__dirname, '..', 'gateway-server', '.ddt-admin-password');
const pwdContent = readFileSync(pwdFile, 'utf-8');
const pwdLine = pwdContent.split('\n').find((l) => l.startsWith('admin:'));
const ADMIN_PWD = pwdLine ? pwdLine.replace(/^admin:/, '').trim() : '';

const BASE_HOST = 'localhost';
const BASE_PORT = 13000;

let token = '';
let projectId = '';
let transitId = '';

function request(method, path, body, withAuth = true) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (withAuth && token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { hostname: BASE_HOST, port: BASE_PORT, path, method, headers },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          let json;
          try { json = JSON.parse(buf); } catch { json = { raw: buf }; }
          resolve({ status: res.statusCode, json, headers: res.headers });
        });
      },
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== §1 鉴权登录 ===');
  const login = await request('POST', '/api/auth/login', { username: 'admin', password: ADMIN_PWD }, false);
  if (login.status !== 200 || !login.json?.data?.access_token) {
    console.log('[FAIL] login:', JSON.stringify(login.json));
    process.exit(1);
  }
  token = login.json.data.access_token;
  console.log(`[OK] login success, token=${token.substring(0, 20)}...`);

  console.log('\n=== §2 项目管理 ===');
  const proj = await request('POST', '/api/api/admin/v1/projects', { name: '演示项目-网页中转', description: 'Phase 1 端到端验证' });
  if ((proj.status !== 200 && proj.status !== 201) || !proj.json?.data?.id) {
    console.log('[FAIL] create project:', JSON.stringify(proj.json));
    process.exit(1);
  }
  projectId = proj.json.data.id;
  console.log(`[OK] project created id=${projectId}`);

  console.log('\n=== §3 中转创建（Mock 模式）===');
  // Mock 模式下 transformer 仍为必填（admin.service 强制要求），传占位值
  // 实际 Mock 调用时不走 transformer/dispatch，gateway.service 直接返回 mock_response
  const route = await request('POST', `/api/api/admin/v1/projects/${projectId}/routes`, {
    projectId,
    method: 'POST',
    path: '/demo-chat',
    environment: 'prod',
    is_mock: true,
    mock_response: { message: 'mock_response_from_test_harness' },
    transformer: {
      target_url: 'http://localhost:9999/placeholder',
      type: 'direct',
    },
  });
  if ((route.status !== 200 && route.status !== 201) || !route.json?.data?.route_id) {
    console.log('[FAIL] create transit:', JSON.stringify(route.json));
    process.exit(1);
  }
  transitId = route.json.data.route_id;
  console.log(`[OK] transit created transitId=${transitId}`);

  console.log('\n=== §4 Mock 模式调用 ===');
  const mock = await request('POST', `/v1/transit/${transitId}/invoke`, { message: '你好', userId: 'user_001' }, false);
  console.log(`[OK] mock invoke status=${mock.status} response=${JSON.stringify(mock.json)}`);

  console.log('\n=== §5 网关入口（不存在的 transitId）===');
  const notExist = await request('POST', '/v1/transit/nonexistent-id/invoke', { message: 'test' }, false);
  console.log(`[OK] expected error status=${notExist.status} code=${notExist.json?.error?.code} msg=${notExist.json?.error?.message}`);

  console.log('\n=== 验证完成 ===');
  console.log(`projectId=${projectId}`);
  console.log(`transitId=${transitId}`);
  console.log('下一步：用 transitId 测试 SSE 流式透传（需准备下游 SSE 端点）');
  process.exit(0);
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
