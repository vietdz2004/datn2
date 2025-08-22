const express = require('express');
const cartController = require('../controllers/cartController');
const router = express.Router();

// Cart Routes
// GET /cart/:userId - Lấy tất cả items trong giỏ hàng của user
router.get('/:userId', cartController.getCartItems);

// POST /cart/add - Thêm sản phẩm vào giỏ hàng
router.post('/add', cartController.addToCart);

// PUT /cart/:userId/:productId - Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:userId/:productId', cartController.updateCartItem);

// DELETE /cart/:userId/:productId - Xóa sản phẩm khỏi giỏ hàng
router.delete('/:userId/:productId', cartController.removeFromCart);

// DELETE /cart/:userId - Xóa tất cả items trong giỏ hàng
router.delete('/:userId', cartController.clearCart);

// POST /cart/sync - Sync cart từ localStorage lên database
router.post('/sync', cartController.syncCartFromLocalStorage);

module.exports = router; 