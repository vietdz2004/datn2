const { Order, User, Voucher, OrderDetail, Product } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/database');
const { 
  sendCancelOrderNotificationEmail, 
  sendApprovedCancellationEmail, 
  sendRejectedCancellationEmail,
  sendAdminCancelledOrderEmail,
  sendFailedDeliveryEmail
} = require('../services/emailService');

// ==========================================
// 📋 TRẠNG THÁI ĐƠN HÀNG - CHUẨN HÓA
// ==========================================
// 
// 1. Trạng thái đơn hàng (orderStatus):
//    - pending: Chờ xác nhận 
//    - confirmed: Đã xác nhận  
//    - shipping: Đang giao
//    - delivered: Đã giao
//    - cancelled: Đã hủy
//
// 2. Trạng thái thanh toán (paymentStatus):
//    - unpaid: Chưa thanh toán
//    - pending: Chờ thanh toán (online)
//    - paid: Đã thanh toán
//    - failed: Thanh toán thất bại
//    - refunded: Hoàn tiền
//
// ==========================================

// =============================
// INVENTORY HELPERS
// =============================
async function decreaseInventoryForItems(items, transaction) {
  for (const item of items) {
    const productId = item.id_SanPham;
    const quantity = parseInt(item.soLuongMua || item.soLuong || item.quantity || 1);
    if (!productId || !quantity || quantity <= 0) {
      throw new Error('Thông tin sản phẩm đặt không hợp lệ để trừ tồn kho');
    }
    
    const rows = await sequelize.query(
      'SELECT soLuongTon FROM sanpham WHERE id_SanPham = ? FOR UPDATE',
      { replacements: [productId], type: QueryTypes.SELECT, transaction }
    );
    
    if (!rows || rows.length === 0) {
      throw new Error(`Sản phẩm ${productId} không tồn tại`);
    }
    
    const currentStock = parseInt(rows[0].soLuongTon || 0);
    if (currentStock < quantity) {
      throw new Error(`Sản phẩm ${productId} không đủ tồn kho. Còn lại: ${currentStock}, yêu cầu: ${quantity}`);
    }
    
    await sequelize.query(
      'UPDATE sanpham SET soLuongTon = soLuongTon - ? WHERE id_SanPham = ?',
      { replacements: [quantity, productId], type: QueryTypes.UPDATE, transaction }
    );
    
    console.log(`📦 Đã trừ tồn kho sản phẩm ${productId}: ${quantity}`);
  }
}

async function restoreInventoryForOrder(orderId, transaction) {
  const items = await sequelize.query(
    'SELECT id_SanPham, soLuongMua FROM chitietdonhang WHERE id_DonHang = ?',
    { replacements: [orderId], type: QueryTypes.SELECT, transaction }
  );
  
  for (const item of items) {
    const productId = item.id_SanPham;
    const quantity = parseInt(item.soLuongMua || 1);
    
    await sequelize.query(
      'UPDATE sanpham SET soLuongTon = soLuongTon + ? WHERE id_SanPham = ?',
      { replacements: [quantity, productId], type: QueryTypes.UPDATE, transaction }
    );
    
    console.log(`📦 Đã khôi phục tồn kho sản phẩm ${productId}: ${quantity}`);
  }
}

// =============================
// CORE ORDER FUNCTIONS
// =============================

// GET /api/admin/orders - Lấy danh sách đơn hàng (admin) với tìm kiếm nâng cao
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      trangThaiDonHang = '',
      // Tìm kiếm nâng cao
      orderId = '',
      customerPhone = '',
      customerEmail = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      minAmount = '',
      maxAmount = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    console.log('📋 Admin order query params:', {
      search, trangThaiDonHang, orderId, customerPhone, customerEmail, 
      status, dateFrom, dateTo, minAmount, maxAmount, page, limit
    });
    
    let whereClause = '';
    let params = [parseInt(limit), parseInt(offset)];
    
    // Tìm kiếm cơ bản (backward compatibility)
    if (search.trim()) {
      whereClause += ` AND (o.maDonHang LIKE ? OR u.ten LIKE ? OR u.soDienThoai LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.unshift(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // Tìm kiếm nâng cao
    if (orderId.trim()) {
      whereClause += ` AND o.maDonHang LIKE ?`;
      params.unshift(`%${orderId.trim()}%`);
    }
    
    if (customerPhone.trim()) {
      whereClause += ` AND u.soDienThoai LIKE ?`;
      params.unshift(`%${customerPhone.trim()}%`);
    }
    
    if (customerEmail.trim()) {
      whereClause += ` AND u.email LIKE ?`;
      params.unshift(`%${customerEmail.trim()}%`);
    }
    
    // Trạng thái (hỗ trợ cả hai tham số)
    const statusFilter = status.trim() || trangThaiDonHang.trim();
    if (statusFilter) {
      whereClause += ` AND o.trangThaiDonHang = ?`;
      params.unshift(statusFilter);
    }
    
    // Lọc theo ngày
    if (dateFrom.trim()) {
      whereClause += ` AND DATE(o.ngayDatHang) >= ?`;
      params.unshift(dateFrom.trim());
    }
    
    if (dateTo.trim()) {
      whereClause += ` AND DATE(o.ngayDatHang) <= ?`;
      params.unshift(dateTo.trim());
    }
    
    // Lọc theo giá trị đơn hàng
    if (minAmount.trim() && !isNaN(minAmount)) {
      whereClause += ` AND o.tongThanhToan >= ?`;
      params.unshift(parseFloat(minAmount));
    }
    
    if (maxAmount.trim() && !isNaN(maxAmount)) {
      whereClause += ` AND o.tongThanhToan <= ?`;
      params.unshift(parseFloat(maxAmount));
    }
    
    console.log('🔍 Executing query with params:', params);
    
    const mainQuery = `
      SELECT
        o.*,
        u.ten as customerName,
        u.email as customerEmail,
        u.soDienThoai as customerPhone,
        u.diaChi as customerAddress,
        COUNT(od.id_ChiTietDH) as itemCount
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      LEFT JOIN chitietdonhang od ON o.id_DonHang = od.id_DonHang
      WHERE 1=1 ${whereClause}
      GROUP BY o.id_DonHang
      ORDER BY o.ngayDatHang DESC
      LIMIT ? OFFSET ?
    `;
    
    console.log('📝 Main query:', mainQuery);
    
    const [orders] = await sequelize.query(mainQuery, { replacements: params });
    
    const countQuery = `
      SELECT COUNT(DISTINCT o.id_DonHang) as total
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      WHERE 1=1 ${whereClause}
    `;
    
    const countParams = params.slice(0, -2);
    const [countResult] = await sequelize.query(countQuery, { replacements: countParams });
    const total = parseInt(countResult[0]?.total || 0);
    
    // Thống kê theo trạng thái
    const statsQuery = `
      SELECT 
        o.trangThaiDonHang,
        COUNT(*) as count,
        SUM(o.tongThanhToan) as totalAmount
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      WHERE 1=1 ${whereClause}
      GROUP BY o.trangThaiDonHang
    `;
    
    const [statsResult] = await sequelize.query(statsQuery, { replacements: countParams });
    
    const stats = {
      total,
      byStatus: statsResult.reduce((acc, item) => {
        acc[item.trangThaiDonHang] = {
          count: parseInt(item.count),
          totalAmount: parseFloat(item.totalAmount || 0)
        };
        return acc;
      }, {})
    };
    
    console.log('✅ Query results:', { ordersCount: orders.length, total, stats });
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải danh sách đơn hàng',
      error: error.message
    });
  }
};

// GET /api/orders - Lấy danh sách đơn hàng (public)
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const offset = (page - 1) * limit;
    
    let whereCondition = {};
    if (status) whereCondition.trangThaiDonHang = status;
    if (userId) whereCondition.id_NguoiDung = userId;
    
    const orders = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        { model: User, attributes: ['ten', 'email', 'soDienThoai'] },
        { model: OrderDetail, include: [{ model: Product }] }
      ],
      order: [['ngayDatHang', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: orders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.count,
        totalPages: Math.ceil(orders.count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải danh sách đơn hàng',
      error: error.message
    });
  }
};

// GET /api/orders/:id - Lấy chi tiết đơn hàng
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ['ten', 'email', 'soDienThoai', 'diaChi'] },
        { model: OrderDetail, include: [{ model: Product }] },
        { model: Voucher }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải chi tiết đơn hàng',
      error: error.message
    });
  }
};

// Alias for admin
exports.getOrderById = exports.getById;

// GET /api/orders/user/:userId - Lấy đơn hàng của user
exports.getByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Getting orders for user: ${userId}`);
    
    console.log('✅ Database connection OK');
    
    const [orders] = await sequelize.query(`
      SELECT 
        o.*,
        COUNT(od.id_ChiTietDH) as itemCount
      FROM donhang o
      LEFT JOIN chitietdonhang od ON o.id_DonHang = od.id_DonHang  
      WHERE o.id_NguoiDung = ?
      GROUP BY o.id_DonHang
      ORDER BY o.ngayDatHang DESC
    `, { replacements: [userId] });
    
    console.log(`📦 Found orders: ${orders.length}`);
    
    // Get order details for each order
    const ordersWithDetails = [];
    for (const order of orders) {
      console.log(`🔍 Order ${order.id_DonHang} has ${order.itemCount} items`);
      
      const [orderDetails] = await sequelize.query(`
        SELECT 
          od.*,
          sp.tenSp,
          sp.hinhAnh,
          sp.gia as giaBan,
          (od.soLuongMua * od.donGia) as calculatedThanhTien
        FROM chitietdonhang od
        JOIN sanpham sp ON od.id_SanPham = sp.id_SanPham
        WHERE od.id_DonHang = ?
      `, { replacements: [order.id_DonHang] });
      
      let calculatedTotal = 0;
      orderDetails.forEach(detail => {
        const quantity = parseInt(detail.soLuongMua) || 0;
        const price = parseFloat(detail.donGia) || parseFloat(detail.giaBan) || 0;
        const itemTotal = quantity * price;
        detail.calculatedThanhTien = itemTotal;
        calculatedTotal += itemTotal;
        
        console.log(`   Item ${detail.id_ChiTietDH}: thanhTien=${detail.thanhTien}, soLuong=${detail.soLuongMua}, giaBan=${detail.giaBan}, calculatedThanhTien=${detail.calculatedThanhTien}`);
      });
      
      const dbTotal = parseFloat(order.tongThanhToan) || 0;
      const finalTotal = dbTotal || calculatedTotal;
      
      console.log(`📊 Order ${order.id_DonHang}: DB Total=${dbTotal.toFixed(2)}, Calculated=${calculatedTotal}, Final=${finalTotal.toFixed(2)}`);
      
      ordersWithDetails.push({
        ...order,
        OrderDetails: orderDetails,
        tongThanhToan: finalTotal
      });
    }
    
    console.log('✅ Successfully processed orders');
    
    res.json({
      success: true,
      data: ordersWithDetails
    });
  } catch (error) {
    console.error('❌ Get orders by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải đơn hàng người dùng',
      error: error.message
    });
  }
};

// POST /api/orders - Tạo đơn hàng mới
exports.create = async (req, res) => {
  const t = await sequelize.transaction({ timeout: 30000 });
  
  try {
    const {
      id_NguoiDung,
      hoTen,
      soDienThoai,
      email,
      diaChiGiao,
      ghiChu,
      phuongThucThanhToan,
      sanPham,
      tongThanhToan,
      phiVanChuyen = 0,
      id_voucher = null
    } = req.body;
    
    console.log('📦 Creating order with data:', req.body);
    
    // Validate required fields
    if (!sanPham || !Array.isArray(sanPham) || sanPham.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Danh sách sản phẩm không hợp lệ'
      });
    }
    
    // Calculate and validate total
    let calculatedTotal = 0;
    for (const item of sanPham) {
      const quantity = parseInt(item.soLuongMua || item.quantity || 1);
      const price = parseFloat(item.gia || item.giaTaiThoiDiem || item.price || 0);
      calculatedTotal += quantity * price;
    }
    
    const providedTotal = parseFloat(tongThanhToan || 0);
    const shippingFee = parseFloat(phiVanChuyen || 0);
    const finalTotal = providedTotal || calculatedTotal;
    
    console.log('💰 Order totals:', {
      providedTotal,
      calculatedTotal,
      finalTotal,
      shippingFee
    });
    
    // Generate order code
    const orderCode = `DH${Date.now()}`;
    
    // Determine payment status
    const paymentMethod = (phuongThucThanhToan || '').toLowerCase();
    const isCOD = ['cod', 'tien_mat'].includes(paymentMethod);
    const paymentStatus = isCOD ? 'unpaid' : 'pending';
    const orderStatus = 'pending';
    
    // Create order
    const orderData = {
      id_NguoiDung: id_NguoiDung || null,
      id_voucher,
      ngayDatHang: new Date(),
      phuongThucThanhToan: phuongThucThanhToan || 'COD',
      soLuong: sanPham.reduce((sum, item) => sum + parseInt(item.soLuongMua || item.quantity || 1), 0),
      tongThanhToan: finalTotal,
      phiVanChuyen: shippingFee,
      trangThaiDonHang: orderStatus,
      trangThaiThanhToan: paymentStatus,
      tenNguoiNhan: hoTen,
      diaChiGiaoHang: diaChiGiao,
      ghiChu: ghiChu || null,
      email,
      maDonHang: orderCode
    };
    
    console.log('📝 Creating order with data:', orderData);
    
    const [result] = await sequelize.query(`
      INSERT INTO donhang (
        id_NguoiDung, id_voucher, ngayDatHang, phuongThucThanhToan, soLuong, 
        tongThanhToan, phiVanChuyen, trangThaiDonHang, trangThaiThanhToan,
        tenNguoiNhan, diaChiGiaoHang, ghiChu, email, maDonHang
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        orderData.id_NguoiDung, orderData.id_voucher, orderData.ngayDatHang,
        orderData.phuongThucThanhToan, orderData.soLuong, orderData.tongThanhToan,
        orderData.phiVanChuyen, orderData.trangThaiDonHang, orderData.trangThaiThanhToan,
        orderData.tenNguoiNhan, orderData.diaChiGiaoHang,
        orderData.ghiChu, orderData.email, orderData.maDonHang
      ],
      type: QueryTypes.INSERT,
      transaction: t
    });
    
    const orderId = result;
    console.log('✅ Order created with ID:', orderId);
    
    // COD orders: Decrease inventory immediately
    if (isCOD) {
      console.log('✅ COD order: Inventory deducted immediately');
      await decreaseInventoryForItems(sanPham, t);
    }
    
    // Create order details
    for (const item of sanPham) {
      const orderDetailData = {
        id_DonHang: orderId,
        id_SanPham: item.id_SanPham,
        soLuongMua: parseInt(item.soLuongMua || item.quantity || 1),
        giaMua: parseFloat(item.gia || item.giaTaiThoiDiem || item.price || 0),
        donGia: parseFloat(item.gia || item.giaTaiThoiDiem || item.price || 0)
      };
      
      console.log('🛍️ Creating order detail:', orderDetailData);
      
      await sequelize.query(`
        INSERT INTO chitietdonhang (id_DonHang, id_SanPham, soLuongMua, giaMua, donGia)
        VALUES (?, ?, ?, ?, ?)
      `, {
        replacements: [
          orderDetailData.id_DonHang, orderDetailData.id_SanPham,
          orderDetailData.soLuongMua, orderDetailData.giaMua, orderDetailData.donGia
        ],
        type: QueryTypes.INSERT,
        transaction: t
      });
    }
    
    await t.commit();
    
    console.log('🎉 Order creation successful!');
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: {
        orderId,
        maDonHang: orderCode,
        tongThanhToan: finalTotal,
        trangThaiDonHang: orderStatus,
        trangThaiThanhToan: paymentStatus,
        phuongThucThanhToan: orderData.phuongThucThanhToan
      }
    });
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo đơn hàng',
      error: error.message
    });
  }
};

// PUT /api/orders/:id - Cập nhật đơn hàng (ít dùng)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updatedRowsCount] = await Order.update(updateData, {
      where: { id_DonHang: id }
    });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng để cập nhật'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật đơn hàng thành công'
    });
  } catch (error) {
    console.error('❌ Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật đơn hàng',
      error: error.message
    });
  }
};

// Alias for admin
exports.updateOrder = exports.update;

// DELETE /api/orders/:id - Xóa đơn hàng (admin only)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await Order.destroy({
      where: { id_DonHang: id }
    });
    
    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng để xóa'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });
  } catch (error) {
    console.error('❌ Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa đơn hàng',
      error: error.message
    });
  }
};

// Alias for admin
exports.deleteOrder = exports.delete;

// =============================
// ORDER STATUS MANAGEMENT
// =============================

// Status flow validation
const STATUS_FLOW = {
  // New system
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  
  // Legacy system
  cho_xu_ly: ["da_xac_nhan", "confirmed", "huy_boi_admin", "cancelled"],
  da_xac_nhan: ["dang_chuan_bi", "dang_giao", "shipping", "huy_boi_admin", "cancelled"],
  dang_chuan_bi: ["dang_giao", "shipping", "huy_boi_admin", "cancelled"],
  dang_giao: ["da_giao", "delivered", "khach_bom_hang", "cancelled"],
  da_giao: [],
  huy_boi_khach: [],
  huy_boi_admin: [],
  khach_bom_hang: []
};

const END_STATUSES = ['da_giao', 'hoan_tat', 'huy_boi_khach', 'huy_boi_admin', 'khach_bom_hang'];

// PUT /api/admin/orders/:id/status - Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction({ 
    timeout: 30000
  });
  
  try {
    const { id } = req.params;
    const { status, lyDo } = req.body;

    console.log(`🔄 Cập nhật trạng thái đơn hàng ${id}:`, { status, lyDo });

    // Validate status
    const validStatuses = [
      'pending', 'confirmed', 'shipping', 'delivered', 'cancelled',
      'cho_xu_ly', 'da_xac_nhan', 'dang_chuan_bi', 'dang_giao', 'da_giao', 
      'huy_boi_khach', 'huy_boi_admin', 'khach_bom_hang'
    ];
    
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: ' + validStatuses.join(', ')
      });
    }

    // Map new status to legacy status for database
    const statusMapping = {
      'pending': 'cho_xu_ly',
      'confirmed': 'da_xac_nhan', 
      'shipping': 'dang_giao',
      'delivered': 'da_giao',
      'cancelled': 'huy_boi_admin'
    };
    
    const dbStatus = statusMapping[status] || status;

    // Get order info with raw query
    const orderResult = await sequelize.query(
      'SELECT * FROM donhang WHERE id_DonHang = ?',
      { replacements: [id], type: QueryTypes.SELECT, transaction: t }
    );

    if (!orderResult || orderResult.length === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const order = orderResult[0];
    const currentStatus = order.trangThaiDonHang;
    const paymentStatus = order.trangThaiThanhToan;
    const payMethod = (order.phuongThucThanhToan || '').toLowerCase();

    console.log(`📋 Trạng thái hiện tại: ${currentStatus} → ${status}`);

    // Validate flow
    const allowedNext = STATUS_FLOW[currentStatus] || [];
    if (allowedNext.length > 0 && !allowedNext.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Chỉ được chuyển từ "${currentStatus}" sang: ${allowedNext.join(', ')}`
      });
    }

    // Payment validation for online orders
    const isOnlineMethod = !['cod', 'tien_mat'].includes(payMethod);
    const requiresPaid = ['confirmed', 'da_xac_nhan', 'shipping', 'dang_giao', 'delivered', 'da_giao'].includes(status);
    
    if (isOnlineMethod && requiresPaid && paymentStatus !== 'paid') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Đơn online chưa thanh toán, không thể cập nhật trạng thái này. Vui lòng yêu cầu khách hoàn tất thanh toán.'
      });
    }

    // Validate reason for cancellation
    const cancelStatuses = ['cancelled', 'huy_boi_admin', 'huy_boi_khach', 'khach_bom_hang'];
    if (cancelStatuses.includes(status) && !lyDo?.trim()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do hủy đơn hàng'
      });
    }

    // Update order status
    let updateQuery = 'UPDATE donhang SET trangThaiDonHang = ?';
    let updateParams = [dbStatus];
    
    if (lyDo?.trim()) {
      updateQuery += ', lyDo = ?';
      updateParams.push(lyDo.trim());
    }
    
    updateQuery += ' WHERE id_DonHang = ?';
    updateParams.push(order.id_DonHang);
    
    await sequelize.query(updateQuery, {
      replacements: updateParams,
      type: QueryTypes.UPDATE,
      transaction: t
    });

    // Special handling based on status
    const deliveredStatuses = ['delivered', 'da_giao'];
    const cancelledStatuses = ['cancelled', 'huy_boi_admin', 'huy_boi_khach', 'khach_bom_hang'];
    
    if (deliveredStatuses.includes(status) || deliveredStatuses.includes(dbStatus)) {
      // Auto-pay COD orders when delivered
      if (['cod', 'tien_mat'].includes(payMethod) && paymentStatus !== 'paid') {
        await sequelize.query(
          'UPDATE donhang SET trangThaiThanhToan = ? WHERE id_DonHang = ?',
          { replacements: ['paid', order.id_DonHang], type: QueryTypes.UPDATE, transaction: t }
        );
        console.log('💰 Đã cập nhật trạng thái thanh toán COD: paid');
      }
    }

    if (cancelledStatuses.includes(status) || cancelledStatuses.includes(dbStatus)) {
      // Restore inventory for cancelled orders
      try {
        const earlyStatuses = ['pending', 'confirmed', 'cho_xu_ly', 'da_xac_nhan'];
        if (earlyStatuses.includes(currentStatus)) {
          await restoreInventoryForOrder(order.id_DonHang, t);
          console.log('📦 Đã khôi phục tồn kho cho đơn hàng:', order.id_DonHang);
        }

        // Mark refund for paid online orders
        if (isOnlineMethod && paymentStatus === 'paid') {
          await sequelize.query(
            'UPDATE donhang SET trangThaiThanhToan = ? WHERE id_DonHang = ?',
            { replacements: ['refunded', order.id_DonHang], type: QueryTypes.UPDATE, transaction: t }
          );
          console.log('💰 Đã đánh dấu hoàn tiền cho đơn online:', order.id_DonHang);
        }
      } catch (invErr) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Không thể xử lý tồn kho/hoàn tiền khi hủy đơn',
          error: invErr.message
        });
      }
    }

    await t.commit();
    
    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành ${status}`,
      data: { id, status, lyDo: lyDo?.trim() }
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

// =============================
// ORDER CANCELLATION
// =============================

// PUT /api/orders/:id/cancel - Khách hàng yêu cầu hủy đơn
exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { lyDo } = req.body;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Only allow cancellation for pending/confirmed orders
    const allowedStatuses = ['pending', 'confirmed', 'cho_xu_ly', 'da_xac_nhan'];
    if (!allowedStatuses.includes(order.trangThaiDonHang)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng ở trạng thái này'
      });
    }

    // Update order status
    await order.update({
      trangThaiDonHang: 'huy_boi_khach',
      lyDo: lyDo || 'Khách hàng yêu cầu hủy'
    }, { transaction: t });

    // Restore inventory
    await restoreInventoryForOrder(id, t);

    await t.commit();

    // Send notification email
    try {
      const user = await User.findByPk(order.id_NguoiDung);
      if (user?.email) {
        await sendCancelOrderNotificationEmail(user.email, {
          maDonHang: order.maDonHang,
          tenKhachHang: user.ten,
          lyDo: lyDo || 'Khách hàng yêu cầu hủy'
        });
      }
    } catch (emailError) {
      console.error('⚠️ Error sending cancel notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Đã gửi yêu cầu hủy đơn hàng'
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hủy đơn hàng',
      error: error.message
    });
  }
};

// PUT /api/admin/orders/:id/approve-cancellation - Admin duyệt hủy đơn
exports.approveCancellation = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    await order.update({
      trangThaiDonHang: 'huy_boi_admin'
    }, { transaction: t });

    await t.commit();

    // Send approval email
    try {
      const user = await User.findByPk(order.id_NguoiDung);
      if (user?.email) {
        await sendApprovedCancellationEmail(user.email, {
          maDonHang: order.maDonHang,
          tenKhachHang: user.ten
        });
      }
    } catch (emailError) {
      console.error('⚠️ Error sending approval email:', emailError);
    }

    res.json({
      success: true,
      message: 'Đã duyệt yêu cầu hủy đơn hàng'
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Approve cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi duyệt hủy đơn hàng',
      error: error.message
    });
  }
};

// PUT /api/admin/orders/:id/reject-cancellation - Admin từ chối hủy đơn
exports.rejectCancellation = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { lyDo } = req.body;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Restore to previous status (usually confirmed)
    await order.update({
      trangThaiDonHang: 'da_xac_nhan',
      lyDo: null
    }, { transaction: t });

    await t.commit();

    // Send rejection email
    try {
      const user = await User.findByPk(order.id_NguoiDung);
      if (user?.email) {
        await sendRejectedCancellationEmail(user.email, {
          maDonHang: order.maDonHang,
          tenKhachHang: user.ten,
          lyDo: lyDo || 'Đơn hàng đã được chuẩn bị, không thể hủy'
        });
      }
    } catch (emailError) {
      console.error('⚠️ Error sending rejection email:', emailError);
    }

    res.json({
      success: true,
      message: 'Đã từ chối yêu cầu hủy đơn hàng'
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Reject cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi từ chối hủy đơn hàng',
      error: error.message
    });
  }
};

// =============================
// PAYMENT HANDLING
// =============================

// POST /payment/success - Payment success callback
exports.paymentSuccess = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { orderId, transactionId, amount } = req.body;

    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Update payment status
    await order.update({
      trangThaiThanhToan: 'paid'
    }, { transaction: t });

    // Decrease inventory for online orders (not done during creation)
    const orderDetails = await OrderDetail.findAll({
      where: { id_DonHang: orderId },
      transaction: t
    });

    await decreaseInventoryForItems(orderDetails.map(detail => ({
      id_SanPham: detail.id_SanPham,
      soLuongMua: detail.soLuongMua
    })), t);

    await t.commit();

    res.json({
      success: true,
      message: 'Thanh toán thành công',
      data: { orderId, transactionId }
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Payment success error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý thanh toán thành công',
      error: error.message
    });
  }
};

// POST /payment/failure - Payment failure callback
exports.paymentFailure = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    await order.update({
      trangThaiThanhToan: 'failed',
      lyDo: reason || 'Thanh toán thất bại'
    });

    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái thanh toán thất bại'
    });

  } catch (error) {
    console.error('❌ Payment failure error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý thanh toán thất bại',
      error: error.message
    });
  }
};

// GET /payment/check-timeout - Check payment timeout
exports.checkPaymentTimeout = async (req, res) => {
  try {
    const timeoutMinutes = 15;
    const timeoutDate = new Date();
    timeoutDate.setMinutes(timeoutDate.getMinutes() - timeoutMinutes);

    const timedOutOrders = await Order.findAll({
      where: {
        trangThaiThanhToan: 'pending',
        ngayDatHang: { [Op.lt]: timeoutDate }
      }
    });

    for (const order of timedOutOrders) {
      await order.update({
        trangThaiThanhToan: 'failed',
        trangThaiDonHang: 'cancelled',
        lyDo: 'Hết thời gian thanh toán'
      });
    }

    res.json({
      success: true,
      message: `Đã xử lý ${timedOutOrders.length} đơn hàng hết thời gian thanh toán`
    });

  } catch (error) {
    console.error('❌ Check payment timeout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra timeout thanh toán',
      error: error.message
    });
  }
};

module.exports = exports;
