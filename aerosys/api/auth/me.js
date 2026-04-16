import { getDB }      from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { handleCors }  from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = requireAuth(req, res);
  if (!user) return;
  const db = getDB();
  const { data, error } = await db.from('users')
    .select('id,name,email,role,company,status,avatar_initials,created_at')
    .eq('id', user.id).maybeSingle();
  if (error || !data) return res.status(404).json({ error: 'User not found' });
  if (data.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
  return res.json(data);
}
