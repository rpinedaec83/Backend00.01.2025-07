import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { randomBytes } from 'crypto';

export function signAccess(payload) {
  const jti = randomBytes(16).toString('base64url');
  const token = jwt.sign({ ...payload, jti }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TTL });
  return { token, jti };
}

export function signRefresh(payload, jti) {
  return jwt.sign({ ...payload, jti }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TTL });
}

export function verifyAccess(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
