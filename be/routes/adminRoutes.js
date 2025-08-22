const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import controllers - Import các controller cần thiết
const dashboardController = require('../controllers/dashboardController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const subCategoryController = require('../controllers/subCategoryController');
const reviewController = require('../controllers/reviewController');
const { requestRefund } = require('../services/paymentService');

// Import admin route modules
const adminVoucherRoutes = require('./admin/voucherRoutes');

// Multer config for product image upload - Cấu hình upload ảnh sản phẩm
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ được phép upload file ảnh!'), false);
    }
  }
});

// ===== DASHBOARD ROUTES - API Dashboard =====
router.get('/dashboard/overview', dashboardController.getOverview);
router.get('/dashboard/recent-activities', dashboardController.getRecentActivities);
router.get('/dashboard/sales-stats', dashboardController.getSalesStats);
router.get('/dashboard/product-stats', dashboardController.getProductStats);
router.get('/dashboard/order-stats', dashboardController.getOrderStats);
router.get('/dashboard/user-stats', dashboardController.getUserStats);
router.get('/dashboard/revenue-chart', dashboardController.getRevenueChart);
router.get('/dashboard/top-products', dashboardController.getTopProducts);
router.get('/dashboard/low-stock', dashboardController.getLowStockProducts);

// ===== PRODUCT ROUTES - API Quản lý sản phẩm =====
// Basic CRUD - Các thao tác cơ bản
router.get('/products', productController.getAll);
router.get('/products/:id', productController.getById);
router.post('/products', upload.single('image'), productController.create);
router.put('/products/:id', upload.single('image'), productController.update);
router.delete('/products/:id', productController.delete);

// Product management - Quản lý sản phẩm
router.put('/products/:id/status', productController.updateStatus);

// Bulk operations - Thao tác hàng loạt
router.post('/products/bulk/delete', productController.bulkDelete);

// Search & Filter - Tìm kiếm và lọc
router.get('/products/search/advanced', productController.searchProducts);
router.get('/products/filter/discounted', productController.getDiscountProducts);
router.get('/products/filter/by-category/:categoryId', productController.getProductsByCategory);

// ===== ORDER ROUTES - API Quản lý đơn hàng =====
// Basic CRUD - Các thao tác cơ bản
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id', orderController.updateOrder);
router.delete('/orders/:id', orderController.deleteOrder);

// Order management - Quản lý đơn hàng
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Cancellation request handling - Xử lý yêu cầu hủy đơn hàng
router.put('/orders/:id/approve-cancellation', orderController.approveCancellation);
router.put('/orders/:id/reject-cancellation', orderController.rejectCancellation);

// Refund handling (manual trigger by admin)
router.post('/orders/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, provider, reason } = req.body;
    // read order for defaults
    const [row] = await require('../models/Order').sequelize.query(
      'SELECT phuongThucThanhToan, trangThaiThanhToan, tongThanhToan FROM donhang WHERE id_DonHang = ?',
      { replacements: [id], type: require('../models/Order').sequelize.QueryTypes.SELECT }
    );
    if (!row) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    if ((row.trangThaiThanhToan || '').toUpperCase() !== 'DA_THANH_TOAN') {
      return res.status(400).json({ success: false, message: 'Đơn hàng chưa thanh toán, không thể hoàn tiền' });
    }
    const usedProvider = provider || row.phuongThucThanhToan || 'UNKNOWN';
    const usedAmount = amount || row.tongThanhToan || 0;
    const result = await requestRefund({ orderId: id, provider: usedProvider, amount: usedAmount, reason });
    const newStatus = result.success ? 'REFUND_SUCCESS' : 'REFUND_FAILED';
    await require('../models/Order').sequelize.query(
      'UPDATE donhang SET trangThaiThanhToan = ? WHERE id_DonHang = ?',
      { replacements: [newStatus, id], type: require('../models/Order').sequelize.QueryTypes.UPDATE }
    );
    res.json({ success: result.success, message: result.message, status: newStatus, reference: result.reference });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Lỗi xử lý hoàn tiền', error: e.message });
  }
});

// Note: Bulk operations and analytics removed in optimization
// These features can be re-added later if needed

// ===== USER ROUTES - API Quản lý người dùng =====
// Basic CRUD - Các thao tác cơ bản
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

// User management - Quản lý người dùng
router.put('/users/:id/status', userController.updateUserStatus);
router.get('/users/:id/orders', userController.getUserOrders);

// Analytics - Thống kê
router.get('/users/analytics/summary', userController.getUsersSummary);
router.get('/users/analytics/activity', userController.getUserActivity);

// Bulk operations - Thao tác hàng loạt
router.post('/users/bulk/update-status', userController.bulkUpdateUserStatus);
router.post('/users/bulk/delete', userController.bulkDeleteUsers);

// Export - Xuất dữ liệu
router.get('/users/export/excel', userController.exportUsersToExcel);

// ===== CATEGORY ROUTES - API Quản lý danh mục =====
// Basic CRUD - Các thao tác cơ bản
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/tree', categoryController.getCategoryTree); // Route lấy cây danh mục
router.get('/categories/:id', categoryController.getById);
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.delete);

// SubCategory management - Quản lý danh mục con
router.get('/categories/:categoryId/subcategories', categoryController.getSubCategories);
router.post('/categories/:categoryId/subcategories', categoryController.createSubCategory);
router.put('/categories/subcategories/:id', categoryController.updateSubCategory);
router.delete('/categories/subcategories/:id', categoryController.deleteSubCategory);

// Analytics & Bulk operations - Thống kê và thao tác hàng loạt
router.get('/categories/analytics/summary', categoryController.getCategorySummary);
router.get('/categories/:id/products', categoryController.getCategoryProducts);
router.post('/categories/bulk/delete', categoryController.bulkDeleteCategories);
router.post('/categories/subcategories/bulk/delete', categoryController.bulkDeleteSubCategories);

// ===== VOUCHER ROUTES - API Quản lý voucher =====
// Use separate voucher routes module  
router.use('/vouchers', adminVoucherRoutes);

// ===== REVIEW ROUTES - API Quản lý đánh giá =====
router.get('/reviews', reviewController.getAll);
router.get('/reviews/:id', reviewController.getById);
router.post('/reviews/:id/reply', reviewController.reply);
router.patch('/reviews/:id/visibility', reviewController.toggleReviewVisibility);
router.delete('/reviews/:id', reviewController.delete);

module.exports = router; 