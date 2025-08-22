# HỆ THỐNG ĐÁNH GIÁ SẢN PHẨM - HOASHOP

## 📋 Tổng quan

Hệ thống đánh giá sản phẩm mới của Hoashop được thiết kế để đảm bảo tính minh bạch và chính xác. Chỉ những khách hàng đã mua sản phẩm và đơn hàng đã hoàn thành mới có thể đánh giá.

## 🎯 Tính năng chính

### 1. Đánh giá theo đơn hàng
- Mỗi sản phẩm chỉ được đánh giá 1 lần trong 1 đơn hàng
- Đánh giá được gắn với đơn hàng cụ thể
- Hỗ trợ đánh giá nhiều lần cho cùng 1 sản phẩm nếu mua ở các đơn hàng khác nhau

### 2. Validation nghiêm ngặt
- Kiểm tra đơn hàng tồn tại và thuộc về user
- Kiểm tra đơn hàng đã hoàn thành (trạng thái 'da_giao')
- Kiểm tra sản phẩm có trong đơn hàng
- Kiểm tra chưa đánh giá sản phẩm này trong đơn hàng này

### 3. Quản lý admin
- Xem tất cả đánh giá
- Ẩn/hiện đánh giá
- Gửi phản hồi cho đánh giá
- Xóa đánh giá (soft delete)

## 🗄️ Cấu trúc Database

### Bảng `danhgia` (reviews)
```sql
CREATE TABLE `danhgia` (
  `id_DanhGia` INT AUTO_INCREMENT PRIMARY KEY,
  `id_SanPham` INT NOT NULL,
  `id_DonHang` INT NOT NULL,
  `id_NguoiDung` INT NOT NULL,
  `noiDung` TEXT NOT NULL,
  `danhGiaSao` INT NOT NULL CHECK (danhGiaSao >= 1 AND danhGiaSao <= 5),
  `ngayDanhGia` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `trangThai` ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
  `phanHoiAdmin` TEXT NULL,
  `ngayPhanHoi` DATETIME NULL,
  
  -- Indexes
  UNIQUE KEY `unique_review_per_order` (`id_SanPham`, `id_DonHang`, `id_NguoiDung`),
  INDEX `idx_review_product` (`id_SanPham`),
  INDEX `idx_review_order` (`id_DonHang`),
  INDEX `idx_review_user` (`id_NguoiDung`),
  INDEX `idx_review_status` (`trangThai`)
);
```

## 🔌 API Endpoints

### Public Routes
```
GET /api/reviews/product/:productId - Lấy đánh giá theo sản phẩm (chỉ active)
```

### User Routes (cần đăng nhập)
```
POST /api/reviews - Tạo đánh giá mới
GET /api/reviews/product/:productId/user/:userId/order/:orderId - Lấy đánh giá của user cho sản phẩm trong đơn hàng
GET /api/reviews/user/:userId - Lấy tất cả đánh giá của user
PUT /api/reviews/:id - Cập nhật đánh giá của user
```

### Order-based Review Routes
```
GET /api/reviews/order/:orderId/user/:userId/products - Lấy danh sách sản phẩm có thể đánh giá trong đơn hàng
POST /api/reviews/order/:orderId/product/:productId/user/:userId - Tạo đánh giá cho sản phẩm trong đơn hàng
```

### Admin Routes
```
GET /api/reviews - Lấy tất cả đánh giá (admin)
GET /api/reviews/:id - Lấy đánh giá theo ID (admin)
POST /api/reviews/:id/reply - Gửi phản hồi admin cho đánh giá
PATCH /api/reviews/:id/visibility - Ẩn/hiện đánh giá (admin)
DELETE /api/reviews/:id - Xóa đánh giá (admin - soft delete)
```

## 🚀 Cách sử dụng

### 1. Khách hàng đánh giá sản phẩm

```javascript
// Lấy danh sách sản phẩm có thể đánh giá trong đơn hàng
const products = await reviewAPI.getOrderProductsForReview(orderId, userId);

// Tạo đánh giá
const reviewData = {
  noiDung: 'Sản phẩm rất tốt!',
  danhGiaSao: 5
};

const review = await reviewAPI.createOrderReview(orderId, productId, userId, reviewData);
```

### 2. Admin quản lý đánh giá

```javascript
// Lấy tất cả đánh giá
const reviews = await reviewAPI.getAll({ page: 1, limit: 20 });

// Ẩn đánh giá
await reviewAPI.toggleVisibility(reviewId, 'hidden');

// Gửi phản hồi
await reviewAPI.reply(reviewId, { reply: 'Cảm ơn bạn đã đánh giá!' });

// Xóa đánh giá
await reviewAPI.delete(reviewId);
```

## 🔒 Bảo mật

### Validation Rules
1. **User Authentication**: Chỉ user đã đăng nhập mới có thể đánh giá
2. **Order Ownership**: Chỉ có thể đánh giá đơn hàng của chính mình
3. **Order Status**: Chỉ đánh giá đơn hàng đã hoàn thành
4. **Product Validation**: Sản phẩm phải có trong đơn hàng
5. **Duplicate Prevention**: Mỗi sản phẩm chỉ đánh giá 1 lần trong 1 đơn hàng

### Admin Permissions
- Xem tất cả đánh giá
- Ẩn/hiện đánh giá
- Gửi phản hồi
- Xóa đánh giá (soft delete)

## 📱 Frontend Integration

### ReviewForm Component
```jsx
<ReviewForm
  open={showReviewForm}
  onClose={() => setShowReviewForm(false)}
  productId={product.id_SanPham}
  productName={product.tenSp}
  orderId={orderId}
  userId={userId}
  isOrderReview={true}
  onReviewSubmitted={handleReviewSubmitted}
/>
```

### API Service
```javascript
import { reviewAPI } from '../services/api';

// Tạo đánh giá
const review = await reviewAPI.createOrderReview(orderId, productId, userId, reviewData);

// Lấy đánh giá sản phẩm
const reviews = await reviewAPI.getByProduct(productId);
```

## 🧪 Testing

### Chạy test script
```bash
cd be
node test-review-system.js
```

### Test cases
1. ✅ Lấy đánh giá theo sản phẩm
2. ✅ Lấy danh sách sản phẩm có thể đánh giá
3. ✅ Tạo đánh giá mới
4. ✅ Tạo đánh giá theo đơn hàng
5. ✅ Lấy đánh giá của user
6. ✅ Admin quản lý đánh giá
7. ✅ Gửi phản hồi admin
8. ✅ Ẩn/hiện đánh giá
9. ✅ Xóa đánh giá (soft delete)

## 🚨 Lưu ý quan trọng

### Migration Database
Trước khi sử dụng, cần chạy migration để cập nhật cấu trúc bảng:
```bash
mysql -u root -p hoanghe < migrations/update_review_table_structure.sql
```

### Environment Variables
Đảm bảo các biến môi trường đã được cấu hình:
- `JWT_SECRET`: Secret key cho JWT
- `DB_*`: Thông tin kết nối database

### Dependencies
Cài đặt các package cần thiết:
```bash
npm install
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs server
2. Chạy test script để debug
3. Kiểm tra cấu trúc database
4. Liên hệ team development

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-19  
**Author**: Hoashop Development Team
