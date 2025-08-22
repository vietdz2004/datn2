const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

// Import multer from app.js (we'll need to pass it)
// For now, we'll set it up here
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/images/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Định nghĩa các route cho sản phẩm - thứ tự quan trọng!
// Special routes phải đặt trước generic routes

router.get('/test', productController.test); // Debug route
router.get('/search', productController.searchProducts);
router.get('/discount', productController.getDiscountProducts);
router.get('/popular', productController.getPopularProducts);
router.get('/new', productController.getNewProducts);
router.get('/bestseller', productController.getBestsellerProducts);
router.get('/by-category', productController.getProductsByCategory);
router.get('/by-categories', productController.getProductsByCategories);

// Routes cho specific product (với ID parameter)
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id/reviews', (req, res) => {
  // Gọi đến reviewController.getByProduct
  const reviewController = require('../controllers/reviewController');
  reviewController.getByProduct(req, res);
});
router.get('/:id', productController.getById);

// CRUD routes
router.post('/', upload.single('image'), productController.create);
router.put('/:id', upload.single('image'), productController.update);
router.patch('/:id/status', productController.updateStatus);
router.delete('/:id', productController.delete);

// Bulk operations
router.post('/bulk-create', upload.single('file'), productController.bulkCreate);
router.delete('/bulk-delete', productController.bulkDelete);

// General route (phải đặt cuối)
router.get('/', productController.getAll);

module.exports = router; 