"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    items: [{
            productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' },
            productName: String,
            productImage: String,
            quantity: Number,
            price: Number,
            subtotal: Number,
            variant: {
                size: String,
                color: String
            }
        }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    deliveryInfo: {
        name: String,
        phone: String,
        address: String,
        ward: String,
        district: String,
        city: String
    },
    notes: String
}, {
    timestamps: true
});
// Generate order number before save
OrderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await mongoose_1.default.model('Order').countDocuments();
        this.orderNumber = `GN${dateStr}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});
exports.default = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map