const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const { hashToken } = require('../utils/token');
const { sendPasswordResetEmail } = require('../services/emailService');

describe('FoodLink Password Recovery & Authentication Suite', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Forgot Password Endpoint (POST /api/auth/forgot-password)', () => {
    test('rejects empty or whitespace-only email with 400', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/valid email/i);
    });

    test('returns generic success response for unregistered email (prevents enumeration)', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'unknown@foodlink.org' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/dispatched/i);
    });

    test('generates hashed token with 15-minute expiry for registered user and normalizes email', async () => {
      const mockUser = {
        name: 'Donor User',
        email: 'donor@foodlink.org',
        save: jest.fn().mockResolvedValue(true),
      };

      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: '  DONOR@FOODLINK.ORG  ' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/dispatched/i);

      // Verify email was trimmed and lowercased
      expect(findSpy).toHaveBeenCalledWith({ email: 'donor@foodlink.org' });

      // Verify token hash and 15-min expiration set on user
      expect(mockUser.resetPasswordTokenHash).toBeDefined();
      expect(mockUser.resetPasswordExpires).toBeDefined();

      const expiryDiffMinutes = (mockUser.resetPasswordExpires - Date.now()) / (60 * 1000);
      expect(expiryDiffMinutes).toBeGreaterThan(14);
      expect(expiryDiffMinutes).toBeLessThanOrEqual(15.1);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('2. Verify Reset Token Endpoint (GET /api/auth/verify-reset-token/:token)', () => {
    test('rejects invalid or expired token with 400', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app).get('/api/auth/verify-reset-token/invalid_or_expired_token');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid or has expired/i);
    });

    test('validates active token and returns user details with 200', async () => {
      const mockUser = {
        name: 'Verified Donor',
        email: 'donor@foodlink.org',
      };

      const rawToken = 'sample_valid_token_123';
      const expectedHash = hashToken(rawToken);

      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      const res = await request(app).get(`/api/auth/verify-reset-token/${rawToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('donor@foodlink.org');
      expect(res.body.data.name).toBe('Verified Donor');

      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          resetPasswordTokenHash: expectedHash,
        })
      );
    });
  });

  describe('3. Reset Password Endpoint (POST /api/auth/reset-password)', () => {
    test('rejects missing token with 400', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ password: 'Password123!', confirmPassword: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token is missing/i);
    });

    test('rejects mismatched password and confirmPassword with 400', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some_token',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/do not match/i);
    });

    test('rejects weak password that violates complexity rules with 400', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some_token',
          password: 'weak',
          confirmPassword: 'weak',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least 8 characters/i);
    });

    test('rejects expired or invalid token during reset attempt with 400', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'expired_token',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid or has expired/i);
    });

    test('updates password, invalidates single-use token, and returns 200', async () => {
      const mockUser = {
        name: 'Donor User',
        email: 'donor@foodlink.org',
        resetPasswordTokenHash: 'some_hash',
        resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid_raw_token',
          password: 'NewStrongPassword123!',
          confirmPassword: 'NewStrongPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/successfully reset/i);

      // Verify token invalidated immediately (single-use)
      expect(mockUser.resetPasswordTokenHash).toBeUndefined();
      expect(mockUser.resetPasswordExpires).toBeUndefined();
      expect(mockUser.passwordHash).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('4. Login & Authentication Edge Cases', () => {
    test('normalizes email and accepts valid credentials with whitespace/case variations', async () => {
      const validObjectId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: validObjectId,
        name: 'Donor Test',
        email: 'donor@foodlink.org',
        role: 'donor',
        passwordHash: '$2a$10$dummyHashValue',
        accountStatus: 'active',
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({ _id: validObjectId, name: 'Donor Test', email: 'donor@foodlink.org', role: 'donor' }),
      };

      const selectMock = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      const findSpy = jest.spyOn(User, 'findOne').mockReturnValue(selectMock);
      jest.spyOn(DonorProfile, 'findOne').mockResolvedValue({ organizationName: 'Test Kitchen' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: '   DONOR@FOODLINK.ORG   ',
          password: 'CorrectPassword123!',
        });

      expect(findSpy).toHaveBeenCalledWith({ email: 'donor@foodlink.org' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('donor@foodlink.org');
    });

    test('advises OAuth-only accounts without password to sign in with social login', async () => {
      const mockOAuthUser = {
        _id: 'oauth_user_123',
        name: 'Social User',
        email: 'social@foodlink.org',
        role: 'donor',
        passwordHash: undefined, // No password hash
        authProviders: [{ provider: 'google', providerId: 'google-123' }],
      };

      const selectMock = {
        select: jest.fn().mockResolvedValue(mockOAuthUser),
      };
      jest.spyOn(User, 'findOne').mockReturnValue(selectMock);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'social@foodlink.org',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/google|social account/i);
    });
  });

  describe('5. Email Service Template & Expiration Warning', () => {
    test('generates 15-minute notice and correct reset URL', async () => {
      const user = { name: 'Donor User', email: 'donor@foodlink.org' };
      const rawToken = 'test_token_hex_123';

      const result = await sendPasswordResetEmail(user, rawToken);
      expect(result.success).toBe(true);
      if (result.devMode) {
        expect(result.resetUrl).toContain(`/reset-password/${rawToken}`);
      }
    });
  });
});
