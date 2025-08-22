const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('hoanghe', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

const checkData = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT id_DonHang, trangThaiDonHang, trangThaiThanhToan, phuongThucThanhToan
      FROM donhang 
      WHERE id_DonHang = 7
    `);
    
    console.log('📋 Đơn hàng ID 7 sau khi test new status system:');
    results.forEach(order => {
      console.log(`ID: ${order.id_DonHang} | Trạng thái DB: ${order.trangThaiDonHang} | Thanh toán: ${order.trangThaiThanhToan} | PT: ${order.phuongThucThanhToan}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkData();
