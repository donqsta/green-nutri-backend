import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { create } from 'express-handlebars';
import session from 'express-session';
import path from 'path';

// Load environment variables
dotenv.config();

// Routes
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import authRoutes from './routes/auth';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';

// Middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();

// View engine setup
const hbs = create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  extname: '.hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    formatPrice: function(price: number) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    },
    eq: function(a: any, b: any) {
      return a === b;
    },
    subtract: function(a: number, b: number) {
      return a - b;
    },
    add: function(a: number, b: number) {
      return a + b;
    },
    join: function(array: any, separator: string) {
      if (!array) return '';
      if (Array.isArray(array)) {
        return array.join(separator || ', ');
      }
      return String(array);
    },
    range: function(start: number, end: number) {
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
app.set('views', path.join(__dirname, 'views'));

// Session middleware for admin
app.use(session({
  secret: process.env.JWT_SECRET || 'admin-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Security middleware (but disable contentSecurityPolicy for admin views and CORS policies for images)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow localhost for development and all origins for production
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:2999',
  'https://green-nutri-backend-production.up.railway.app',
  // Zalo Mini App domains
  'https://miniapp.zaloplatforms.com',
  'https://mini.zalo.me',
  'https://h5.zalo.me'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // In production, allow Zalo Mini App domains and subdomains
    if (process.env.NODE_ENV === 'production') {
      if (origin.includes('zalo') || origin.includes('zalop') || origin.includes('miniapp')) {
        return callback(null, true);
      }
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Override CORP header to allow cross-origin resource sharing
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Static files middleware
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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
app.use('/v1/products', productRoutes);
app.use('/v1/categories', categoryRoutes);
app.use('/v1/auth', authRoutes);
app.use('/v1/cart', cartRoutes);
app.use('/v1/orders', orderRoutes);

// Admin routes
app.use('/admin', adminRoutes);

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
app.use(errorHandler);

export default app;
