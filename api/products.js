import { Redis } from '@upstash/redis';
const r = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN });
export default async function handler(req, res) {
  const list = (await r.get('products')) || [];
  if (req.method === 'GET') return res.json(list);
  if (req.headers['x-admin'] !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  if (req.method === 'POST') { const p = { ...req.body, id: Date.now().toString() }; list.unshift(p); await r.set('products', list); return res.json(p); }
  if (req.method === 'DELETE') { await r.set('products', list.filter(p => p.id !== req.query.id)); return res.json({ ok: true }); }
  res.status(405).end();
}
