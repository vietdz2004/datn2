const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const subCategoryController = require('../controllers/subCategoryController');

// Get all categories
router.get('/', categoryController.getAll);

// Get categories with subcategories (for ProductPage filtering)
router.get('/with-subcategories', categoryController.getAll);

// Get categories with products for navigation menu
router.get('/with-products', async (req, res) => {
  try {
    console.log('📡 /with-products endpoint hit');
    const sequelize = require('../models/database');
    
    // Query để lấy categories với subcategories và count sản phẩm
    const categoriesWithProducts = await sequelize.query(`
      SELECT 
        c.id_DanhMuc,
        c.tenDanhMuc,
        sc.id_DanhMucChiTiet,
        sc.tenDanhMucChiTiet,
        COUNT(p.id_SanPham) as product_count
      FROM danhmuc c
      LEFT JOIN danhmucchitiet sc ON c.id_DanhMuc = sc.id_DanhMuc
      LEFT JOIN sanpham p ON sc.id_DanhMucChiTiet = p.id_DanhMucChiTiet 
        AND p.trangthai = 1
      GROUP BY c.id_DanhMuc, c.tenDanhMuc, sc.id_DanhMucChiTiet, sc.tenDanhMucChiTiet
      ORDER BY c.id_DanhMuc, sc.id_DanhMucChiTiet
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('📊 Raw query results:', categoriesWithProducts.length);

    // Group categories và subcategories
    const categoriesMap = new Map();
    
    categoriesWithProducts.forEach(row => {
      const categoryId = row.id_DanhMuc;
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id_DanhMuc: categoryId,
          tenDanhMuc: row.tenDanhMuc,
          SubCategories: [],
          totalProducts: 0
        });
      }
      
      const category = categoriesMap.get(categoryId);
      
      if (row.id_DanhMucChiTiet && parseInt(row.product_count) > 0) {
        category.SubCategories.push({
          id_DanhMucChiTiet: row.id_DanhMucChiTiet,
          id_DanhMuc: categoryId,
          tenDanhMucChiTiet: row.tenDanhMucChiTiet,
          product_count: parseInt(row.product_count) || 0
        });
        
        category.totalProducts += parseInt(row.product_count) || 0;
      }
    });

    // Convert Map to Array và chỉ lấy categories có sản phẩm
    const categories = Array.from(categoriesMap.values())
      .filter(cat => cat.totalProducts > 0);

    console.log('✅ Processed categories:', categories.length);
    console.log('📋 Categories data:', JSON.stringify(categories, null, 2));

    res.json({
      success: true,
      data: categories,
      message: 'Lấy danh sách danh mục có sản phẩm thành công'
    });
  } catch (error) {
    console.error('❌ Error in categories/with-products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

// Put parameterized routes AFTER specific routes
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);
router.get('/sub-categories', subCategoryController.getAll);
router.get('/tree', categoryController.getCategoryTree);

module.exports = router; 