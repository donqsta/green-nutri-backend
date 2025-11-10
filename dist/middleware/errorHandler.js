"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: Object.values(err.errors).map((e) => e.message)
            }
        });
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'DUPLICATE_ERROR',
                message: 'Resource already exists',
                details: err.keyValue
            }
        });
    }
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_ID',
                message: 'Invalid resource ID'
            }
        });
    }
    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An error occurred',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map