import { Request, Response, NextFunction } from 'express';
export declare const getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategoryById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=categoryController.d.ts.map