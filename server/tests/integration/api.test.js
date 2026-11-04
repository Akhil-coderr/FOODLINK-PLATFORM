const request = require('supertest');
const app = require('../../app');

describe('FoodLink API Integration & Security Tests', () => {
  describe('GET /api/health', () => {
    test('returns 200 OK with system status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('system', 'FoodLink API');
    });
  });

  describe('Input Validation & Error Handling', () => {
    test('POST /api/auth/login rejects empty payload with 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/required/i);
    });

    test('POST /api/auth/login rejects missing password with 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'donor@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    test('POST /api/contact rejects missing required fields with 400', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Anonymous',
          email: 'anon@example.com',
          subject: 'Question'
          // message omitted
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('RBAC & Route Protection', () => {
    test('GET /api/admin/users rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    test('GET /api/donations/my-donations rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/donations/my-donations');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    test('POST /api/qr/verify-pickup rejects unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/qr/verify-pickup')
        .send({ qrCode: 'PK-SAMPLE' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    test('GET /api/volunteers/tasks rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/volunteers/tasks');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
