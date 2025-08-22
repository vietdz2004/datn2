const express = require('express');
const reviewController = require('../controllers/reviewController');
const router = express.Router();

// ===== PUBLIC ROUTES =====
// Lấy đánh giá theo sản phẩm (chỉ hiển thị active)
router.get('/product/:productId', reviewController.getByProduct);

// Lấy thống kê đánh giá cho sản phẩm
router.get('/product/:productId/stats', reviewController.getProductReviewStats);

// ===== USER ROUTES (cần đăng nhập) =====
// Tạo đánh giá mới
router.post('/', reviewController.create);

// Lấy đánh giá của user cho sản phẩm trong đơn hàng cụ thể
router.get('/product/:productId/user/:userId/order/:orderId', reviewController.getUserProductReview);

// Lấy tất cả đánh giá của user
router.get('/user/:userId', reviewController.getUserReviews);

// Cập nhật đánh giá của user
router.put('/:id', reviewController.update);

// ===== ORDER-BASED REVIEW ROUTES =====
// Lấy danh sách sản phẩm trong đơn hàng có thể đánh giá
router.get('/order/:orderId/user/:userId/products', reviewController.getOrderProductsForReview);

// Tạo đánh giá cho sản phẩm trong đơn hàng
router.post('/order/:orderId/product/:productId/user/:userId', reviewController.createOrderReview);

// ===== ADMIN ROUTES =====
// Lấy tất cả đánh giá (admin)
router.get('/', reviewController.getAll);

// Lấy đánh giá theo ID (admin)
router.get('/:id', reviewController.getById);

// Gửi phản hồi admin cho đánh giá
router.post('/:id/reply', reviewController.reply);

// Ẩn/hiện đánh giá (admin)
router.patch('/:id/visibility', reviewController.toggleReviewVisibility);

// Xóa đánh giá (admin - soft delete)
router.delete('/:id', reviewController.delete);

module.exports = router; 