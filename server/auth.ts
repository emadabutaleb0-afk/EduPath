import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'edupath_secure_fallback_secret_key_2026';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface UserTokenPayload {
  id: string;
  email: string;
  role: 'student' | 'parent' | 'admin' | 'teacher';
  name: string;
  exp: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}

// -------------------------------------------------------------
// 1. Password Hashing & Verification (scrypt with salt)
// -------------------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(':')) {
      // Legacy fallback: if storedHash was plain text (e.g. from mock/legacy setup)
      return password === storedHash;
    }
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

// -------------------------------------------------------------
// 2. Token Generation & Verification (HMAC-SHA256 Signed Tokens)
// -------------------------------------------------------------
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

export function generateToken(payload: Omit<UserTokenPayload, 'exp'>): string {
  const exp = Date.now() + TOKEN_EXPIRY_MS;
  const fullPayload: UserTokenPayload = { ...payload, exp };
  
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: UserTokenPayload = JSON.parse(base64UrlDecode(body));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// 3. Authentication & Authorization Middleware
// -------------------------------------------------------------
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireRole(...allowedRoles: Array<'student' | 'parent' | 'admin' | 'teacher'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// 4. Rate Limiting Middleware (In-Memory IP Bucket)
// -------------------------------------------------------------
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function rateLimiter(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const bucket = rateLimitBuckets.get(key);
    if (!bucket || now > bucket.resetTime) {
      rateLimitBuckets.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    bucket.count++;
    if (bucket.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      });
    }

    next();
  };
}

// -------------------------------------------------------------
// 5. Security Headers Middleware
// -------------------------------------------------------------
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}
