# Green Nutri Backend API

Backend API server cho Green Nutri Zalo Mini App.

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js 18+ và npm
- MongoDB (local hoặc Atlas cloud)

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

#### Option A: MongoDB Local (Ubuntu/Debian)

```bash
# Install MongoDB
sudo apt update
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify MongoDB is running
sudo systemctl status mongodb
```

#### Option B: MongoDB Atlas (Cloud - Khuyến nghị)

1. Tạo tài khoản miễn phí tại https://www.mongodb.com/cloud/atlas/register
2. Tạo một cluster mới (chọn Free tier)
3. Tạo database user và password
4. Whitelist IP address (hoặc cho phép 0.0.0.0/0 để test)
5. Lấy connection string từ "Connect" → "Connect your application"
6. Copy connection string vào file `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/greennutri?retryWrites=true&w=majority
```

### 3. Environment Variables

Đã có file `.env` sẵn trong project. Cập nhật các giá trị cần thiết:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/greennutri
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/greennutri

# JWT
JWT_SECRET=green-nutri-super-secret-key-change-this-in-production
JWT_EXPIRE=7d
```

### 4. Seed Database

Import dữ liệu mẫu vào database:

```bash
npm run seed
```

Kết quả mong đợi:

```
🌱 Starting seed process...
✅ MongoDB Connected: localhost
🗑️  Clearing existing data...
📁 Creating categories...
✅ Created 4 categories
📦 Creating products...
✅ Created 4 products

🎉 Seed completed successfully!
📊 Summary:
   - Categories: 4
   - Products: 4
```

## 🏃 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

Server chạy tại: `http://localhost:3001`

### Health Check

```
GET /health
```

### Categories

```
GET /v1/categories          # Get all categories
GET /v1/categories/:id      # Get category by ID
```

### Products

```
GET /v1/products            # Get all products (with filters)
GET /v1/products/:id        # Get product by ID
POST /v1/products           # Create product (Admin)
PUT /v1/products/:id        # Update product (Admin)
DELETE /v1/products/:id     # Delete product (Admin)
```

#### Query Parameters for GET /v1/products:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `categoryId` - Filter by category
- `search` - Search by product name
- `featured` - Filter featured products (true/false)
- `sort` - Sort order (default: -createdAt)

#### Example Requests:

```bash
# Get all products
curl http://localhost:3001/v1/products

# Get featured products
curl http://localhost:3001/v1/products?featured=true

# Get products by category
curl http://localhost:3001/v1/products?categoryId=<CATEGORY_ID>

# Search products
curl http://localhost:3001/v1/products?search=điều

# Get product by ID
curl http://localhost:3001/v1/products/<PRODUCT_ID>
```

## 🧪 Testing

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Get all products
curl http://localhost:3001/v1/products

# Get all categories
curl http://localhost:3001/v1/categories
```

### Using Browser

Mở trình duyệt và truy cập:
- http://localhost:3001/health
- http://localhost:3001/v1/products
- http://localhost:3001/v1/categories

### Using Thunder Client / Postman

Import các endpoints sau:

1. GET `http://localhost:3001/health`
2. GET `http://localhost:3001/v1/categories`
3. GET `http://localhost:3001/v1/products`
4. GET `http://localhost:3001/v1/products/:id`

## 📁 Project Structure

```
green-nutri-backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── models/
│   │   ├── Category.ts          # Category model
│   │   ├── Product.ts           # Product model
│   │   ├── User.ts              # User model
│   │   └── Order.ts             # Order model
│   ├── controllers/
│   │   ├── productController.ts # Product logic
│   │   └── categoryController.ts# Category logic
│   ├── routes/
│   │   ├── products.ts          # Product routes
│   │   └── categories.ts        # Category routes
│   ├── middleware/
│   │   └── errorHandler.ts     # Error handling
│   ├── scripts/
│   │   └── seed.ts              # Database seeding
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development Scripts

```bash
# Run in development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm start

# Seed database
npm run seed
```

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solutions**:
1. Check if MongoDB is running: `sudo systemctl status mongodb`
2. Start MongoDB: `sudo systemctl start mongodb`
3. Or use MongoDB Atlas cloud instead

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**: Change PORT in `.env` or kill process using port 3001:
```bash
sudo lsof -ti:3001 | xargs kill -9
```

### TypeScript Errors

**Solution**: Rebuild the project:
```bash
npm run build
```

## 📚 Next Steps

1. ✅ Implement Order APIs
2. ✅ Implement Cart APIs
3. ✅ Implement Authentication with Zalo
4. ✅ Add ZaloPay integration
5. ✅ Deploy to Railway/Heroku

## 🔗 Related Documentation

- [API Specifications](/root/miniapp-greennutri/docs/technical/API-SPECIFICATIONS.md)
- [Backend Setup Guide](/root/miniapp-greennutri/docs/technical/BACKEND-SETUP-GUIDE.md)

## 📞 Support

For issues or questions, please check the documentation or create an issue.

---

**Version**: 1.0.0
**Last Updated**: 2025-01-07
