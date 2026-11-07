import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHandler } from './lookup-worker.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.LOOKUP_PORT || 8014);
const fixtureMode = process.env.LOOKUP_FIXTURES === '1';
const handler = createHandler(fixtureMode ? { upstreamFetch: async (_url, options) => {
  const { username } = JSON.parse(options.body);
  if (username === 'test_error') return new Response('Unavailable', { status: 503 });
  if (username === 'test_slow') await new Promise(resolve => setTimeout(resolve, 600));
  return Response.json({ success: true, username, name: 'Test ' + username,
    is_gold: username === 'test_unknown' ? undefined : username === 'test_gold',
    package_name: username === 'test_gold' ? 'Gói dùng thử' : null,
    expires_at: username === 'test_gold' ? '2026-12-10T14:40:00Z' : null,
    existing_activation_code: 'MUST_NOT_REACH_BROWSER', holder: 'MUST_NOT_REACH_BROWSER' });
} } : {});
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.mobileconfig':'application/x-apple-aspen-config', '.cer':'application/pkix-cert' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:' + port);
    if (url.pathname === '/api/locket/lookup' || url.pathname === '/health') {
      const chunks = []; let length = 0;
      for await (const chunk of req) { length += chunk.length; if (length > 2048) { res.writeHead(413);res.end();return; } chunks.push(chunk); }
      const request = new Request(url, { method:req.method, headers:req.headers, ...(['GET','HEAD'].includes(req.method) ? {} : { body:Buffer.concat(chunks) }) });
      const response = await handler(request, { ALLOWED_ORIGINS:'http://127.0.0.1:' + port });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filename = path.resolve(root, '.' + pathname);
    if (!filename.startsWith(root) || /(?:^|[\\/])\.(?:git|env|openai)(?:[\\/]|$)/.test(filename)) { res.writeHead(403);res.end();return; }
    const data = await readFile(filename);
    res.writeHead(200, { 'Content-Type':mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control':'no-store' });res.end(data);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain' });res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:' + port + (fixtureMode ? ' (test fixtures)' : ' (live read-only lookup)')));
