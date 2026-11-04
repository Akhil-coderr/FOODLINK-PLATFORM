const { 
  calculateDistanceKm, 
  normalizeToKg, 
  calculateMealsSaved, 
  calculateCarbonOffsetKg 
} = require('../../utils/distance');
const { 
  generateRandomSecret, 
  hashToken, 
  generateTokens 
} = require('../../utils/token');

describe('FoodLink Utility & Algorithm Tests', () => {
  describe('Geospatial & Conversion Formulas', () => {
    test('calculateDistanceKm should accurately compute Haversine distance in km', () => {
      // New York to Philadelphia ~ 130 km
      const ny = { lat: 40.7128, lng: -74.0060 };
      const philly = { lat: 39.9526, lng: -75.1652 };
      const dist = calculateDistanceKm(ny.lat, ny.lng, philly.lat, philly.lng);
      
      expect(dist).toBeGreaterThan(120);
      expect(dist).toBeLessThan(145);
    });

    test('calculateDistanceKm returns 0 for identical points', () => {
      const dist = calculateDistanceKm(12.9716, 77.5946, 12.9716, 77.5946);
      expect(dist).toBe(0);
    });

    test('normalizeToKg converts different measurement units properly', () => {
      expect(normalizeToKg(10, 'kg')).toBe(10);
      expect(normalizeToKg(5, 'liters')).toBe(5);
      expect(normalizeToKg(20, 'servings')).toBe(9); // 20 * 0.45 = 9
      expect(normalizeToKg(50, 'meals')).toBe(22.5); // 50 * 0.45 = 22.5
      expect(normalizeToKg(10, 'packets')).toBe(5); // 10 * 0.5 = 5
    });

    test('calculateMealsSaved calculates approximately 2.2 meals per kg', () => {
      expect(calculateMealsSaved(10)).toBe(22);
      expect(calculateMealsSaved(0)).toBe(0);
      expect(calculateMealsSaved(4.2)).toBe(9);
    });

    test('calculateCarbonOffsetKg calculates 2.5 kg CO2e per kg food diverted', () => {
      expect(calculateCarbonOffsetKg(10)).toBe(25);
      expect(calculateCarbonOffsetKg(40)).toBe(100);
    });
  });

  describe('Cryptographic QR Code & Verification Security', () => {
    test('generateRandomSecret generates unique cryptographically strong tokens with prefix', () => {
      const token1 = generateRandomSecret('PK');
      const token2 = generateRandomSecret('DL');

      expect(token1).toMatch(/^PK-[A-F0-9]{12}$/);
      expect(token2).toMatch(/^DL-[A-F0-9]{12}$/);
      expect(token1).not.toBe(token2);
    });

    test('hashToken creates consistent SHA-256 hex hashes', () => {
      const token = 'PK-ABCD1234';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex string is 64 chars
    });

    test('verifying token against hash prevents tampering', () => {
      const token = 'PK-SECURE99';
      const hash = hashToken(token);

      expect(hashToken(token)).toBe(hash);
      expect(hashToken('PK-TAMPERED')).not.toBe(hash);
    });

    test('generateTokens returns access and refresh tokens for user', () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011', email: 'test@foodlink.org', role: 'donor' };
      const tokens = generateTokens(mockUser);
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
    });
  });
});
