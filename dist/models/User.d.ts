import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    zaloId: string;
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
    role: 'user' | 'admin';
    loyaltyPoints: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map