const express = require('express');
const orderController = require('../controllers/orderController');
const router = express.Router();

// Định nghĩa các route cho đơn hàng
router.get('/', orderController.getAll);
router.get('/user/:userId', orderController.getByUser);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.put('/:id/cancel', orderController.cancelOrder);
router.delete('/:id', orderController.delete);

module.exports = router; 