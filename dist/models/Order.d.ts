import mongoose, { Document } from 'mongoose';
export interface IOrder extends Document {
    orderNumber: string;
    userId: string;
    items: Array<{
        productId: mongoose.Types.ObjectId;
        productName: string;
        productImage: string;
        quantity: number;
        price: number;
        subtotal: number;
        variant?: {
            size?: string;
            color?: string;
        };
    }>;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    deliveryInfo: {
        name: string;
        phone: string;
        address: string;
        ward?: string;
        district?: string;
        city?: string;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Order.d.ts.map