"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_handlebars_1 = require("express-handlebars");
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Routes
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const auth_1 = __importDefault(require("./routes/auth"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
// Middleware
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// View engine setup
const hbs = (0, express_handlebars_1.create)({
    defaultLayout: 'main',
    layoutsDir: path_1.default.join(__dirname, 'views/layouts'),
    partialsDir: path_1.default.join(__dirname, 'views/partials'),
    extname: '.hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    helpers: {
        formatPrice: function (price) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
        },
        eq: function (a, b) {
            return a === b;
        },
        subtract: function (a, b) {
            return a - b;
        },
        add: function (a, b) {
            return a + b;
        },
        join: function (array, separator) {
            return array ? array.join(separator) : '';
        },
        range: function (start, end) {
            const result = [];
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
            return result;
        }
    }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path_1.default.join(__dirname, 'views'));
// Session middleware for admin
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET || 'admin-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// Security middleware (but disable contentSecurityPolicy for admin views)
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
// Body parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Green Nutri API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
// API Routes
app.use('/v1/products', products_1.default);
app.use('/v1/categories', categories_1.default);
app.use('/v1/auth', auth_1.default);
app.use('/v1/cart', cart_1.default);
app.use('/v1/orders', orders_1.default);
// Admin routes
app.use('/admin', admin_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found'
        }
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map