import mongoose, { Schema, Document } from 'mongoose';

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

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  image: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  details: [{
    title: String,
    content: String
  }],
  sizes: [{ type: String }],
  variants: [{
    id: Number,
    size: String,
    price: Number,
    salePrice: Number
  }]
}, {
  timestamps: true
});

// Index for text search
ProductSchema.index({ name: 'text' });

// Virtual for originalPrice (for compatibility with frontend)
ProductSchema.virtual('originalPrice').get(function() {
  return this.salePrice ? this.price : undefined;
});

// Ensure virtuals are included in JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
