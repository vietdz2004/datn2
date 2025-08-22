const { Cart, Product, User } = require('../models');
const { Op } = require('sequelize');

// Lấy tất cả item trong giỏ hàng của user
exports.getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const cartItems = await Cart.findAll({
      where: { id_NguoiDung: userId },
      include: [
        {
          model: Product,
          attributes: ['id_SanPham', 'tenSp', 'gia', 'giaKhuyenMai', 'hinhAnh', 'thuongHieu', 'soLuongTon']
        }
      ],
      order: [['ngayThem', 'DESC']]
    });

    // Format response để match với frontend cart context
    const formattedItems = cartItems.map(item => ({
      id_SanPham: item.id_SanPham,
      tenSp: item.Product.tenSp,
      gia: parseFloat(item.Product.gia),
      giaKhuyenMai: item.Product.giaKhuyenMai ? parseFloat(item.Product.giaKhuyenMai) : null,
      hinhAnh: item.Product.hinhAnh,
      thuongHieu: item.Product.thuongHieu,
      soLuong: item.soLuong,
      quantity: item.soLuong, // Alias for compatibility
      giaTaiThoiDiem: parseFloat(item.giaTaiThoiDiem),
      ngayThem: item.ngayThem,
      ngayCapNhat: item.ngayCapNhat
    }));

    // Tính tổng
    const totalItems = formattedItems.reduce((sum, item) => sum + item.soLuong, 0);
    const totalAmount = formattedItems.reduce((sum, item) => {
      const price = item.giaKhuyenMai || item.gia;
      return sum + (price * item.soLuong);
    }, 0);

    res.json({
      success: true,
      data: {
        items: formattedItems,
        totalItems,
        totalAmount,
        message: `Found ${formattedItems.length} items in cart`
      }
    });
  } catch (error) {
    console.error('Error getting cart items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Product ID are required' 
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Kiểm tra tồn kho
    if (product.soLuongTon < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Available: ${product.soLuongTon}` 
      });
    }

    // Kiểm tra item đã có trong giỏ hàng chưa
    const existingCartItem = await Cart.findOne({
      where: { 
        id_NguoiDung: userId, 
        id_SanPham: productId 
      }
    });

    const currentPrice = product.giaKhuyenMai || product.gia;

    if (existingCartItem) {
      // Update quantity nếu đã tồn tại
      const newQuantity = existingCartItem.soLuong + parseInt(quantity);
      
      // Kiểm tra tồn kho cho số lượng mới
      if (product.soLuongTon < newQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot add ${quantity} more. Maximum available: ${product.soLuongTon - existingCartItem.soLuong}` 
        });
      }

      await existingCartItem.update({
        soLuong: newQuantity,
        giaTaiThoiDiem: currentPrice,
        ngayCapNhat: new Date()
      });

      res.json({
        success: true,
        data: existingCartItem,
        message: 'Cart item updated successfully'
      });
    } else {
      // Tạo mới cart item
      const newCartItem = await Cart.create({
        id_NguoiDung: userId,
        id_SanPham: productId,
        soLuong: parseInt(quantity),
        giaTaiThoiDiem: currentPrice
      });

      res.status(201).json({
        success: true,
        data: newCartItem,
        message: 'Product added to cart successfully'
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid quantity is required' 
      });
    }

    const cartItem = await Cart.findOne({
      where: { 
        id_NguoiDung: userId, 
        id_SanPham: productId 
      }
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    // Nếu quantity = 0, xóa item
    if (quantity === 0) {
      await cartItem.destroy();
      return res.json({
        success: true,
        message: 'Cart item removed successfully'
      });
    }

    // Kiểm tra tồn kho
    const product = await Product.findByPk(productId);
    if (product && product.soLuongTon < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Available: ${product.soLuongTon}` 
      });
    }

    // Cập nhật số lượng
    await cartItem.update({
      soLuong: parseInt(quantity),
      ngayCapNhat: new Date()
    });

    res.json({
      success: true,
      data: cartItem,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cartItem = await Cart.findOne({
      where: { 
        id_NguoiDung: userId, 
        id_SanPham: productId 
      }
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Cart item removed successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Xóa tất cả items trong giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedCount = await Cart.destroy({
      where: { id_NguoiDung: userId }
    });

    res.json({
      success: true,
      data: { deletedCount },
      message: `Cleared ${deletedCount} items from cart`
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Sync cart từ localStorage lên database (cho migration)
exports.syncCartFromLocalStorage = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    if (!userId || !Array.isArray(cartItems)) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and cart items array are required' 
      });
    }

    // Xóa cart cũ trong database
    await Cart.destroy({ where: { id_NguoiDung: userId } });

    // Thêm items từ localStorage
    const syncedItems = [];
    for (const item of cartItems) {
      try {
        // Verify product exists
        const product = await Product.findByPk(item.id_SanPham);
        if (!product) continue;

        const currentPrice = product.giaKhuyenMai || product.gia;
        const quantity = Math.min(item.soLuong || item.quantity || 1, product.soLuongTon);

        if (quantity > 0) {
          const cartItem = await Cart.create({
            id_NguoiDung: userId,
            id_SanPham: item.id_SanPham,
            soLuong: quantity,
            giaTaiThoiDiem: currentPrice
          });
          syncedItems.push(cartItem);
        }
      } catch (itemError) {
        console.error(`Error syncing item ${item.id_SanPham}:`, itemError);
        // Continue with other items
      }
    }

    res.json({
      success: true,
      data: {
        syncedItems,
        syncedCount: syncedItems.length,
        originalCount: cartItems.length
      },
      message: `Successfully synced ${syncedItems.length}/${cartItems.length} cart items`
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}; 