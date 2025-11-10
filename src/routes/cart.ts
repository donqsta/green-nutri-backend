import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', getCart);

/**
 * @route   POST /v1/cart
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/', addToCart);

/**
 * @route   PUT /v1/cart/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/:itemId', updateCartItem);

/**
 * @route   DELETE /v1/cart/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:itemId', removeFromCart);

/**
 * @route   DELETE /v1/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', clearCart);

export default router;
