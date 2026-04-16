import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-replace-in-production';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/** Extract and verify Bearer token from request headers.
 *  Returns { user } on success, sends 401 and returns null on failure. */
export function requireAuth(req, res) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) { res.status(401).json({ error: 'Authentication required' }); return null; }
  try {
    const user = verifyToken(token);
    return user;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

/** Same as requireAuth but also checks role === 'admin'. */
export function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return user;
}
