import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Create new order from cart
 */
export declare const createOrder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get user's orders with pagination
 */
export declare const getOrders: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get order by ID
 */
export declare const getOrderById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Cancel order
 */
export declare const cancelOrder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=orderController.d.ts.map