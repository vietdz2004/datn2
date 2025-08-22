// Test hệ thống trạng thái đơn hàng mới
const { sequelize } = require('./models/database');
const { QueryTypes } = require('sequelize');

async function testNewOrderStatus() {
  try {
    console.log('🧪 Kiểm tra hệ thống trạng thái mới...\n');

    // 1. Kiểm tra đơn hàng có trạng thái mới
    const newStatusOrders = await sequelize.query(`
      SELECT 
        id_DonHang,
        maDonHang,
        trangThaiDonHang,
        trangThaiThanhToan,
        phuongThucThanhToan,
        tongThanhToan,
        ngayDatHang
      FROM donhang 
      WHERE trangThaiDonHang IN ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')
      LIMIT 5
    `, { type: QueryTypes.SELECT });

    console.log('📋 Đơn hàng với trạng thái mới:');
    newStatusOrders.forEach(order => {
      console.log(`   - #${order.id_DonHang}: ${order.trangThaiDonHang} | ${order.trangThaiThanhToan} | ${order.phuongThucThanhToan} | ${order.tongThanhToan?.toLocaleString()}đ`);
    });

    // 2. Kiểm tra thống kê trạng thái
    const statusStats = await sequelize.query(`
      SELECT 
        trangThaiDonHang,
        COUNT(*) as soLuong,
        SUM(tongThanhToan) as tongTien
      FROM donhang 
      GROUP BY trangThaiDonHang
      ORDER BY soLuong DESC
    `, { type: QueryTypes.SELECT });

    console.log('\n📊 Thống kê trạng thái:');
    statusStats.forEach(stat => {
      console.log(`   - ${stat.trangThaiDonHang}: ${stat.soLuong} đơn, ${(stat.tongTien || 0).toLocaleString()}đ`);
    });

    // 3. Kiểm tra trạng thái thanh toán
    const paymentStats = await sequelize.query(`
      SELECT 
        trangThaiThanhToan,
        COUNT(*) as soLuong
      FROM donhang 
      WHERE trangThaiThanhToan IS NOT NULL
      GROUP BY trangThaiThanhToan
      ORDER BY soLuong DESC
    `, { type: QueryTypes.SELECT });

    console.log('\n💰 Thống kê thanh toán:');
    paymentStats.forEach(stat => {
      console.log(`   - ${stat.trangThaiThanhToan}: ${stat.soLuong} đơn`);
    });

    // 4. Test logic flow trạng thái
    console.log('\n🔄 Test logic flow trạng thái:');
    const statusFlows = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipping', 'cancelled'],
      'shipping': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    Object.entries(statusFlows).forEach(([status, allowedNext]) => {
      console.log(`   - ${status} → [${allowedNext.join(', ')}]`);
    });

    console.log('\n✅ Kiểm tra hệ thống hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi kiểm tra:', error.message);
  }
}

// Chạy test
testNewOrderStatus()
  .then(() => {
    console.log('\n🎯 Test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
