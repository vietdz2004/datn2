const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('hoanghe', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

const checkData = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT id_DonHang, trangThaiDonHang, trangThaiThanhToan, phuongThucThanhToan, lyDo
      FROM donhang 
      WHERE id_DonHang IN (2, 4, 5, 6)
      ORDER BY id_DonHang
    `);
    
    console.log('📋 Trạng thái các đơn hàng đã test:');
    results.forEach(order => {
      console.log(`ID: ${order.id_DonHang} | Trạng thái: ${order.trangThaiDonHang} | Thanh toán: ${order.trangThaiThanhToan} | PT: ${order.phuongThucThanhToan} ${order.lyDo ? '| Lý do: ' + order.lyDo : ''}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkData();
