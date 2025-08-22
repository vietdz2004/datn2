const express = require('express');
const router = express.Router();
const { sequelize } = require('../models/database');
const { QueryTypes } = require('sequelize');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('Dashboard stats called');

    // Execute all queries in parallel for better performance
    const [
      productsCount,
      ordersCount,
      quickOrdersCount,
      usersCount,
      todayOrders,
      revenueResult
    ] = await Promise.all([
      // Products count
      sequelize.query('SELECT COUNT(*) as count FROM sanpham', { type: QueryTypes.SELECT }),
      
      // Orders count  
      sequelize.query('SELECT COUNT(*) as count FROM donhang', { type: QueryTypes.SELECT }),
      
      // Quick orders count (temporarily disabled)
      Promise.resolve([{ count: 0 }]),
      
      // Users count (customers only)
      sequelize.query("SELECT COUNT(*) as count FROM nguoidung WHERE vaiTro = 'KHACH_HANG' OR vaiTro IS NULL", { type: QueryTypes.SELECT }),
      
      // Today's orders
      sequelize.query('SELECT COUNT(*) as count FROM donhang WHERE DATE(ngayDatHang) = CURDATE()', { type: QueryTypes.SELECT }),
      
      // Total revenue
      sequelize.query('SELECT COALESCE(SUM(tongThanhToan), 0) as revenue FROM donhang WHERE trangThaiDonHang IN ("DA_GIAO", "HOAN_THANH")', { type: QueryTypes.SELECT })
    ]);

    const stats = {
      totalProducts: productsCount[0]?.count || 0,
      totalOrders: ordersCount[0]?.count || 0,
      totalQuickOrders: quickOrdersCount[0]?.count || 0,
      totalCustomers: usersCount[0]?.count || 0,
      todayOrders: todayOrders[0]?.count || 0,
      totalRevenue: parseFloat(revenueResult[0]?.revenue || 0),
      
      // Additional calculated stats
      avgOrderValue: ordersCount[0]?.count > 0 
        ? parseFloat(revenueResult[0]?.revenue || 0) / ordersCount[0].count 
        : 0,
        
      growthRate: 15.5, // Mock data - would calculate from historical data
      conversionRate: 3.2 // Mock data
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error in dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê dashboard',
      error: error.message
    });
  }
});

// Get recent orders
router.get('/recent-orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const query = `
      SELECT 
        dh.*,
        nd.ten as tenKhachHang,
        nd.soDienThoai
      FROM donhang dh
      LEFT JOIN nguoidung nd ON dh.id_NguoiDung = nd.id_NguoiDung
      ORDER BY dh.ngayDatHang DESC
      LIMIT ?
    `;
    
    const orders = await sequelize.query(query, {
      replacements: [limit],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: orders,
      message: 'Recent orders retrieved successfully'
    });

  } catch (error) {
    console.error('Error in recent orders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đơn hàng gần đây',
      error: error.message
    });
  }
});

// Get recent quick orders
router.get('/recent-quick-orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Temporarily return empty array for quick orders
    const query = `SELECT 1 as dummy LIMIT 0`;
    
    const quickOrders = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: quickOrders,
      message: 'Recent quick orders retrieved successfully'
    });

  } catch (error) {
    console.error('Error in recent quick orders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đơn đặt nhanh gần đây',
      error: error.message
    });
  }
});

// Get new customers
router.get('/new-customers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const query = `
      SELECT 
        id_NguoiDung,
        ten,
        email,
        soDienThoai,
        ngayTao
      FROM nguoidung 
      WHERE vaiTro = 'KHACH_HANG' OR vaiTro IS NULL
      ORDER BY ngayTao DESC
      LIMIT ?
    `;
    
    const customers = await sequelize.query(query, {
      replacements: [limit],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: customers,
      message: 'New customers retrieved successfully'
    });

  } catch (error) {
    console.error('Error in new customers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy khách hàng mới',
      error: error.message
    });
  }
});

// Get revenue report
router.get('/revenue', async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let dateFormat, dateGroupBy;
    switch (period) {
      case 'monthly':
        dateFormat = '%Y-%m';
        dateGroupBy = 'YEAR(ngayDatHang), MONTH(ngayDatHang)';
        break;
      case 'yearly':
        dateFormat = '%Y';
        dateGroupBy = 'YEAR(ngayDatHang)';
        break;
      default: // daily
        dateFormat = '%Y-%m-%d';
        dateGroupBy = 'DATE(ngayDatHang)';
    }
    
    let whereClause = '';
    let replacements = [];
    
    if (startDate && endDate) {
      whereClause = 'WHERE DATE(ngayDatHang) BETWEEN ? AND ?';
      replacements = [startDate, endDate];
    }
    
    const query = `
      SELECT 
        DATE_FORMAT(ngayDatHang, '${dateFormat}') as period,
        COUNT(*) as orderCount,
        SUM(tongThanhToan) as revenue
      FROM donhang 
      ${whereClause}
      GROUP BY ${dateGroupBy}
      ORDER BY period DESC
      LIMIT 30
    `;
    
    const revenueData = await sequelize.query(query, {
      replacements: replacements,
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: revenueData,
      message: 'Revenue report retrieved successfully'
    });

  } catch (error) {
    console.error('Error in revenue report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy báo cáo doanh thu',
      error: error.message
    });
  }
});

// Get top products
router.get('/top-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Mock query since we don't have order details table setup properly
    const query = `
      SELECT 
        sp.id_SanPham,
        sp.tenSp,
        sp.gia,
        sp.giaKhuyenMai,
        sp.hinhAnh,
        dm.tenDanhMuc,
        dmct.tenDanhMucChiTiet,
        RAND() * 100 as salesCount
      FROM sanpham sp
      LEFT JOIN danhmucchitiet dmct ON sp.id_DanhMucChiTiet = dmct.id_DanhMucChiTiet
      LEFT JOIN danhmuc dm ON dmct.id_DanhMuc = dm.id_DanhMuc
      ORDER BY salesCount DESC
      LIMIT ?
    `;
    
    const topProducts = await sequelize.query(query, {
      replacements: [limit],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: topProducts,
      message: 'Top products retrieved successfully'
    });

  } catch (error) {
    console.error('Error in top products:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sản phẩm bán chạy',
      error: error.message
    });
  }
});

module.exports = router; 