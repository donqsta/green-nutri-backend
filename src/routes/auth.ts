import { Router } from 'express';
import { loginWithZalo, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /v1/auth/login/zalo
 * @desc    Login with Zalo
 * @access  Public
 */
router.post('/login/zalo', loginWithZalo);

/**
 * @route   GET /v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

export default router;
