import mongoose, { Schema, Document } from 'mongoose';

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

const UserSchema: Schema = new Schema({
  zaloId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loyaltyPoints: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
