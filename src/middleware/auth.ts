import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    zaloId?: string;
    name?: string;
    role?: string;
  };
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
