const { sequelize } = require('./models/database');

async function fixOrderStatus() {
  try {
    console.log('🔧 Đang sửa trạng thái đơn hàng...');

    // Kiểm tra cấu trúc bảng
    console.log('\n📋 Kiểm tra cấu trúc bảng donhang:');
    const structure = await sequelize.query('DESCRIBE donhang', { type: sequelize.QueryTypes.SELECT });
    const statusField = structure.find(field => field.Field === 'trangThaiDonHang');
    console.log('Cột trangThaiDonHang:', statusField);

    // Kiểm tra giá trị NULL/empty
    console.log('\n📊 Kiểm tra giá trị NULL/empty:');
    const stats = await sequelize.query(`
      SELECT 
        COUNT(*) as total, 
        COUNT(trangThaiDonHang) as non_null,
        SUM(CASE WHEN trangThaiDonHang = '' THEN 1 ELSE 0 END) as empty_string,
        SUM(CASE WHEN trangThaiDonHang IS NULL THEN 1 ELSE 0 END) as null_values
      FROM donhang
    `, { type: sequelize.QueryTypes.SELECT });
    console.log(stats[0]);

    // Cập nhật trạng thái mặc định
    console.log('\n🔧 Cập nhật trạng thái mặc định:');
    const updateResult = await sequelize.query(`
      UPDATE donhang 
      SET trangThaiDonHang = 'pending' 
      WHERE trangThaiDonHang IS NULL OR trangThaiDonHang = ''
    `, { type: sequelize.QueryTypes.UPDATE });
    console.log('Số đơn hàng được cập nhật:', updateResult[1]);

    // Kiểm tra kết quả
    console.log('\n✅ Kiểm tra lại sau khi cập nhật:');
    const orders = await sequelize.query(`
      SELECT id_DonHang, maDonHang, trangThaiDonHang, trangThaiThanhToan 
      FROM donhang 
      ORDER BY ngayDatHang DESC 
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    orders.forEach(order => {
      console.log(`ID: ${order.id_DonHang} | Mã: ${order.maDonHang} | Trạng thái ĐH: [${order.trangThaiDonHang}] | Trạng thái TT: [${order.trangThaiThanhToan}]`);
    });

    console.log('\n🎉 Hoàn thành!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

fixOrderStatus();
