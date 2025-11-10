import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Get user's cart
 */
export declare const getCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Add item to cart
 */
export declare const addToCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update cart item quantity
 */
export declare const updateCartItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Remove item from cart
 */
export declare const removeFromCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Clear cart
 */
export declare const clearCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=cartController.d.ts.map