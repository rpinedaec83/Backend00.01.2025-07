import { Router } from 'express';
import { validateCredentials, findUserById } from '../services/user.service.js';
import { requireAuthJwt } from '../middleware/authJwt.js';
import { issueTokens, rotateRefresh, revokeAccessJti, revokeRefreshJti } from '../services/token.service.js';

export const jwtRouter = Router();

function setRefreshCookie(res, token) {
  res.cookie('refresh', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/jwt'
  });
}

jwtRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await validateCredentials(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const { accessToken, refreshToken } = issueTokens(user);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
});

jwtRouter.post('/refresh', (req, res) => {
  try {
    const token = req.cookies?.refresh || req.body?.refreshToken;
    if (!token) return res.status(400).json({ error: 'missing_refresh' });
    const rotated = rotateRefresh(token);
    setRefreshCookie(res, rotated.refreshToken);
    res.json({ accessToken: rotated.accessToken });
  } catch (e) {
    return res.status(401).json({ error: 'invalid_refresh' });
  }
});

jwtRouter.post('/logout', requireAuthJwt, (req, res) => {
  const token = req.cookies?.refresh || req.body?.refreshToken;
  revokeAccessJti(req.user.jti);
  if (token) {
    try {
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
      revokeRefreshJti(payload.jti);
    } catch {}
  }
  res.clearCookie('refresh', { path: '/jwt' });
  res.json({ ok: true });
});

jwtRouter.get('/me', requireAuthJwt, async (req, res) => {
  const u = await findUserById(req.user.id);
  res.json({ id: u.id, email: u.email, role: u.role });
});
