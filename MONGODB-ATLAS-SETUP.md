# HƯỚNG DẪN SETUP MONGODB ATLAS CHO GREEN NUTRI BACKEND

> Hướng dẫn chi tiết từng bước để setup MongoDB Atlas (miễn phí) cho Green Nutri Backend
>
> **Thời gian**: ~10 phút
> **Chi phí**: FREE (512MB storage)

---

## 📋 MỤC LỤC

1. [Đăng ký MongoDB Atlas Account](#bước-1-đăng-ký-mongodb-atlas-account)
2. [Tạo Database Cluster](#bước-2-tạo-database-cluster)
3. [Tạo Database User](#bước-3-tạo-database-user)
4. [Whitelist IP Address](#bước-4-whitelist-ip-address)
5. [Lấy Connection String](#bước-5-lấy-connection-string)
6. [Cập nhật Backend Config](#bước-6-cập-nhật-backend-config)
7. [Test Connection](#bước-7-test-connection)

---

## BƯỚC 1: Đăng ký MongoDB Atlas Account

### 1.1. Truy cập MongoDB Atlas

Mở trình duyệt và truy cập: **https://www.mongodb.com/cloud/atlas/register**

### 1.2. Chọn phương thức đăng ký

Bạn có 3 options:
- ✅ **Google Account** (Khuyến nghị - nhanh nhất)
- ✅ Email
- ✅ GitHub Account

**→ Chọn "Sign up with Google" nếu có Gmail**

### 1.3. Điền thông tin

Nếu dùng email:
- **Email**: Nhập email của bạn
- **First Name**: Tên
- **Last Name**: Họ
- **Password**: Tạo mật khẩu mạnh
- Tick ✅ "I agree to the Terms of Service"

**→ Click "Create your Atlas account"**

### 1.4. Verify Email

- Check email để verify (nếu đăng ký bằng email)
- Click vào link verification trong email
- Đăng nhập lại nếu cần

---

## BƯỚC 2: Tạo Database Cluster

### 2.1. Màn hình "Welcome to Atlas"

Sau khi đăng nhập, bạn sẽ thấy form tạo cluster.

### 2.2. Chọn Plan

**Tại "Deploy a cloud database":**

```
┌─────────────────────────────────────────┐
│  Deploy a cloud database                │
│                                         │
│  ○ Serverless                           │
│  ● Dedicated                            │
│  ● Shared (FREE)   ← CHỌN CÁI NÀY     │
└─────────────────────────────────────────┘
```

**→ Click "Create" ở mục "Shared" (FREE tier)**

### 2.3. Chọn Cloud Provider & Region

**Cloud Provider:**
- **AWS** (khuyến nghị)
- Google Cloud
- Azure

**Region:**
Chọn region gần Việt Nam nhất (để giảm latency):
- ✅ **Singapore (ap-southeast-1)** ← KHUYẾN NGHỊ
- ✅ **Hong Kong (ap-east-1)**
- ✅ **Mumbai (ap-south-1)**

**Cluster Tier:**
- Giữ nguyên: **M0 Sandbox** (FREE Forever)
- Storage: 512 MB
- Shared RAM

**Cluster Name:**
- Đặt tên: `green-nutri-cluster` (hoặc để mặc định `Cluster0`)

**→ Click "Create Cluster" ở góc dưới bên phải**

### 2.4. Đợi Cluster Deploy

```
⏳ Creating your cluster...
   This may take 3-5 minutes
```

Trong lúc chờ, màn hình sẽ chuyển sang phần tạo user.

---

## BƯỚC 3: Tạo Database User

### 3.1. Security Quickstart - Create User

Bạn sẽ thấy form:

```
┌──────────────────────────────────────────────┐
│  How would you like to authenticate          │
│  your connection?                             │
│                                               │
│  ● Username and Password (khuyến nghị)       │
│  ○ Certificate                                │
└──────────────────────────────────────────────┘
```

### 3.2. Tạo Username và Password

```
Username: greennutri_admin
Password: [Click "Autogenerate Secure Password"]
```

**QUAN TRỌNG**:
- ⚠️ **Copy password ngay!** Bạn sẽ cần dùng lại sau
- Hoặc tự đặt password (ít nhất 8 ký tự)
- **Lưu vào notepad/notes!**

**Ví dụ:**
```
Username: greennutri_admin
Password: GreenNutri2025@Secure
```

**→ Click "Create User"**

---

## BƯỚC 4: Whitelist IP Address

### 4.1. Where would you like to connect from?

Bạn sẽ thấy:

```
┌──────────────────────────────────────────────┐
│  Add entries to your IP Access List          │
│                                               │
│  IP Address:  [________________]              │
│  Description: [________________]              │
│                                               │
│  ○ My Local Environment                      │
│  ○ Cloud Environment                          │
└──────────────────────────────────────────────┘
```

### 4.2. Cho phép ALL IP Addresses (Development)

**Để test nhanh:**

1. Click **"Add My Current IP Address"** (tự động add IP của bạn)

   HOẶC

2. **Cho phép mọi IP** (khuyến nghị cho development):
   ```
   IP Address:  0.0.0.0/0
   Description: Allow all IPs (Development)
   ```

**⚠️ LƯU Ý**:
- `0.0.0.0/0` = cho phép mọi IP kết nối
- Chỉ dùng cho development/testing
- Production nên whitelist IP cụ thể

**→ Click "Add Entry"**

**→ Click "Finish and Close"** ở góc dưới

---

## BƯỚC 5: Lấy Connection String

### 5.1. Vào Database Dashboard

Sau khi setup xong, bạn sẽ thấy dashboard:

```
┌───────────────────────────────────────────────────┐
│  Cluster0 (hoặc green-nutri-cluster)              │
│  ┌──────────────────────────────────────────┐     │
│  │  ● Running (green dot)                    │     │
│  │  M0 Sandbox - Singapore                   │     │
│  │                                            │     │
│  │  [Connect]  [Metrics]  [Collections]      │     │
│  └──────────────────────────────────────────┘     │
└───────────────────────────────────────────────────┘
```

**→ Click nút "Connect"**

### 5.2. Chọn Connection Method

Bạn sẽ thấy 3 options:

```
┌────────────────────────────────────┐
│  Connect to Cluster0                │
│                                     │
│  Choose a connection method:        │
│                                     │
│  1. Shell                           │
│  2. Drivers  ← CHỌN CÁI NÀY        │
│  3. Compass                         │
└────────────────────────────────────┘
```

**→ Click "Drivers"**

### 5.3. Setup Connection

**Step 1: Select your driver and version**
```
Driver: Node.js
Version: 5.5 or later
```

**Step 2: Add your connection string into your application code**

Bạn sẽ thấy connection string như sau:

```
mongodb+srv://greennutri_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**→ Click "Copy" bên cạnh connection string**

### 5.4. Thay <password> bằng password thật

Connection string có dạng:
```
mongodb+srv://greennutri_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Thay `<password>` bằng password bạn đã tạo ở BƯỚC 3:**

**Ví dụ:**
```
BEFORE:
mongodb+srv://greennutri_admin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority

AFTER:
mongodb+srv://greennutri_admin:GreenNutri2025@Secure@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **LƯU Ý**:
- Không giữ dấu `<` và `>`
- Nếu password có ký tự đặc biệt (@, #, $...), cần encode URL
- Ví dụ: `@` → `%40`, `#` → `%23`

### 5.5. Thêm Database Name

Thêm `/greennutri` sau `.mongodb.net`:

```
FINAL CONNECTION STRING:
mongodb+srv://greennutri_admin:GreenNutri2025@Secure@cluster0.abc123.mongodb.net/greennutri?retryWrites=true&w=majority
```

**→ Copy connection string này!**

---

## BƯỚC 6: Cập nhật Backend Config

### 6.1. Mở file .env

```bash
cd /root/miniapp-greennutri/green-nutri-backend
nano .env
```

Hoặc mở bằng editor bất kỳ.

### 6.2. Update MONGODB_URI

Tìm dòng:
```env
MONGODB_URI=mongodb://localhost:27017/greennutri
```

**Thay bằng connection string từ Atlas:**
```env
MONGODB_URI=mongodb+srv://greennutri_admin:GreenNutri2025@Secure@cluster0.abc123.mongodb.net/greennutri?retryWrites=true&w=majority
```

**Full .env file:**
```env
# Server
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://greennutri_admin:GreenNutri2025@Secure@cluster0.abc123.mongodb.net/greennutri?retryWrites=true&w=majority

# JWT
JWT_SECRET=green-nutri-super-secret-key-change-this-in-production
JWT_EXPIRE=7d

# Zalo
ZALO_APP_ID=your-zalo-app-id
ZALO_APP_SECRET=your-zalo-app-secret

# ZaloPay
ZALOPAY_APP_ID=your-zalopay-app-id
ZALOPAY_KEY1=your-zalopay-key1
ZALOPAY_KEY2=your-zalopay-key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2
```

**→ Lưu file (Ctrl + S hoặc Ctrl + O → Enter → Ctrl + X nếu dùng nano)**

---

## BƯỚC 7: Test Connection

### 7.1. Chạy Seed Script

```bash
cd /root/miniapp-greennutri/green-nutri-backend
npm run seed
```

**Kết quả mong đợi:**

```
🌱 Starting seed process...
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
🗑️  Clearing existing data...
📁 Creating categories...
✅ Created 4 categories
📦 Creating products...
✅ Created 4 products

🎉 Seed completed successfully!
📊 Summary:
   - Categories: 4
   - Products: 4
✅ MongoDB Disconnected
```

✅ **Nếu thấy output này = SUCCESS!**

### 7.2. Nếu Có Lỗi

**Error 1: Authentication failed**
```
MongoServerError: bad auth : Authentication failed
```

**Giải pháp:**
- ✅ Check lại username/password trong connection string
- ✅ Đảm bảo không có dấu `<>` trong password
- ✅ Check password có encode đúng (nếu có ký tự đặc biệt)

**Error 2: IP not whitelisted**
```
MongoServerError: Client IP address not in whitelist
```

**Giải pháp:**
- ✅ Quay lại MongoDB Atlas
- ✅ Network Access → Add IP Address → `0.0.0.0/0`

**Error 3: Connection timeout**
```
MongooseServerSelectionError: connect ETIMEDOUT
```

**Giải pháp:**
- ✅ Check internet connection
- ✅ Thử region khác (Singapore → Hong Kong)
- ✅ Check firewall/VPN

### 7.3. Verify Data trên Atlas

1. Quay lại **MongoDB Atlas Dashboard**
2. Click vào cluster → **"Browse Collections"**
3. Bạn sẽ thấy:
   ```
   Database: greennutri
   ├── categories (4 documents)
   └── products (4 documents)
   ```

4. Click vào `products` để xem data:
   ```
   {
     "_id": "...",
     "name": "Sữa Hạt Điều Nguyên Chất",
     "price": 50000,
     "salePrice": 35000,
     ...
   }
   ```

✅ **Nếu thấy data = HOÀN TẤT!**

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Đăng ký MongoDB Atlas account
- [ ] Tạo FREE cluster (M0 Sandbox)
- [ ] Chọn region Singapore/Hong Kong
- [ ] Tạo database user (username + password)
- [ ] Whitelist IP: `0.0.0.0/0`
- [ ] Copy connection string
- [ ] Thay `<password>` bằng password thật
- [ ] Thêm `/greennutri` vào connection string
- [ ] Update `.env` file
- [ ] Chạy `npm run seed` thành công
- [ ] Verify data trên Atlas dashboard

---

## 🚀 NEXT STEPS

Sau khi setup xong MongoDB Atlas:

### 1. Start Backend Server

```bash
cd /root/miniapp-greennutri/green-nutri-backend
npm run dev
```

**Output:**
```
🚀 ════════════════════════════════════════
🚀 Green Nutri Backend API
🚀 Server running on port 3001
🚀 Environment: development
🚀 Health check: http://localhost:3001/health
🚀 ════════════════════════════════════════
```

### 2. Test APIs

**Browser:**
```
http://localhost:3001/health
http://localhost:3001/v1/products
http://localhost:3001/v1/categories
```

**curl:**
```bash
curl http://localhost:3001/v1/products
```

### 3. Kết nối với Mini App

Update mini app để call backend APIs thay vì dùng mock data.

---

## 📊 THÔNG TIN QUAN TRỌNG CẦN LƯU

**MongoDB Atlas:**
```
Email: your-email@gmail.com
Password: your-mongodb-atlas-password
Cluster Name: Cluster0 (hoặc green-nutri-cluster)
Region: Singapore (ap-southeast-1)
```

**Database User:**
```
Username: greennutri_admin
Password: GreenNutri2025@Secure (hoặc password bạn tạo)
```

**Connection String:**
```
mongodb+srv://greennutri_admin:PASSWORD@cluster0.xxxxx.mongodb.net/greennutri?retryWrites=true&w=majority
```

⚠️ **Lưu thông tin này vào nơi an toàn!**

---

## 🆘 TROUBLESHOOTING COMMON ISSUES

### Issue 1: "Cannot connect to MongoDB"

**Kiểm tra:**
1. Internet connection
2. Connection string đúng format
3. Password không có ký tự đặc biệt chưa encode
4. IP đã whitelist

### Issue 2: "Authentication failed"

**Kiểm tra:**
1. Username chính xác
2. Password chính xác (không có `<>`)
3. Database user đã tạo trong Atlas

### Issue 3: "Seed script fails"

**Kiểm tra:**
1. `.env` file đã save đúng
2. Connection string có `/greennutri` ở cuối
3. Cluster đang ở trạng thái "Running" (màu xanh)

---

## 💡 TIPS

1. **Free Tier Limits:**
   - 512 MB storage (đủ cho ~100k products)
   - Shared RAM
   - No backup
   - Perfect cho development!

2. **Monitoring:**
   - Vào Atlas Dashboard → Metrics để xem usage
   - Check connections, operations/second

3. **Security:**
   - Production: Whitelist IP cụ thể thay vì `0.0.0.0/0`
   - Dùng environment variables cho password
   - Rotate password định kỳ

---

**Version**: 1.0
**Last Updated**: 2025-01-07
**Contact**: MongoDB Atlas Support (nếu cần help)
