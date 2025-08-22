const { Review, Product, User, Order, OrderDetail } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/database');

// Lấy tất cả đánh giá (admin)
exports.getAll = async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const where = {};
    
    // Filter trạng thái
    if (status) {
      where.trangThai = status;
    }
    
    // Filter search (sản phẩm, user, nội dung)
    if (search) {
      where[Op.or] = [
        { noiDung: { [Op.like]: `%${search}%` } },
      ];
    }
    
    // Phân trang
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Query trực tiếp không dùng associations
    const { count, rows } = await Review.findAndCountAll({
      where,
      order: [['ngayDanhGia', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // Map lại dữ liệu cho FE (không dùng associations)
    const data = rows.map(r => ({
      id_Review: r.id_DanhGia,
      productName: `Product #${r.id_SanPham}`, // Tạm thời
      id_SanPham: r.id_SanPham,
      userName: `User #${r.id_NguoiDung}`, // Tạm thời
      id_NguoiDung: r.id_NguoiDung,
      noiDung: r.noiDung,
      sao: r.danhGiaSao,
      ngayTao: r.ngayDanhGia,
      trangThai: r.trangThai || 'active',
      id_DonHang: r.id_DonHang,
      orderStatus: 'Unknown', // Tạm thời
      phanHoiAdmin: r.phanHoiAdmin,
      ngayPhanHoi: r.ngayPhanHoi
    }));
    
    res.json({
      success: true,
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đánh giá theo id
exports.getById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        { model: Product, attributes: ['id_SanPham', 'tenSp', 'hinhAnh'] },
        { model: User, attributes: ['id_NguoiDung', 'ten', 'email'] },
        { model: Order, attributes: ['id_DonHang', 'trangThaiDonHang', 'ngayDatHang'] }
      ]
    });
    
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới đánh giá (với validation logic mới)
exports.create = async (req, res) => {
  try {
    const { id_SanPham, id_DonHang, noiDung, danhGiaSao } = req.body;
    const id_NguoiDung = req.user?.id || req.body.id_NguoiDung; // Từ auth middleware
    
    // VALIDATION - Kiểm tra dữ liệu đầu vào
    if (!id_SanPham || !id_DonHang || !danhGiaSao) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: id_SanPham, id_DonHang, danhGiaSao'
      });
    }
    
    if (!id_NguoiDung) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng chưa đăng nhập'
      });
    }
    
    // Nội dung không bắt buộc, nhưng nếu có thì phải có ít nhất 10 ký tự
    if (noiDung && noiDung.trim().length > 0 && noiDung.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung đánh giá phải có ít nhất 10 ký tự hoặc để trống'
      });
    }
    
    if (danhGiaSao < 1 || danhGiaSao > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá sao phải từ 1-5'
      });
    }
    
    console.log('📝 Creating new review:', { id_SanPham, id_DonHang, id_NguoiDung, noiDung: noiDung.substring(0, 50) + '...', danhGiaSao });
    
    // VALIDATION - Kiểm tra đơn hàng tồn tại và thuộc về user
    const order = await Order.findByPk(id_DonHang);
    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }
    
    if (order.id_NguoiDung !== parseInt(id_NguoiDung)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền đánh giá đơn hàng này'
      });
    }
    
    // VALIDATION - Kiểm tra đơn hàng đã hoàn thành
    if (order.trangThaiDonHang !== 'da_giao') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đánh giá đơn hàng đã hoàn thành'
      });
    }
    
    // VALIDATION - Kiểm tra sản phẩm có trong đơn hàng không
    const orderDetail = await OrderDetail.findOne({
      where: {
        id_DonHang: id_DonHang,
        id_SanPham: id_SanPham
      }
    });
    
    if (!orderDetail) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không có trong đơn hàng này'
      });
    }
    
    // VALIDATION - Kiểm tra đã đánh giá sản phẩm này trong đơn hàng này chưa
    const existingReview = await Review.findOne({
      where: {
        id_SanPham: id_SanPham,
        id_DonHang: id_DonHang,
        id_NguoiDung: id_NguoiDung
      }
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi'
      });
    }
    
    // Tạo đánh giá mới
    const reviewData = {
      id_SanPham: parseInt(id_SanPham),
      id_DonHang: parseInt(id_DonHang),
      id_NguoiDung: parseInt(id_NguoiDung),
      noiDung: noiDung ? noiDung.trim() : null,
      hinhAnh: req.body.hinhAnh || null,
      danhGiaSao: parseInt(danhGiaSao),
      ngayDanhGia: new Date(),
      trangThai: 'active'
    };
    
    const review = await Review.create(reviewData);
    
    console.log('✅ Review created successfully:', review.id_DanhGia);
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Đánh giá đã được tạo thành công'
    });
    
  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tạo đánh giá', 
      error: error.message 
    });
  }
};

// Cập nhật đánh giá
exports.update = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    
    // Chỉ cho phép cập nhật một số trường nhất định
    const allowedFields = ['noiDung', 'danhGiaSao', 'trangThai'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Validation cho số sao
    if (updateData.danhGiaSao && (updateData.danhGiaSao < 1 || updateData.danhGiaSao > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá sao phải từ 1-5'
      });
    }
    
    // Validation cho nội dung
    if (updateData.noiDung && updateData.noiDung.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung đánh giá phải có ít nhất 10 ký tự'
      });
    }
    
    await review.update(updateData);
    
    res.json({
      success: true,
      data: review,
      message: 'Cập nhật đánh giá thành công'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa đánh giá (soft delete)
exports.delete = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    
    // Soft delete - chỉ cập nhật trạng thái
    await review.update({ trangThai: 'deleted' });
    
    res.json({
      success: true,
      message: 'Đã xóa đánh giá thành công'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đánh giá theo sản phẩm (chỉ hiển thị active)
exports.getByProduct = async (req, res) => {
  try {
    console.log('DEBUG getByProduct req.params =', req.params);
    // Support both /reviews/product/:productId and /products/:id/reviews (productRoutes uses :id)
    const productId = req.params.productId || req.params.id;
    console.log('🔍 Fetching reviews for product:', productId);

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required in params' });
    }

    // Lấy reviews theo id_SanPham, chỉ hiển thị active
    const reviews = await Review.findAll({
      where: { 
        id_SanPham: productId,
        trangThai: 'active'
      },
      include: [
        { model: User, attributes: ['id_NguoiDung', 'ten'] },
        { model: Order, attributes: ['id_DonHang', 'ngayDatHang'] }
      ],
      order: [['ngayDanhGia', 'DESC']]
    });

    console.log('📊 Found reviews for product:', reviews.length);

    res.json({
      success: true,
      data: reviews,
      message: `Tìm thấy ${reviews.length} đánh giá cho sản phẩm ${productId}`
    });
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy đánh giá', 
      error: error.message
    });
  }
};

// API: Gửi phản hồi admin cho đánh giá
exports.reply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    
    review.phanHoiAdmin = reply;
    review.ngayPhanHoi = new Date();
    await review.save();
    
    res.json({ 
      success: true, 
      message: 'Đã gửi phản hồi', 
      data: review 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// API: Lấy danh sách sản phẩm trong đơn hàng mà user có thể đánh giá
exports.getOrderProductsForReview = async (req, res) => {
  try {
    const { orderId, userId } = req.params;
    
    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID và User ID là bắt buộc'
      });
    }

    // Query để lấy sản phẩm trong đơn hàng mà user đã mua
    const query = `
      SELECT DISTINCT
        p.id_SanPham,
        p.tenSp,
        p.hinhAnh,
        p.gia,
        p.giaKhuyenMai,
        od.soLuongMua,
        (od.soLuongMua * COALESCE(od.donGia, od.giaMua, p.gia)) AS thanhTien,
        o.trangThaiDonHang,
        o.ngayDatHang,
        CASE WHEN r.id_DanhGia IS NOT NULL THEN 1 ELSE 0 END as hasReviewed,
        r.id_DanhGia as reviewId,
        r.danhGiaSao,
        r.noiDung as reviewContent,
        r.ngayDanhGia as reviewDate
      FROM chitietdonhang od
      JOIN sanpham p ON od.id_SanPham = p.id_SanPham
      JOIN donhang o ON od.id_DonHang = o.id_DonHang
      LEFT JOIN danhgia r ON p.id_SanPham = r.id_SanPham AND r.id_DonHang = o.id_DonHang AND r.id_NguoiDung = ?
      WHERE o.id_DonHang = ? 
        AND o.id_NguoiDung = ?
        AND o.trangThaiDonHang = 'da_giao'
      ORDER BY p.tenSp ASC
    `;

    const products = await sequelize.query(query, {
      replacements: [userId, orderId, userId],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: products,
      message: `Tìm thấy ${products.length} sản phẩm có thể đánh giá trong đơn hàng ${orderId}`
    });

  } catch (error) {
    console.error('❌ Error getting order products for review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sản phẩm đánh giá',
      error: error.message
    });
  }
};

// API: Tạo đánh giá cho sản phẩm trong đơn hàng (với validation)
exports.createOrderReview = async (req, res) => {
  try {
    // Kiểm tra kết nối database
    const { sequelize } = require('../models/database');
    await sequelize.authenticate();
    
    const { orderId, productId, userId } = req.params;
    const { noiDung, danhGiaSao } = req.body;
    
    console.log('🔍 Debug - Request params:', { orderId, productId, userId });
    console.log('🔍 Debug - Request body:', req.body);
    
    // VALIDATION - Kiểm tra dữ liệu đầu vào
    // Nội dung không bắt buộc, nhưng nếu có thì phải có ít nhất 10 ký tự
    if (noiDung && noiDung.trim().length > 0 && noiDung.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung đánh giá phải có ít nhất 10 ký tự hoặc để trống'
      });
    }
    
    if (!danhGiaSao || danhGiaSao < 1 || danhGiaSao > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá sao phải từ 1-5'
      });
    }

    // VALIDATION - Kiểm tra user đã mua sản phẩm này trong đơn hàng chưa
    const purchaseQuery = `
      SELECT COUNT(*) as count
      FROM chitietdonhang od
      JOIN donhang o ON od.id_DonHang = o.id_DonHang
      WHERE o.id_DonHang = ? 
        AND o.id_NguoiDung = ? 
        AND od.id_SanPham = ?
        AND o.trangThaiDonHang = 'da_giao'
    `;

    const [purchaseResult] = await sequelize.query(purchaseQuery, {
      replacements: [orderId, userId, productId],
      type: QueryTypes.SELECT
    });

    if (purchaseResult.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành'
      });
    }

    // VALIDATION - Kiểm tra user đã đánh giá sản phẩm này trong đơn hàng này chưa
    const existingReview = await Review.findOne({
      where: {
        id_SanPham: productId,
        id_DonHang: orderId,
        id_NguoiDung: userId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi'
      });
    }
    
    console.log('📝 Creating order review:', { orderId, productId, userId, noiDung: noiDung ? noiDung.substring(0, 50) + '...' : 'null', danhGiaSao });
    
    // Tạo đánh giá mới
    const reviewData = {
      id_SanPham: parseInt(productId),
      id_DonHang: parseInt(orderId),
      id_NguoiDung: parseInt(userId),
      noiDung: noiDung ? noiDung.trim() : null,
      hinhAnh: req.body.hinhAnh || null,
      danhGiaSao: parseInt(danhGiaSao) || 5, // Đảm bảo có giá trị mặc định
      ngayDanhGia: new Date(),
      trangThai: 'active'
    };
    
    console.log('📝 Attempting to create review with data:', reviewData);
    
    const review = await Review.create(reviewData);
    
    console.log('✅ Order review created successfully:', review.id_DanhGia);
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Đánh giá đã được tạo thành công'
    });
    
  } catch (error) {
    console.error('❌ Error creating order review:', error);
    
    // Kiểm tra lỗi unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi'
      });
    }
    
    // Kiểm tra lỗi validation
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đánh giá không hợp lệ: ' + error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tạo đánh giá', 
      error: error.message 
    });
  }
};

// API: Lấy đánh giá của user cho sản phẩm trong đơn hàng cụ thể
exports.getUserProductReview = async (req, res) => {
  try {
    const { productId, userId, orderId } = req.params;
    
    const review = await Review.findOne({
      where: {
        id_SanPham: productId,
        id_NguoiDung: userId,
        id_DonHang: orderId
      }
    });

    res.json({
      success: true,
      data: review,
      message: review ? 'Tìm thấy đánh giá' : 'Chưa có đánh giá'
    });

  } catch (error) {
    console.error('❌ Error getting user product review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá',
      error: error.message
    });
  }
};

// API: Lấy tất cả đánh giá của user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows } = await Review.findAndCountAll({
      where: { 
        id_NguoiDung: userId,
        trangThai: { [Op.ne]: 'deleted' }
      },
      include: [
        { model: Product, attributes: ['id_SanPham', 'tenSp', 'hinhAnh'] },
        { model: Order, attributes: ['id_DonHang', 'ngayDatHang'] }
      ],
      order: [['ngayDanhGia', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      },
      message: `Tìm thấy ${count} đánh giá của người dùng`
    });
    
  } catch (error) {
    console.error('❌ Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá người dùng',
      error: error.message
    });
  }
};

// API: Ẩn/hiện đánh giá (admin)
exports.toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;
    
    if (!['active', 'hidden'].includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }
    
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }
    
    await review.update({ trangThai });
    
    res.json({
      success: true,
      message: `Đã ${trangThai === 'hidden' ? 'ẩn' : 'hiển thị'} đánh giá thành công`,
      data: { id, trangThai }
    });
    
  } catch (error) {
    console.error('❌ Error toggling review visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thay đổi trạng thái đánh giá',
      error: error.message
    });
  }
};

// API: Lấy thống kê đánh giá cho sản phẩm
exports.getProductReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID là bắt buộc'
      });
    }

    // Query để lấy thống kê đánh giá
    const statsQuery = `
      SELECT 
        COUNT(*) as totalReviews,
        AVG(danhGiaSao) as averageRating,
        MIN(danhGiaSao) as minRating,
        MAX(danhGiaSao) as maxRating,
        SUM(CASE WHEN danhGiaSao = 5 THEN 1 ELSE 0 END) as fiveStar,
        SUM(CASE WHEN danhGiaSao = 4 THEN 1 ELSE 0 END) as fourStar,
        SUM(CASE WHEN danhGiaSao = 3 THEN 1 ELSE 0 END) as threeStar,
        SUM(CASE WHEN danhGiaSao = 2 THEN 1 ELSE 0 END) as twoStar,
        SUM(CASE WHEN danhGiaSao = 1 THEN 1 ELSE 0 END) as oneStar
      FROM danhgia 
      WHERE id_SanPham = ? AND trangThai = 'active'
    `;

    const [stats] = await sequelize.query(statsQuery, {
      replacements: [productId],
      type: QueryTypes.SELECT
    });

    // Tính toán phần trăm cho mỗi sao
    const total = parseInt(stats.totalReviews);
    const ratingStats = {
      totalReviews: total,
      averageRating: total > 0 ? parseFloat(stats.averageRating).toFixed(1) : '0.0',
      minRating: parseInt(stats.minRating) || 0,
      maxRating: parseInt(stats.maxRating) || 0,
      ratingDistribution: {
        5: {
          count: parseInt(stats.fiveStar) || 0,
          percentage: total > 0 ? Math.round((parseInt(stats.fiveStar) / total) * 100) : 0
        },
        4: {
          count: parseInt(stats.fourStar) || 0,
          percentage: total > 0 ? Math.round((parseInt(stats.fourStar) / total) * 100) : 0
        },
        3: {
          count: parseInt(stats.threeStar) || 0,
          percentage: total > 0 ? Math.round((parseInt(stats.threeStar) / total) * 100) : 0
        },
        2: {
          count: parseInt(stats.twoStar) || 0,
          percentage: total > 0 ? Math.round((parseInt(stats.twoStar) / total) * 100) : 0
        },
        1: {
          count: parseInt(stats.oneStar) || 0,
          percentage: total > 0 ? Math.round((parseInt(stats.oneStar) / total) * 100) : 0
        }
      }
    };

    res.json({
      success: true,
      data: ratingStats,
      message: `Thống kê đánh giá cho sản phẩm ${productId}`
    });

  } catch (error) {
    console.error('❌ Error getting product review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê đánh giá',
      error: error.message
    });
  }
};