import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
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
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work for both guest and logged-in users
 */
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Require admin role
 */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Simple admin check for web interface
 * In production, you should implement proper admin authentication
 */
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Generate JWT token for user
 */
export declare function generateToken(user: {
    id: string;
    zaloId?: string;
    name?: string;
    role?: string;
}): string;
//# sourceMappingURL=auth.d.ts.map