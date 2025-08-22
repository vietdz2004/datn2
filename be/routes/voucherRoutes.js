const express = require('express');
const voucherController = require('../controllers/voucherController');
const router = express.Router();

// Định nghĩa các route cho voucher
router.get('/', voucherController.getAll);
router.get('/available', voucherController.getAvailable);
router.get('/:id', voucherController.getById);
router.post('/', voucherController.create);
router.post('/validate', voucherController.validate);
router.post('/apply', voucherController.apply);
router.put('/:id', voucherController.update);
router.delete('/:id', voucherController.delete);

// API cũ để tương thích
router.post('/validate-voucher', voucherController.validateVoucher);

module.exports = router; 