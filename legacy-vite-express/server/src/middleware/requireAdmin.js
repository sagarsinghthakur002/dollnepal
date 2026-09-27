import { verifyToken } from '../utils/token.js';

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized. Please log in again.' });
  }

  next();
}
