import mongoose, { Document } from 'mongoose';
export interface ICartItem {
    _id?: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    variant?: {
        size?: string;
        color?: string;
    };
}
export interface ICart extends Document {
    userId: string;
    items: ICartItem[];
    subtotal: number;
    updatedAt: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, {}> & ICart & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Cart.d.ts.map