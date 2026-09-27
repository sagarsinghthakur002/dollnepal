import { Router } from 'express';
import { createToken, verifyToken } from '../utils/token.js';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD || 'dollnepal-admin';

  if (typeof password !== 'string' || password !== adminPassword) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const token = createToken();
  res.json({ token });
});

router.get('/verify', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  res.json({ valid: verifyToken(token) });
});

export default router;
