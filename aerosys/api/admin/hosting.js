import { getDB }       from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';
import { handleCors }   from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const db = getDB();

  if (req.method === 'GET') {
    const { data, error } = await db.from('hosting_assignments')
      .select(`*, domain:domains(name), user:users!hosting_assignments_user_id_fkey(name,email,company), plan:plans(name,slug)`)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { domain_id, user_id, plan_id, server_ip = '', server_host = '', notes = '' } = req.body || {};
    if (!domain_id || !user_id || !plan_id)
      return res.status(400).json({ error: 'domain_id, user_id and plan_id required' });

    // Assign domain to user
    await db.from('domains').update({ assigned_to: user_id }).eq('id', domain_id);

    // Create hosting assignment
    const { data, error } = await db.from('hosting_assignments')
      .insert({ domain_id, user_id, plan_id, server_ip, server_host, assigned_by: admin.id, notes })
      .select(`*, domain:domains(name), user:users!hosting_assignments_user_id_fkey(name,email), plan:plans(name,slug)`)
      .single();
    if (error) return res.status(500).json({ error: error.message });

    // Seed default DNS records (MX, SPF, DMARC) for the assigned domain
    const { data: domain } = await db.from('domains').select('name').eq('id', domain_id).single();
    if (domain) {
      const domainName = domain.name;
      const defaultRecords = [
        { domain_id, type: 'MX',  name: '@',      value: `mail.${domainName}`,  ttl: 3600, priority: 10 },
        { domain_id, type: 'TXT', name: '@',      value: `v=spf1 include:${domainName} ~all`, ttl: 3600 },
        { domain_id, type: 'TXT', name: '_dmarc', value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domainName}`, ttl: 3600 },
        { domain_id, type: 'A',   name: 'mail',   value: server_ip || '0.0.0.0', ttl: 3600 },
      ];
      await db.from('dns_records').upsert(defaultRecords, { onConflict: 'domain_id,type,name', ignoreDuplicates: true });
    }

    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    const { id, status, notes, server_ip } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Assignment id required' });
    const updates = {};
    if (status)    updates.status    = status;
    if (notes)     updates.notes     = notes;
    if (server_ip) updates.server_ip = server_ip;
    const { data, error } = await db.from('hosting_assignments').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
