"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.requireAdmin = exports.optionalAuth = exports.authenticate = void 0;
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
 * Simple admin check for web interface
 * In production, you should implement proper admin authentication
 */
const isAdmin = async (req, res, next) => {
    // Simple password protection for now
    // In production, implement proper session-based authentication
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    // Check for basic auth or session
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Basic ')) {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        if (username === 'admin' && password === adminPassword) {
            return next();
        }
    }
    // Check for session (you can implement this later)
    if (req.session?.isAdmin) {
        return next();
    }
    // For now, just allow access (remove this in production)
    // You should implement proper authentication
    console.log('Admin access granted - implement proper authentication in production');
    next();
    // Uncomment this for actual authentication:
    // res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    // return res.status(401).send('Admin access required');
};
exports.isAdmin = isAdmin;
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