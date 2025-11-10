import mongoose, { Schema, Document } from 'mongoose';

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

const CartSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: {
      size: String,
      color: String
    }
  }],
  subtotal: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Calculate subtotal before save
CartSchema.pre('save', function(next) {
  // @ts-ignore - Type issue with items property
  this.subtotal = this.items.reduce((total: number, item: any) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

export default mongoose.model<ICart>('Cart', CartSchema);
