import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @route   POST /v1/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', createOrder);

/**
 * @route   GET /v1/orders
 * @desc    Get user's orders with pagination
 * @access  Private
 */
router.get('/', getOrders);

/**
 * @route   GET /v1/orders/:orderId
 * @desc    Get order details
 * @access  Private
 */
router.get('/:orderId', getOrderById);

/**
 * @route   POST /v1/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post('/:orderId/cancel', cancelOrder);

export default router;
