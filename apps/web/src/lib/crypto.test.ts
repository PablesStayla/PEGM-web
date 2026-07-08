import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { _resetKeyCache, decrypt, encrypt, isEncrypted, secureCompare } from './crypto';
import { resetEnvCache } from './env';

/**
 * Unit tests for the AES-256-GCM crypto utilities.
 * Uses a safe 32-byte test key that is never committed as a real secret.
 */

const TEST_KEY_HEX = '0'.repeat(64); // 32 zero-bytes in hex â€” safe for tests

describe('@/lib/crypto', () => {
  beforeEach(() => {
    process.env['ENCRYPTION_KEY'] = TEST_KEY_HEX;
    resetEnvCache();
    _resetKeyCache();
  });

  afterEach(() => {
    Reflect.deleteProperty(process.env, 'ENCRYPTION_KEY');
    resetEnvCache();
    _resetKeyCache();
  });

  // â”€â”€ encrypt() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('encrypt()', () => {
    it('returns a non-empty string', () => {
      expect(encrypt('hello')).toBeTruthy();
    });

    it('output has iv:authTag:ciphertext format (3 colon-separated parts)', () => {
      const parts = encrypt('hello').split(':');
      expect(parts).toHaveLength(3);
      expect(parts.every((p) => p.length > 0)).toBe(true);
    });

    it('produces different ciphertexts for the same plaintext (unique IV)', () => {
      const a = encrypt('same value');
      const b = encrypt('same value');
      expect(a).not.toBe(b);
    });

    it('all output parts are valid hex strings', () => {
      const parts = encrypt('test').split(':');
      const hexRegex = /^[0-9a-f]+$/i;
      expect(parts.every((p) => hexRegex.test(p))).toBe(true);
    });

    it('throws when ENCRYPTION_KEY is missing', () => {
      Reflect.deleteProperty(process.env, 'ENCRYPTION_KEY');
      resetEnvCache();
      _resetKeyCache();
      expect(() => encrypt('secret')).toThrow('ENCRYPTION_KEY is not set');
    });

    it('throws when ENCRYPTION_KEY is wrong length', () => {
      process.env['ENCRYPTION_KEY'] = 'tooshort';
      resetEnvCache();
      _resetKeyCache();
      expect(() => encrypt('secret')).toThrow();
    });
  });

  // â”€â”€ decrypt() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('decrypt()', () => {
    it('round-trips: decrypt(encrypt(x)) === x', () => {
      const original = 'sk_live_supplier_api_key_123';
      expect(decrypt(encrypt(original))).toBe(original);
    });

    it('handles multi-line strings', () => {
      const text = 'line1\nline2\nline3';
      expect(decrypt(encrypt(text))).toBe(text);
    });

    it('handles unicode characters', () => {
      const text = 'ContraseÃ±a segura: ðŸ”’ ArÃ¡ndano';
      expect(decrypt(encrypt(text))).toBe(text);
    });

    it('handles empty string', () => {
      expect(decrypt(encrypt(''))).toBe('');
    });

    it('throws on tampered ciphertext', () => {
      const encrypted = encrypt('original');
      const parts = encrypted.split(':');
      // Corrupt the ciphertext part
      parts[2] = 'deadbeef'.repeat(parts[2].length / 8);
      expect(() => decrypt(parts.join(':'))).toThrow();
    });

    it('throws on wrong format (not 3 parts)', () => {
      expect(() => decrypt('not:valid')).toThrow();
      expect(() => decrypt('onlyone')).toThrow();
      expect(() => decrypt('a:b:c:d')).toThrow();
    });

    it('does NOT silently return plaintext on error (critical regression test)', () => {
      // This test guards against the bug that was fixed:
      // old code: catch (error) { return encrypted } (returns raw ciphertext as if it were plaintext)
      const encrypted = encrypt('secret_value');
      // Tamper with it
      const tampered = `${encrypted.slice(0, -4)}dead`;
      // Must throw, never return a value
      expect(() => decrypt(tampered)).toThrow();
    });
  });

  // â”€â”€ isEncrypted() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('isEncrypted()', () => {
    it('returns true for values produced by encrypt()', () => {
      expect(isEncrypted(encrypt('test'))).toBe(true);
    });

    it('returns false for plaintext', () => {
      expect(isEncrypted('sk_live_not_encrypted')).toBe(false);
      expect(isEncrypted('hello world')).toBe(false);
    });

    it('returns false for values with wrong number of parts', () => {
      expect(isEncrypted('only:two')).toBe(false);
      expect(isEncrypted('one')).toBe(false);
    });
  });

  // â”€â”€ secureCompare() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('secureCompare()', () => {
    it('returns true for identical strings', () => {
      expect(secureCompare('abc123', 'abc123')).toBe(true);
    });

    it('returns false for different strings of same length', () => {
      expect(secureCompare('abc123', 'xyz789')).toBe(false);
    });

    it('returns false for strings of different lengths', () => {
      expect(secureCompare('short', 'longer_string')).toBe(false);
    });

    it('returns false for empty vs non-empty', () => {
      expect(secureCompare('', 'not-empty')).toBe(false);
    });

    it('returns true for two empty strings', () => {
      expect(secureCompare('', '')).toBe(true);
    });
  });
});
