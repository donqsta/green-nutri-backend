import { Request, Response, NextFunction } from 'express';
export declare const getProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=productController.d.ts.map