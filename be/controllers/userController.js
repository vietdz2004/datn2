const { User } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../services/emailService');

// Lấy tất cả người dùng với RAW SQL filtering, search, pagination, sorting
exports.getAll = async (req, res) => {
  try {
    const {
      // Pagination
      page = 1,
      limit = 20,
      
      // Search
      search,
      
      // Filters
      status,           // HOAT_DONG, TAM_KHOA, DA_KHOA
      vaiTro,          // KHACH_HANG, NHAN_VIEN, QUAN_LY
      dateFrom,
      dateTo,
      province,        // Tỉnh thành
      
      // Sorting
      sortBy = 'ngayTao', // ngayTao, ten, email
      sortOrder = 'DESC'    // ASC, DESC
    } = req.query;

    // Xây dựng WHERE conditions
    const whereConditions = [];
    const queryParams = [];

    // Search condition - tìm kiếm theo tên, email, SĐT, địa chỉ
    if (search) {
      whereConditions.push(`
        (u.ten LIKE ? OR 
         u.email LIKE ? OR 
         u.soDienThoai LIKE ? OR 
         u.diaChi LIKE ?)
      `);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Status filter
    if (status) {
      whereConditions.push(`u.trangThai = ?`);
      queryParams.push(status);
    }
    
    // Role filter
    if (vaiTro) {
      whereConditions.push(`u.vaiTro = ?`);
      queryParams.push(vaiTro);
    }
    
    // Date range filter (registration date)
    if (dateFrom && dateTo) {
      whereConditions.push(`u.ngayTao BETWEEN ? AND ?`);
      queryParams.push(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      whereConditions.push(`u.ngayTao >= ?`);
      queryParams.push(new Date(dateFrom));
    } else if (dateTo) {
      whereConditions.push(`u.ngayTao <= ?`);
      queryParams.push(new Date(dateTo));
    }
    
    // Province filter
    if (province) {
      whereConditions.push(`u.diaChi LIKE ?`);
      queryParams.push(`%${province}%`);
    }

    // Xây dựng ORDER BY clause
    let orderClause = '';
    switch (sortBy) {
      case 'ten':
        orderClause = `ORDER BY u.ten ${sortOrder.toUpperCase()}`;
        break;
      case 'email':
        orderClause = `ORDER BY u.email ${sortOrder.toUpperCase()}`;
        break;
      case 'ngayTao':
      default:
        orderClause = `ORDER BY u.ngayTao ${sortOrder.toUpperCase()}`;
        break;
    }
    
    // Xây dựng WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Main query để lấy users
    const mainQuery = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao,
        COALESCE(order_counts.total_orders, 0) as totalOrders,
        COALESCE(order_counts.total_spent, 0) as totalSpent
      FROM nguoidung u
      LEFT JOIN (
        SELECT 
          id_NguoiDung,
          COUNT(*) as total_orders,
          SUM(tongThanhToan) as total_spent
        FROM donhang 
        WHERE trangThaiDonHang = 'DA_GIAO'
        GROUP BY id_NguoiDung
      ) order_counts ON u.id_NguoiDung = order_counts.id_NguoiDung
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;
    
    // Count query để đếm tổng số
    const countQuery = `
      SELECT COUNT(*) as total
      FROM nguoidung u
      ${whereClause}
    `;

    // Stats query để tính thống kê
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN u.trangThai = 'HOAT_DONG' THEN 1 END) as active,
        COUNT(CASE WHEN u.trangThai = 'DA_KHOA' THEN 1 END) as locked,
        COUNT(CASE WHEN u.trangThai = 'TAM_KHOA' THEN 1 END) as suspended,
        COUNT(CASE WHEN u.vaiTro = 'KHACH_HANG' THEN 1 END) as customers,
        COUNT(CASE WHEN u.vaiTro = 'NHAN_VIEN' THEN 1 END) as staff,
        COUNT(CASE WHEN u.vaiTro = 'QUAN_LY' THEN 1 END) as managers,
        COUNT(CASE WHEN DATE(u.ngayTao) = CURRENT_DATE THEN 1 END) as newToday,
        COUNT(CASE WHEN MONTH(u.ngayTao) = MONTH(CURRENT_DATE) AND YEAR(u.ngayTao) = YEAR(CURRENT_DATE) THEN 1 END) as newThisMonth
      FROM nguoidung u
      ${whereClause}
    `;

    // Execute các queries song song
    queryParams.push(parseInt(limit), offset);
    
    const [users, countResult, statsResult] = await Promise.all([
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

    const totalItems = parseInt(countResult[0].total);
    const stats = {
      total: parseInt(statsResult[0].total),
      active: parseInt(statsResult[0].active),
      locked: parseInt(statsResult[0].locked),
      suspended: parseInt(statsResult[0].suspended),
      customers: parseInt(statsResult[0].customers),
      staff: parseInt(statsResult[0].staff),
      managers: parseInt(statsResult[0].managers),
      newToday: parseInt(statsResult[0].newToday),
      newThisMonth: parseInt(statsResult[0].newThisMonth)
    };
    
    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      stats,
      filters: {
        search,
        status,
        vaiTro,
        dateFrom,
        dateTo,
        province,
        sortBy,
        sortOrder
      },
      performance: {
        queryExecutionTime: Date.now(),
        sqlOptimized: true
      }
    });
  } catch (error) {
    console.error('Error in getAll users with SQL:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy người dùng theo id với SQL (loại bỏ password)
exports.getById = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao,
        COUNT(o.id_DonHang) as totalOrders,
        SUM(CASE WHEN o.trangThaiDonHang = 'DA_GIAO' THEN COALESCE(o.tongThanhToan, 0) ELSE 0 END) as totalSpent,
        MAX(o.ngayDatHang) as lastOrderDate,
        AVG(CASE WHEN o.trangThaiDonHang = 'DA_GIAO' THEN COALESCE(o.tongThanhToan, 0) END) as avgOrderValue
      FROM nguoidung u
      LEFT JOIN donhang o ON u.id_NguoiDung = o.id_NguoiDung
      WHERE u.id_NguoiDung = ?
      GROUP BY u.id_NguoiDung
    `;
    
    const result = await sequelize.query(query, {
      replacements: [req.params.id],
      type: QueryTypes.SELECT
    });
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Get recent orders for this user
    const recentOrdersQuery = `
      SELECT 
        o.id_DonHang,
        o.tongThanhToan,
        o.trangThaiDonHang,
        o.ngayDatHang
      FROM donhang o
      WHERE o.id_NguoiDung = ?
      ORDER BY o.ngayDatHang DESC
      LIMIT 5
    `;
    
    const recentOrders = await sequelize.query(recentOrdersQuery, {
      replacements: [req.params.id],
      type: QueryTypes.SELECT
    });

    const user = {
      ...result[0],
      recentOrders
    };
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới người dùng
exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    
    // Lấy user vừa tạo nhưng loại bỏ password
    const query = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao
      FROM nguoidung u
      WHERE u.id_NguoiDung = ?
    `;
    
    const result = await sequelize.query(query, {
      replacements: [user.id_NguoiDung],
      type: QueryTypes.SELECT
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công!',
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Cập nhật người dùng
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    
    await user.update(req.body);
    
    // Lấy user đã cập nhật nhưng loại bỏ password
    const query = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao
      FROM nguoidung u
      WHERE u.id_NguoiDung = ?
    `;
    
    const result = await sequelize.query(query, {
      replacements: [req.params.id],
      type: QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công!',
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa người dùng
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    await user.destroy();
    res.json({ message: 'Đã xóa người dùng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thống kê chi tiết người dùng với SQL
exports.getUserStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM nguoidung WHERE trangThai = 'HOAT_DONG') as activeUsers,
        (SELECT COUNT(*) FROM nguoidung WHERE vaiTro = 'KHACH_HANG') as customers,
        (SELECT COUNT(*) FROM nguoidung WHERE DATE(ngayTao) = CURRENT_DATE) as newToday,
        (SELECT COUNT(*) FROM nguoidung WHERE ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)) as newThisWeek,
        (SELECT COUNT(*) FROM nguoidung WHERE ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)) as newThisMonth,
        (SELECT AVG(totalSpent) FROM (
          SELECT u.id_NguoiDung, SUM(o.tongThanhToan) as totalSpent
          FROM nguoidung u
          LEFT JOIN donhang o ON u.id_NguoiDung = o.id_NguoiDung AND o.trangThaiDonHang = 'DA_GIAO'
          GROUP BY u.id_NguoiDung
        ) as userSpending) as avgCustomerValue
    `;
    
    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// AUTH ENDPOINTS

// Đăng ký người dùng
const register = async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, matKhau } = req.body;

    // Validate input
    if (!hoTen || !email || !soDienThoai || !matKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(matKhau, salt);

    // Create user
    const userData = {
      ten: hoTen,
      email,
      soDienThoai,
      matKhau: hashedPassword,
      vaiTro: 'KHACH_HANG',
      trangThai: 'HOAT_DONG'
    };

    const user = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id_NguoiDung, email: user.email, vaiTro: user.vaiTro },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.matKhau;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Đăng ký thành công'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi đăng ký',
      error: error.message
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    console.log('LOGIN DEBUG:', { email, matKhau });

    // Validate input
    if (!email || !matKhau) {
      console.log('LOGIN ERROR: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    console.log('LOGIN DEBUG: user found:', user ? user.email : null);
    if (!user) {
      console.log('LOGIN ERROR: User not found');
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau);
    console.log('LOGIN DEBUG: password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('LOGIN ERROR: Wrong password');
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id_NguoiDung, email: user.email, vaiTro: user.vaiTro },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.matKhau;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Đăng nhập thành công'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi đăng nhập',
      error: error.message
    });
  }
};

// Xác thực token
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // Get user info
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.matKhau;
    res.json({
      success: true,
      data: { user: userResponse },
      message: 'Token hợp lệ'
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      error: error.message
    });
  }
};

// Đăng xuất (chỉ trả về thông báo thành công)
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng xuất',
      error: error.message
    });
  }
};

// Cập nhật profile người dùng
const updateProfile = async (req, res) => {
  try {
    console.log('DEBUG updateProfile req.user:', req.user);
    console.log('DEBUG updateProfile req.body:', req.body);
    const userId = req.user.id; // From auth middleware
    const userData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete userData.matKhau;
    delete userData.vaiTro;
    delete userData.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    await user.update(userData);
    const updatedUser = user.toJSON();
    delete updatedUser.matKhau;

    res.json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin',
      error: error.message
    });
  }
};

// === ADMIN FUNCTIONS - Các function dành cho admin ===

// Cập nhật trạng thái người dùng (HOAT_DONG, TAM_KHOA, DA_KHOA)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status - Kiểm tra trạng thái hợp lệ
    const validStatuses = ['HOAT_DONG', 'TAM_KHOA', 'DA_KHOA'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    await user.update({ trangThai: status });
    
    res.json({
      success: true,
      message: `Đã cập nhật trạng thái người dùng thành ${status}`,
      data: { id, status }
    });
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái người dùng',
      error: error.message
    });
  }
};

// Lấy lịch sử đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query lấy đơn hàng của user
    const ordersQuery = `
      SELECT 
        o.id_DonHang,
        o.maDonHang,
        o.tongThanhToan,
        o.trangThaiDonHang,
        o.ngayDatHang,
        o.phuongThucThanhToan,
        o.trangThaiThanhToan,
        o.diaChiGiaoHang,
        o.tenNguoiNhan,
        o.soDienThoai,
        o.ghiChu,
        COUNT(od.id_ChiTietDH) as itemCount
      FROM donhang o
      LEFT JOIN chitietdonhang od ON o.id_DonHang = od.id_DonHang
      WHERE o.id_NguoiDung = ?
      GROUP BY o.id_DonHang
      ORDER BY o.ngayDatHang DESC
      LIMIT ? OFFSET ?
    `;

    const orders = await sequelize.query(ordersQuery, {
      replacements: [id, parseInt(limit), offset],
      type: QueryTypes.SELECT
    });

    // Lấy chi tiết đơn hàng cho mỗi đơn hàng
    const orderIds = orders.map(order => order.id_DonHang);
    if (orderIds.length > 0) {
      const detailsQuery = `
        SELECT 
          od.id_DonHang,
          od.id_SanPham,
          od.soLuong,
          od.giaBan,
          sp.tenSp,
          sp.hinhAnh,
          (SELECT EXISTS(SELECT 1 FROM danhgia dg WHERE dg.id_DonHang = od.id_DonHang AND dg.id_SanPham = od.id_SanPham AND dg.id_NguoiDung = ?)) as isReviewed
        FROM chitietdonhang od
        JOIN sanpham sp ON od.id_SanPham = sp.id_SanPham
        WHERE od.id_DonHang IN (?)
      `;
      
      const details = await sequelize.query(detailsQuery, {
        replacements: [id, orderIds],
        type: QueryTypes.SELECT
      });

      // Gắn chi tiết vào mỗi đơn hàng
      orders.forEach(order => {
        order.OrderDetails = details.filter(d => d.id_DonHang === order.id_DonHang);
      });
    }

    res.json({
      success: true,
      data: orders,
      message: `Lấy lịch sử ${orders.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử đơn hàng',
      error: error.message
    });
  }
};

// Tổng quan người dùng cho admin
exports.getUsersSummary = async (req, res) => {
  try {
    // Sử dụng lại function getUserStats đã có
    return exports.getUserStats(req, res);
  } catch (error) {
    console.error('Error in getUsersSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan người dùng',
      error: error.message
    });
  }
};

// Hoạt động người dùng gần đây
exports.getUserActivity = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case '7d':
        dateCondition = 'AND u.ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'AND u.ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        break;
      default:
        dateCondition = '';
    }

    // Query hoạt động người dùng - Lấy thống kê hoạt động theo thời gian
    const activityQuery = `
      SELECT 
        DATE(u.ngayTao) as date,
        COUNT(*) as newUsers,
        COUNT(CASE WHEN u.vaiTro = 'KHACH_HANG' THEN 1 END) as newCustomers
      FROM nguoidung u
      WHERE 1=1 ${dateCondition}
      GROUP BY DATE(u.ngayTao)
      ORDER BY date DESC
      LIMIT 30
    `;

    const activity = await sequelize.query(activityQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: activity,
      message: `Lấy hoạt động người dùng ${period} thành công`
    });
  } catch (error) {
    console.error('Error in getUserActivity:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hoạt động người dùng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái hàng loạt
exports.bulkUpdateUserStatus = async (req, res) => {
  try {
    const { userIds, status } = req.body;

    // Validate input - Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID người dùng không hợp lệ'
      });
    }

    const validStatuses = ['HOAT_DONG', 'TAM_KHOA', 'DA_KHOA'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    // Cập nhật hàng loạt bằng SQL
    const updateQuery = `
      UPDATE nguoidung 
      SET trangThai = ?
      WHERE id_NguoiDung IN (${userIds.map(() => '?').join(',')})
    `;

    await sequelize.query(updateQuery, {
      replacements: [status, ...userIds],
      type: QueryTypes.UPDATE
    });

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái ${userIds.length} người dùng thành ${status}`
    });
  } catch (error) {
    console.error('Error in bulkUpdateUserStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái hàng loạt',
      error: error.message
    });
  }
};

// Xóa người dùng hàng loạt
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID người dùng không hợp lệ'
      });
    }

    // Xóa hàng loạt bằng Sequelize
    await User.destroy({
      where: {
        id_NguoiDung: userIds
      }
    });

    res.json({
      success: true,
      message: `Đã xóa ${userIds.length} người dùng thành công`
    });
  } catch (error) {
    console.error('Error in bulkDeleteUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng hàng loạt',
      error: error.message
    });
  }
};

// Export users to Excel (tạm thời trả về JSON)
exports.exportUsersToExcel = async (req, res) => {
  try {
    // Lấy tất cả users để export
    const users = await User.findAll({
      attributes: ['id_NguoiDung', 'ten', 'email', 'soDienThoai', 'vaiTro', 'trangThai', 'ngayTao']
    });

    res.json({
      success: true,
      data: users,
      message: `Export ${users.length} người dùng thành công`
    });
  } catch (error) {
    console.error('Error in exportUsersToExcel:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export người dùng',
      error: error.message
    });
  }
};

// ===== PASSWORD MANAGEMENT FUNCTIONS =====

// Change Password (for logged-in users)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id || req.body.userId; // From auth middleware or request

    console.log('🔒 Change password request for user:', userId);

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.matKhau);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await user.update({ matKhau: hashedNewPassword });

    console.log('✅ Password changed successfully for user:', userId);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi đổi mật khẩu',
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với email này' });

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    console.log('✅ Token saved to DB:', user.email, user.resetPasswordToken, user.resetPasswordExpiry);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const result = await sendResetPasswordEmail(email, resetUrl, user.ten || user.email);

    if (!result.success) {
      console.log('⚠️ Fallback to mock email.');
    }
    // Luôn trả về response cho client
    return res.json({ success: true, message: 'Đã gửi liên kết đặt lại mật khẩu đến email của bạn!' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    // Tìm user theo token
    const user = await User.findOne({ where: { resetPasswordToken: token } });
    if (!user || !user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    // Hash mật khẩu mới
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Cập nhật mật khẩu và xóa token
    user.matKhau = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();
    return res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    // Lấy token từ params (route: /auth/verify-reset-token/:token)
    const token = req.params.token || req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    // Tìm user theo token
    const user = await User.findOne({ where: { resetPasswordToken: token } });
    if (!user || !user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    // Token hợp lệ
    return res.json({ success: true, data: { email: user.email } });
  } catch (error) {
    console.error('verifyResetToken error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.verifyResetToken = verifyResetToken;

// === MODULE EXPORTS - Xuất tất cả functions ===
module.exports = {
  // Basic CRUD - Các function cơ bản
  getAll: exports.getAll,
  getById: exports.getById,
  create: exports.create,
  update: exports.update,
  delete: exports.delete,
  getUserStats: exports.getUserStats,
  
  // Admin functions - Các function cho admin
  updateUserStatus: exports.updateUserStatus,
  getUserOrders: exports.getUserOrders,
  getUsersSummary: exports.getUsersSummary,
  getUserActivity: exports.getUserActivity,
  bulkUpdateUserStatus: exports.bulkUpdateUserStatus,
  bulkDeleteUsers: exports.bulkDeleteUsers,
  exportUsersToExcel: exports.exportUsersToExcel,
  
  // Auth functions - Các function xác thực
  register,
  login,
  verifyToken,
  logout,
  updateProfile,
  
  // Password management functions
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken
}; 
