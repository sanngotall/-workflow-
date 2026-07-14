// 端端通 SSE 流式透传端到端验证
// 用法：node deployments/test-sse.mjs
// 前置：mock-sse-server.mjs 已启动（端口 9999）+ gateway-server 已启动（端口 13000）
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pwdFile = join(__dirname, '..', 'gateway-server', '.ddt-admin-password');
const pwdContent = readFileSync(pwdFile, 'utf-8');
const pwdLine = pwdContent.split('\n').find((l) => l.startsWith('admin:'));
const ADMIN_PWD = pwdLine ? pwdLine.replace(/^admin:/, '').trim() : '';

const HOST = 'localhost';
const PORT = 13000;

let token = '';
let projectId = '';
let sseTransitId = '';
let jsonTransitId = '';

function request(method, path, body, withAuth = true) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (withAuth && token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: HOST, port: PORT, path, method, headers }, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        let json;
        try { json = JSON.parse(buf); } catch { json = { raw: buf }; }
        resolve({ status: res.statusCode, json, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// 流式请求：返回完整 buffer + 响应头（不解析 JSON，保留 SSE 原文）
function requestStream(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request({ hostname: HOST, port: PORT, path, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks).toString('utf-8');
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: buf,
        });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== 准备：登录获取 token ===');
  const login = await request('POST', '/api/auth/login', { username: 'admin', password: ADMIN_PWD }, false);
  token = login.json.data.access_token;
  console.log(`[OK] token=${token.substring(0, 20)}...`);

  console.log('\n=== 准备：创建项目 ===');
  const proj = await request('POST', '/api/api/admin/v1/projects', { name: 'SSE 演示项目', description: 'SSE 流式透传验证' });
  projectId = proj.json.data.id;
  console.log(`[OK] projectId=${projectId}`);

  console.log('\n=== §A SSE 流式透传（下游返回 text/event-stream）===');
  // 创建指向 mock SSE /chat 的中转
  const sseRoute = await request('POST', `/api/api/admin/v1/projects/${projectId}/routes`, {
    projectId,
    method: 'POST',
    path: '/sse-chat',
    environment: 'prod',
    transformer: {
      target_url: 'http://localhost:9999/chat',
      type: 'direct',
    },
  });
  sseTransitId = sseRoute.json.data.route_id;
  console.log(`[OK] SSE transit created transitId=${sseTransitId}`);

  // 调用中转，期望 SSE 透传
  console.log('[..] 调用 SSE 中转...');
  const sseRes = await requestStream('POST', `/v1/transit/${sseTransitId}/invoke`, { message: '你好' });
  console.log(`[OK] status=${sseRes.status}`);
  console.log(`[OK] content-type=${sseRes.headers['content-type']}`);
  console.log(`[OK] x-accel-buffering=${sseRes.headers['x-accel-buffering']}`);
  console.log('[OK] SSE 原文响应：');
  console.log('---');
  console.log(sseRes.body);
  console.log('---');

  // 校验
  const isSSE = sseRes.headers['content-type']?.includes('text/event-stream');
  const hasDone = sseRes.body.includes('[DONE]');
  const hasTokens = sseRes.body.includes('"token":"你"') && sseRes.body.includes('"token":"世界"');
  if (isSSE && hasDone && hasTokens) {
    console.log('[PASS] SSE 流式透传验证通过 ✅');
  } else {
    console.log(`[FAIL] SSE 透传异常: isSSE=${isSSE} hasDone=${hasDone} hasTokens=${hasTokens}`);
    process.exit(1);
  }

  console.log('\n=== §B 同步 JSON 透传（下游返回 application/json）===');
  // 创建指向 mock /json 的中转
  const jsonRoute = await request('POST', `/api/api/admin/v1/projects/${projectId}/routes`, {
    projectId,
    method: 'POST',
    path: '/json-api',
    environment: 'prod',
    transformer: {
      target_url: 'http://localhost:9999/json',
      type: 'direct',
    },
  });
  jsonTransitId = jsonRoute.json.data.route_id;
  console.log(`[OK] JSON transit created transitId=${jsonTransitId}`);

  // 调用中转，期望同步 JSON（走 collectStreamToJson）
  console.log('[..] 调用 JSON 中转...');
  const jsonRes = await request('POST', `/v1/transit/${jsonTransitId}/invoke`, { message: 'test' }, false);
  console.log(`[OK] status=${jsonRes.status} response=${JSON.stringify(jsonRes.json)}`);

  // 校验：应当是标准 envelope 包装的同步 JSON
  if (jsonRes.json?.success === true && jsonRes.json?.data?.code === 0 && jsonRes.json?.data?.data?.hello === 'world') {
    console.log('[PASS] 同步 JSON 透传验证通过 ✅');
  } else {
    console.log(`[FAIL] JSON 透传异常: ${JSON.stringify(jsonRes.json)}`);
    process.exit(1);
  }

  console.log('\n=== 验证完成 ===');
  console.log(`projectId=${projectId}`);
  console.log(`sseTransitId=${sseTransitId}`);
  console.log(`jsonTransitId=${jsonTransitId}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
