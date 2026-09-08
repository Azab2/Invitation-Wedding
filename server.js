import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;
const TABLE = 'messages';

function loadEnv() {
  const path = join(ROOT, '.env');
  if (!existsSync(path)) return;
  const data = readFileSync(path, 'utf8');
  for (const line of data.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const cors = res => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
};

const send = (res, status, body) => {
  cors(res);
  res.statusCode = status;
  res.end(JSON.stringify(body));
};

function sanitize(text, maxLen) {
  return String(text || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLen);
}

async function saveMessage(guestName, message) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ wedding_id: process.env.WEDDING_ID, guest_name: guestName, message })
  });
  if (!res.ok) throw new Error(`supabase insert failed: ${res.status}`);
  return res.json();
}

async function listMessages() {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/${TABLE}?select=guest_name,message,created_at&wedding_id=eq.${process.env.WEDDING_ID}&order=created_at.asc`,
    { headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error(`supabase select failed: ${res.status}`);
  const rows = await res.json();
  return rows.map(r => ({ name: r.guest_name, message: r.message, timestamp: r.created_at }));
}

function readBody(req) {
  return new Promise(resolve => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
}

async function handleApi(req, res, url) {
  const method = (req.method || '').toUpperCase();

  if (method === 'POST') {
    const body = await readBody(req);
    const guest_name = sanitize(body.name, 100);
    const message = sanitize(body.message, 2000);
    if (!guest_name || !message) return send(res, 400, { error: 'Name and message are required' });
    try {
      await saveMessage(guest_name, message);
      return send(res, 201, { ok: true });
    } catch (e) {
      return send(res, 500, { error: 'Could not save message' });
    }
  }

  if (method === 'GET') {
    const provided = req.headers['x-admin-token'] || '';
    const adminToken = process.env.ADMIN_TOKEN || 'azab@123';
    if (!provided || provided !== adminToken) return send(res, 401, { error: 'Unauthorized' });
    try {
      const messages = await listMessages();
      return send(res, 200, messages);
    } catch (e) {
      return send(res, 500, { error: 'Could not load messages' });
    }
  }

  return send(res, 405, { error: 'Method not allowed' });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/api/')) return handleApi(req, res, url);

  let filePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (!filePath) filePath = 'index.html';
  if (pathname === '/admin') filePath = 'admin.html';

  let abs = normalize(join(ROOT, filePath));
  if (!abs.startsWith(ROOT)) { res.statusCode = 403; return res.end('Forbidden'); }

  if (existsSync(abs) && statSync(abs).isDirectory()) abs = join(abs, 'index.html');

  if (!existsSync(abs)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end('<h3 style="font-family:sans-serif;color:#9c5a74">404 — Not Found</h3>');
  }

  res.setHeader('Content-Type', MIME[extname(abs).toLowerCase()] || 'application/octet-stream');
  createReadStream(abs).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Wedding invitation running at http://localhost:${PORT}`);
  console.log('Admin page: http://localhost:' + PORT + '/admin  (ADMIN_TOKEN = ' + (process.env.ADMIN_TOKEN || 'azab@123') + ')');
});