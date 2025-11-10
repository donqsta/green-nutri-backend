import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import session from 'express-session';

// Extend session data
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    zaloId?: string;
    name?: string;
    role?: string;
  };
  session: session.Session & Partial<session.SessionData>;
}

/**
 * Authenticate user with JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Access token is required'
        }
      });
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = {
        id: decoded.id || decoded.userId,
        zaloId: decoded.zaloId,
        name: decoded.name,
        role: decoded.role
      };
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid or expired token'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work for both guest and logged-in users
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = {
          id: decoded.id || decoded.userId,
          zaloId: decoded.zaloId,
          name: decoded.name,
          role: decoded.role
        };
      } catch (jwtError) {
        // Token invalid but continue anyway
        console.warn('Invalid token in optional auth:', jwtError);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require admin role
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Admin access required'
      }
    });
  }
  next();
};

/**
 * Simple admin check for web interface
 * In production, you should implement proper admin authentication
 */
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Simple password protection for now
  // In production, implement proper session-based authentication
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Check for basic auth or session
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === 'admin' && password === adminPassword) {
      return next();
    }
  }

  // Check for session (you can implement this later)
  if (req.session?.isAdmin) {
    return next();
  }

  // For now, just allow access (remove this in production)
  // You should implement proper authentication
  console.log('Admin access granted - implement proper authentication in production');
  next();

  // Uncomment this for actual authentication:
  // res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
  // return res.status(401).send('Admin access required');
};

/**
 * Generate JWT token for user
 */
export function generateToken(user: {
  id: string;
  zaloId?: string;
  name?: string;
  role?: string;
}): string {
  return (jwt.sign as any)(
    {
      id: user.id,
      userId: user.id,
      zaloId: user.zaloId,
      name: user.name,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}
