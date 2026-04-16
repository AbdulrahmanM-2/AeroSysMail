import { getDB }      from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { handleCors }  from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = requireAuth(req, res);
  if (!user) return;

  const db = getDB();
  const uid = user.id;

  const [{ data: domains }, { data: subs }, { data: hosting }, { data: invoices }, { data: mailboxes }] =
    await Promise.all([
      db.from('domains').select('*, dns_records(count)').eq('assigned_to', uid),
      db.from('subscriptions').select('*, plan:plans(name,slug,storage_gb,email_accounts,price_monthly)').eq('user_id', uid).eq('status', 'active'),
      db.from('hosting_assignments').select('*, domain:domains(name), plan:plans(name,storage_gb)').eq('user_id', uid).eq('status', 'active'),
      db.from('invoices').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10),
      db.from('mailboxes').select('*').eq('user_id', uid),
    ]);

  return res.json({
    domains:   domains   || [],
    subs:      subs      || [],
    hosting:   hosting   || [],
    invoices:  invoices  || [],
    mailboxes: mailboxes || [],
    stats: {
      domain_count:   (domains   || []).length,
      mailbox_count:  (mailboxes || []).length,
      active_plan:    subs?.[0]?.plan?.name || null,
      next_invoice:   invoices?.find(i => i.status === 'pending'),
      storage_used_gb: hosting?.reduce((s, h) => s + ((h.storage_used_mb || 0) / 1024), 0) || 0,
      storage_limit_gb: subs?.[0]?.plan?.storage_gb || 0,
    },
  });
}
