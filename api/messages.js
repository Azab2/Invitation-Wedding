const TABLE = 'messages';

function cors(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-admin-token, content-type');
  if (process.env.VERCEL_REGION) {} // no-op
}

function send(res, status, body) {
  cors(res);
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function sanitize(text, maxLen) {
  return String(text || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLen);
}

function rest() {
  return (process.env.SUPABASE_URL || '') + '/rest/v1/' + TABLE;
}

async function supabaseReq(path, init) {
  const headers = {
    'apikey': process.env.SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + process.env.SUPABASE_ANON_KEY
  };
  if (init && init.headers) {
    Object.assign(headers, init.headers);
  }
  const resp = await fetch(rest() + path, Object.assign({}, init, { headers }));
  const text = await resp.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = text; }
  }
  if (!resp.ok) {
    const detail = data && data.message ? ': ' + data.message : '';
    throw new Error('supabase ' + resp.status + detail);
  }
  return data;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      cors(res);
      res.statusCode = 200;
      res.end('{}');
      return;
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return send(res, 500, { error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' });
    }

    const method = (req.method || '').toUpperCase();

    if (method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      let parsed = {};
      try { parsed = JSON.parse(body); } catch (e) {}
      const guest_name = sanitize(parsed.name, 100);
      const message = sanitize(parsed.message, 2000);
      if (!guest_name || !message) return send(res, 400, { error: 'Name and message are required' });

      await supabaseReq('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          wedding_id: process.env.WEDDING_ID,
          guest_name: guest_name,
          message: message
        })
      });
      return send(res, 201, { ok: true });
    }

    if (method === 'GET') {
      const token = req.headers['x-admin-token'] || '';
      if (token !== (process.env.ADMIN_TOKEN || 'azab@123')) {
        return send(res, 401, { error: 'Unauthorized' });
      }
      const rows = await supabaseReq(
        '?select=guest_name,message,created_at&wedding_id=eq.' + process.env.WEDDING_ID + '&order=created_at.asc'
      );
      const messages = (Array.isArray(rows) ? rows : []).map(r => ({
        name: r.guest_name,
        message: r.message,
        timestamp: r.created_at
      }));
      return send(res, 200, messages);
    }

    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return send(res, 500, { error: 'Server error: ' + (e.message || 'unknown') });
  }
};