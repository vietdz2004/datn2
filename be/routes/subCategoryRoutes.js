const express = require('express');
const subCategoryController = require('../controllers/subCategoryController');
const router = express.Router();

// Định nghĩa các route cho danh mục chi tiết
router.get('/', subCategoryController.getAll);
router.get('/category/:categoryId', subCategoryController.getByCategory);
router.get('/:id', subCategoryController.getById);
router.post('/', subCategoryController.create);
router.put('/:id', subCategoryController.update);
router.delete('/:id', subCategoryController.delete);

module.exports = router; 