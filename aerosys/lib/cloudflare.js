/**
 * AeroSysMail — Cloudflare DNS API
 * Wraps Cloudflare v4 API for live DNS record management.
 * Docs: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records
 */

const CF_BASE = 'https://api.cloudflare.com/client/v4';

function cfHeaders() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error('CLOUDFLARE_API_TOKEN not set');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json',
  };
}

/** GET /zones?name=domain.com — find zone ID for a domain */
export async function getZoneId(domain) {
  const r = await fetch(`${CF_BASE}/zones?name=${domain}&status=active`, { headers: cfHeaders() });
  const j = await r.json();
  if (!j.success || !j.result.length) return null;
  return j.result[0].id;
}

/** List all DNS records for a zone */
export async function listDnsRecords(zoneId) {
  const r = await fetch(`${CF_BASE}/zones/${zoneId}/dns_records?per_page=100`, { headers: cfHeaders() });
  const j = await r.json();
  if (!j.success) throw new Error(j.errors?.[0]?.message || 'Cloudflare list failed');
  return j.result;
}

/** Create a DNS record */
export async function createDnsRecord(zoneId, { type, name, content, ttl = 1, priority, proxied = false }) {
  const body = { type, name, content, ttl, proxied };
  if (priority !== undefined) body.priority = priority;
  const r = await fetch(`${CF_BASE}/zones/${zoneId}/dns_records`, {
    method: 'POST', headers: cfHeaders(), body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.errors?.[0]?.message || 'Cloudflare create failed');
  return j.result;
}

/** Update an existing DNS record */
export async function updateDnsRecord(zoneId, cfRecordId, { type, name, content, ttl = 1, priority, proxied = false }) {
  const body = { type, name, content, ttl, proxied };
  if (priority !== undefined) body.priority = priority;
  const r = await fetch(`${CF_BASE}/zones/${zoneId}/dns_records/${cfRecordId}`, {
    method: 'PUT', headers: cfHeaders(), body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.errors?.[0]?.message || 'Cloudflare update failed');
  return j.result;
}

/** Delete a DNS record */
export async function deleteDnsRecord(zoneId, cfRecordId) {
  const r = await fetch(`${CF_BASE}/zones/${zoneId}/dns_records/${cfRecordId}`, {
    method: 'DELETE', headers: cfHeaders(),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.errors?.[0]?.message || 'Cloudflare delete failed');
  return j.result;
}

/** Verify a TXT record exists with specific content */
export async function verifyTxtRecord(zoneId, name, expectedContent) {
  const records = await listDnsRecords(zoneId);
  return records.some(r => r.type === 'TXT' && r.name.startsWith(name) && r.content.includes(expectedContent));
}
