# 🌸 HoaShop Frontend

## Mô tả
Frontend cho website bán hoa HoaShop được xây dựng với React, Vite và Material-UI.

## Công nghệ sử dụng
- **React 19** - JavaScript library cho UI
- **Vite** - Build tool nhanh 
- **Material-UI (MUI)** - Component library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **SCSS** - CSS preprocessor
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Cấu trúc dự án
```
frontend/
├── public/              # Static assets
│   ├── images/         # Product images & banners
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductList.jsx
│   │   └── ...
│   ├── pages/          # Page components
│   │   ├── HomePage.jsx
│   │   ├── ProductPage.jsx
│   │   ├── CartPage.jsx
│   │   └── ...
│   ├── contexts/       # React contexts
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── layouts/        # Layout components
│   │   └── MainLayout.jsx
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── package.json
├── vite.config.js      # Vite configuration
└── README.md
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm >= 8.0.0

### Các bước cài đặt
1. Clone repository và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Chạy development server:
   ```bash
   npm run dev
   ```

4. Mở trình duyệt và truy cập: `http://localhost:3000`

### Scripts có sẵn
- `npm run dev` - Chạy development server trên port 3000
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint và tự động fix
- `npm run format` - Format code với Prettier

## Tính năng chính

### Khách hàng
- 🏠 **Trang chủ** với banner slider và sản phẩm nổi bật
- 📱 **Danh mục sản phẩm** với filter và search
- 🌸 **Chi tiết sản phẩm** với hình ảnh và thông tin đầy đủ
- 🛒 **Giỏ hàng** với quản lý số lượng
- 💳 **Thanh toán** với form đặt hàng
- 👤 **Tài khoản** với đăng nhập/đăng ký
- 📦 **Đơn hàng** theo dõi trạng thái
- ⭐ **Đánh giá** sản phẩm

### Giao diện
- 🎨 **Modern UI** với Material-UI components
- 📱 **Responsive Design** tương thích mobile/tablet
- 🎯 **UX tối ưu** với loading states và error handling
- 🌈 **Theme màu sắc** phù hợp với website bán hoa

## API Integration
Frontend kết nối với backend API tại `http://localhost:5002/api`

### Endpoints chính:
- `/api/products` - Quản lý sản phẩm
- `/api/categories` - Danh mục sản phẩm  
- `/api/cart` - Giỏ hàng
- `/api/orders` - Đơn hàng
- `/api/users` - Người dùng & authentication

## Environment Variables
Tạo file `.env` với các biến:
```
VITE_API_URL=http://localhost:5002/api
VITE_IMAGE_URL=http://localhost:5002
```

## Deployment
1. Build production:
   ```bash
   npm run build
   ```

2. Files sẽ được tạo trong thư mục `dist/`

3. Deploy lên hosting provider (Vercel, Netlify, etc.)

## Đóng góp
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## Liên hệ
- Email: hoashop@example.com
- Website: https://hoashop.com

---
Made with 💖 by HoaShop Team
