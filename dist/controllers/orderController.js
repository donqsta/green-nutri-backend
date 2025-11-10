"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
/**
 * Create new order from cart
 */
const createOrder = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { deliveryInfo, paymentMethod, notes, cartItemIds } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to create order'
                }
            });
        }
        if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Delivery information is required'
                }
            });
        }
        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Payment method is required'
                }
            });
        }
        // Get user's cart
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CART_EMPTY',
                    message: 'Cart is empty'
                }
            });
        }
        // Filter cart items if specific items are selected
        let orderItems = cart.items;
        if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
            orderItems = cart.items.filter(item => cartItemIds.includes(item._id?.toString()));
        }
        if (orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_ITEMS_SELECTED',
                    message: 'No items selected for checkout'
                }
            });
        }
        // Validate stock for all items
        for (const item of orderItems) {
            const product = await Product_1.default.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_NOT_FOUND',
                        message: `Product ${item.productName} not found`
                    }
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_STOCK',
                        message: `Not enough stock for ${item.productName}`
                    }
                });
            }
        }
        // Calculate totals
        const subtotal = orderItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        const shipping = subtotal >= 500000 ? 0 : 30000; // Free shipping for orders >= 500k
        const discount = 0; // Can be enhanced with coupon logic
        const total = subtotal + shipping - discount;
        // Create order
        const order = new Order_1.default({
            userId,
            items: orderItems.map(item => ({
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity,
                variant: item.variant
            })),
            subtotal,
            discount,
            shipping,
            total,
            paymentMethod,
            deliveryInfo,
            notes,
            status: 'pending',
            paymentStatus: 'pending'
        });
        await order.save();
        // Update product stock
        for (const item of orderItems) {
            await Product_1.default.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
        // Remove ordered items from cart
        if (cartItemIds && cartItemIds.length > 0) {
            cart.items = cart.items.filter(item => !cartItemIds.includes(item._id?.toString()));
        }
        else {
            cart.items = [];
        }
        await cart.save();
        res.status(201).json({
            success: true,
            data: {
                order: {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    items: order.items,
                    subtotal: order.subtotal,
                    shipping: order.shipping,
                    discount: order.discount,
                    total: order.total,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    paymentMethod: order.paymentMethod,
                    deliveryInfo: order.deliveryInfo,
                    notes: order.notes,
                    createdAt: order.createdAt
                }
            },
            message: 'Order created successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
/**
 * Get user's orders with pagination
 */
const getOrders = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to view orders'
                }
            });
        }
        const query = { userId };
        if (status) {
            query.status = status;
        }
        const total = await Order_1.default.countDocuments(query);
        const orders = await Order_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({
            success: true,
            data: {
                items: orders.map(order => ({
                    id: order._id,
                    orderNumber: order.orderNumber,
                    items: order.items,
                    subtotal: order.subtotal,
                    shipping: order.shipping,
                    discount: order.discount,
                    total: order.total,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    paymentMethod: order.paymentMethod,
                    deliveryInfo: order.deliveryInfo,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
/**
 * Get order by ID
 */
const getOrderById = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { orderId } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to view order'
                }
            });
        }
        const order = await Order_1.default.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }
        res.json({
            success: true,
            data: {
                id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                subtotal: order.subtotal,
                shipping: order.shipping,
                discount: order.discount,
                total: order.total,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                deliveryInfo: order.deliveryInfo,
                notes: order.notes,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
/**
 * Cancel order
 */
const cancelOrder = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { orderId } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to cancel order'
                }
            });
        }
        const order = await Order_1.default.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }
        // Only allow canceling pending or processing orders
        if (order.status !== 'pending' && order.status !== 'processing') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_CANCEL',
                    message: 'Cannot cancel order in current status'
                }
            });
        }
        // Update order status
        order.status = 'cancelled';
        await order.save();
        // Restore product stock
        for (const item of order.items) {
            await Product_1.default.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
        res.json({
            success: true,
            data: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status
            },
            message: 'Order cancelled successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=orderController.js.map