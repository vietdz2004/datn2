const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const router = express.Router();

// ===== WISHLIST ROUTES - API Danh sách yêu thích =====

// GET /api/wishlist?userId=1 - Lấy danh sách yêu thích của user
router.get('/', wishlistController.getUserWishlist);

// GET /api/wishlist/count?userId=1 - Đếm số sản phẩm yêu thích
router.get('/count', wishlistController.getWishlistCount);

// GET /api/wishlist/check/:productId?userId=1 - Kiểm tra sản phẩm có trong yêu thích không
router.get('/check/:productId', wishlistController.checkInWishlist);

// POST /api/wishlist - Thêm sản phẩm vào yêu thích
// Body: { userId: 1, productId: 1 }
router.post('/', wishlistController.addToWishlist);

// DELETE /api/wishlist/:productId?userId=1 - Xóa sản phẩm khỏi yêu thích
router.delete('/:productId', wishlistController.removeFromWishlist);

// DELETE /api/wishlist?userId=1 - Xóa toàn bộ wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router; 