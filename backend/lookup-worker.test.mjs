import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, sanitizeLookup } from './lookup-worker.mjs';

const origin = 'https://anhhphuong06.github.io';
const request = (username = 'demo', extra = {}) => new Request('https://lookup.test/api/locket/lookup', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify({ username }) });
test('only public display fields leave the proxy, including unknown Gold', async () => {
  const raw = { success: true, username: 'demo', name: 'Demo', raw_avatar: 'https://cdn2.locketcamera.com/avatar.webp', is_gold: true, package_name: 'Trial', expires_at: '2026-12-01T00:00:00Z', uid: 'private-uid', existing_activation_code: 'private-code', deviceToken: 'private-token', holder: 'private-holder' };
  const result = sanitizeLookup(raw, 'demo', 0);
  assert.equal(result.is_gold, true); assert.equal(result.avatar, raw.raw_avatar);
  for (const secret of ['private-uid','private-code','private-token','private-holder']) assert.ok(!JSON.stringify(result).includes(secret));
  assert.equal(sanitizeLookup({ success: true, username: 'demo', avatar: 'javascript:alert(1)' }, 'demo', 0).is_gold, null);
  assert.equal(sanitizeLookup({ success: true, username: 'demo', raw_avatar: 'https://evil.test/a.jpg' }, 'demo', 0).avatar, null);
  assert.throws(() => sanitizeLookup({ success:true,username:'someone_else' }, 'demo'));
});
test('valid lookup accepts GitHub origin and caches only sanitized result', async () => {
  let calls = 0;
  const handle = createHandler({ upstreamFetch: async (url, options) => { calls++; assert.equal(url, 'https://uplocket.io.vn/api/locket/lookup'); assert.deepEqual(JSON.parse(options.body), { username: 'demo' }); return Response.json({ success:true,username:'demo',is_gold:false,existing_activation_code:'hidden' }); } });
  const first = await handle(request('https://locket.cam/demo'));
  assert.equal(first.status, 200); assert.equal(first.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal((await first.json()).is_gold, false);
  await handle(request()); assert.equal(calls, 1);
});
test('invalid input, disallowed origins and non-lookup routes never contact provider', async () => {
  const handle = createHandler({ upstreamFetch: async () => { throw new Error('should not contact provider'); } });
  assert.equal((await handle(request('https://evil.test/demo'))).status, 400);
  assert.equal((await handle(request('demo', { Origin:'https://evil.test' }))).status, 403);
  assert.equal((await handle(new Request('https://lookup.test/api/orders'))).status, 404);
  const preflight = await handle(new Request('https://lookup.test/api/locket/lookup', { method:'OPTIONS',headers:{Origin:origin} }));
  assert.equal(preflight.status, 204);
});
test('provider failure stays unknown rather than returning inactive Gold', async () => {
  const handle = createHandler({ upstreamFetch:async () => new Response('Forbidden',{status:403}) });
  const result = await handle(request()); assert.equal(result.status, 502);
  const data = await result.json(); assert.equal(data.success,false); assert.equal(data.is_gold,undefined);
});
test('lookup request budget limits repeated requests', async () => {
  const handle = createHandler({ upstreamFetch:async () => Response.json({success:true,username:'demo',is_gold:true}) });
  for(let n=0;n<15;n++) assert.equal((await handle(request())).status,200);
  assert.equal((await handle(request())).status,429);
});
