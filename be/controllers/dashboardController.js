// Import database connection và QueryTypes từ Sequelize
// Đường dẫn từ controllers/ đến models/ chỉ cần đi lên 1 cấp (../)
const { sequelize } = require('../models/database');
const { QueryTypes } = require('sequelize');

// Dashboard Overview - Thống kê tổng quan
exports.getOverview = async (req, res) => {
  try {
    const overviewQuery = `
      SELECT 
        -- Tổng sản phẩm
        (SELECT COUNT(*) FROM sanpham) as totalProducts,
        (SELECT COUNT(*) FROM sanpham WHERE trangThai = 'active') as activeProducts,
        (SELECT COUNT(*) FROM sanpham WHERE soLuongTon <= soLuongToiThieu) as lowStockProducts,
        
        -- Tổng đơn hàng
        (SELECT COUNT(*) FROM donhang) as totalOrders,
        (SELECT COUNT(*) FROM donhang WHERE DATE(ngayDatHang) = CURRENT_DATE) as todayOrders,
        (SELECT COUNT(*) FROM donhang WHERE trangThaiDonHang = 'da_xac_nhan') as confirmedOrders,
        
        -- Tổng người dùng
        (SELECT COUNT(*) FROM nguoidung) as totalUsers,
        (SELECT COUNT(*) FROM nguoidung WHERE DATE(ngayTao) = CURRENT_DATE) as newUsersToday,
        
        -- Doanh thu
        (SELECT COALESCE(SUM(tongThanhToan), 0) FROM donhang WHERE trangThaiDonHang = 'DA_GIAO') as totalRevenue,
        (SELECT COALESCE(SUM(tongThanhToan), 0) FROM donhang WHERE DATE(ngayDatHang) = CURRENT_DATE AND trangThaiDonHang = 'DA_GIAO') as todayRevenue,
        (SELECT COALESCE(SUM(tongThanhToan), 0) FROM donhang WHERE MONTH(ngayDatHang) = MONTH(CURRENT_DATE) AND YEAR(ngayDatHang) = YEAR(CURRENT_DATE) AND trangThaiDonHang = 'DA_GIAO') as monthRevenue
    `;

    const [overview] = await sequelize.query(overviewQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        products: {
          total: parseInt(overview.totalProducts),
          active: parseInt(overview.activeProducts),
          lowStock: parseInt(overview.lowStockProducts)
        },
        orders: {
          total: parseInt(overview.totalOrders),
          today: parseInt(overview.todayOrders),
          pending: parseInt(overview.pendingOrders)
        },
        users: {
          total: parseInt(overview.totalUsers),
          newToday: parseInt(overview.newUsersToday)
        },
        revenue: {
          total: parseFloat(overview.totalRevenue),
          today: parseFloat(overview.todayRevenue),
          month: parseFloat(overview.monthRevenue)
        }
      }
    });
  } catch (error) {
    console.error('Error in getOverview:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê tổng quan',
      error: error.message
    });
  }
};

// Recent Activities - Hoạt động gần đây (removed quick order references)
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const activitiesQuery = `
      (SELECT 
        'order' as type,
        id_DonHang as id,
        CONCAT('Đơn hàng #', id_DonHang, ' - ', FORMAT(tongThanhToan, 0), 'đ') as title,
        trangThaiDonHang as status,
        ngayDatHang as createdAt
      FROM donhang 
      ORDER BY ngayDatHang DESC 
      LIMIT ?)
      
      UNION ALL
      
      (SELECT 
        'user' as type,
        id_NguoiDung as id,
        CONCAT('Người dùng mới: ', ten) as title,
        trangThai as status,
        ngayTao as createdAt
      FROM nguoidung 
      ORDER BY ngayTao DESC 
      LIMIT ?)
      
      ORDER BY createdAt DESC
      LIMIT ?
    `;

    const activities = await sequelize.query(activitiesQuery, {
      replacements: [limit, limit, limit],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hoạt động gần đây',
      error: error.message
    });
  }
};

// Sales Statistics - Thống kê bán hàng 
exports.getSalesStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case '7d':
        dateCondition = 'AND ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'AND ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        break;
      case '90d':
        dateCondition = 'AND ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)';
        break;
      default:
        dateCondition = '';
    }

    const salesQuery = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_HUY' THEN 1 END) as cancelledOrders,
        COALESCE(SUM(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan END), 0) as totalRevenue,
        COALESCE(AVG(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan END), 0) as avgOrderValue,
        COUNT(DISTINCT id_NguoiDung) as uniqueCustomers
      FROM donhang 
      WHERE 1=1 ${dateCondition}
    `;

    const [salesStats] = await sequelize.query(salesQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        period,
        stats: {
          totalOrders: parseInt(salesStats.totalOrders),
          completedOrders: parseInt(salesStats.completedOrders),
          cancelledOrders: parseInt(salesStats.cancelledOrders),
          totalRevenue: parseFloat(salesStats.totalRevenue),
          avgOrderValue: parseFloat(salesStats.avgOrderValue),
          uniqueCustomers: parseInt(salesStats.uniqueCustomers)
        }
      }
    });
  } catch (error) {
    console.error('Error in getSalesStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê bán hàng',
      error: error.message
    });
  }
};

// Product Statistics - Thống kê sản phẩm
exports.getProductStats = async (req, res) => {
  try {
    const productStatsQuery = `
      SELECT 
        COUNT(*) as totalProducts,
        COUNT(CASE WHEN trangThai = 'active' THEN 1 END) as activeProducts,
        COUNT(CASE WHEN trangThai = 'hidden' THEN 1 END) as hiddenProducts,
        COUNT(CASE WHEN soLuongTon <= soLuongToiThieu THEN 1 END) as lowStockProducts,
        COUNT(CASE WHEN soLuongTon = 0 THEN 1 END) as outOfStockProducts,
        COUNT(CASE WHEN giaKhuyenMai IS NOT NULL AND giaKhuyenMai > 0 THEN 1 END) as discountedProducts,
        COALESCE(SUM(soLuongTon), 0) as totalStockValue,
        COALESCE(AVG(gia), 0) as avgPrice
      FROM sanpham
    `;

    const [productStats] = await sequelize.query(productStatsQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        total: parseInt(productStats.totalProducts),
        active: parseInt(productStats.activeProducts),
        hidden: parseInt(productStats.hiddenProducts),
        lowStock: parseInt(productStats.lowStockProducts),
        outOfStock: parseInt(productStats.outOfStockProducts),
        discounted: parseInt(productStats.discountedProducts),
        totalStockValue: parseInt(productStats.totalStockValue),
        avgPrice: parseFloat(productStats.avgPrice)
      }
    });
  } catch (error) {
    console.error('Error in getProductStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê sản phẩm',
      error: error.message
    });
  }
};

// Order Statistics - Thống kê đơn hàng
exports.getOrderStats = async (req, res) => {
  try {
    const orderStatsQuery = `
      SELECT 
        trangThaiDonHang as status,
        COUNT(*) as count,
        COALESCE(SUM(tongThanhToan), 0) as totalValue
      FROM donhang
      GROUP BY trangThaiDonHang
      ORDER BY count DESC
    `;

    const orderStats = await sequelize.query(orderStatsQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: orderStats.map(stat => ({
        status: stat.status,
        count: parseInt(stat.count),
        totalValue: parseFloat(stat.totalValue)
      }))
    });
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đơn hàng',
      error: error.message
    });
  }
};

// User Statistics - Thống kê người dùng
exports.getUserStats = async (req, res) => {
  try {
    const userStatsQuery = `
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN vaiTro = 'KHACH_HANG' THEN 1 END) as customers,
        COUNT(CASE WHEN vaiTro = 'NHAN_VIEN' THEN 1 END) as staff,
        COUNT(CASE WHEN trangThai = 'HOAT_DONG' THEN 1 END) as activeUsers,
        COUNT(CASE WHEN DATE(ngayTao) = CURRENT_DATE THEN 1 END) as newToday,
        COUNT(CASE WHEN ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) THEN 1 END) as newThisWeek,
        COUNT(CASE WHEN ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 END) as newThisMonth
      FROM nguoidung
    `;

    const [userStats] = await sequelize.query(userStatsQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        total: parseInt(userStats.totalUsers),
        customers: parseInt(userStats.customers),
        staff: parseInt(userStats.staff),
        active: parseInt(userStats.activeUsers),
        newToday: parseInt(userStats.newToday),
        newThisWeek: parseInt(userStats.newThisWeek),
        newThisMonth: parseInt(userStats.newThisMonth)
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê người dùng',
      error: error.message
    });
  }
};

// Revenue Chart Data - Dữ liệu biểu đồ doanh thu
exports.getRevenueChart = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    let groupBy = '';
    
    switch (period) {
      case '7d':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        groupBy = 'DATE(ngayDatHang)';
        break;
      case '30d':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        groupBy = 'DATE(ngayDatHang)';
        break;
      case '12m':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)';
        groupBy = 'DATE_FORMAT(ngayDatHang, "%Y-%m")';
        break;
      default:
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        groupBy = 'DATE(ngayDatHang)';
    }

    const revenueChartQuery = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as orderCount,
        COALESCE(SUM(CASE WHEN trangThaiDonHang = 'delivered' THEN tongThanhToan END), 0) as revenue,
        COUNT(CASE WHEN trangThaiDonHang = 'delivered' THEN 1 END) as completedOrders
      FROM donhang 
      ${dateCondition}
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `;

    const revenueChart = await sequelize.query(revenueChartQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        period,
        chart: revenueChart.map(item => ({
          period: item.period,
          orderCount: parseInt(item.orderCount),
          revenue: parseFloat(item.revenue),
          completedOrders: parseInt(item.completedOrders)
        }))
      }
    });
  } catch (error) {
    console.error('Error in getRevenueChart:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu biểu đồ doanh thu',
      error: error.message
    });
  }
};

// Top Products - Sản phẩm bán chạy
exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topProductsQuery = `
      SELECT 
        p.id_SanPham,
        p.tenSp,
        p.gia,
        p.giaKhuyenMai,
        p.hinhAnh,
        p.soLuongTon,
        COALESCE(SUM(od.soLuongMua), 0) as totalSold,
        COALESCE(SUM(od.soLuongMua * od.donGia), 0) as totalRevenue,
        COUNT(od.id_ChiTietDH) as orderCount
      FROM sanpham p
      LEFT JOIN chitietdonhang od ON p.id_SanPham = od.id_SanPham
      LEFT JOIN donhang o ON od.id_DonHang = o.id_DonHang AND o.trangThaiDonHang = 'delivered'
      WHERE p.trangThai = 'active'
      GROUP BY p.id_SanPham
      ORDER BY totalSold DESC, totalRevenue DESC
      LIMIT ?
    `;

    const topProducts = await sequelize.query(topProductsQuery, {
      replacements: [limit],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: topProducts.map(product => ({
        id: product.id_SanPham,
        name: product.tenSp,
        price: parseFloat(product.gia),
        salePrice: parseFloat(product.giaKhuyenMai || 0),
        image: product.hinhAnh,
        stock: parseInt(product.soLuongTon),
        totalSold: parseInt(product.totalSold),
        totalRevenue: parseFloat(product.totalRevenue),
        orderCount: parseInt(product.orderCount)
      }))
    });
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm bán chạy',
      error: error.message
    });
  }
};

// Low Stock Products - Sản phẩm sắp hết hàng
exports.getLowStockProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const lowStockQuery = `
      SELECT 
        p.id_SanPham,
        p.tenSp,
        p.gia,
        p.hinhAnh,
        p.soLuongTon,
        p.soLuongToiThieu,
        (p.soLuongToiThieu - p.soLuongTon) as deficit,
        ROUND((p.soLuongTon / p.soLuongToiThieu) * 100, 1) as stockPercent
      FROM sanpham p
      WHERE p.trangThai = 'active' 
        AND p.soLuongTon <= p.soLuongToiThieu
      ORDER BY stockPercent ASC, deficit DESC
      LIMIT ?
    `;

    const lowStockProducts = await sequelize.query(lowStockQuery, {
      replacements: [limit],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: lowStockProducts.map(product => ({
        id: product.id_SanPham,
        name: product.tenSp,
        price: parseFloat(product.gia),
        image: product.hinhAnh,
        currentStock: parseInt(product.soLuongTon),
        minStock: parseInt(product.soLuongToiThieu),
        deficit: parseInt(product.deficit),
        stockPercent: parseFloat(product.stockPercent)
      }))
    });
  } catch (error) {
    console.error('Error in getLowStockProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm sắp hết hàng',
      error: error.message
    });
  }
}; 