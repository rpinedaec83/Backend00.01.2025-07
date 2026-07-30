import { hashPassword, verifyPassword } from '../utils/passwords.js';

const users = new Map(); // id -> { id, email, role, passwordHash }

const seed = [
  { id: 'u1', email: 'admin@example.com', role: 'admin', password: 'admin123' },
  { id: 'u2', email: 'user@example.com', role: 'user', password: 'user123' }
];

await (async () => {
  for (const u of seed) {
    const passwordHash = await hashPassword(u.password);
    users.set(u.id, { id: u.id, email: u.email, role: u.role, passwordHash });
  }
})();

export async function findUserByEmail(email) {
  for (const u of users.values()) if (u.email === email) return u;
  return null;
}

export async function findUserById(id) {
  return users.get(id) ?? null;
}

export async function validateCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}
