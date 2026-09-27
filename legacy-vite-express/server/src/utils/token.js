import crypto from 'crypto';

const SECRET = process.env.TOKEN_SECRET || 'dev-only-secret';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

export function createToken() {
  const payload = JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS });
  const encoded = Buffer.from(payload).toString('base64url');
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [encoded, signature] = token.split('.');
  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature || '');
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}
