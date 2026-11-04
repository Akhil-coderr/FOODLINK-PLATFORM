const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const {
  generateOAuthState,
  verifyOAuthState,
} = require('../services/oauthService');

describe('FoodLink OAuth & Admin Upgrade Test Suite', () => {
  describe('Cryptographic OAuth State & PKCE Protection', () => {
    test('generateOAuthState generates a tamper-evident signed JWT', () => {
      const state = generateOAuthState('google');
      expect(typeof state).toBe('string');
      expect(state.split('.')).toHaveLength(3); // Standard JWT header.payload.signature
    });

    test('verifyOAuthState successfully validates valid state token', () => {
      const state = generateOAuthState('google');
      const decoded = verifyOAuthState(state, 'google');
      expect(decoded.provider).toBe('google');
      expect(decoded).toHaveProperty('nonce');
    });

    test('verifyOAuthState rejects state token with provider mismatch', () => {
      const state = generateOAuthState('google');
      expect(() => {
        verifyOAuthState(state, 'github');
      }).toThrow(/mismatch/i);
    });

    test('verifyOAuthState rejects forged or tampered state token', () => {
      const forgedState = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      expect(() => {
        verifyOAuthState(forgedState, 'google');
      }).toThrow(/invalid/i);
    });
  });

  describe('Dedicated Admin Login API (/api/auth/admin/login)', () => {
    test('rejects empty payload with 400', async () => {
      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/required/i);
    });

    test('rejects missing password with 400', async () => {
      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'admin@foodlink.org' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('OAuth Endpoints & Graceful Configuration Handling', () => {
    test('GET /api/auth/google handles missing credentials gracefully without crash', async () => {
      const res = await request(app).get('/api/auth/google');
      // Should redirect to frontend login with explanatory query parameter
      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/login\?oauthError=/);
    });

    test('GET /api/auth/facebook returns 404 for unsupported OAuth providers', async () => {
      const res = await request(app).get('/api/auth/facebook');
      expect(res.status).toBe(404);
    });

    test('POST /api/auth/oauth/onboard rejects request with missing onboarding token', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/onboard')
        .send({
          role: 'donor',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/token required/i);
    });

    test('POST /api/auth/oauth/onboard rejects invalid or expired onboarding token', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/onboard')
        .send({
          onboardingToken: 'invalid.jwt.token',
          role: 'donor',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/expired|invalid/i);
    });
  });

  describe('Admin Endpoints Authorization & Protection', () => {
    test('GET /api/admin/donors rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/donors');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    test('GET /api/admin/analytics rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/analytics');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    test('GET /api/admin/audit-logs rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/audit-logs');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    test('POST /api/admin/broadcast rejects unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/admin/broadcast')
        .send({ title: 'Advisory', message: 'Test message' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    test('GET /api/admin/broadcasts rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/broadcasts');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('Duplicate Email Registration Safeguards', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('POST /api/auth/register/donor returns exact duplicate message for existing email', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '123456', email: 'admin@foodlink.org' });

      const res = await request(app)
        .post('/api/auth/register/donor')
        .send({
          name: 'Existing Donor',
          email: 'admin@foodlink.org',
          password: 'Password123!',
          phone: '9876543210',
          city: 'Coimbatore',
          organizationName: 'Charity Kitchen',
          donorType: 'restaurant',
          address: '123 Main St',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toBe('An account with this email already exists. Please sign in instead.');
    });
  });
});
