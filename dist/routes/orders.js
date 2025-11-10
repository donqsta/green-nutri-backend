"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All order routes require authentication
router.use(auth_1.authenticate);
/**
 * @route   POST /v1/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', orderController_1.createOrder);
/**
 * @route   GET /v1/orders
 * @desc    Get user's orders with pagination
 * @access  Private
 */
router.get('/', orderController_1.getOrders);
/**
 * @route   GET /v1/orders/:orderId
 * @desc    Get order details
 * @access  Private
 */
router.get('/:orderId', orderController_1.getOrderById);
/**
 * @route   POST /v1/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post('/:orderId/cancel', orderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map