import { getDB }       from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';
import { handleCors }   from '../../lib/cors.js';
import { getZoneId }    from '../../lib/cloudflare.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const db = getDB();

  // ── GET: list all domains with assigned user info ──────────
  if (req.method === 'GET') {
    const { data, error } = await db.from('domains')
      .select(`*, assigned_user:users!domains_assigned_to_fkey(id,name,email,company)`)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // ── POST: add a new domain to inventory ───────────────────
  if (req.method === 'POST') {
    const { name, registrar = 'Cloudflare', expiry_date, auto_renew = true, notes = '' } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Domain name required' });

    // Try to look up Cloudflare zone ID automatically
    let cloudflare_zone_id = '';
    try {
      cloudflare_zone_id = (await getZoneId(name)) || '';
    } catch { /* CF not configured — ok */ }

    const { data, error } = await db.from('domains')
      .insert({ name: name.toLowerCase(), registrar, expiry_date, auto_renew, notes,
                cloudflare_zone_id, added_by: admin.id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Domain already exists' });
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  }

  // ── PUT: update a domain ──────────────────────────────────
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Domain id required' });
    delete updates.added_by; // immutable
    const { data, error } = await db.from('domains').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // ── DELETE ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Domain id required' });
    const { error } = await db.from('domains').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ status: 'deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
