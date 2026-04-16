import { getDB }       from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';
import { handleCors }   from '../../lib/cors.js';
import { listDnsRecords, createDnsRecord, updateDnsRecord, deleteDnsRecord } from '../../lib/cloudflare.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const db = getDB();
  const domainId = req.query.domainId;
  if (!domainId) return res.status(400).json({ error: 'domainId query param required' });

  // Load domain (need zoneId for CF sync)
  const { data: domain } = await db.from('domains').select('*').eq('id', domainId).maybeSingle();
  if (!domain) return res.status(404).json({ error: 'Domain not found' });

  const hasCF = !!domain.cloudflare_zone_id;

  // ── GET: list DNS records ─────────────────────────────────
  if (req.method === 'GET') {
    // If CF zone exists, sync live records
    if (hasCF) {
      try {
        const cfRecords = await listDnsRecords(domain.cloudflare_zone_id);
        // Upsert each CF record into our DB (sync)
        for (const cfr of cfRecords) {
          await db.from('dns_records').upsert({
            domain_id: domainId, cf_record_id: cfr.id,
            type: cfr.type, name: cfr.name, value: cfr.content,
            ttl: cfr.ttl, priority: cfr.priority || 0, proxied: cfr.proxied,
          }, { onConflict: 'cf_record_id', ignoreDuplicates: false });
        }
      } catch (e) { console.warn('CF sync warn:', e.message); }
    }
    const { data, error } = await db.from('dns_records').select('*').eq('domain_id', domainId).order('type');
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ records: data, cf_synced: hasCF });
  }

  // ── POST: create DNS record ───────────────────────────────
  if (req.method === 'POST') {
    const { type, name, value, ttl = 3600, priority = 0, proxied = false } = req.body || {};
    if (!type || !name || !value) return res.status(400).json({ error: 'type, name and value required' });

    let cfRecordId = '';
    if (hasCF) {
      try {
        const cfr = await createDnsRecord(domain.cloudflare_zone_id, { type, name, content: value, ttl, priority, proxied });
        cfRecordId = cfr.id;
      } catch (e) { return res.status(502).json({ error: 'Cloudflare error: ' + e.message }); }
    }

    const { data, error } = await db.from('dns_records')
      .insert({ domain_id: domainId, cf_record_id: cfRecordId, type, name, value, ttl, priority, proxied })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  // ── PUT: update DNS record ────────────────────────────────
  if (req.method === 'PUT') {
    const { id, type, name, value, ttl, priority, proxied } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Record id required' });

    const { data: existing } = await db.from('dns_records').select('*').eq('id', id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Record not found' });

    if (hasCF && existing.cf_record_id) {
      try {
        await updateDnsRecord(domain.cloudflare_zone_id, existing.cf_record_id,
          { type: type || existing.type, name: name || existing.name,
            content: value || existing.value, ttl: ttl || existing.ttl,
            priority: priority ?? existing.priority, proxied: proxied ?? existing.proxied });
      } catch (e) { return res.status(502).json({ error: 'Cloudflare error: ' + e.message }); }
    }

    const updates = {};
    if (type)     updates.type     = type;
    if (name)     updates.name     = name;
    if (value)    updates.value    = value;
    if (ttl)      updates.ttl      = ttl;
    if (priority !== undefined) updates.priority = priority;
    if (proxied  !== undefined) updates.proxied  = proxied;

    const { data, error } = await db.from('dns_records').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // ── DELETE ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Record id required' });

    const { data: existing } = await db.from('dns_records').select('*').eq('id', id).maybeSingle();
    if (existing && hasCF && existing.cf_record_id) {
      try {
        await deleteDnsRecord(domain.cloudflare_zone_id, existing.cf_record_id);
      } catch (e) { return res.status(502).json({ error: 'Cloudflare error: ' + e.message }); }
    }

    const { error } = await db.from('dns_records').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ status: 'deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
