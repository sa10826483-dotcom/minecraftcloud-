import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

const AUTH_SECRET = process.env.AUTH_SECRET || 'minecraftcloud-super-production-secret-token-key-2026';
const TOKEN_EXPIRY = '7d';

export interface UserSessionPayload {
  userId: string;
  email: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'VIEWER';
}

export class SecurityCrypto {
  /**
   * Hashes a password using PBKDF2-HMAC-SHA512 with a cryptographically secure random salt.
   */
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifies password against stored salt:hash
   */
  public static verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  }

  /**
   * Creates a signed JWT session token
   */
  public static signSessionToken(payload: UserSessionPayload): string {
    return jwt.sign(payload, AUTH_SECRET, { expiresIn: TOKEN_EXPIRY });
  }

  /**
   * Verifies and decodes a JWT session token
   */
  public static verifySessionToken(token: string): UserSessionPayload | null {
    try {
      return jwt.verify(token, AUTH_SECRET) as UserSessionPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generates a secure random API secret or RCON password
   */
  public static generateSecureSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }
}
