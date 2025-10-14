import { vi, describe, it, expect, beforeEach } from 'vitest';

import { authenticate, AuthenticatedRequest } from '../../src/utils/auth';

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable to test default
    delete process.env.API_SECRET_KEY;
  });

  describe('authenticate', () => {
    const mockRequest = (headers: Record<string, string> = {}) => ({
      headers
    }) as AuthenticatedRequest;

    it('should authenticate with correct static API key', () => {
      process.env.API_SECRET_KEY = 'my-secret-key';
      
      const req = mockRequest({ authorization: 'Bearer my-secret-key' });
      const result = authenticate(req);

      expect(result).toBe(true);
    });

    it('should authenticate with test API key from setup', () => {
      process.env.API_SECRET_KEY = 'test-api-key';
      
      const req = mockRequest({ authorization: 'Bearer test-api-key' });
      const result = authenticate(req);

      expect(result).toBe(true);
    });

    it('should reject incorrect API key', () => {
      process.env.API_SECRET_KEY = 'correct-key';
      
      const req = mockRequest({ authorization: 'Bearer wrong-key' });
      const result = authenticate(req);

      expect(result).toBe(false);
    });

    it('should reject request without authorization header', () => {
      const req = mockRequest();
      const result = authenticate(req);

      expect(result).toBe(false);
    });

    it('should reject request with invalid authorization format', () => {
      process.env.API_SECRET_KEY = 'test-key';
      
      const req = mockRequest({ authorization: 'InvalidFormat test-key' });
      const result = authenticate(req);

      expect(result).toBe(false);
    });

    it('should reject request with Bearer but no token', () => {
      const req = mockRequest({ authorization: 'Bearer ' });
      const result = authenticate(req);

      expect(result).toBe(false);
    });

    it('should reject request with only Bearer', () => {
      const req = mockRequest({ authorization: 'Bearer' });
      const result = authenticate(req);

      expect(result).toBe(false);
    });

    it('should fail when environment variable not set', () => {
      // Don't set API_SECRET_KEY, should fail without fallback
      const req = mockRequest({ authorization: 'Bearer any-token' });
      const result = authenticate(req);

      expect(result).toBe(false);
    });

    it('should handle empty token gracefully', () => {
      process.env.API_SECRET_KEY = 'test-key';
      
      const req = mockRequest({ authorization: 'Bearer ' });
      const result = authenticate(req);

      expect(result).toBe(false);
    });

    it('should be case sensitive for API key', () => {
      process.env.API_SECRET_KEY = 'CaseSensitiveKey';
      
      const req = mockRequest({ authorization: 'Bearer casesensitivekey' });
      const result = authenticate(req);

      expect(result).toBe(false);
    });
  });
});