const { Order, User, Voucher, OrderDetail, Product } = require('../models');
// ==========================================
// 📋 TRẠNG THÁI ĐƠN HÀNG MỚI - CHUẨN HÓA
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
//    - pending: Chờ thanh toán (online nhưng chưa trả)
//    - paid: Đã thanh toán
//    - failed: Thanh toán thất bại
//    - refunded: Hoàn tiền
//
// 3. Logic xử lý:
//    a. COD: orderStatus=pending, paymentStatus=unpaid → delivered thì paymentStatus=paid
//    b. Online: orderStatus=pending, paymentStatus=pending → thành công thì paymentStatus=paid
// ==========================================
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/database');
const { 
  sendCancelOrderNotificationEmail, 
  sendApprovedCancellationEmail, 
  sendRejectedCancellationEmail,
  sendAdminCancelledOrderEmail,
  sendFailedDeliveryEmail
} = require('../services/emailService');

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
    // Lock row to ensure consistency
    const rows = await sequelize.query(
      'SELECT soLuongTon FROM sanpham WHERE id_SanPham = ? FOR UPDATE',
      { replacements: [productId], type: QueryTypes.SELECT, transaction }
    );
    if (!rows || rows.length === 0) {
      throw new Error(`Sản phẩm ${productId} không tồn tại`);
    }
    const currentStock = parseInt(rows[0].soLuongTon || 0);
    if (currentStock < quantity) {
      throw new Error(`Sản phẩm ${productId} không đủ tồn kho (còn ${currentStock})`);
    }
    await sequelize.query(
      'UPDATE sanpham SET soLuongTon = soLuongTon - ? WHERE id_SanPham = ?',
      { replacements: [quantity, productId], type: QueryTypes.UPDATE, transaction }
    );
  }
}

async function restoreInventoryForOrder(orderId, transaction) {
  const items = await sequelize.query(
    'SELECT id_SanPham, SUM(soLuongMua) as qty FROM chitietdonhang WHERE id_DonHang = ? GROUP BY id_SanPham',
    { replacements: [orderId], type: QueryTypes.SELECT, transaction }
  );
  for (const row of items) {
    const productId = row.id_SanPham;
    const qty = parseInt(row.qty || 0);
    if (!productId || !qty || qty <= 0) continue;
    await sequelize.query(
      'UPDATE sanpham SET soLuongTon = soLuongTon + ? WHERE id_SanPham = ?',
      { replacements: [qty, productId], type: QueryTypes.UPDATE, transaction }
    );
  }
}

// FIXED: Updated search to use id_DonHang instead of maDonHang - 2024
// Lấy tất cả đơn hàng với RAW SQL filtering, search, pagination, sorting
exports.getAll = async (req, res) => {
  try {
    const {
      // Pagination
      page = 1,
      limit = 20,
      
      // Search
      search,
      
      // Filters
      status,           // CHO_XAC_NHAN, DA_XAC_NHAN, DANG_GIAO, DA_GIAO, DA_HUY
      trangThaiDonHang, // Alternative parameter name for status
      paymentStatus,    // CHUA_THANH_TOAN, DA_THANH_TOAN, HOAN_TIEN
      paymentMethod,    // TIEN_MAT, CHUYEN_KHOAN, THE
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      userId,           // Filter by specific user
      
      // Sorting
      sortBy = 'createdAt', // createdAt, total, status
      sortOrder = 'DESC'    // ASC, DESC
    } = req.query;

    console.log('📋 Admin order query params:', { search, status, trangThaiDonHang, page, limit });

    // Xây dựng WHERE conditions
    const whereConditions = [];
    const queryParams = [];

    // Search condition - mã đơn hàng và thông tin khách hàng - FIXED to use id_DonHang
    if (search) {
      whereConditions.push(`
        (CAST(o.id_DonHang AS CHAR) LIKE ? OR 
         u.ten LIKE ? OR 
         u.soDienThoai LIKE ? OR 
         u.email LIKE ?)
      `);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Status filter - Support both parameter names
    const orderStatus = status || trangThaiDonHang;
    if (orderStatus) {
      whereConditions.push(`o.trangThaiDonHang = ?`);
      queryParams.push(orderStatus);
    }
    
    // Payment method filter
    if (paymentMethod) {
      whereConditions.push(`o.phuongThucThanhToan = ?`);
      queryParams.push(paymentMethod);
    }
    
    // Date range filter
    if (dateFrom && dateTo) {
      whereConditions.push(`o.ngayDatHang BETWEEN ? AND ?`);
      queryParams.push(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      whereConditions.push(`o.ngayDatHang >= ?`);
      queryParams.push(new Date(dateFrom));
    } else if (dateTo) {
      whereConditions.push(`o.ngayDatHang <= ?`);
      queryParams.push(new Date(dateTo));
    }
    
    // Total amount filter
    if (minTotal || maxTotal) {
      if (minTotal && maxTotal) {
        whereConditions.push(`o.tongThanhToan BETWEEN ? AND ?`);
        queryParams.push(parseFloat(minTotal), parseFloat(maxTotal));
      } else if (minTotal) {
        whereConditions.push(`o.tongThanhToan >= ?`);
        queryParams.push(parseFloat(minTotal));
      } else if (maxTotal) {
        whereConditions.push(`o.tongThanhToan <= ?`);
        queryParams.push(parseFloat(maxTotal));
      }
    }
    
    // User filter
    if (userId) {
      whereConditions.push(`o.id_NguoiDung = ?`);
      queryParams.push(parseInt(userId));
    }

    // Xây dựng ORDER BY clause
    let orderClause = '';
    switch (sortBy) {
      case 'total':
        orderClause = `ORDER BY o.tongThanhToan ${sortOrder.toUpperCase()}`;
        break;
      case 'status':
        orderClause = `ORDER BY o.trangThaiDonHang ${sortOrder.toUpperCase()}`;
        break;
      case 'createdAt':
      default:
        orderClause = `ORDER BY o.ngayDatHang ${sortOrder.toUpperCase()}`;
        break;
    }
    
    // Xây dựng WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Main query để lấy orders với user info
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
      ${whereClause}
      GROUP BY o.id_DonHang
      ${orderClause}
      LIMIT ? OFFSET ?
    `;
    
    // Count query để đếm tổng số
    const countQuery = `
      SELECT COUNT(DISTINCT o.id_DonHang) as total
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      ${whereClause}
    `;

    // Stats query để tính thống kê - Cập nhật theo trạng thái mới
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT o.id_DonHang) as total,
        COUNT(CASE WHEN o.trangThaiDonHang = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN o.trangThaiDonHang = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN o.trangThaiDonHang = 'shipping' THEN 1 END) as shipping,
        COUNT(CASE WHEN o.trangThaiDonHang = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN o.trangThaiDonHang = 'cancelled' THEN 1 END) as cancelled,
        
        -- Trạng thái thanh toán
        COUNT(CASE WHEN o.trangThaiThanhToan = 'unpaid' THEN 1 END) as unpaid,
        COUNT(CASE WHEN o.trangThaiThanhToan = 'pending' THEN 1 END) as pending_payment,
        COUNT(CASE WHEN o.trangThaiThanhToan = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN o.trangThaiThanhToan = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN o.trangThaiThanhToan = 'refunded' THEN 1 END) as refunded,
        
        -- Thống kê khác
        COUNT(CASE WHEN DATE(o.ngayDatHang) = CURRENT_DATE THEN 1 END) as todayOrders,
        SUM(CASE WHEN o.trangThaiDonHang = 'delivered' AND o.trangThaiThanhToan = 'paid' THEN COALESCE(o.tongThanhToan, 0) ELSE 0 END) as totalRevenue,
        
        -- Legacy status support (tạm thời)
        COUNT(CASE WHEN o.trangThaiDonHang = 'cho_xu_ly' THEN 1 END) as cho_xu_ly,
        COUNT(CASE WHEN o.trangThaiDonHang = 'da_xac_nhan' THEN 1 END) as da_xac_nhan,
        COUNT(CASE WHEN o.trangThaiDonHang = 'dang_giao' THEN 1 END) as dang_giao,
        COUNT(CASE WHEN o.trangThaiDonHang = 'da_giao' THEN 1 END) as da_giao
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      ${whereClause}
    `;

    // Execute các queries song song
    queryParams.push(parseInt(limit), offset);
    
    console.log('🔍 Executing query with params:', queryParams);
    console.log('📝 Main query:', mainQuery);
    
    const [orders, countResult, statsResult] = await Promise.all([
      sequelize.query(mainQuery, { 
        replacements: queryParams, 
        type: QueryTypes.SELECT 
      }),
      sequelize.query(countQuery, { 
        replacements: queryParams.slice(0, -2), // Loại bỏ limit và offset
        type: QueryTypes.SELECT 
      }),
      sequelize.query(statsQuery, { 
        replacements: queryParams.slice(0, -2), // Loại bỏ limit và offset
        type: QueryTypes.SELECT 
      })
    ]);

    console.log('✅ Query results:', { ordersCount: orders.length, total: countResult[0]?.total });

    const totalItems = parseInt(countResult[0]?.total || 0);
    const stats = {
      total: parseInt(statsResult[0]?.total || 0),
      pending: parseInt(statsResult[0]?.pending || 0),
              daXacNhan: parseInt(statsResult[0]?.confirmed || 0),
      shipping: parseInt(statsResult[0]?.shipping || 0),
      completed: parseInt(statsResult[0]?.completed || 0),
      cancelled: parseInt(statsResult[0]?.cancelled || 0),
      cancellationRequests: parseInt(statsResult[0]?.cancellationRequests || 0),
      todayOrders: parseInt(statsResult[0]?.todayOrders || 0),
      totalRevenue: parseFloat(statsResult[0]?.totalRevenue || 0)
    };
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      stats,
      filters: {
        search,
        status: orderStatus,
        paymentStatus,
        paymentMethod,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
        userId,
        sortBy,
        sortOrder
      },
      message: `Lấy ${orders.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('❌ Error in getAll orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tải đơn hàng', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Lấy đơn hàng theo id với SQL JOIN
exports.getById = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.*,
        u.ten as customerName,
        u.email as customerEmail,
        u.soDienThoai as customerPhone,
        u.diaChi as customerAddress,
        o.tenNguoiNhan,
        o.diaChiGiaoHang as diaChiGiao,
        o.ghiChu,
        o.email as orderEmail,
        o.maDonHang
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      WHERE o.id_DonHang = ?
    `;
    
    const orderResult = await sequelize.query(query, {
      replacements: [req.params.id],
      type: QueryTypes.SELECT
    });
    
    if (orderResult.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    // Get order details
    const detailsQuery = `
      SELECT 
        od.*,
        p.tenSp,
        p.hinhAnh,
        p.gia as originalPrice,
        p.maSKU
      FROM chitietdonhang od
      LEFT JOIN sanpham p ON od.id_SanPham = p.id_SanPham
      WHERE od.id_DonHang = ?
      ORDER BY od.id_ChiTietDH
    `;
    
    const orderDetails = await sequelize.query(detailsQuery, {
      replacements: [req.params.id],
      type: QueryTypes.SELECT
    });

    const order = {
      ...orderResult[0],
      OrderDetails: orderDetails
    };
    
    res.json({
      success: true,
      data: order,
      message: 'Lấy đơn hàng thành công'
    });
  } catch (error) {
    console.error('❌ Error in getById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tải chi tiết đơn hàng', 
      error: error.message 
    });
  }
};

// Tạo mới đơn hàng
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('📦 Creating order with data:', req.body);
    
    const {
      // Thông tin khách hàng
      id_NguoiDung,
      hoTen,
      email,
      soDienThoai,
      diaChi,
      diaChiGiao, // Support both field names
      
      // Thông tin giao hàng
      ghiChu,
      thoiGianGiao,
      ngayGiao,
      gioGiao,
      
      // Thanh toán
      phuongThucThanhToan,
      trangThaiDonHang,
      trangThaiThanhToan,
      
      // Sản phẩm (support both formats)
      sanPham,
      chiTietDonHang,
      
      // Tổng tiền
      tongTienHang,
      phiVanChuyen,
      giaTriGiam,
      tongThanhToan,
      
      // Voucher
      maVoucher
    } = req.body;

    // Use products from either field
    const products = sanPham || chiTietDonHang;

    // Validate required fields
    const deliveryAddress = diaChiGiao || diaChi;
    if (!hoTen || !soDienThoai || !deliveryAddress || !phuongThucThanhToan) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
        missingFields: {
          hoTen: !hoTen,
          soDienThoai: !soDienThoai,
          diaChiGiao: !deliveryAddress,
          phuongThucThanhToan: !phuongThucThanhToan
        }
      });
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(soDienThoai)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ (phải có 10-11 chữ số)'
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email không hợp lệ'
        });
      }
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống hoặc không hợp lệ'
      });
    }

    // Validate each product item
    for (const item of products) {
      const quantity = item.soLuongMua || item.soLuong || item.quantity;
      if (!item.id_SanPham || !quantity || !item.gia) {
        return res.status(400).json({
          success: false,
          message: 'Thông tin sản phẩm không hợp lệ',
          invalidItem: item
        });
      }
      
      if (parseInt(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng sản phẩm phải lớn hơn 0',
          invalidItem: item
        });
      }
      
      if (parseFloat(item.gia) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Giá sản phẩm phải lớn hơn 0',
          invalidItem: item
        });
      }
    }

  // Generate order code
    const orderCode = 'DH' + Date.now();
    
    // Calculate total from products if not provided
    const calculatedTotal = products.reduce((total, item) => {
      const price = parseFloat(item.giaTaiThoiDiem || item.gia || 0);
      const quantity = parseInt(item.soLuongMua || item.soLuong || item.quantity || 1);
      return total + (price * quantity);
    }, 0);
    
    // Create main order
    const orderData = {
      id_NguoiDung: id_NguoiDung || req.user?.id_NguoiDung || null,
      id_voucher: null, // Sẽ được set sau khi validate voucher
      ngayDatHang: new Date(),
      phuongThucThanhToan: phuongThucThanhToan,
      soLuong: products.length,
      tongThanhToan: parseFloat(tongThanhToan) || calculatedTotal,
      phiVanChuyen: parseFloat(phiVanChuyen) || 0,
      
      // ===== TRẠNG THÁI MỚI - CHUẨN HÓA =====
      trangThaiDonHang: 'pending', // Mặc định: Chờ xác nhận
      trangThaiThanhToan: (() => {
        const method = (phuongThucThanhToan || '').toUpperCase();
        if (method === 'COD' || method === 'TIEN_MAT') {
          return 'unpaid'; // COD: Chưa thanh toán
        } else {
          return 'pending'; // Online: Chờ thanh toán
        }
      })(),
      // =====================================
      
      // Thông tin giao hàng
      tenNguoiNhan: hoTen,
      soDienThoai: soDienThoai,
      diaChiGiaoHang: deliveryAddress,
      ghiChu: ghiChu || null,
      email: email || null,
      maDonHang: orderCode
    };
    
    console.log('💰 Order totals:', {
      providedTotal: tongThanhToan,
      calculatedTotal: calculatedTotal,
      finalTotal: orderData.tongThanhToan,
      shippingFee: orderData.phiVanChuyen
    });

    // Nếu có mã voucher, lookup id_voucher và validate
    if (maVoucher) {
      try {
        const voucher = await Voucher.findOne({ where: { maVoucher } });
        if (!voucher) {
          return res.status(400).json({
            success: false,
            message: 'Mã voucher không tồn tại'
          });
        }
        
        // Kiểm tra voucher có còn hiệu lực không
        const now = new Date();
        if (voucher.ngayHetHan && new Date(voucher.ngayHetHan) < now) {
          return res.status(400).json({
            success: false,
            message: 'Voucher đã hết hạn'
          });
        }
        
        if (voucher.soLuong <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Voucher đã hết lượt sử dụng'
          });
        }
        
        orderData.id_voucher = voucher.id_voucher;
        console.log('✅ Voucher validated:', { maVoucher, id_voucher: voucher.id_voucher });
      } catch (voucherError) {
        console.error('❌ Error validating voucher:', voucherError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra voucher'
        });
      }
    }

  console.log('📝 Creating order with data:', orderData);
  const newOrder = await Order.create(orderData, { transaction });

  // Trừ tồn kho: chỉ áp dụng ngay cho COD/tiền mặt. Với thanh toán online, sẽ trừ khi có callback thành công.
  const method = (phuongThucThanhToan || '').toUpperCase();
  const isCOD = method === 'COD' || method === 'TIEN_MAT';
  if (isCOD) {
    await decreaseInventoryForItems(products, transaction);
    console.log('✅ COD order: Inventory deducted immediately');
  } else {
    console.log('⏳ Online payment order: Waiting for payment success callback to deduct inventory');
  }
    console.log('✅ Order created with ID:', newOrder.id_DonHang);

    // Create order details
    const orderDetails = [];
    for (const item of products) {
      const productId = item.id_SanPham;
      const quantity = parseInt(item.soLuongMua || item.soLuong || item.quantity || 1);
      const price = parseFloat(item.giaTaiThoiDiem || item.gia || 0);
      
      if (!productId || !quantity || !price) {
        console.warn('⚠️ Invalid product item:', item);
        continue;
      }
      
      const detailData = {
        id_DonHang: newOrder.id_DonHang,
        id_SanPham: productId,
        soLuongMua: quantity,
        giaMua: parseFloat(price * quantity),
        donGia: price
      };
      
      console.log('🛍️ Creating order detail:', detailData);
      
      try {
        const orderDetail = await OrderDetail.create(detailData, { transaction });
        orderDetails.push({
          ...orderDetail.toJSON(),
          tenSp: item.tenSp,
          hinhAnh: item.hinhAnh
        });
      } catch (detailError) {
        console.error('❌ Error creating order detail:', detailError);
        throw new Error(`Lỗi tạo chi tiết đơn hàng cho sản phẩm ${productId}: ${detailError.message}`);
      }
    }
    await transaction.commit();
    
    console.log('🎉 Order creation successful!');

    // Return complete order with details
    const response = {
      success: true,
      message: 'Đặt hàng thành công',
      data: {
        ...newOrder.toJSON(),
        OrderDetails: orderDetails,
        customerInfo: {
          hoTen,
          email,
          soDienThoai,
          diaChi
        }
      }
    };

    res.status(201).json(response);
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating order:', error);
    
    // Log detailed error information
    if (error.original) {
      console.error('❌ SQL Error:', error.original.sqlMessage || error.original.message);
      console.error('❌ SQL State:', error.original.sqlState);
      console.error('❌ Error Code:', error.original.errno);
    }
    
    // Determine appropriate error message based on error type
  let errorMessage = 'Lỗi server khi tạo đơn hàng';
  let statusCode = 500;
    
    if (error.name === 'SequelizeValidationError') {
      errorMessage = 'Dữ liệu không hợp lệ';
      statusCode = 400;
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      errorMessage = 'Sản phẩm hoặc voucher không tồn tại';
      statusCode = 400;
    } else if (error.name === 'SequelizeDatabaseError') {
      if (error.original && error.original.errno === 1452) {
        errorMessage = 'Sản phẩm không tồn tại trong hệ thống';
        statusCode = 400;
      }
    }
    // Inventory validation errors
    if (/tồn kho|không đủ tồn kho|không tồn tại/i.test(error.message || '')) {
      statusCode = 400;
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      sqlError: error.original ? (error.original.sqlMessage || error.original.message) : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Cập nhật đơn hàng
exports.update = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    await order.update(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa đơn hàng
exports.delete = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    await order.destroy();
    res.json({ message: 'Đã xóa đơn hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đơn hàng theo người dùng với SQL
exports.getByUser = async (req, res) => {
  try {
    console.log(' Getting orders for user:', req.params.userId);
    
    // Validate userId
    const userId = parseInt(req.params.userId);
    if (!userId || isNaN(userId)) {
      console.error('❌ Invalid userId:', req.params.userId);
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    
    // Test database connection first
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      return res.status(500).json({ message: 'Lỗi kết nối database' });
    }
    
    // 1. Lấy danh sách đơn hàng của user (chỉ các cột tồn tại)
    const orders = await sequelize.query(
      `SELECT 
        o.id_DonHang,
        o.ngayDatHang,
        o.trangThaiDonHang,
        o.phuongThucThanhToan,
        o.phiVanChuyen,
        COALESCE(o.tongThanhToan, 0) as tongThanhToan,
        o.soLuong
      FROM donhang o
      WHERE o.id_NguoiDung = ?
      ORDER BY o.ngayDatHang DESC`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    console.log('📦 Found orders:', orders.length);
    
    // 2. Lấy chi tiết đơn hàng cho từng order với đầy đủ thông tin sản phẩm
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          const details = await sequelize.query(
            `SELECT 
              od.id_ChiTietDH,
              od.id_SanPham,
              od.soLuongMua,
              -- Compute thanhTien from existing columns
              (od.soLuongMua * COALESCE(od.donGia, od.giaMua, p.gia)) AS thanhTien,
              p.tenSp,
              p.hinhAnh,
              p.gia as giaHienTai,
              p.moTa,
              p.thuongHieu,
              p.maSKU
            FROM chitietdonhang od
            LEFT JOIN sanpham p ON od.id_SanPham = p.id_SanPham
            WHERE od.id_DonHang = ?
            ORDER BY od.id_ChiTietDH`,
            {
              replacements: [order.id_DonHang],
              type: sequelize.QueryTypes.SELECT
            }
          );
          
          console.log(` Order ${order.id_DonHang} has ${details.length} items`);
          
          // Tính toán tổng tiền từ chi tiết đơn hàng
          const calculatedTotal = details.reduce((total, detail) => {
            const soLuong = Number(detail.soLuongMua) || 0;
            const unitPrice = Number(detail.giaHienTai) || 0;
            const fallback = soLuong * unitPrice;
            return total + (Number(detail.thanhTien) || fallback);
          }, 0);
          
          // Sử dụng tổng tiền đã tính toán nếu tongThanhToan là 0 hoặc NULL
          const finalTotal = order.tongThanhToan > 0 ? order.tongThanhToan : calculatedTotal;
          
          console.log(` Order ${order.id_DonHang}: DB Total=${order.tongThanhToan}, Calculated=${calculatedTotal}, Final=${finalTotal}`);
          
          // Format dữ liệu cho frontend - Sửa cách tính giá bán và thành tiền
          const formattedDetails = details.map(detail => {
            // Tính giá bán từ thanhTien và soLuongMua, nếu không có thì dùng giá hiện tại
            const soLuong = Number(detail.soLuongMua) || 0;
            const giaHienTai = Number(detail.giaHienTai) || 0;
            let giaBan = 0;
            let thanhTien = 0;
            
            if (Number(detail.thanhTien) > 0) {
              thanhTien = Number(detail.thanhTien);
              giaBan = soLuong > 0 ? thanhTien / soLuong : giaHienTai;
            } else if (giaHienTai > 0 && soLuong > 0) {
              giaBan = giaHienTai;
              thanhTien = giaHienTai * soLuong;
            }
            
            console.log(`   Item ${detail.id_ChiTietDH}: thanhTien=${detail.thanhTien}, soLuong=${detail.soLuongMua}, giaBan=${giaBan}, calculatedThanhTien=${thanhTien}`);
            
            return {
              id_ChiTietDH: detail.id_ChiTietDH,
              id_SanPham: detail.id_SanPham,
              soLuong: detail.soLuongMua,
              thanhTien: thanhTien, // Sử dụng thanhTien đã tính toán
              giaBan: giaBan, // Sử dụng giá đã tính toán
              sanPham: {
                id_SanPham: detail.id_SanPham,
                tenSp: detail.tenSp,
                hinhAnh: detail.hinhAnh,
                gia: detail.giaHienTai,
                moTa: detail.moTa,
                thuongHieu: detail.thuongHieu,
                maSKU: detail.maSKU
              }
            };
          });
          
          return {
            id_DonHang: order.id_DonHang,
            maDonHang: `DH${order.id_DonHang}`, // Tạo mã đơn hàng từ ID
            ngayDatHang: order.ngayDatHang,
            trangThaiDonHang: order.trangThaiDonHang,
            tongThanhToan: finalTotal,
            phuongThucThanhToan: order.phuongThucThanhToan,
            phiVanChuyen: order.phiVanChuyen,
            OrderDetails: formattedDetails
          };
        } catch (detailError) {
          console.error('❌ Error getting order details:', detailError.message);
          return {
            ...order,
            maDonHang: `DH${order.id_DonHang}`,
            OrderDetails: []
          };
        }
      })
    );
    
    console.log('✅ Successfully processed orders');
    return res.json(ordersWithDetails);
    
  } catch (error) {
    console.error('❌ Error in getByUser:', error.message);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Lỗi khi lấy đơn hàng',
      error: error.message 
    });
  }
};

// === ADMIN FUNCTIONS - Các function dành cho admin ===

// Quy tắc chuyển trạng thái hợp lệ
const ORDER_STATUS_FLOW = {
  cho_xu_ly: ['da_xac_nhan', 'huy_boi_admin'],
  // Hỗ trợ tương thích trạng thái cũ 'dang_chuan_bi' nếu vẫn còn trong dữ liệu
  // Cho phép chuyển sang 'dang_chuan_bi' (bước chuẩn bị) hoặc trực tiếp 'dang_giao'
  da_xac_nhan: ['dang_chuan_bi', 'dang_giao', 'huy_boi_admin'],
  dang_chuan_bi: ['dang_giao', 'huy_boi_admin'],
  // Chấp nhận cả 'da_giao' và alias 'hoan_tat' để hoàn tất
  dang_giao: ['da_giao', 'hoan_tat', 'khach_bom_hang'],
  da_giao: [],
  hoan_tat: [],
  huy_boi_khach: [],
  huy_boi_admin: [],
  khach_bom_hang: []
};
const END_STATUSES = ['da_giao', 'hoan_tat', 'huy_boi_khach', 'huy_boi_admin', 'khach_bom_hang'];

// Cập nhật trạng thái đơn hàng - Hỗ trợ cả hệ thống mới và cũ
exports.updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction({ 
    timeout: 30000 // 30 seconds timeout
  });
  try {
    const { id } = req.params;
    const { status, lyDo } = req.body;

    console.log(`🔄 Cập nhật trạng thái đơn hàng ${id}:`, { status, lyDo });

    // Validate status - hỗ trợ cả hệ thống mới và cũ
    const validStatuses = [
      // Hệ thống trạng thái mới
      'pending', 'confirmed', 'shipping', 'delivered', 'cancelled',
      // Hệ thống trạng thái cũ (legacy)
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

    // Map new status sang legacy status cho database (enum constraint)
    const statusMapping = {
      'pending': 'cho_xu_ly',
      'confirmed': 'da_xac_nhan', 
      'shipping': 'dang_giao',
      'delivered': 'da_giao',
      'cancelled': 'huy_boi_admin'
    };
    
    // Convert new status thành legacy status nếu cần
    const dbStatus = statusMapping[status] || status;

    // Tìm đơn hàng bằng raw query để tránh timeout
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
    console.log(`📋 Trạng thái hiện tại: ${currentStatus} → ${status}`);

    // Định nghĩa flow trạng thái - hỗ trợ cả hai hệ thống
    const STATUS_FLOW = {
      // ===== HỆ THỐNG MỚI =====
      'pending': ['confirmed', 'cancelled', 'da_xac_nhan', 'huy_boi_admin'],
      'confirmed': ['shipping', 'cancelled', 'dang_giao', 'huy_boi_admin'],
      'shipping': ['delivered', 'cancelled', 'da_giao', 'khach_bom_hang'],
      'delivered': ['da_giao'], // Cho phép sync
      'cancelled': ['huy_boi_admin', 'huy_boi_khach'], // Cho phép sync

      // ===== HỆ THỐNG CŨ (LEGACY) =====
      'cho_xu_ly': ['da_xac_nhan', 'confirmed', 'huy_boi_admin', 'cancelled'],
      'da_xac_nhan': ['dang_chuan_bi', 'dang_giao', 'shipping', 'huy_boi_admin', 'cancelled'],
      'dang_chuan_bi': ['dang_giao', 'shipping', 'huy_boi_admin', 'cancelled'],
      'dang_giao': ['da_giao', 'delivered', 'khach_bom_hang', 'cancelled'],
      'da_giao': [], // Trạng thái cuối
      'huy_boi_khach': [], // Trạng thái cuối
      'huy_boi_admin': [], // Trạng thái cuối
      'khach_bom_hang': [] // Trạng thái cuối
    };

    // Không cho cập nhật nếu đã ở trạng thái kết thúc
    const endStatuses = ['delivered', 'cancelled', 'da_giao', 'huy_boi_khach', 'huy_boi_admin', 'khach_bom_hang'];
    if (endStatuses.includes(currentStatus) && !endStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã kết thúc, không thể cập nhật trạng thái.'
      });
    }

    // Kiểm tra flow hợp lệ - cho phép chuyển đổi linh hoạt giữa các hệ thống
    const allowedNext = STATUS_FLOW[currentStatus] || [];
    if (allowedNext.length > 0 && !allowedNext.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Chỉ được chuyển từ "${currentStatus}" sang: ${allowedNext.join(', ')}`
      });
    }

    // Ràng buộc thanh toán cho đơn Online
    const payMethod = (order.phuongThucThanhToan || '').toLowerCase();
    const isOnlineMethod = !['cod', 'tien_mat'].includes(payMethod);
    const paymentStatus = order.trangThaiThanhToan;
    
    // Các trạng thái yêu cầu thanh toán (cả hệ thống mới và cũ)
    const requiresPaid = [
      'confirmed', 'shipping', 'delivered', // Hệ thống mới
      'da_xac_nhan', 'dang_chuan_bi', 'dang_giao', 'da_giao' // Hệ thống cũ
    ].includes(status);
    
    if (isOnlineMethod && requiresPaid && paymentStatus !== 'paid') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Đơn online chưa thanh toán, không thể cập nhật trạng thái này. Vui lòng yêu cầu khách hoàn tất thanh toán.'
      });
    }

    // Kiểm tra bắt buộc nhập lý do cho trạng thái hủy
    const cancelStatuses = ['cancelled', 'huy_boi_admin', 'huy_boi_khach', 'khach_bom_hang'];
    if (cancelStatuses.includes(status) && !lyDo?.trim()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do hủy đơn hàng'
      });
    }

    // Cập nhật trạng thái và lý do nếu có bằng raw SQL
    const updateData = { trangThaiDonHang: dbStatus };
    if (lyDo?.trim()) {
      updateData.lyDo = lyDo.trim();
    }
    
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

    // Logic xử lý đặc biệt theo trạng thái - hỗ trợ cả hai hệ thống
    const deliveredStatuses = ['delivered', 'da_giao'];
    const cancelledStatuses = ['cancelled', 'huy_boi_admin', 'huy_boi_khach', 'khach_bom_hang'];
    
    if (deliveredStatuses.includes(status) || deliveredStatuses.includes(dbStatus)) {
      // Nếu đánh dấu đã giao: đơn COD -> cập nhật đã thanh toán
      if (['cod', 'tien_mat'].includes(payMethod) && paymentStatus !== 'paid') {
        await sequelize.query(
          'UPDATE donhang SET trangThaiThanhToan = ? WHERE id_DonHang = ?',
          { replacements: ['paid', order.id_DonHang], type: QueryTypes.UPDATE, transaction: t }
        );
        console.log('💰 Đã cập nhật trạng thái thanh toán COD: paid');
      }
    }

    if (cancelledStatuses.includes(status) || cancelledStatuses.includes(dbStatus)) {
      // Khôi phục tồn kho nếu hủy đơn
      try {
        const row = await sequelize.query(
          'SELECT trangThaiDonHang, trangThaiThanhToan, phuongThucThanhToan FROM donhang WHERE id_DonHang = ?',
          { replacements: [order.id_DonHang], type: QueryTypes.SELECT, transaction: t }
        );
        
        const info = row && row[0] ? row[0] : {};
        const current = info.trangThaiDonHang;
        const paidStatus = info.trangThaiThanhToan;
        const payMethod = (info.phuongThucThanhToan || '').toLowerCase();
        const isOnline = !['cod', 'tien_mat'].includes(payMethod);

        // Chỉ khôi phục tồn kho nếu hủy khi đơn còn ở trạng thái đầu
        const earlyStatuses = ['pending', 'confirmed', 'cho_xu_ly', 'da_xac_nhan'];
        if (earlyStatuses.includes(current)) {
          await restoreInventoryForOrder(order.id_DonHang, t);
          console.log('📦 Đã khôi phục tồn kho cho đơn hàng:', order.id_DonHang);
        }

        // Nếu đơn online đã thanh toán, đánh dấu trạng thái thanh toán refunded để xử lý hoàn tiền
        if (isOnline && paidStatus === 'paid') {
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
    
    // Gửi email thông báo (nếu cần)
    try {
      const user = await User.findByPk(order.id_NguoiDung);
      if (user && user.email) {
        const orderData = {
          maDonHang: order.maDonHang,
          id_DonHang: order.id_DonHang,
          tongThanhToan: order.tongThanhToan,
          ngayDatHang: order.ngayDatHang,
          tenKhachHang: user.ten,
          soDienThoai: user.soDienThoai,
          email: user.email,
          phuongThucThanhToan: order.phuongThucThanhToan
        };
        
        switch (status) {
          case 'confirmed':
          case 'da_xac_nhan':
            // Gửi mail xác nhận đơn hàng
            // await sendOrderConfirmedEmail(user.email, orderData);
            break;
          case 'delivered':
          case 'da_giao':
            // Gửi mail cảm ơn, mời đánh giá
            // await sendOrderDeliveredEmail(user.email, orderData);
            break;
          case 'cancelled':
          case 'huy_boi_admin':
          case 'huy_boi_khach':
          case 'khach_bom_hang':
            // await sendAdminCancelledOrderEmail(user.email, orderData, lyDo);
            break;
          default:
            break;
        }
      }
    } catch (emailError) {
      console.error('⚠️ Error sending email notification:', emailError);
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành ${status}`,
      data: { id, status, lyDo: updateData.lyDo }
    });
  } catch (error) {
    try { await t.rollback(); } catch (_) {}
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái hàng loạt - Cập nhật theo logic mới
exports.bulkUpdateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderIds, status, lyDo } = req.body;

    console.log(`🔄 Cập nhật hàng loạt ${orderIds.length} đơn hàng:`, { status, lyDo });

    // Validate input - Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID đơn hàng không hợp lệ'
      });
    }

    // Validate status - hệ thống trạng thái mới
    const validStatuses = [
      'pending', 'confirmed', 'shipping', 'delivered', 'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: ' + validStatuses.join(', ')
      });
    }

    // Kiểm tra bắt buộc nhập lý do cho trạng thái hủy
    if (status === 'cancelled' && !lyDo?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do hủy đơn hàng'
      });
    }

    // Lấy thông tin các đơn hàng để kiểm tra
    const orders = await Order.findAll({
      where: { id_DonHang: orderIds },
      attributes: ['id_DonHang', 'trangThaiDonHang', 'trangThaiThanhToan', 'phuongThucThanhToan'],
      transaction: t
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Một số đơn hàng không tồn tại'
      });
    }

    // Kiểm tra logic cập nhật cho từng đơn
    const invalidOrders = [];
    const endStatuses = ['delivered', 'cancelled'];
    
    for (const order of orders) {
      // Không cho cập nhật nếu đã ở trạng thái kết thúc
      if (endStatuses.includes(order.trangThaiDonHang)) {
        invalidOrders.push(order.id_DonHang);
        continue;
      }

      // Kiểm tra ràng buộc thanh toán cho đơn online
      const payMethod = (order.phuongThucThanhToan || '').toLowerCase();
      const isOnlineMethod = !['cod', 'tien_mat'].includes(payMethod);
      const paymentStatus = order.trangThaiThanhToan;
      const requiresPaid = ['confirmed', 'shipping', 'delivered'].includes(status);
      
      if (isOnlineMethod && requiresPaid && paymentStatus !== 'paid') {
        invalidOrders.push(order.id_DonHang);
      }
    }

    if (invalidOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể cập nhật trạng thái cho các đơn hàng: ${invalidOrders.join(', ')}. Lý do: đã kết thúc hoặc chưa thanh toán.`
      });
    }

    // Cập nhật hàng loạt
    const updateData = { trangThaiDonHang: status };
    if (lyDo?.trim()) {
      updateData.lyDo = lyDo.trim();
    }
    
    await Order.update(updateData, { 
      where: { id_DonHang: orderIds }, 
      transaction: t 
    });

    // Xử lý logic đặc biệt theo trạng thái
    if (status === 'delivered') {
      // Cập nhật thanh toán cho các đơn COD
      await sequelize.query(`
        UPDATE donhang 
        SET trangThaiThanhToan = 'paid' 
        WHERE id_DonHang IN (${orderIds.map(() => '?').join(',')}) 
        AND LOWER(phuongThucThanhToan) IN ('cod', 'tien_mat')
        AND trangThaiThanhToan != 'paid'
      `, { 
        replacements: orderIds, 
        type: QueryTypes.UPDATE, 
        transaction: t 
      });
      console.log('💰 Đã cập nhật thanh toán COD cho các đơn giao thành công');
    }

    if (status === 'cancelled') {
      // Khôi phục tồn kho và xử lý hoàn tiền
      try {
        for (const order of orders) {
          // Khôi phục tồn kho nếu đơn còn ở pending/confirmed
          if (['pending', 'confirmed'].includes(order.trangThaiDonHang)) {
            await restoreInventoryForOrder(order.id_DonHang, t);
          }

          // Đánh dấu hoàn tiền cho đơn online đã thanh toán
          const payMethod = (order.phuongThucThanhToan || '').toLowerCase();
          const isOnline = !['cod', 'tien_mat'].includes(payMethod);
          if (isOnline && order.trangThaiThanhToan === 'paid') {
            await Order.update(
              { trangThaiThanhToan: 'refunded' },
              { where: { id_DonHang: order.id_DonHang }, transaction: t }
            );
          }
        }
        console.log('📦 Đã xử lý tồn kho và hoàn tiền cho các đơn hủy');
      } catch (invErr) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Không thể xử lý tồn kho/hoàn tiền khi hủy đơn hàng loạt',
          error: invErr.message
        });
      }
    }

    await t.commit();

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái cho ${orderIds.length} đơn hàng thành ${status}`,
      data: { 
        orderIds, 
        status, 
        lyDo: updateData.lyDo,
        updated: orderIds.length 
      }
    });
  } catch (error) {
    try { await t.rollback(); } catch (_) {}
    console.error('Error in bulkUpdateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng hàng loạt',
      error: error.message
    });
  }
};

// Xóa đơn hàng hàng loạt
exports.bulkDeleteOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID đơn hàng không hợp lệ'
      });
    }

    // Xóa hàng loạt
    await Order.destroy({
      where: { id_DonHang: orderIds }
    });

    res.json({
      success: true,
      message: `Đã xóa ${orderIds.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('Error in bulkDeleteOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đơn hàng hàng loạt',
      error: error.message
    });
  }
};

// Tổng quan đơn hàng cho admin
exports.getOrdersSummary = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case '7d':
        dateCondition = 'AND o.ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'AND o.ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        break;
      default:
        dateCondition = '';
    }

    // Query thống kê đơn hàng
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'da_xac_nhan' THEN 1 END) as confirmedOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'delivered' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN trangThaiDonHang IN ('cancelled_by_customer', 'cancelled_by_admin') THEN 1 END) as cancelledOrders,
        SUM(CASE WHEN trangThaiDonHang = 'delivered' THEN tongThanhToan ELSE 0 END) as totalRevenue,
        AVG(tongThanhToan) as avgOrderValue,
        COUNT(CASE WHEN DATE(ngayDatHang) = CURRENT_DATE THEN 1 END) as todayOrders
      FROM donhang o
      WHERE 1=1 ${dateCondition}
    `;

    const result = await sequelize.query(summaryQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: result[0],
      message: `Lấy tổng quan đơn hàng ${period} thành công`
    });
  } catch (error) {
    console.error('Error in getOrdersSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan đơn hàng',
      error: error.message
    });
  }
};

// Xu hướng đơn hàng theo thời gian
exports.getOrderTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Query xu hướng đơn hàng theo ngày
    const trendsQuery = `
      SELECT 
        DATE(ngayDatHang) as date,
        COUNT(*) as orderCount,
        COUNT(CASE WHEN trangThaiDonHang = 'delivered' THEN 1 END) as completedCount,
        SUM(CASE WHEN trangThaiDonHang = 'delivered' THEN tongThanhToan ELSE 0 END) as revenue
      FROM donhang
      WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      GROUP BY DATE(ngayDatHang)
      ORDER BY date DESC
      LIMIT 30
    `;

    const trends = await sequelize.query(trendsQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: trends.reverse(), // Đảo ngược để hiển thị từ cũ đến mới
      message: `Lấy xu hướng đơn hàng ${period} thành công`
    });
  } catch (error) {
    console.error('Error in getOrderTrends:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy xu hướng đơn hàng',
      error: error.message
    });
  }
};

// Thống kê doanh thu
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Query thống kê doanh thu chi tiết
    const revenueQuery = `
      SELECT 
        SUM(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as totalRevenue,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN 1 END) as paidOrders,
        AVG(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan END) as avgOrderValue,
        SUM(CASE WHEN DATE(ngayDatHang) = CURRENT_DATE AND trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as todayRevenue,
        SUM(CASE WHEN ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) AND trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as weekRevenue,
        SUM(CASE WHEN ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) AND trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as monthRevenue
      FROM donhang
    `;

    const result = await sequelize.query(revenueQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: result[0],
      message: 'Lấy thống kê doanh thu thành công'
    });
  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê doanh thu',
      error: error.message
    });
  }
};

// Export orders to Excel (tạm thời trả về JSON)
exports.exportOrdersToExcel = async (req, res) => {
  try {
    // Lấy tất cả orders để export
    const orders = await Order.findAll({
      order: [['ngayDatHang', 'DESC']],
      include: [
        { model: User, as: 'User', attributes: ['ten', 'email', 'soDienThoai'] }
      ]
    });

    res.json({
      success: true,
      data: orders,
      message: `Export ${orders.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('Error in exportOrdersToExcel:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export đơn hàng',
      error: error.message
    });
  }
};

// Hủy đơn hàng (cho khách hàng)
exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    // Kiểm tra đơn hàng tồn tại và trạng thái
    const order = await sequelize.query(
      'SELECT * FROM donhang WHERE id_DonHang = ?',
      { replacements: [id], type: QueryTypes.SELECT }
    );
    if (!order || order.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }
  const currentStatus = order[0].trangThaiDonHang;
  const payStatus = (order[0].trangThaiThanhToan || '').toUpperCase();
  const payMethod = (order[0].phuongThucThanhToan || '').toUpperCase();
  const isOnlineMethod = !(payMethod === 'COD' || payMethod === 'TIEN_MAT');
      // Chỉ cho phép hủy khi trạng thái là 'cho_xu_ly'
      if (currentStatus !== 'cho_xu_ly') {
        // Chặn cứng khi đã xác nhận hoặc đang chuẩn bị theo yêu cầu
        if (currentStatus === 'da_xac_nhan' || currentStatus === 'dang_chuan_bi') {
          return res.status(400).json({
            success: false,
            message: 'Đơn hàng đã xác nhận/đang chuẩn bị, bạn không thể hủy.',
            currentStatus
          });
        }
        return res.status(400).json({ 
          success: false,
          message: 'Đơn hàng đã được xử lý, bạn không thể hủy',
          currentStatus
        });
      }
    // Nếu đã thanh toán online thành công -> không cho khách hủy, cần liên hệ admin
    if (isOnlineMethod && payStatus === 'DA_THANH_TOAN') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã thanh toán online, bạn không thể hủy. Vui lòng liên hệ admin.'
      });
    }

    // Cập nhật trạng thái đơn hàng thành 'huy_boi_khach'
    await sequelize.query(
      'UPDATE donhang SET trangThaiDonHang = ? WHERE id_DonHang = ?',
      { replacements: ['huy_boi_khach', id], type: QueryTypes.UPDATE, transaction: t }
    );

    // Khôi phục tồn kho do khách hủy
    try {
      // Khôi phục tồn kho: chỉ nếu là COD/tiền mặt (đã trừ tồn ngay) hoặc online nhưng đã trừ tồn do đã thanh toán thành công
      if (!isOnlineMethod || payStatus === 'DA_THANH_TOAN') {
        await restoreInventoryForOrder(id, t);
      }
    } catch (invErr) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không thể khôi phục tồn kho khi hủy đơn',
        error: invErr.message
      });
    }

    await t.commit();
    // Gửi thông báo cho admin về việc khách hủy đơn
    try {
      // Lấy thông tin khách hàng
      const customerInfo = await sequelize.query(
        'SELECT ten, email, soDienThoai FROM nguoidung WHERE id_NguoiDung = ?',
        { replacements: [order[0].id_NguoiDung], type: QueryTypes.SELECT }
      );
      const orderNotificationData = {
        ...order[0],
        tenKhachHang: customerInfo[0]?.ten,
        email: customerInfo[0]?.email,
        soDienThoai: customerInfo[0]?.soDienThoai
      };
      await sendCancelOrderNotificationEmail(orderNotificationData);
      console.log(`✅ Admin notification sent for customer cancellation #${order[0].maDonHang || id}`);
    } catch (notificationError) {
      console.error('❌ Failed to send admin notification:', notificationError.message);
    }
    res.json({ 
      success: true, 
      message: 'Đơn hàng đã được hủy thành công.',
      newStatus: 'huy_boi_khach'
    });
  } catch (error) {
    try { await t.rollback(); } catch (_) {}
    console.error('Error canceling order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi xử lý yêu cầu hủy đơn hàng', 
      error: error.message 
    });
  }
};

// Duyệt yêu cầu hủy đơn hàng (cho admin)
exports.approveCancellation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { reason = 'Admin đã chấp nhận yêu cầu hủy đơn hàng' } = req.body;
    // Kiểm tra đơn hàng tồn tại và trạng thái
    const order = await sequelize.query(
      'SELECT * FROM donhang WHERE id_DonHang = ?',
      { replacements: [id], type: QueryTypes.SELECT }
    );
    if (!order || order.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }
    const currentStatus = order[0].trangThaiDonHang;
    // Chỉ cho phép duyệt yêu cầu hủy từ trạng thái 'khach_yeu_cau_huy'
    if (currentStatus !== 'khach_yeu_cau_huy') {
      return res.status(400).json({ 
        success: false,
        message: 'Đơn hàng không ở trạng thái yêu cầu hủy',
        currentStatus: currentStatus
      });
    }
    // Cập nhật trạng thái đơn hàng thành 'huy_boi_khach'
    await sequelize.query(
      'UPDATE donhang SET trangThaiDonHang = ? WHERE id_DonHang = ?',
      { replacements: ['huy_boi_khach', id], type: QueryTypes.UPDATE, transaction: t }
    );

    // Khôi phục tồn kho khi admin duyệt yêu cầu hủy
    try {
      await restoreInventoryForOrder(id, t);
    } catch (invErr) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không thể khôi phục tồn kho khi duyệt hủy',
        error: invErr.message
      });
    }

    await t.commit();
    // Gửi email thông báo cho khách hàng
    try {
      const customerInfo = await sequelize.query(
        'SELECT ten, email, soDienThoai FROM nguoidung WHERE id_NguoiDung = ?',
        { replacements: [order[0].id_NguoiDung], type: QueryTypes.SELECT }
      );
      if (customerInfo[0]?.email) {
        const orderNotificationData = {
          ...order[0],
          tenKhachHang: customerInfo[0]?.ten,
          email: customerInfo[0]?.email,
          soDienThoai: customerInfo[0]?.soDienThoai
        };
        await sendApprovedCancellationEmail(customerInfo[0].email, orderNotificationData, reason);
        console.log(`✅ Customer notification sent for approved cancellation #${order[0].maDonHang || id}`);
      }
    } catch (notificationError) {
      console.error('❌ Failed to send customer notification:', notificationError.message);
    }
    res.json({ 
      success: true, 
      message: 'Đã chấp nhận yêu cầu hủy đơn hàng thành công.',
      newStatus: 'huy_boi_khach',
      reason: reason
    });
  } catch (error) {
    try { await t.rollback(); } catch (_) {}
    console.error('Error approving cancellation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi duyệt yêu cầu hủy đơn hàng', 
      error: error.message 
    });
  }
};

// Từ chối yêu cầu hủy đơn hàng (cho admin)
exports.rejectCancellation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Admin đã từ chối yêu cầu hủy đơn hàng' } = req.body;
    // Kiểm tra đơn hàng tồn tại và trạng thái
    const order = await sequelize.query(
      'SELECT * FROM donhang WHERE id_DonHang = ?',
      { replacements: [id], type: QueryTypes.SELECT }
    );
    if (!order || order.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }
    const currentStatus = order[0].trangThaiDonHang;
    // Chỉ cho phép từ chối yêu cầu hủy từ trạng thái 'khach_yeu_cau_huy'
    if (currentStatus !== 'khach_yeu_cau_huy') {
      return res.status(400).json({ 
        success: false,
        message: 'Đơn hàng không ở trạng thái yêu cầu hủy',
        currentStatus: currentStatus
      });
    }
    // Cập nhật trạng thái đơn hàng về trạng thái trước đó (ví dụ: 'cho_xu_ly')
    const previousStatus = 'cho_xu_ly'; // Có thể lưu trạng thái trước khi yêu cầu hủy nếu cần
    await sequelize.query(
      'UPDATE donhang SET trangThaiDonHang = ? WHERE id_DonHang = ?',
      { replacements: [previousStatus, id], type: QueryTypes.UPDATE }
    );
    // Gửi email thông báo cho khách hàng
    try {
      const customerInfo = await sequelize.query(
        'SELECT ten, email, soDienThoai FROM nguoidung WHERE id_NguoiDung = ?',
        { replacements: [order[0].id_NguoiDung], type: QueryTypes.SELECT }
      );
      if (customerInfo[0]?.email) {
        const orderNotificationData = {
          ...order[0],
          tenKhachHang: customerInfo[0]?.ten,
          email: customerInfo[0]?.email,
          soDienThoai: customerInfo[0]?.soDienThoai
        };
        await sendRejectedCancellationEmail(customerInfo[0].email, orderNotificationData, reason);
        console.log(`✅ Customer notification sent for rejected cancellation #${order[0].maDonHang || id}`);
      }
    } catch (notificationError) {
      console.error('❌ Failed to send customer notification:', notificationError.message);
    }
    res.json({ 
      success: true, 
      message: 'Đã từ chối yêu cầu hủy đơn hàng. Đơn hàng sẽ tiếp tục được xử lý.',
      newStatus: previousStatus,
      reason: reason
    });
  } catch (error) {
    console.error('Error rejecting cancellation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi từ chối yêu cầu hủy đơn hàng', 
      error: error.message 
    });
  }
};

// ==========================================
// 💳 ONLINE PAYMENT FLOW HANDLERS
// ==========================================

/**
 * 🎯 Xử lý callback thành công từ cổng thanh toán
 * pending → paid + trừ tồn kho
 */
exports.paymentSuccess = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId, transactionId, amount, gatewayResponse } = req.body;
    
    console.log('✅ Payment success callback received:', {
      orderId,
      transactionId,
      amount,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin orderId'
      });
    }

    // Find order
    const order = await sequelize.query(
      'SELECT * FROM donhang WHERE id_DonHang = ? OR maDonHang = ?',
      {
        replacements: [orderId, orderId],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (order.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const orderData = order[0];
    
    // Verify payment status - chỉ chấp nhận 'pending'
    if (orderData.trangThaiThanhToan !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Trạng thái thanh toán không hợp lệ: ${orderData.trangThaiThanhToan}`,
        expectedStatus: 'pending',
        currentStatus: orderData.trangThaiThanhToan
      });
    }

    // Verify amount if provided
    if (amount && Math.abs(parseFloat(amount) - parseFloat(orderData.tongThanhToan)) > 0.01) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Số tiền thanh toán không khớp',
        expectedAmount: orderData.tongThanhToan,
        receivedAmount: amount
      });
    }

    // Get order items to deduct inventory
    const orderItems = await sequelize.query(
      'SELECT id_SanPham, soLuongMua FROM chitietdonhang WHERE id_DonHang = ?',
      {
        replacements: [orderData.id_DonHang],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    // Deduct inventory for online payment
    console.log('🔄 Deducting inventory for online payment success...');
    await decreaseInventoryForItems(
      orderItems.map(item => ({
        id_SanPham: item.id_SanPham,
        soLuongMua: item.soLuongMua
      })),
      transaction
    );

    // Update payment status: pending → paid
    await sequelize.query(
      `UPDATE donhang SET 
         trangThaiThanhToan = 'paid',
         lyDo = ?
       WHERE id_DonHang = ?`,
      {
        replacements: [
          `Thanh toán online thành công. Transaction ID: ${transactionId || 'N/A'}`,
          orderData.id_DonHang
        ],
        type: QueryTypes.UPDATE,
        transaction
      }
    );

    await transaction.commit();

    console.log('🎉 Payment success processed successfully for order:', orderData.id_DonHang);

    res.json({
      success: true,
      message: 'Thanh toán thành công',
      data: {
        orderId: orderData.id_DonHang,
        orderCode: orderData.maDonHang,
        paymentStatus: 'paid',
        transactionId
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error processing payment success:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý thanh toán thành công',
      error: error.message
    });
  }
};

/**
 * ❌ Xử lý callback thất bại/timeout từ cổng thanh toán
 * pending → failed + hủy đơn hàng
 */
exports.paymentFailure = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId, reason, gatewayResponse } = req.body;
    
    console.log('❌ Payment failure callback received:', {
      orderId,
      reason,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin orderId'
      });
    }

    // Find order
    const order = await sequelize.query(
      'SELECT * FROM donhang WHERE id_DonHang = ? OR maDonHang = ?',
      {
        replacements: [orderId, orderId],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (order.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const orderData = order[0];
    
    // Verify payment status - chỉ chấp nhận 'pending'
    if (orderData.trangThaiThanhToan !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Trạng thái thanh toán không hợp lệ: ${orderData.trangThaiThanhToan}`,
        expectedStatus: 'pending',
        currentStatus: orderData.trangThaiThanhToan
      });
    }

    // Update order status: pending → failed + cancelled
    await sequelize.query(
      `UPDATE donhang SET 
         trangThaiThanhToan = 'failed',
         trangThaiDonHang = 'cancelled',
         lyDo = ?
       WHERE id_DonHang = ?`,
      {
        replacements: [
          `Thanh toán thất bại: ${reason || 'Không xác định'}`,
          orderData.id_DonHang
        ],
        type: QueryTypes.UPDATE,
        transaction
      }
    );

    await transaction.commit();

    console.log('💔 Payment failure processed for order:', orderData.id_DonHang);

    res.json({
      success: true,
      message: 'Đã xử lý thanh toán thất bại',
      data: {
        orderId: orderData.id_DonHang,
        orderCode: orderData.maDonHang,
        paymentStatus: 'failed',
        orderStatus: 'cancelled',
        reason
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error processing payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý thanh toán thất bại',
      error: error.message
    });
  }
};

/**
 * ⏰ Kiểm tra và xử lý các đơn hàng bị timeout thanh toán
 * Tự động chuyển pending → failed sau thời gian quy định
 */
exports.checkPaymentTimeout = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const timeoutMinutes = req.query.timeout || 30; // Default 30 phút
    const timeoutDate = new Date();
    timeoutDate.setMinutes(timeoutDate.getMinutes() - timeoutMinutes);
    
    console.log(`⏰ Checking payment timeout for orders older than ${timeoutMinutes} minutes...`);

    // Find orders with 'pending' payment status that are older than timeout
    const timeoutOrders = await sequelize.query(
      `SELECT id_DonHang, maDonHang, ngayDatHang, tongThanhToan 
       FROM donhang 
       WHERE trangThaiThanhToan = 'pending' 
       AND ngayDatHang < ?`,
      {
        replacements: [timeoutDate],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (timeoutOrders.length === 0) {
      await transaction.commit();
      return res.json({
        success: true,
        message: 'Không có đơn hàng nào bị timeout',
        timeoutCount: 0
      });
    }

    // Update timeout orders: pending → failed + cancelled
    const orderIds = timeoutOrders.map(order => order.id_DonHang);
    
    await sequelize.query(
      `UPDATE donhang SET 
         trangThaiThanhToan = 'failed',
         trangThaiDonHang = 'cancelled',
         lyDo = ?
       WHERE id_DonHang IN (${orderIds.map(() => '?').join(',')})`,
      {
        replacements: [
          `Timeout thanh toán online (quá ${timeoutMinutes} phút)`,
          ...orderIds
        ],
        type: QueryTypes.UPDATE,
        transaction
      }
    );

    await transaction.commit();

    console.log(`⏰ Processed ${timeoutOrders.length} timeout orders`);

    res.json({
      success: true,
      message: `Đã xử lý ${timeoutOrders.length} đơn hàng timeout`,
      timeoutCount: timeoutOrders.length,
      timeoutOrders: timeoutOrders.map(order => ({
        orderId: order.id_DonHang,
        orderCode: order.maDonHang,
        orderDate: order.ngayDatHang,
        amount: order.tongThanhToan
      }))
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error checking payment timeout:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra timeout thanh toán',
      error: error.message
    });
  }
};

// === MODULE EXPORTS - Xuất tất cả functions ===
module.exports = {
  // Basic CRUD - Các function cơ bản
  getAll: exports.getAll,
  getById: exports.getById,
  create: exports.create,
  update: exports.update,
  delete: exports.delete,
  getByUser: exports.getByUser,
  
  // Admin functions - Các function cho admin
  updateOrderStatus: exports.updateOrderStatus,
  bulkUpdateOrderStatus: exports.bulkUpdateOrderStatus,
  bulkDeleteOrders: exports.bulkDeleteOrders,
  getOrdersSummary: exports.getOrdersSummary,
  getOrderTrends: exports.getOrderTrends,
  getRevenueAnalytics: exports.getRevenueAnalytics,
  exportOrdersToExcel: exports.exportOrdersToExcel,
  cancelOrder: exports.cancelOrder,
  approveCancellation: exports.approveCancellation,
  rejectCancellation: exports.rejectCancellation,
  
  // Online Payment Flow Functions
  paymentSuccess: exports.paymentSuccess,
  paymentFailure: exports.paymentFailure,
  checkPaymentTimeout: exports.checkPaymentTimeout,
  
  // Alias functions - Tên gọi khác để tương thích
  getAllOrders: exports.getAll,
  getOrderById: exports.getById,
  updateOrder: exports.update,
  deleteOrder: exports.delete
}; 