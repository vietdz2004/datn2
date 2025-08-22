const express = require('express');
const router = express.Router();
const voucherController = require('../../controllers/voucherController');

// ===== ADMIN VOUCHER ROUTES - API Quản lý voucher cho admin =====

// Voucher management (specific routes first) - Quản lý voucher
router.get('/available', voucherController.getAvailable);
router.post('/validate', voucherController.validate);

// Basic CRUD - Các thao tác cơ bản
router.get('/', voucherController.getAll);
router.get('/:id', voucherController.getById);
router.post('/', voucherController.create);
router.put('/:id', voucherController.update);
router.delete('/:id', voucherController.delete);

// Export as admin voucher routes
module.exports = router; 