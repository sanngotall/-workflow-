// 本地 mock SSE 服务，模拟 Dify/n8n 的流式响应
// 用法：node deployments/mock-sse-server.mjs
// 端口 9999，POST /chat 返回 text/event-stream
import http from 'http';

const PORT = 9999;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/chat') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // 模拟 Dify 风格的流式响应（5 个 chunk + [DONE]）
    const chunks = [
      { event: 'message', data: { token: '你', message_id: 'msg_001' } },
      { event: 'message', data: { token: '好', message_id: 'msg_001' } },
      { event: 'message', data: { token: '，', message_id: 'msg_001' } },
      { event: 'message', data: { token: '世界', message_id: 'msg_001' } },
      { event: 'message', data: { token: '！', message_id: 'msg_001' } },
      { event: 'message_end', data: { message_id: 'msg_001', conversation_id: 'conv_001' } },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= chunks.length) {
        res.write('data: [DONE]\n\n');
        clearInterval(interval);
        res.end();
        return;
      }
      const chunk = chunks[i++];
      // Dify 风格：event: xxx\ndata: {...json...}\n\n
      res.write(`event: ${chunk.event}\n`);
      res.write(`data: ${JSON.stringify(chunk.data)}\n\n`);
    }, 300);

    req.on('close', () => {
      clearInterval(interval);
      if (!res.writableEnded) res.end();
    });
    return;
  }

  // 非 SSE 端点：返回普通 JSON（验证同步路径仍正常）
  if (req.method === 'POST' && req.url === '/json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 0, message: '同步 JSON 响应', data: { hello: 'world' } }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`[Mock SSE Server] listening on http://localhost:${PORT}`);
  console.log(`  POST /chat  → text/event-stream（模拟 Dify 流式）`);
  console.log(`  POST /json  → application/json（同步响应）`);
});
