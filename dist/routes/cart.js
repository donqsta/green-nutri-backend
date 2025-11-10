"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All cart routes require authentication
router.use(auth_1.authenticate);
/**
 * @route   GET /v1/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', cartController_1.getCart);
/**
 * @route   POST /v1/cart
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/', cartController_1.addToCart);
/**
 * @route   PUT /v1/cart/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/:itemId', cartController_1.updateCartItem);
/**
 * @route   DELETE /v1/cart/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:itemId', cartController_1.removeFromCart);
/**
 * @route   DELETE /v1/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', cartController_1.clearCart);
exports.default = router;
//# sourceMappingURL=cart.js.map