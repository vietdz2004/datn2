# 🌸 HoaShop - E-commerce Platform

A modern e-commerce platform for flower shop built with Node.js, React, and MySQL.

## 🚀 Features

### 🛍️ Customer Features
- Browse and search products
- Shopping cart management
- Order placement and tracking
- User authentication
- Product reviews and ratings
- Order history

### 👨‍💼 Admin Features
- **Advanced Order Management**
  - Smart search (by order ID, phone, email)
  - Advanced filtering (date range, status, amount)
  - Order status tracking and updates
  - Real-time statistics
- Product management (CRUD operations)
- User management
- Sales analytics and reports
- Voucher/discount management

## 🏗️ Architecture

```
hoats/
├── be/                 # Backend (Node.js + Express)
│   ├── controllers/    # API controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── app.js         # Server entry point
├── fe/                 # Customer Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   └── package.json
├── admin-fe/           # Admin Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Multer** - File upload
- **Nodemailer** - Email service

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React Router** - Routing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hoats.git
cd hoats
```

2. **Backend Setup**
```bash
cd be
npm install
cp config.env.example config.env
# Edit config.env with your database credentials
npm start
```

3. **Customer Frontend Setup**
```bash
cd fe
npm install
npm run dev
```

4. **Admin Frontend Setup**
```bash
cd admin-fe
npm install
npm run dev
```

### Default URLs
- **Backend API**: http://localhost:5002
- **Customer Frontend**: http://localhost:5173
- **Admin Frontend**: http://localhost:5175

## 📊 Database Schema

### Key Tables
- `nguoidung` - Users
- `sanpham` - Products
- `donhang` - Orders
- `chitietdonhang` - Order details
- `danhgiasanpham` - Product reviews
- `voucher` - Discount vouchers

## 🔧 API Endpoints

### Orders API
```
GET    /api/admin/orders              # Get all orders with advanced search
POST   /api/orders                    # Create new order
GET    /api/orders/:id                # Get order details
PUT    /api/orders/:id/status         # Update order status
DELETE /api/orders/:id                # Cancel order
```

### Products API
```
GET    /api/products                  # Get all products
POST   /api/products                  # Create product (admin)
GET    /api/products/:id              # Get product details
PUT    /api/products/:id              # Update product (admin)
DELETE /api/products/:id              # Delete product (admin)
```

## 🎯 Recent Updates

### Order Management System v2.0
- ✅ **Advanced Search**: Smart search by order ID, phone, email
- ✅ **Multi-filter Support**: Date range, status, amount filters
- ✅ **Real-time Statistics**: Order counts and revenue by status
- ✅ **Streamlined Status Flow**: Simplified 5-status workflow
- ✅ **Responsive Design**: Mobile-friendly admin interface
- ✅ **Performance Optimized**: Efficient database queries

### Status Flow
```
Chờ xử lý (cho_xu_ly) → Đã xác nhận (da_xac_nhan) → Đang giao hàng (dang_giao) → Đã giao hàng (da_giao)
                      ↘                           ↘                            ↘
                        Đã hủy (huy_boi_admin)     Đã hủy (huy_boi_admin)       (End State)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Pham Van Viet**
- GitHub: [@phamvanviet](https://github.com/phamvanviet)
- Email: phamvanvietz2004z@gmail.com

## 🙏 Acknowledgments

- Material-UI for the beautiful components
- Node.js community for excellent packages
- React team for the amazing framework

---

⭐ Star this repository if you found it helpful!
