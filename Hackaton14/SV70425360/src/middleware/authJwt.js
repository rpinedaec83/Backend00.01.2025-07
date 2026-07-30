import { verifyAccess } from '../utils/tokens.js';
import { isAccessRevoked } from '../services/token.service.js';

export function requireAuthJwt(req, res, next) {
  const h = req.headers.authorization || '';
  const [, token] = h.split(' ');
  if (!token) return res.status(401).json({ error: 'missing_bearer' });
  try {
    const payload = verifyAccess(token);
    if (isAccessRevoked(payload.jti)) return res.status(401).json({ error: 'token_revoked' });
    req.user = { id: payload.sub, role: payload.role, email: payload.email, jti: payload.jti };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_or_expired' });
  }
}
