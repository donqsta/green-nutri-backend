import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    slug: string;
    categoryId: mongoose.Types.ObjectId;
    price: number;
    salePrice?: number;
    image: string;
    images?: string[];
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    details?: Array<{
        title: string;
        content: string;
    }>;
    sizes?: string[];
    variants?: Array<{
        id: number;
        size: string;
        price: number;
        salePrice?: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map