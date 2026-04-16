import { getDB }       from '../lib/db.js';
import { handleCors }   from '../lib/cors.js';
import { requireAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  const db = getDB();

  // Public GET — anyone can read plans
  if (req.method === 'GET') {
    const { data, error } = await db.from('plans')
      .select('*').eq('is_active', true).order('sort_order');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // Admin-only mutations
  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'POST') {
    const { name, slug, price_monthly, price_yearly, storage_gb, email_accounts, domains, bandwidth_gb, features } = req.body;
    if (!name || !slug || !price_monthly) return res.status(400).json({ error: 'name, slug, price_monthly required' });
    const { data, error } = await db.from('plans').insert({ name, slug, price_monthly, price_yearly, storage_gb, email_accounts, domains, bandwidth_gb, features }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'Plan id required' });
    const { data, error } = await db.from('plans').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
