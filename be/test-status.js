const { sequelize } = require('./models/database');

async function testStatusUpdate() {
  try {
    console.log('🧪 Test cập nhật trạng thái đơn hàng...\n');

    // Kiểm tra thống kê trạng thái
    const stats = await sequelize.query(`
      SELECT trangThaiDonHang, COUNT(*) as count 
      FROM donhang 
      GROUP BY trangThaiDonHang 
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📊 Thống kê trạng thái đơn hàng:');
    stats.forEach(stat => {
      console.log(`${stat.trangThaiDonHang}: ${stat.count} đơn`);
    });

    // Tìm đơn hàng cho test
    const choXuLy = await sequelize.query(`
      SELECT id_DonHang, trangThaiDonHang, trangThaiThanhToan, phuongThucThanhToan
      FROM donhang 
      WHERE trangThaiDonHang = 'cho_xu_ly' 
      LIMIT 3
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n📋 Đơn hàng chờ xử lý:');
    choXuLy.forEach(order => {
      console.log(`ID: ${order.id_DonHang} | Trạng thái: ${order.trangThaiDonHang} | Thanh toán: ${order.trangThaiThanhToan} | PT: ${order.phuongThucThanhToan}`);
    });

    if (choXuLy.length > 0) {
      const testOrder = choXuLy[0];
      console.log(`\n🔄 Sẽ test cập nhật đơn hàng ID: ${testOrder.id_DonHang}`);
      console.log(`Trạng thái hiện tại: ${testOrder.trangThaiDonHang}`);
      console.log('Có thể chuyển sang: da_xac_nhan, confirmed, huy_boi_admin, cancelled');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

testStatusUpdate();
