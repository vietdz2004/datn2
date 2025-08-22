const { Wishlist, Product, User } = require('../models');

// ===== GET USER WISHLIST - Lấy danh sách yêu thích của user =====
exports.getUserWishlist = async (req, res) => {
  try {
    // Tạm thời lấy userId từ query params (sau này sẽ lấy từ JWT token)
    const userId = req.query.userId || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId là bắt buộc'
      });
    }
    
    console.log('💖 Fetching wishlist for user:', userId);
    
    // Lấy wishlist với thông tin sản phẩm
    const wishlistItems = await Wishlist.findAll({
      where: { id_NguoiDung: userId },
      include: [
        {
          model: Product,
          attributes: ['id_SanPham', 'tenSp', 'gia', 'giaKhuyenMai', 'hinhAnh', 'soLuongTon']
        }
      ],
      order: [['ngayThem', 'DESC']]
    });
    
    console.log('📊 Found wishlist items:', wishlistItems.length);
    
    res.json({
      success: true,
      data: wishlistItems,
      count: wishlistItems.length,
      message: `Tìm thấy ${wishlistItems.length} sản phẩm yêu thích`
    });
    
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách yêu thích',
      error: error.message
    });
  }
};

// ===== ADD TO WISHLIST - Thêm sản phẩm vào yêu thích =====
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    // VALIDATION - Kiểm tra dữ liệu đầu vào
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId là bắt buộc'
      });
    }
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId là bắt buộc'
      });
    }
    
    console.log('💕 Adding to wishlist:', { userId, productId });
    
    // Kiểm tra xem sản phẩm đã có trong wishlist chưa
    const existingItem = await Wishlist.findOne({
      where: {
        id_NguoiDung: userId,
        id_SanPham: productId
      }
    });
    
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã có trong danh sách yêu thích'
      });
    }
    
    // Tạo wishlist item mới
    const wishlistItem = await Wishlist.create({
      id_NguoiDung: parseInt(userId),
      id_SanPham: parseInt(productId),
      ngayThem: new Date()
    });
    
    console.log('✅ Added to wishlist successfully:', wishlistItem.id_YeuThich);
    
    res.status(201).json({
      success: true,
      data: wishlistItem,
      message: 'Đã thêm sản phẩm vào danh sách yêu thích'
    });
    
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    
    // Handle unique constraint error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã có trong danh sách yêu thích'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm vào yêu thích',
      error: error.message
    });
  }
};

// ===== REMOVE FROM WISHLIST - Xóa sản phẩm khỏi yêu thích =====
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId là bắt buộc'
      });
    }
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId là bắt buộc'
      });
    }
    
    console.log('💔 Removing from wishlist:', { userId, productId });
    
    // Tìm và xóa item từ wishlist
    const deletedCount = await Wishlist.destroy({
      where: {
        id_NguoiDung: userId,
        id_SanPham: productId
      }
    });
    
    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong danh sách yêu thích'
      });
    }
    
    console.log('✅ Removed from wishlist successfully');
    
    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi danh sách yêu thích'
    });
    
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa khỏi yêu thích',
      error: error.message
    });
  }
};

// ===== CHECK IF IN WISHLIST - Kiểm tra sản phẩm có trong yêu thích không =====
exports.checkInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId là bắt buộc'
      });
    }
    
    console.log('🔍 Checking wishlist status:', { userId, productId });
    
    const wishlistItem = await Wishlist.findOne({
      where: {
        id_NguoiDung: userId,
        id_SanPham: productId
      }
    });
    
    const isInWishlist = !!wishlistItem;
    
    res.json({
      success: true,
      data: {
        isInWishlist,
        productId: parseInt(productId),
        userId: parseInt(userId)
      },
      message: isInWishlist ? 'Sản phẩm đã có trong yêu thích' : 'Sản phẩm chưa có trong yêu thích'
    });
    
  } catch (error) {
    console.error('❌ Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra yêu thích',
      error: error.message
    });
  }
};

// ===== GET WISHLIST COUNT - Đếm số lượng sản phẩm yêu thích =====
exports.getWishlistCount = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId là bắt buộc'
      });
    }
    
    const count = await Wishlist.count({
      where: { id_NguoiDung: userId }
    });
    
    res.json({
      success: true,
      data: { count, userId: parseInt(userId) },
      message: `Có ${count} sản phẩm trong yêu thích`
    });
    
  } catch (error) {
    console.error('❌ Error getting wishlist count:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đếm yêu thích',
      error: error.message
    });
  }
};

// ===== CLEAR WISHLIST - Xóa toàn bộ wishlist =====
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId là bắt buộc'
      });
    }
    
    console.log('🗑️ Clearing wishlist for user:', userId);
    
    const deletedCount = await Wishlist.destroy({
      where: { id_NguoiDung: userId }
    });
    
    res.json({
      success: true,
      data: { deletedCount, userId: parseInt(userId) },
      message: `Đã xóa ${deletedCount} sản phẩm khỏi danh sách yêu thích`
    });
    
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa yêu thích',
      error: error.message
    });
  }
}; 