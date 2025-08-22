const { Voucher, Order, OrderDetail } = require('../models');
const { Op } = require('sequelize');

// Lấy tất cả voucher với pagination và search cho admin
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;

    // Build where conditions
    const whereConditions = {};

    // Search by voucher code
    if (search) {
      whereConditions.maVoucher = {
        [Op.like]: `%${search}%`
      };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereConditions.ngayBatDau = {};
      if (dateFrom) {
        whereConditions.ngayBatDau[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereConditions.ngayHetHan = {
          [Op.lte]: new Date(dateTo)
        };
      }
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get vouchers with pagination
    const { count, rows: vouchers } = await Voucher.findAndCountAll({
      where: whereConditions,
      order: [['id_voucher', 'DESC']], // Use id_voucher instead of createdAt
      limit: parseInt(limit),
      offset: offset,
      include: [{
        model: Order,
        required: false,
        attributes: ['id_DonHang']
      }]
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: vouchers,
      pagination: {
        total: count,
        totalPages: totalPages,
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      },
      message: 'Lấy danh sách voucher thành công'
    });
  } catch (error) {
    console.error('❌ Error in getAll vouchers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tải danh sách voucher', 
      error: error.message 
    });
  }
};

// Lấy voucher theo id
exports.getById = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id, {
      include: [Order]
    });
    if (!voucher) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy voucher' 
      });
    }
    res.json({
      success: true,
      data: voucher,
      message: 'Lấy thông tin voucher thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Tạo mới voucher với validation
exports.create = async (req, res) => {
  try {
    const {
      maVoucher,
      loai,
      giaTriGiam,
      dieuKienApDung,
      soLuong,
      trangThai,
      ngayBatDau,
      ngayHetHan,
      moTa
    } = req.body;

    // Validation cơ bản
    if (!maVoucher || !loai || !giaTriGiam || soLuong === undefined || !trangThai || !ngayBatDau || !ngayHetHan) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu trường bắt buộc'
      });
    }

    // Validate enum loai
    const validLoai = ['fixed', 'percentage'];
    if (!validLoai.includes(loai)) {
      return res.status(400).json({
        success: false,
        message: 'Loại voucher không hợp lệ'
      });
    }

    // Validate enum trangThai
    const validTrangThai = ['dang_hoat_dong', 'het_han'];
    if (!validTrangThai.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái voucher không hợp lệ'
      });
    }

    // Validate số lượng
    if (isNaN(soLuong) || soLuong < 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải là số >= 0'
      });
    }

    // Validate giá trị giảm
    if (isNaN(giaTriGiam) || giaTriGiam <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị giảm phải là số > 0'
      });
    }

    // Validate ngày
    const startDate = new Date(ngayBatDau);
    const endDate = new Date(ngayHetHan);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Ngày bắt đầu/kết thúc không hợp lệ'
      });
    }

    // Check if voucher code already exists
    const existingVoucher = await Voucher.findOne({
      where: { maVoucher }
    });
    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: 'Mã voucher đã tồn tại'
      });
    }

    // Log dữ liệu nhận được khi tạo voucher
    console.log('Create voucher:', { maVoucher, loai, giaTriGiam, dieuKienApDung, soLuong, trangThai, ngayBatDau, ngayHetHan, moTa });

    // Create voucher
    const voucher = await Voucher.create({
      maVoucher,
      loai,
      giaTriGiam,
      dieuKienApDung,
      soLuong,
      soLuongDaDung: 0,
      trangThai,
      ngayBatDau: startDate,
      ngayHetHan: endDate,
      moTa
    });
    // Log thành công
    console.log('Voucher created:', { id: voucher.id_voucher, moTa: voucher.moTa });

    res.status(201).json({
      success: true,
      data: voucher,
      message: 'Tạo voucher thành công'
    });
  } catch (error) {
    console.error('❌ Error creating voucher:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tạo voucher', 
      error: error.message 
    });
  }
};

// Cập nhật voucher với validation
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      maVoucher,
      loai,
      giaTriGiam,
      dieuKienApDung,
      soLuong,
      trangThai,
      ngayBatDau,
      ngayHetHan,
      moTa
    } = req.body;

    // Find voucher
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy voucher' 
      });
    }

    // Check if new voucher code already exists (excluding current voucher)
    if (maVoucher && maVoucher !== voucher.maVoucher) {
      const existingVoucher = await Voucher.findOne({
        where: { 
          maVoucher,
          id_voucher: { [Op.ne]: id }
        }
      });
      if (existingVoucher) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher đã tồn tại'
        });
      }
    }

    // Validate enum loai
    const validLoai = ['fixed', 'percentage'];
    if (loai && !validLoai.includes(loai)) {
      return res.status(400).json({
        success: false,
        message: 'Loại voucher không hợp lệ'
      });
    }

    // Validate enum trangThai
    const validTrangThai = ['dang_hoat_dong', 'het_han'];
    if (trangThai && !validTrangThai.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái voucher không hợp lệ'
      });
    }

    // Validate số lượng
    if (soLuong !== undefined && (isNaN(soLuong) || soLuong < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải là số >= 0'
      });
    }

    // Validate giá trị giảm
    if (giaTriGiam !== undefined && (isNaN(giaTriGiam) || giaTriGiam <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị giảm phải là số > 0'
      });
    }

    // Validate ngày
    let startDate = voucher.ngayBatDau;
    let endDate = voucher.ngayHetHan;
    if (ngayBatDau) {
      startDate = new Date(ngayBatDau);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Ngày bắt đầu không hợp lệ'
        });
      }
    }
    if (ngayHetHan) {
      endDate = new Date(ngayHetHan);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Ngày kết thúc không hợp lệ'
        });
      }
    }
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Ngày bắt đầu phải trước ngày kết thúc'
      });
    }

    // Log giá trị moTa để debug
    console.log('Update voucher:', { moTa, body: req.body });

    // Update voucher bằng set + save để đảm bảo moTa luôn được cập nhật
    voucher.set({
      maVoucher: maVoucher || voucher.maVoucher,
      loai: loai || voucher.loai,
      giaTriGiam: giaTriGiam !== undefined ? giaTriGiam : voucher.giaTriGiam,
      dieuKienApDung: dieuKienApDung !== undefined ? dieuKienApDung : voucher.dieuKienApDung,
      soLuong: soLuong !== undefined ? soLuong : voucher.soLuong,
      trangThai: trangThai || voucher.trangThai,
      ngayBatDau: startDate,
      ngayHetHan: endDate,
      moTa: moTa !== undefined ? moTa : (voucher.moTa || "")
    });
    voucher.changed('moTa', true); // Ép Sequelize nhận thay đổi field moTa
    await voucher.save();

    res.json({
      success: true,
      data: voucher,
      message: 'Cập nhật voucher thành công'
    });
  } catch (error) {
    console.error('❌ Error updating voucher:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi cập nhật voucher', 
      error: error.message 
    });
  }
};

// Xóa voucher
exports.delete = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy voucher' 
      });
    }
    await voucher.destroy();
    res.json({ 
      success: true,
      message: 'Đã xóa voucher' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy danh sách voucher có sẵn
exports.getAvailable = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.findAll({
      where: {
        ngayBatDau: {
          [Op.lte]: now
        },
        ngayHetHan: {
          [Op.gte]: now
        }
      },
      order: [['giaTriGiam', 'DESC']]
    });
    
    res.json({
      success: true,
      data: vouchers,
      message: `Tìm thấy ${vouchers.length} voucher có sẵn`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Kiểm tra voucher có hợp lệ
exports.validate = async (req, res) => {
  try {
    const { code, orderTotal = 0 } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã voucher'
      });
    }

    const voucher = await Voucher.findOne({
      where: { maVoucher: code.toUpperCase() }
    });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã voucher không tồn tại'
      });
    }
    
    const now = new Date();
    
    // Kiểm tra thời gian hiệu lực
    if (voucher.ngayBatDau > now) {
      return res.status(400).json({
        success: false,
        message: 'Voucher chưa có hiệu lực'
      });
    }
    
    if (voucher.ngayHetHan < now) {
      return res.status(400).json({
        success: false,
        message: 'Voucher đã hết hạn'
      });
    }
    
    // Kiểm tra điều kiện áp dụng (nếu có)
    if (voucher.dieuKienApDung) {
      try {
        const conditions = JSON.parse(voucher.dieuKienApDung);
        if (conditions.minOrderTotal && orderTotal < conditions.minOrderTotal) {
          return res.status(400).json({
            success: false,
            message: `Đơn hàng tối thiểu ${conditions.minOrderTotal.toLocaleString('vi-VN')}đ để áp dụng voucher`
          });
        }
      } catch (e) {
        console.warn('Invalid voucher conditions format:', voucher.dieuKienApDung);
      }
    }
    
    res.json({
      success: true,
      data: {
        id_voucher: voucher.id_voucher,
        maVoucher: voucher.maVoucher,
        giaTriGiam: voucher.giaTriGiam,
        dieuKienApDung: voucher.dieuKienApDung,
        ngayBatDau: voucher.ngayBatDau,
        ngayHetHan: voucher.ngayHetHan
      },
      message: 'Voucher hợp lệ'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Áp dụng voucher và tính toán giảm giá
exports.apply = async (req, res) => {
  try {
    const { code, orderTotal, userId, productIds } = req.body;
    
    if (!code || !orderTotal) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin mã voucher hoặc tổng đơn hàng'
      });
    }

    // Validate voucher
    const voucher = await Voucher.findOne({
      where: { maVoucher: code.toUpperCase() }
    });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã voucher không tồn tại'
      });
    }
    
    const now = new Date();
    
    // Kiểm tra thời gian hiệu lực
    if (voucher.ngayBatDau > now || voucher.ngayHetHan < now) {
      return res.status(400).json({
        success: false,
        message: 'Voucher không còn hiệu lực'
      });
    }
    
    // Kiểm tra điều kiện áp dụng
    let minOrderTotal = 0;
    if (voucher.dieuKienApDung) {
      try {
        const conditions = JSON.parse(voucher.dieuKienApDung);
        minOrderTotal = conditions.minOrderTotal || 0;
      } catch (e) {
        console.warn('Invalid voucher conditions format:', voucher.dieuKienApDung);
      }
    }
    
    if (orderTotal < minOrderTotal) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${minOrderTotal.toLocaleString('vi-VN')}đ để áp dụng voucher`
      });
    }
    
    // Kiểm tra user đã dùng voucher này cho sản phẩm nào chưa
    if (userId && Array.isArray(productIds) && productIds.length > 0) {
      // Tìm các đơn hàng của user đã dùng voucher này
      const usedOrders = await Order.findAll({
        where: { id_NguoiDung: userId, id_voucher: voucher.id_voucher },
        attributes: ['id_DonHang']
      });
      if (usedOrders.length > 0) {
        const orderIds = usedOrders.map(o => o.id_DonHang);
        // Tìm các sản phẩm đã dùng voucher trong các đơn này
        const usedDetails = await OrderDetail.findAll({
          where: {
            id_DonHang: orderIds,
            id_SanPham: productIds
          }
        });
        if (usedDetails.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Bạn chỉ được áp dụng voucher này 1 lần cho mỗi sản phẩm.'
          });
        }
      }
    }
    
    // Tính toán giảm giá
    const discountAmount = Math.min(voucher.giaTriGiam, orderTotal);
    const finalTotal = Math.max(0, orderTotal - discountAmount);
    
    res.json({
      success: true,
      data: {
        voucher: {
          id_voucher: voucher.id_voucher,
          maVoucher: voucher.maVoucher,
          giaTriGiam: voucher.giaTriGiam
        },
        calculation: {
          originalTotal: orderTotal,
          discountAmount: discountAmount,
          finalTotal: finalTotal
        }
      },
      message: `Áp dụng voucher thành công, giảm ${discountAmount.toLocaleString('vi-VN')}đ`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// API cũ để tương thích
exports.validateVoucher = async (req, res) => {
  return exports.validate(req, res);
}; 