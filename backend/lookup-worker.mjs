const UPSTREAM = 'https://uplocket.io.vn/api/locket/lookup';
const DEFAULT_ORIGIN = 'https://anhhphuong06.github.io';

export function normalizeUsername(value) {
  if (typeof value !== 'string' || value.length > 512) throw new Error('invalid');
  let username = value.trim();
  if (username.startsWith('https://')) {
    const url = new URL(username);
    if (url.hostname !== 'locket.cam' || url.port || url.username || url.password) throw new Error('invalid');
    username = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  }
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(username) || username === '.' || username === '..') throw new Error('invalid');
  return username;
}

function safeText(value, limit) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, limit) : null;
}

function publicAvatar(data) {
  for (const candidate of [data.raw_avatar, data.avatar]) {
    if (typeof candidate !== 'string' || candidate.length > 4096) continue;
    try {
      const url = new URL(candidate, 'https://uplocket.io.vn');
      const allowed = url.hostname.endsWith('.locketcamera.com') || url.hostname === 'firebasestorage.googleapis.com';
      if (url.protocol === 'https:' && allowed && !url.username && !url.password) return url.href;
    } catch {}
  }
  return null;
}

export function sanitizeLookup(data, requested, now = Date.now()) {
  if (!data || data.success !== true || data.exists === false) return null;
  const username = normalizeUsername(data.username || requested);
  if (username.toLowerCase() !== requested.toLowerCase()) throw new Error('mismatched profile');
  const expiry = typeof data.expires_at === 'string' ? new Date(data.expires_at) : null;
  return {
    success: true,
    provider: 'uplocket',
    username,
    name: safeText(data.name, 100),
    avatar: publicAvatar(data),
    is_gold: typeof data.is_gold === 'boolean' ? data.is_gold : null,
    package_name: safeText(data.package_name, 120),
    expires_at: expiry && Number.isFinite(expiry.getTime()) ? expiry.toISOString() : null,
    checked_at: new Date(now).toISOString()
  };
}

export function createHandler({ upstreamFetch = (...args) => globalThis.fetch(...args), clock = Date.now } = {}) {
  const cache = new Map();
  const buckets = new Map();
  return async function handle(request, env = {}) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = new Set([DEFAULT_ORIGIN, url.origin, ...(env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)]);
    const cors = origin && allowed.has(origin) ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {};
    const headers = { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    const reply = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } });
    if (origin && !allowed.has(origin)) return reply({ success: false, error: 'Origin is not allowed' }, 403);
    if (url.pathname === '/health' || url.pathname === '/') {
      if (request.method !== 'GET') return reply({ success: false, error: 'Method not allowed' }, 405);
      return reply({ service: 'AnhhPhuongg profile lookup', provider: 'uplocket', read_only: true, status: 'ok' });
    }
    if (url.pathname !== '/api/locket/lookup') return reply({ success: false, error: 'Not found' }, 404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } });
    if (request.method !== 'POST') return reply({ success: false, error: 'Use POST' }, 405, { Allow: 'POST, OPTIONS' });
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply({ success: false, error: 'JSON required' }, 415);
    let username;
    try {
      const text = await request.text();
      if (text.length > 1024) return reply({ success: false, error: 'Request too large' }, 413);
      username = normalizeUsername(JSON.parse(text).username);
    } catch { return reply({ success: false, error: 'Link Locket không hợp lệ.' }, 400); }
    const now = clock();
    const client = request.headers.get('CF-Connecting-IP') || 'local';
    const bucket = buckets.get(client);
    if (bucket && now < bucket.until && bucket.count >= 15) return reply({ success: false, error: 'Vui lòng thử lại sau ít phút.' }, 429, { 'Retry-After': '60' });
    if (bucket && now < bucket.until) bucket.count++;
    else buckets.set(client, { count: 1, until: now + 60000 });
    if (buckets.size > 512) buckets.delete(buckets.keys().next().value);
    const key = username.toLowerCase();
    const cached = cache.get(key);
    if (cached && cached.until > now) return reply(cached.data);
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 10000);
    let stage = 'fetch';
    try {
      const upstream = await upstreamFetch(UPSTREAM, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'AnhhPhuonggProfileLookup/1.0' },
        body: JSON.stringify({ username }), signal: abort.signal, redirect: 'manual'
      });
      stage = 'response';
      if (upstream.status === 429) return reply({ success: false, error: 'Uplocket đang giới hạn tra cứu. Hãy thử lại sau.' }, 429, { 'Retry-After': '60' });
      if (!upstream.ok) return reply({ success: false, error: 'Chưa tra cứu được Uplocket. Vui lòng thử lại sau.' }, 502);
      const text = await upstream.text();
      stage = 'parse';
      if (text.length > 65536) throw new Error('Upstream response too large');
      const data = sanitizeLookup(JSON.parse(text), username, now);
      if (!data) return reply({ success: false, error: 'Uplocket chưa trả về tài khoản phù hợp.' }, 404);
      cache.set(key, { data, until: now + 30000 });
      if (cache.size > 128) cache.delete(cache.keys().next().value);
      return reply(data);
    } catch (error) {
      console.error('Lookup upstream failure', { stage, kind: error?.name || 'Error', ...(stage === 'fetch' ? { message: String(error?.message || '').slice(0, 160) } : {}) });
      return reply({ success: false, error: 'Không kết nối được dịch vụ tra cứu. Chưa xác định trạng thái Gold.' }, 502);
    }
    finally { clearTimeout(timeout); }
  };
}

export default { fetch: createHandler() };
