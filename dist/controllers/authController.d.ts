import { Request, Response, NextFunction } from 'express';
/**
 * Login với Zalo access token
 */
export declare const loginWithZalo: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get current user profile
 */
export declare const getProfile: (req: any, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update user profile
 */
export declare const updateProfile: (req: any, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authController.d.ts.map