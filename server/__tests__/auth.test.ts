import { describe, it, expect } from 'vitest';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken 
} from '../auth.js';

describe('Authentication & Cryptographic Security', () => {
  it('should generate salted password hashes and verify correctly', () => {
    const password = 'SecurePassword2026!';
    const hash = hashPassword(password);

    expect(hash).toContain(':');
    expect(hash.split(':').length).toBe(2);

    // Verification succeeds with correct password
    expect(verifyPassword(password, hash)).toBe(true);

    // Verification fails with incorrect password
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
  });

  it('should generate unique salts for identical passwords', () => {
    const password = 'SamePassword123';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);

    expect(hash1).not.toBe(hash2);
    expect(verifyPassword(password, hash1)).toBe(true);
    expect(verifyPassword(password, hash2)).toBe(true);
  });

  it('should generate signed HMAC tokens and verify valid signatures', () => {
    const payload = {
      id: 'student-001',
      email: 'student@school.edu',
      role: 'student' as const,
      name: 'Test Student'
    };

    const token = generateToken(payload);
    expect(token.split('.').length).toBe(3);

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(payload.id);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);
    expect(verified?.name).toBe(payload.name);
  });

  it('should reject tampered or invalid tokens', () => {
    const token = generateToken({
      id: 'user-1',
      email: 'user@school.edu',
      role: 'student',
      name: 'Normal User'
    });

    const parts = token.split('.');
    // Tamper with payload (change to admin)
    const tamperedPayload = Buffer.from(JSON.stringify({
      id: 'user-1',
      email: 'user@school.edu',
      role: 'admin',
      name: 'Normal User',
      exp: Date.now() + 100000
    })).toString('base64url');

    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    expect(verifyToken(tamperedToken)).toBeNull();
    expect(verifyToken('completely-invalid-token')).toBeNull();
  });
});
