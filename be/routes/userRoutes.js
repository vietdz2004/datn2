const express = require('express');
const userController = require('../controllers/userController');
const requireAuth = require('../middlewares/auth');
const router = express.Router();

console.log('🚀 UserRoutes module loaded');

// Debug middleware cho user routes
router.use((req, res, next) => {
  console.log(`📍 UserRoutes: ${req.method} ${req.path}`);
  next();
});

// Auth routes - Di chuyển tất cả auth routes vào /auth namespace
router.post('/auth/login', userController.login);
router.post('/auth/register', userController.register);
router.post('/auth/logout', userController.logout);
router.get('/auth/verify', userController.verifyToken);
router.put('/auth/profile', requireAuth, userController.updateProfile);

// Password management routes
router.post('/auth/change-password', userController.changePassword);
router.post('/auth/forgot-password', userController.forgotPassword);
router.post('/auth/reset-password', userController.resetPassword);
router.get('/auth/verify-reset-token/:token', userController.verifyResetToken);

// Đăng nhập cho admin (legacy route - có thể xóa sau)
router.post('/login', userController.login);

// Định nghĩa các route cho user
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

console.log('✅ UserRoutes configured with auth routes');

module.exports = router; 