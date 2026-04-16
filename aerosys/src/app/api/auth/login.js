import bcrypt from 'bcryptjs';
import { getDB }      from '../../lib/db.js';
import { signToken }  from '../../lib/auth.js';
import { handleCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const db = getDB();
    const { data: user, error } = await db.from('users')
      .select('id,name,email,role,company,avatar_initials,password_hash,status')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !user)
      return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status === 'suspended')
      return res.status(403).json({ error: 'Account suspended. Contact support.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const { password_hash, ...safe } = user;
    const token = signToken({ id: safe.id, email: safe.email, role: safe.role, name: safe.name });
    return res.status(200).json({ token, user: safe });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}
