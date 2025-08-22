# 🔧 Debug Lỗi Review API

## 🚨 Lỗi hiện tại: 500 Internal Server Error

### Vấn đề:
- Frontend gửi đánh giá → Backend trả về lỗi 500
- Console hiển thị: "Failed to load resource: :5002/api/reviews/or...product/17/user/7:1 the server responded with a status of 500"

### 🔍 Các bước debug đã thực hiện:

#### 1. **Sửa lỗi xử lý noiDung**
```javascript
// Trước (có thể gây lỗi nếu noiDung là null)
console.log('📝 Creating order review:', { orderId, productId, userId, noiDung: noiDung.substring(0, 50) + '...', danhGiaSao });

// Sau (kiểm tra null trước khi substring)
console.log('📝 Creating order review:', { orderId, productId, userId, noiDung: noiDung ? noiDung.substring(0, 50) + '...' : 'null', danhGiaSao });
```

#### 2. **Thêm xử lý lỗi chi tiết**
```javascript
} catch (error) {
  console.error('❌ Error creating order review:', error);
  
  // Kiểm tra lỗi unique constraint
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi'
    });
  }
  
  // Kiểm tra lỗi validation
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đánh giá không hợp lệ: ' + error.message
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: 'Lỗi server khi tạo đánh giá', 
    error: error.message 
  });
}
```

#### 3. **Thêm kiểm tra database connection**
```javascript
exports.createOrderReview = async (req, res) => {
  try {
    // Kiểm tra kết nối database
    const { sequelize } = require('../models/database');
    await sequelize.authenticate();
    
    // ... rest of the code
```

#### 4. **Thêm logging chi tiết**
```javascript
console.log('🔍 Debug - Request params:', { orderId, productId, userId });
console.log('🔍 Debug - Request body:', req.body);
console.log('📝 Attempting to create review with data:', reviewData);
```

#### 5. **Sửa lỗi xử lý danhGiaSao**
```javascript
danhGiaSao: parseInt(danhGiaSao) || 5, // Đảm bảo có giá trị mặc định
```

#### 6. **Cải thiện xử lý lỗi frontend**
```javascript
if (err.response?.status === 500) {
  setError('Lỗi server khi tạo đánh giá. Vui lòng thử lại sau.');
} else if (err.response?.data?.message) {
  setError(err.response.data.message);
}
```

## 🧪 Test Script

Tạo file `be/test-review-api.js` để test API:
```javascript
const axios = require('axios');

const testReviewAPI = async () => {
  try {
    const testData = {
      noiDung: 'Sản phẩm rất đẹp và chất lượng tốt!',
      danhGiaSao: 5,
      hinhAnh: null
    };
    
    const url = 'http://localhost:5002/api/reviews/order/1/product/1/user/1';
    
    const response = await axios.post(url, testData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testReviewAPI();
```

## 🔍 Cách debug tiếp theo:

### 1. **Kiểm tra logs backend**
```bash
cd be
npm start
# Xem logs khi gửi đánh giá
```

### 2. **Kiểm tra database**
```sql
-- Kiểm tra bảng danhgia
DESCRIBE danhgia;

-- Kiểm tra dữ liệu hiện tại
SELECT * FROM danhgia LIMIT 5;

-- Kiểm tra unique constraint
SHOW INDEX FROM danhgia;
```

### 3. **Test API trực tiếp**
```bash
cd be
node test-review-api.js
```

### 4. **Kiểm tra network tab**
- Mở Developer Tools → Network
- Gửi đánh giá và xem request/response

## 📋 Checklist kiểm tra:

- [ ] Backend server đang chạy trên port 5002
- [ ] Database connection hoạt động
- [ ] Models được import đúng cách
- [ ] Unique constraint không bị vi phạm
- [ ] Dữ liệu gửi từ frontend đúng format
- [ ] Validation logic hoạt động đúng

## 🚀 Cách khởi động để test:

```bash
# Terminal 1: Backend
cd be && npm start

# Terminal 2: Frontend
cd fe && npm run dev

# Terminal 3: Test API
cd be && node test-review-api.js
```

## 📱 Truy cập:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5002/api
- Test API: http://localhost:5002/api/reviews/order/1/product/1/user/1
