"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.loginWithZalo = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const axios_1 = __importDefault(require("axios"));
/**
 * Login với Zalo access token
 */
const loginWithZalo = async (req, res, next) => {
    try {
        const { accessToken, zaloId, name, avatar } = req.body;
        if (!accessToken && !zaloId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Zalo access token or zaloId is required'
                }
            });
        }
        let userZaloId = zaloId;
        let userName = name;
        let userAvatar = avatar;
        // Nếu có accessToken, verify với Zalo API
        if (accessToken) {
            try {
                // Call Zalo API to get user info
                const zaloResponse = await axios_1.default.get('https://graph.zalo.me/v2.0/me', {
                    params: {
                        access_token: accessToken,
                        fields: 'id,name,picture'
                    }
                });
                if (zaloResponse.data && zaloResponse.data.id) {
                    userZaloId = zaloResponse.data.id;
                    userName = zaloResponse.data.name || userName;
                    userAvatar = zaloResponse.data.picture?.data?.url || userAvatar;
                }
            }
            catch (zaloError) {
                console.warn('Zalo API error:', zaloError);
                // Continue with provided data nếu Zalo API fails
            }
        }
        if (!userZaloId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ZALO_TOKEN',
                    message: 'Could not verify Zalo user'
                }
            });
        }
        // Find or create user
        let user = await User_1.default.findOne({ zaloId: userZaloId });
        if (!user) {
            // Create new user
            user = new User_1.default({
                zaloId: userZaloId,
                name: userName || 'Zalo User',
                avatar: userAvatar,
                role: 'user',
                loyaltyPoints: 0
            });
            await user.save();
        }
        else {
            // Update user info
            if (userName)
                user.name = userName;
            if (userAvatar)
                user.avatar = userAvatar;
            await user.save();
        }
        // Generate JWT token
        const token = (0, auth_1.generateToken)({
            id: user._id.toString(),
            zaloId: user.zaloId,
            name: user.name,
            role: user.role
        });
        res.json({
            success: true,
            data: {
                accessToken: token,
                expiresIn: process.env.JWT_EXPIRE || '7d',
                tokenType: 'Bearer',
                user: {
                    id: user._id,
                    zaloId: user.zaloId,
                    name: user.name,
                    avatar: user.avatar,
                    role: user.role,
                    loyaltyPoints: user.loyaltyPoints
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginWithZalo = loginWithZalo;
/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Authentication required'
                }
            });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                zaloId: user.zaloId,
                name: user.name,
                phone: user.phone,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                loyaltyPoints: user.loyaltyPoints,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { name, phone, email } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Authentication required'
                }
            });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }
        // Update allowed fields
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (email)
            user.email = email;
        await user.save();
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email
            },
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map