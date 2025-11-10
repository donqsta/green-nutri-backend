"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
/**
 * Get user's cart
 */
const getCart = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to view cart'
                }
            });
        }
        let cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            // Create empty cart
            cart = new Cart_1.default({
                userId,
                items: [],
                subtotal: 0
            });
            await cart.save();
        }
        res.json({
            success: true,
            data: {
                id: cart._id,
                userId: cart.userId,
                items: cart.items,
                subtotal: cart.subtotal,
                itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
                updatedAt: cart.updatedAt
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
/**
 * Add item to cart
 */
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { productId, quantity = 1, variant } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to add items to cart'
                }
            });
        }
        if (!productId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Product ID is required'
                }
            });
        }
        // Get product info
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PRODUCT_NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }
        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_STOCK',
                    message: 'Not enough stock available'
                }
            });
        }
        // Get or create cart
        let cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            cart = new Cart_1.default({
                userId,
                items: [],
                subtotal: 0
            });
        }
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId &&
            item.variant?.size === variant?.size &&
            item.variant?.color === variant?.color);
        const price = product.salePrice || product.price;
        if (existingItemIndex >= 0) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        }
        else {
            // Add new item
            cart.items.push({
                productId: product._id,
                productName: product.name,
                productImage: product.image,
                price,
                quantity,
                variant
            });
        }
        await cart.save();
        res.json({
            success: true,
            data: {
                cart: {
                    items: cart.items,
                    subtotal: cart.subtotal,
                    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
                }
            },
            message: 'Added to cart successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
/**
 * Update cart item quantity
 */
const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to update cart'
                }
            });
        }
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_QUANTITY',
                    message: 'Quantity must be at least 1'
                }
            });
        }
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CART_NOT_FOUND',
                    message: 'Cart not found'
                }
            });
        }
        const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ITEM_NOT_FOUND',
                    message: 'Item not found in cart'
                }
            });
        }
        // Check stock
        const product = await Product_1.default.findById(cart.items[itemIndex].productId);
        if (product && product.stock < quantity) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_STOCK',
                    message: 'Not enough stock available'
                }
            });
        }
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.json({
            success: true,
            data: {
                cart: {
                    items: cart.items,
                    subtotal: cart.subtotal,
                    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
                }
            },
            message: 'Cart updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartItem = updateCartItem;
/**
 * Remove item from cart
 */
const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { itemId } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to update cart'
                }
            });
        }
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CART_NOT_FOUND',
                    message: 'Cart not found'
                }
            });
        }
        cart.items = cart.items.filter(item => item._id?.toString() !== itemId);
        await cart.save();
        res.json({
            success: true,
            data: {
                cart: {
                    items: cart.items,
                    subtotal: cart.subtotal,
                    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
                }
            },
            message: 'Item removed from cart'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
/**
 * Clear cart
 */
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Please login to clear cart'
                }
            });
        }
        const cart = await Cart_1.default.findOne({ userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({
            success: true,
            data: {
                cart: {
                    items: [],
                    subtotal: 0,
                    itemCount: 0
                }
            },
            message: 'Cart cleared successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.clearCart = clearCart;
//# sourceMappingURL=cartController.js.map