import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

export interface EncryptedPayload {
  iv: string;         // hex
  ciphertext: string; // hex
  tag: string;        // hex
}

export class CryptoService {
  private readonly masterKey: Buffer;

  constructor(masterSecret: string) {
    if (!masterSecret || masterSecret.length < 16) {
      throw new Error('Master secret must be at least 16 characters long');
    }
    // Derive 32-byte key from master secret using scrypt
    this.masterKey = scryptSync(masterSecret, 'personal-os-token-salt', KEY_LENGTH);
  }

  /**
   * Encrypt sensitive token using AES-256-GCM
   */
  encrypt(plaintext: string): EncryptedPayload {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv);
    
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      ciphertext,
      tag
    };
  }

  /**
   * Decrypt ciphertext payload using AES-256-GCM
   */
  decrypt(payload: EncryptedPayload): string {
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');
    
    if (tag.length !== TAG_LENGTH) {
      throw new Error('Invalid authentication tag length');
    }

    const decipher = createDecipheriv(ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(tag);

    let plaintext = decipher.update(payload.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }

  /**
   * Serialize encrypted payload to a single string for storage
   */
  encryptToString(plaintext: string): string {
    const { iv, ciphertext, tag } = this.encrypt(plaintext);
    return `${iv}:${tag}:${ciphertext}`;
  }

  /**
   * Deserialize and decrypt from formatted string
   */
  decryptFromString(serialized: string): string {
    const parts = serialized.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid serialized encrypted string format');
    }
    const [iv, tag, ciphertext] = parts;
    return this.decrypt({ iv, tag, ciphertext });
  }

  /**
   * Hash a password using scrypt with random salt
   */
  static hashPassword(password: string): string {
    const salt = randomBytes(SALT_LENGTH).toString('hex');
    const derivedKey = scryptSync(password, salt, KEY_LENGTH);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Verify password against hash in constant time
   */
  static verifyPassword(password: string, hash: string): boolean {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;
    
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = scryptSync(password, salt, KEY_LENGTH);
    
    if (keyBuffer.length !== derivedKey.length) return false;
    return timingSafeEqual(keyBuffer, derivedKey);
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(byteLength = 32): string {
    return randomBytes(byteLength).toString('hex');
  }
}
