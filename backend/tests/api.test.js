const request = require('supertest');
const db = require('./setup');

let app;
beforeAll(async () => {
  await db.connect();
  app = require('../src/app');
});
afterAll(() => db.disconnect());
beforeEach(() => db.clear());

const signup = (u) => request(app).post('/api/v1/user/signup').send(u);
async function makeUser(name) {
  const creds = { email: `${name}@example.com`, username: name, password: 'password123' };
  await signup(creds).expect(201);
  const { body } = await request(app).post('/api/v1/user/signin').send(creds).expect(200);
  const me = await request(app).get('/api/v1/user/me').set('Authorization', `Bearer ${body.token}`).expect(200);
  return { token: body.token, id: me.body._id, auth: { Authorization: `Bearer ${body.token}` } };
}
const balance = async (u) => (await request(app).get('/api/v1/account/balance').set(u.auth)).body.balance;
const transfer = (u, body) => request(app).post('/api/v1/account/transfer').set(u.auth).send(body);

describe('health', () => {
  it('reports database readiness', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('auth', () => {
  it('creates a user with a starting balance and never stores the plain password', async () => {
    const alice = await makeUser('alice');
    expect(await balance(alice)).toBe(1000);
    const { User } = require('../src/models');
    const stored = await User.findById(alice.id).select('+passwordHash');
    expect(stored.passwordHash).not.toBe('password123');
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('rejects duplicate emails (case-insensitive) and weak input', async () => {
    await makeUser('alice');
    await signup({ email: 'ALICE@example.com', username: 'x2', password: 'password123' }).expect(409);
    await signup({ email: 'not-an-email', username: 'bob', password: 'password123' }).expect(400);
    await signup({ email: 'b@example.com', username: 'bob', password: 'short' }).expect(400);
  });

  it('returns the same error for a wrong password and an unknown email', async () => {
    await makeUser('alice');
    const wrong = await request(app).post('/api/v1/user/signin').send({ email: 'alice@example.com', password: 'nope-nope' });
    const unknown = await request(app).post('/api/v1/user/signin').send({ email: 'ghost@example.com', password: 'nope-nope' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it('protects routes and rejects tampered tokens', async () => {
    await request(app).get('/api/v1/account/balance').expect(401);
    await request(app).get('/api/v1/user/me').set('Authorization', 'Bearer abc.def.ghi').expect(401);
  });
});

describe('users', () => {
  it('searches safely: excludes self, treats regex characters literally, never crashes', async () => {
    const alice = await makeUser('alice');
    await makeUser('bob');
    const found = await request(app).get('/api/v1/user/bulk?filter=bo').set(alice.auth).expect(200);
    expect(found.body.user.map((u) => u.username)).toEqual(['bob']);
    const self = await request(app).get('/api/v1/user/bulk?filter=alice').set(alice.auth).expect(200);
    expect(self.body.user).toHaveLength(0);
    await request(app).get('/api/v1/user/bulk').query({ filter: '(' }).set(alice.auth).expect(200);
  });

  it('only allows username and password updates', async () => {
    const alice = await makeUser('alice');
    await request(app).put('/api/v1/user/update').set(alice.auth).send({ email: 'hacked@example.com' }).expect(400);
    await request(app).put('/api/v1/user/update').set(alice.auth).send({}).expect(400);
    await request(app).put('/api/v1/user/update').set(alice.auth).send({ username: 'alice2' }).expect(200);
    const me = await request(app).get('/api/v1/user/me').set(alice.auth);
    expect(me.body.username).toBe('alice2');
    expect(me.body.email).toBe('alice@example.com');
  });
});

describe('transfers', () => {
  it('moves money atomically and records history for both parties', async () => {
    const [alice, bob] = [await makeUser('alice'), await makeUser('bob')];
    await transfer(alice, { to: bob.id, amount: '100.50' }).expect(201); // string, as the UI sends it
    expect(await balance(alice)).toBe(899.5);
    expect(await balance(bob)).toBe(1100.5);
    const a = await request(app).get('/api/v1/account/transactions').set(alice.auth);
    const b = await request(app).get('/api/v1/account/transactions').set(bob.auth);
    expect(a.body.transactions[0]).toMatchObject({ direction: 'sent', counterparty: 'bob', amount: 100.5 });
    expect(b.body.transactions[0]).toMatchObject({ direction: 'received', counterparty: 'alice', amount: 100.5 });
  });

  it.each([-5000, 0, 'abc', 1000001, 1.234])('rejects invalid amount %p without moving money', async (amount) => {
    const [alice, bob] = [await makeUser('alice'), await makeUser('bob')];
    await transfer(alice, { to: bob.id, amount }).expect(400);
    expect(await balance(alice)).toBe(1000);
    expect(await balance(bob)).toBe(1000);
  });

  it('rejects overdrafts, self-transfers, malformed and unknown recipients', async () => {
    const [alice, bob] = [await makeUser('alice'), await makeUser('bob')];
    expect((await transfer(alice, { to: bob.id, amount: 1001 })).body.code).toBe('INSUFFICIENT_FUNDS');
    expect((await transfer(alice, { to: alice.id, amount: 1 })).body.code).toBe('SELF_TRANSFER');
    await transfer(alice, { to: 'zzz', amount: 1 }).expect(400);
    await transfer(alice, { to: '64b7f0f0f0f0f0f0f0f0f0f0', amount: 1 }).expect(404);
    expect(await balance(alice)).toBe(1000);
  });

  it('never overdraws under concurrent transfers', async () => {
    const [alice, bob] = [await makeUser('alice'), await makeUser('bob')];
    const results = await Promise.all(Array.from({ length: 10 }, () => transfer(alice, { to: bob.id, amount: 300 })));
    const ok = results.filter((r) => r.status === 201).length;
    expect(ok).toBeLessThanOrEqual(3);
    expect(await balance(alice)).toBeGreaterThanOrEqual(0);
    expect((await balance(alice)) + (await balance(bob))).toBe(2000); // money is conserved
  });

  it('is idempotent: a retried request with the same key moves money once', async () => {
    const [alice, bob] = [await makeUser('alice'), await makeUser('bob')];
    const body = { to: bob.id, amount: 100, idempotencyKey: 'retry-key-12345' };
    await transfer(alice, body).expect(201);
    await transfer(alice, body).expect(200);
    expect(await balance(alice)).toBe(900);
  });
});

describe('platform', () => {
  it('returns JSON 404 and 400 instead of crashing', async () => {
    await request(app).get('/nope').expect(404);
    await request(app).post('/api/v1/user/signin').set('Content-Type', 'application/json').send('{bad').expect(400);
  });

  it('only allows configured CORS origins', async () => {
    const ok = await request(app).get('/health').set('Origin', 'http://allowed.test');
    const bad = await request(app).get('/health').set('Origin', 'http://evil.test');
    expect(ok.headers['access-control-allow-origin']).toBe('http://allowed.test');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });
});
