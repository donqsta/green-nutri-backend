"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /v1/auth/login/zalo
 * @desc    Login with Zalo
 * @access  Public
 */
router.post('/login/zalo', authController_1.loginWithZalo);
/**
 * @route   GET /v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
/**
 * @route   PUT /v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth_1.authenticate, authController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map