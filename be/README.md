# 🌸 HoaShop Backend API

## Mô tả
Backend API cho website bán hoa HoaShop được xây dựng với Node.js, Express và MySQL.

## Công nghệ sử dụng
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework  
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload
- **CORS** - Cross-origin resource sharing

## Cấu trúc dự án
```
backend/
├── app.js                 # Main server file
├── package.json          # Dependencies 
├── config.env            # Environment variables
├── controllers/          # Business logic
│   ├── admin/           # Admin controllers
│   ├── cartController.js
│   ├── categoryController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── userController.js
│   └── ...
├── models/              # Database models
│   ├── database.js      # Database connection
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── ...
├── routes/             # API routes
│   ├── admin/         # Admin routes
│   ├── userRoutes.js
│   ├── productRoutes.js
│   └── ...
├── public/            # Static files
│   └── images/        # Uploaded images
├── data/             # Database backup
└── migrations/       # Database migrations
```

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình database
- Tạo database MySQL tên `hoanghe`
- Import file `/data/hoanghe.sql` vào database
- Cấu hình kết nối trong `config.env`

### 3. Cấu hình environment
Tạo file `config.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hoanghe

PORT=5002
NODE_ENV=development

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### 4. Chạy server
```bash
# Development mode
npm run dev

# Production mode  
npm start
```

Server sẽ chạy tại: http://localhost:5002

## API Endpoints

### Authentication
- `POST /api/users/auth/login` - Đăng nhập
- `POST /api/users/auth/register` - Đăng ký
- `GET /api/users/auth/verify` - Xác thực token

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `GET /api/products/discount` - Sản phẩm giảm giá
- `GET /api/products/popular` - Sản phẩm phổ biến

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/subcategories` - Lấy danh mục con

### Cart
- `GET /api/cart/:userId` - Lấy giỏ hàng
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `PUT /api/cart/:userId/:productId` - Cập nhật số lượng
- `DELETE /api/cart/:userId/:productId` - Xóa khỏi giỏ hàng

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders/user/:userId` - Đơn hàng của user

### Quick Orders
- `POST /api/quick-orders` - Tạo đơn đặt nhanh
- `GET /api/quick-orders` - Lấy danh sách đơn nhanh

### Admin APIs
- `GET /api/admin/dashboard/overview` - Thống kê tổng quan
- `GET /api/admin/products` - Quản lý sản phẩm (admin)
- `GET /api/admin/orders` - Quản lý đơn hàng (admin)
- `GET /api/admin/users` - Quản lý người dùng (admin)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development)"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Features

### ✅ Đã hoàn thành
- 🔐 Authentication & Authorization (JWT)
- 📦 Product Management
- 🛒 Shopping Cart
- 📋 Order Management  
- ⚡ Quick Order
- 🏷️ Category Management
- 👥 User Management
- 📊 Admin Dashboard
- 🔍 Search & Filtering
- 📱 File Upload
- 💾 Database với relationships

### 🚧 Đang phát triển
- 📧 Email notifications
- 💳 Payment integration
- 📈 Advanced analytics
- 🎫 Voucher system
- ⭐ Review system

## Database Schema

### Main Tables
- `nguoidung` - Users
- `sanpham` - Products  
- `danhmuc` - Categories
- `danhmucchitiet` - Subcategories
- `donhang` - Orders
- `chitietdonhang` - Order details
- `giohang` - Cart
- `quick_orders` - Quick orders

## Error Handling
- Global error handler
- Input validation
- SQL injection protection
- Authentication middleware

## Scripts
```bash
npm start      # Chạy production server
npm run dev    # Chạy development server với nodemon
```

## Support
- Email: support@hoashop.com
- Documentation: Xem file API_ADMIN_STRUCTURE.md cho admin APIs

---
Built with ❤️ by HoaShop Team 