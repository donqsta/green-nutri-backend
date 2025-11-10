"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuth = exports.authenticate = void 0;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Authenticate user with JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_TOKEN_MISSING',
                    message: 'Access token is required'
                }
            });
        }
        // Verify JWT token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.id || decoded.userId,
                zaloId: decoded.zaloId,
                name: decoded.name,
                role: decoded.role
            };
            next();
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_TOKEN_INVALID',
                    message: 'Invalid or expired token'
                }
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work for both guest and logged-in users
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                req.user = {
                    id: decoded.id || decoded.userId,
                    zaloId: decoded.zaloId,
                    name: decoded.name,
                    role: decoded.role
                };
            }
            catch (jwtError) {
                // Token invalid but continue anyway
                console.warn('Invalid token in optional auth:', jwtError);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Require admin role
 */
const requireAdmin = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: {
                code: 'AUTH_FORBIDDEN',
                message: 'Admin access required'
            }
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Generate JWT token for user
 */
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        userId: user.id,
        zaloId: user.zaloId,
        name: user.name,
        role: user.role || 'user'
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
//# sourceMappingURL=auth.js.map