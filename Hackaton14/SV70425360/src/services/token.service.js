import { signAccess, signRefresh, verifyRefresh } from '../utils/tokens.js';
import { randomBytes } from 'crypto';

const refreshStore = new Map(); // jti -> { jti, userId, revoked, expiresAt }
const accessBlacklist = new Set(); // jti de access revocados (opcional)

export function issueTokens(user) {
  const payload = { sub: user.id, role: user.role, email: user.email };
  const { token: accessToken, jti: accessJti } = signAccess(payload);
  const refreshJti = randomBytes(16).toString('base64url');
  const refreshToken = signRefresh(payload, refreshJti);

  const expiresAt = decodeExp(refreshToken);
  refreshStore.set(refreshJti, { jti: refreshJti, userId: user.id, revoked: false, expiresAt });

  return { accessToken, accessJti, refreshToken, refreshJti };
}

export function revokeAccessJti(jti) {
  if (jti) accessBlacklist.add(jti);
}

export function isAccessRevoked(jti) {
  return !!(jti && accessBlacklist.has(jti));
}

export function revokeRefreshJti(jti) {
  const row = refreshStore.get(jti);
  if (row) row.revoked = true;
}

export function isRefreshValid(jti) {
  const row = refreshStore.get(jti);
  return !!(row && !row.revoked && row.expiresAt > Date.now());
}

export function rotateRefresh(oldToken) {
  const payload = verifyRefresh(oldToken); // lanza si inválido/expirado
  const oldJti = payload.jti;
  if (!isRefreshValid(oldJti)) throw new Error('refresh_revoked_or_expired');
  revokeRefreshJti(oldJti);

  const userPayload = { sub: payload.sub, role: payload.role, email: payload.email };
  const { token: accessToken, jti: accessJti } = signAccess(userPayload);
  const newJti = randomBytes(16).toString('base64url');
  const refreshToken = signRefresh(userPayload, newJti);
  const expiresAt = decodeExp(refreshToken);
  refreshStore.set(newJti, { jti: newJti, userId: payload.sub, revoked: false, expiresAt });

  return { accessToken, accessJti, refreshToken, refreshJti: newJti };
}

function decodeExp(jwtStr) {
  const [, payloadB64] = jwtStr.split('.');
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
  return payload.exp * 1000;
}
