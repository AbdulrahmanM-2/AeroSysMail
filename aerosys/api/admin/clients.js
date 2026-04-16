import { getDB }       from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';
import { handleCors }   from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const db = getDB();

  if (req.method === 'GET') {
    // List all clients with their subscriptions and domains
    const { data: clients, error } = await db.from('users')
      .select(`
        id, name, email, company, status, avatar_initials, created_at,
        subscriptions(id, status, billing_cycle, current_period_end,
          plan:plans(name, slug, price_monthly),
          domain:domains(name)
        )
      `)
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Add domain count per client
    const clientIds = clients.map(c => c.id);
    const { data: domainCounts } = await db.from('domains')
      .select('assigned_to')
      .in('assigned_to', clientIds);

    const countMap = {};
    (domainCounts || []).forEach(d => { countMap[d.assigned_to] = (countMap[d.assigned_to] || 0) + 1; });

    return res.json(clients.map(c => ({ ...c, domain_count: countMap[c.id] || 0 })));
  }

  if (req.method === 'PUT') {
    const { id, status, name, company } = req.body || {};
    if (!id) return res.status(400).json({ error: 'User id required' });
    const updates = {};
    if (status)  updates.status  = status;
    if (name)    updates.name    = name;
    if (company) updates.company = company;
    const { data, error } = await db.from('users').update(updates).eq('id', id).eq('role', 'client').select('id,name,email,status,company').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'User id required' });
    await db.from('subscriptions').delete().eq('user_id', id);
    await db.from('domains').update({ assigned_to: null }).eq('assigned_to', id);
    const { error } = await db.from('users').delete().eq('id', id).eq('role', 'client');
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ status: 'deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
