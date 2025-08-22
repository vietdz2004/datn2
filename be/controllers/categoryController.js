const { Category, SubCategory, Product } = require('../models');
const { isDatabaseAvailable, getMockData, sequelize } = require('../models/database');
const { QueryTypes } = require('sequelize');

// Lấy tất cả danh mục với số lượng sản phẩm (Customer version)
exports.getAll = async (req, res) => {
  try {
    console.log('🔍 Getting all categories...');
    
    // Check if database is available
    if (!isDatabaseAvailable()) {
      console.log('📱 Using mock data for categories');
      const mockCategories = getMockData('categories');
      return res.json({
        success: true,
        data: mockCategories,
        message: 'Lấy danh sách danh mục thành công (mock data)'
      });
    }

    // Use real database
    const categories = await Category.findAll({
      include: [SubCategory],
      order: [['id_DanhMuc', 'ASC']]
    });

    console.log(`✅ Found ${categories.length} categories`);
    
    res.json({
      success: true,
      data: categories,
      message: 'Lấy danh sách danh mục thành công'
    });
  } catch (error) {
    console.error('❌ Error in getAll categories:', error);
    
    // Fallback to mock data on error
    console.log('📱 Falling back to mock data');
    const mockCategories = getMockData('categories');
    res.json({
      success: true,
      data: mockCategories,
      message: 'Lấy danh sách danh mục thành công (fallback)'
    });
  }
};

// ADMIN: Get all categories with advanced filtering (Merged from adminCategoryController)
exports.getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'tenDanhMuc',
      sortOrder = 'ASC'
    } = req.query;

    const whereConditions = [];
    const queryParams = [];

    if (search) {
      whereConditions.push('c.tenDanhMuc LIKE ?');
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT sc.id_DanhMucChiTiet) as subCategoryCount,
        COUNT(DISTINCT p.id_SanPham) as productCount
      FROM danhmuc c
      LEFT JOIN danhmucchitiet sc ON c.id_DanhMuc = sc.id_DanhMuc
      LEFT JOIN sanpham p ON sc.id_DanhMucChiTiet = p.id_DanhMucChiTiet
      ${whereClause}
      GROUP BY c.id_DanhMuc
      ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);

    const categories = await sequelize.query(query, {
      replacements: queryParams,
      type: QueryTypes.SELECT
    });

    const countQuery = `SELECT COUNT(*) as total FROM danhmuc c ${whereClause}`;
    const [countResult] = await sequelize.query(countQuery, {
      replacements: queryParams.slice(0, -2),
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục',
      error: error.message
    });
  }
};

// ADMIN: Get category summary (Merged from adminCategoryController)
exports.getCategorySummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT c.id_DanhMuc) as totalCategories,
        COUNT(DISTINCT sc.id_DanhMucChiTiet) as totalSubCategories,
        COUNT(DISTINCT p.id_SanPham) as totalProducts,
        COUNT(DISTINCT CASE WHEN p.trangThai = 'active' THEN p.id_SanPham END) as activeProducts
      FROM danhmuc c
      LEFT JOIN danhmucchitiet sc ON c.id_DanhMuc = sc.id_DanhMuc
      LEFT JOIN sanpham p ON sc.id_DanhMucChiTiet = p.id_DanhMucChiTiet
    `;

    const [summary] = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error in getCategorySummary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan danh mục',
      error: error.message
    });
  }
};

// ADMIN: Bulk delete categories (Merged from adminCategoryController)
exports.bulkDeleteCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID danh mục không hợp lệ'
      });
    }

    await Category.destroy({
      where: { id_DanhMuc: categoryIds }
    });

    res.json({
      success: true,
      message: `Đã xóa ${categoryIds.length} danh mục thành công`
    });
  } catch (error) {
    console.error('Error in bulkDeleteCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hàng loạt danh mục',
      error: error.message
    });
  }
};

// ADMIN: Get subcategories (Merged from adminCategoryController)
exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subCategories = await SubCategory.findAll({
      where: { id_DanhMuc: categoryId },
      include: [Category]
    });

    res.json({
      success: true,
      data: subCategories
    });
  } catch (error) {
    console.error('Error in getSubCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục con',
      error: error.message
    });
  }
};

// ADMIN: Create subcategory (Merged from adminCategoryController)
exports.createSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { tenDanhMucChiTiet } = req.body;

    if (!tenDanhMucChiTiet) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục con không được để trống'
      });
    }

    const subCategory = await SubCategory.create({
      id_DanhMuc: categoryId,
      tenDanhMucChiTiet
    });

    res.status(201).json({
      success: true,
      data: subCategory,
      message: 'Tạo danh mục con thành công'
    });
  } catch (error) {
    console.error('Error in createSubCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh mục con',
      error: error.message
    });
  }
};

// ADMIN: Update subcategory (Merged from adminCategoryController)
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục con'
      });
    }

    await subCategory.update(updateData);

    res.json({
      success: true,
      data: subCategory,
      message: 'Cập nhật danh mục con thành công'
    });
  } catch (error) {
    console.error('Error in updateSubCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật danh mục con',
      error: error.message
    });
  }
};

// ADMIN: Delete subcategory (Merged from adminCategoryController)
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục con'
      });
    }

    await subCategory.destroy();

    res.json({
      success: true,
      message: 'Xóa danh mục con thành công'
    });
  } catch (error) {
    console.error('Error in deleteSubCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa danh mục con',
      error: error.message
    });
  }
};

// ADMIN: Get products in category (Merged from adminCategoryController)
exports.getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT p.*, sc.tenDanhMucChiTiet
                FROM sanpham p 
      JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      WHERE sc.id_DanhMuc = ?
      ORDER BY p.tenSp ASC
      LIMIT ? OFFSET ?
    `;

    const products = await sequelize.query(query, {
      replacements: [id, parseInt(limit), offset],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error in getCategoryProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm theo danh mục',
      error: error.message
    });
  }
};

// ADMIN: Bulk delete subcategories (Merged from adminCategoryController)
exports.bulkDeleteSubCategories = async (req, res) => {
  try {
    const { subCategoryIds } = req.body;

    if (!subCategoryIds || !Array.isArray(subCategoryIds) || subCategoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID danh mục con không hợp lệ'
      });
    }

    await SubCategory.destroy({
      where: { id_DanhMucChiTiet: subCategoryIds }
    });

    res.json({
      success: true,
      message: `Đã xóa ${subCategoryIds.length} danh mục con thành công`
    });
  } catch (error) {
    console.error('Error in bulkDeleteSubCategories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi xóa hàng loạt danh mục con',
      error: error.message 
    });
  }
};

// ADMIN: Get all categories with their sub-categories (tree structure)
exports.getCategoryTree = async (req, res) => {
  try {
    console.log('🌳 getCategoryTree called');
    
    // Lấy tất cả danh mục cha
    const categories = await Category.findAll({
      order: [['id_DanhMuc', 'ASC']],
      raw: true
    });
    console.log('📂 Categories found:', categories.length);
    
    // Lấy tất cả danh mục con
    const subCategories = await SubCategory.findAll({
      order: [['id_DanhMuc', 'ASC']],
      raw: true
    });
    console.log('📁 SubCategories found:', subCategories.length);
    
    // Gộp subCategories vào từng category
    const tree = categories.map(cat => ({
      ...cat,
      subCategories: subCategories.filter(sc => sc.id_DanhMuc === cat.id_DanhMuc)
    }));
    
    console.log('🌲 Tree built:', tree.length, 'parents');
    
    res.json({
      success: true,
      data: tree,
      message: 'Lấy danh mục cha và con thành công'
    });
  } catch (error) {
    console.error('❌ Error in getCategoryTree:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh mục cha-con',
      error: error.message
    });
  }
};

// ===== ORIGINAL FUNCTIONS (kept for backward compatibility) =====

// Lấy danh mục theo id
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [SubCategory]
    });
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới danh mục
exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật danh mục
exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    await category.update(req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa danh mục
exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    await category.destroy();
    res.json({ message: 'Đã xóa danh mục' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 