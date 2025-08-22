const { sequelize } = require('./models/database');

async function findCODOrders() {
  try {
    const codOrders = await sequelize.query(`
      SELECT id_DonHang, trangThaiDonHang, phuongThucThanhToan, trangThaiThanhToan
      FROM donhang 
      WHERE phuongThucThanhToan = 'COD' AND trangThaiDonHang = 'cho_xu_ly' 
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Đơn COD chờ xử lý:');
    codOrders.forEach(order => {
      console.log(`ID: ${order.id_DonHang} | Trạng thái: ${order.trangThaiDonHang} | PT: ${order.phuongThucThanhToan} | TT: ${order.trangThaiThanhToan}`);
    });

    if (codOrders.length > 0) {
      console.log(`\n🔄 Test với đơn hàng ID: ${codOrders[0].id_DonHang}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

findCODOrders();
