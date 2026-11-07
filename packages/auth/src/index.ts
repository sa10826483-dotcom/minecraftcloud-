import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface UserSessionPayload {
  userId: string;
  email: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'VIEWER';
}

export class SecurityCrypto {
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  public static verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  }

  public static signSessionToken(payload: UserSessionPayload, secret: string = 'mc-cloud-jwt-secret'): string {
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  public static verifySessionToken(token: string, secret: string = 'mc-cloud-jwt-secret'): UserSessionPayload | null {
    try {
      return jwt.verify(token, secret) as UserSessionPayload;
    } catch {
      return null;
    }
  }
}
