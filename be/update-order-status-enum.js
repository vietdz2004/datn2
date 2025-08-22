const { sequelize } = require('./models/database');

async function updateOrderStatusToValidEnum() {
  try {
    console.log('🔧 Cập nhật trạng thái đơn hàng về enum hợp lệ...');

    // Kiểm tra trạng thái hiện tại
    console.log('\n📊 Trạng thái trước khi cập nhật:');
    const currentOrders = await sequelize.query(`
      SELECT trangThaiDonHang, COUNT(*) as count 
      FROM donhang 
      GROUP BY trangThaiDonHang 
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    currentOrders.forEach(row => {
      console.log(`Trạng thái: "${row.trangThaiDonHang}" - Số lượng: ${row.count}`);
    });

    // Cập nhật tất cả đơn hàng có trạng thái rỗng thành 'cho_xu_ly'
    console.log('\n🔄 Đang cập nhật...');
    const updateResult = await sequelize.query(`
      UPDATE donhang 
      SET trangThaiDonHang = 'cho_xu_ly' 
      WHERE trangThaiDonHang = '' OR trangThaiDonHang IS NULL
    `, { type: sequelize.QueryTypes.UPDATE });
    
    console.log('Số đơn hàng được cập nhật:', updateResult[1]);

    // Kiểm tra kết quả
    console.log('\n✅ Trạng thái sau khi cập nhật:');
    const updatedOrders = await sequelize.query(`
      SELECT trangThaiDonHang, COUNT(*) as count 
      FROM donhang 
      GROUP BY trangThaiDonHang 
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    updatedOrders.forEach(row => {
      console.log(`Trạng thái: "${row.trangThaiDonHang}" - Số lượng: ${row.count}`);
    });

    // Hiển thị một vài đơn hàng mẫu
    console.log('\n📋 Mẫu đơn hàng sau cập nhật:');
    const sampleOrders = await sequelize.query(`
      SELECT id_DonHang, maDonHang, trangThaiDonHang, trangThaiThanhToan 
      FROM donhang 
      ORDER BY ngayDatHang DESC 
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });
    
    sampleOrders.forEach(order => {
      console.log(`ID: ${order.id_DonHang} | Mã: ${order.maDonHang} | Trạng thái ĐH: "${order.trangThaiDonHang}" | Trạng thái TT: "${order.trangThaiThanhToan}"`);
    });

    console.log('\n🎉 Hoàn thành cập nhật trạng thái!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateOrderStatusToValidEnum();
