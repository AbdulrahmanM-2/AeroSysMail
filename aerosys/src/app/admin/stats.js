import { getDB }       from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';
import { handleCors }   from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const db = getDB();
  const [
    { count: total_clients },
    { count: total_domains },
    { count: active_subs },
    { data: rev },
    { count: pending_inv },
    { data: recent_clients },
    { data: recent_domains },
  ] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    db.from('domains').select('*', { count: 'exact', head: true }),
    db.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('subscriptions').select('billing_cycle, plan:plans(price_monthly,price_yearly)').eq('status', 'active'),
    db.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('users').select('id,name,email,company,created_at,avatar_initials').eq('role','client').order('created_at',{ascending:false}).limit(5),
    db.from('domains').select('id,name,status,assigned_to,created_at').order('created_at',{ascending:false}).limit(5),
  ]);

  const mrr = (rev || []).reduce((sum, s) => {
    const price = s.billing_cycle === 'yearly'
      ? (s.plan?.price_yearly || 0) / 12
      : (s.plan?.price_monthly || 0);
    return sum + Number(price);
  }, 0);

  return res.json({
    total_clients:  total_clients  || 0,
    total_domains:  total_domains  || 0,
    active_subs:    active_subs    || 0,
    pending_invoices: pending_inv  || 0,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100,
    recent_clients: recent_clients || [],
    recent_domains: recent_domains || [],
  });
}
