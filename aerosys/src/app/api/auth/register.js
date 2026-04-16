import bcrypt from 'bcryptjs';
import { getDB }      from '../../lib/db.js';
import { signToken }  from '../../lib/auth.js';
import { handleCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, password, company = '' } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address' });

    const db = getDB();

    // Check duplicate
    const { data: existing } = await db.from('users').select('id').eq('email', email.toLowerCase()).maybeSingle();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash     = await bcrypt.hash(password, 12);
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const { data: user, error } = await db.from('users')
      .insert({ name, email: email.toLowerCase(), password_hash: hash, company, role: 'client', avatar_initials: initials })
      .select('id,name,email,role,company,avatar_initials')
      .single();

    if (error) throw error;

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}
