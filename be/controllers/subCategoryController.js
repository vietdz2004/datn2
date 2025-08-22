const { SubCategory, Category, Product } = require('../models');

// Lấy tất cả danh mục chi tiết
exports.getAll = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [Category]
    });
    res.json({
      success: true,
      data: subCategories,
      message: 'Lấy danh sách danh mục chi tiết thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy danh mục chi tiết theo id
exports.getById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id, {
      include: [Category, Product]
    });
    if (!subCategory) return res.status(404).json({ message: 'Không tìm thấy danh mục chi tiết' });
    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới danh mục chi tiết
exports.create = async (req, res) => {
  try {
    const subCategory = await SubCategory.create(req.body);
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật danh mục chi tiết
exports.update = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);
    if (!subCategory) return res.status(404).json({ message: 'Không tìm thấy danh mục chi tiết' });
    await subCategory.update(req.body);
    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa danh mục chi tiết
exports.delete = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);
    if (!subCategory) return res.status(404).json({ message: 'Không tìm thấy danh mục chi tiết' });
    await subCategory.destroy();
    res.json({ message: 'Đã xóa danh mục chi tiết' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh mục chi tiết theo danh mục cha
exports.getByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      where: { id_DanhMuc: req.params.categoryId },
      include: [Category]
    });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 