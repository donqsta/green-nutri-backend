import { Request, Response, NextFunction } from 'express';
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
 * Generate JWT token for user
 */
export declare function generateToken(user: {
    id: string;
    zaloId?: string;
    name?: string;
    role?: string;
}): string;
//# sourceMappingURL=auth.d.ts.map