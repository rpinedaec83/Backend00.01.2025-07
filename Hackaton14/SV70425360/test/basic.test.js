import request from 'supertest';
import { app } from '../src/app.js';

const agent = request.agent(app);

await test('health ok', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
});

await test('session login fails with wrong password', async () => {
  const res = await agent.post('/session/login').send({ email: 'a@a.com', password: 'x' });
  expect(res.status).toBe(401);
});

await test('session login ok and /session/me works', async () => {
  const res1 = await agent.post('/session/login').send({ email: 'user@example.com', password: 'user123' });
  expect(res1.status).toBe(200);
  const res2 = await agent.get('/session/me');
  expect(res2.status).toBe(200);
  expect(res2.body.email).toBe('user@example.com');
});

await test('jwt login/refresh/logout flow', async () => {
  const login = await request(app).post('/jwt/login').send({ email: 'user@example.com', password: 'user123' });
  expect(login.status).toBe(200);
  const access = login.body.accessToken;
  expect(access).toBeTruthy();

  const me = await request(app).get('/jwt/me').set('Authorization', `Bearer ${access}`);
  expect(me.status).toBe(200);

  const cookie = login.headers['set-cookie']?.find(c => c.startsWith('refresh='));
  const refresh = await request(app).post('/jwt/refresh').set('Cookie', cookie);
  expect(refresh.status).toBe(200);

  const logout = await request(app).post('/jwt/logout').set('Authorization', `Bearer ${access}`).set('Cookie', cookie);
  expect(logout.status).toBe(200);
});

await test('admin stats requires role', async () => {
  const loginAdmin = await request(app).post('/jwt/login').send({ email: 'admin@example.com', password: 'admin123' });
  const accessAdmin = loginAdmin.body.accessToken;
  const ok = await request(app).get('/private/admin/stats').set('Authorization', `Bearer ${accessAdmin}`);
  expect(ok.status).toBe(200);

  const loginUser = await request(app).post('/jwt/login').send({ email: 'user@example.com', password: 'user123' });
  const accessUser = loginUser.body.accessToken;
  const forbidden = await request(app).get('/private/admin/stats').set('Authorization', `Bearer ${accessUser}`);
  expect(forbidden.status).toBe(403);
});
