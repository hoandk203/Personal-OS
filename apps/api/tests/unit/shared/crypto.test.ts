import { describe, it, expect } from 'vitest';
import { CryptoService } from '@personal-os/shared';

describe('CryptoService Suite', () => {
  const masterSecret = 'super-secure-master-key-for-personal-os-12345';
  const cryptoService = new CryptoService(masterSecret);

  it('should encrypt and decrypt plaintext using AES-256-GCM', () => {
    const sensitiveToken = 'ghp_exampleGithubPersonalAccessToken123456789';
    const encrypted = cryptoService.encrypt(sensitiveToken);

    expect(encrypted.iv).toBeDefined();
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.tag).toBeDefined();

    const decrypted = cryptoService.decrypt(encrypted);
    expect(decrypted).toBe(sensitiveToken);
  });

  it('should encrypt and decrypt from serialized string', () => {
    const rawData = 'oauth2-secret-refresh-token-value-xyz';
    const serialized = cryptoService.encryptToString(rawData);

    expect(serialized).toContain(':');
    const decrypted = cryptoService.decryptFromString(serialized);
    expect(decrypted).toBe(rawData);
  });

  it('should throw error on tampered ciphertext or auth tag', () => {
    const encrypted = cryptoService.encrypt('secret');
    const tamperedTag = { ...encrypted, tag: '00'.repeat(16) };

    expect(() => cryptoService.decrypt(tamperedTag)).toThrow();
  });

  it('should throw on short master secret', () => {
    expect(() => new CryptoService('short')).toThrow();
  });

  it('should hash and verify passwords using scrypt', () => {
    const password = 'SuperSecretUserPassword!2026';
    const hash = CryptoService.hashPassword(password);

    expect(hash).toContain(':');
    expect(CryptoService.verifyPassword(password, hash)).toBe(true);
    expect(CryptoService.verifyPassword('WrongPassword', hash)).toBe(false);
  });

  it('should generate secure random tokens', () => {
    const token1 = CryptoService.generateSecureToken();
    const token2 = CryptoService.generateSecureToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });
});
