require('dotenv').config({ path: './config.env' });
const { sequelize } = require('./models/database');

const updateShippingInfo = async () => {
  try {
    console.log('🔍 Updating shipping info for existing orders...');
    
    // Lấy thông tin user cho các đơn hàng
    const ordersWithUserInfo = await sequelize.query(
      `SELECT 
        o.id_DonHang,
        o.id_NguoiDung,
        o.maDonHang,
        o.tenNguoiNhan,
        o.soDienThoai,
        o.diaChiGiaoHang,
        o.ghiChu,
        u.ten as userName,
        u.email as userEmail,
        u.soDienThoai as userPhone
      FROM donhang o
      JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      WHERE o.tenNguoiNhan IS NULL 
        OR o.tenNguoiNhan = 'null'
        OR o.soDienThoai IS NULL 
        OR o.soDienThoai = 'null'
      LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${ordersWithUserInfo.length} orders to update:`);
    
    for (const order of ordersWithUserInfo) {
      console.log(`\n📦 Updating order ${order.id_DonHang}:`);
      console.log(`  Current: tenNguoiNhan="${order.tenNguoiNhan}", soDienThoai="${order.soDienThoai}"`);
      console.log(`  User info: ${order.userName} (${order.userEmail}), phone: ${order.userPhone}`);
      
      // Cập nhật thông tin giao hàng từ thông tin user
      const updateResult = await sequelize.query(
        `UPDATE donhang 
         SET 
           tenNguoiNhan = ?,
           soDienThoai = ?,
           diaChiGiaoHang = ?,
           ghiChu = ?
         WHERE id_DonHang = ?`,
        {
          replacements: [
            order.userName,
            order.userPhone,
            'Địa chỉ giao hàng sẽ được cập nhật sau',
            'Thông tin giao hàng được cập nhật từ thông tin tài khoản',
            order.id_DonHang
          ],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log(`  ✅ Updated order ${order.id_DonHang}`);
    }
    
    // Kiểm tra kết quả
    console.log('\n📋 Checking updated orders...');
    const updatedOrders = await sequelize.query(
      `SELECT 
        id_DonHang,
        maDonHang,
        tenNguoiNhan,
        soDienThoai,
        diaChiGiaoHang,
        ghiChu
      FROM donhang 
      WHERE tenNguoiNhan IS NOT NULL 
        AND tenNguoiNhan != 'null'
        AND soDienThoai IS NOT NULL 
        AND soDienThoai != 'null'
      LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n✅ Found ${updatedOrders.length} orders with shipping info:`);
    updatedOrders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  ID: ${order.id_DonHang}`);
      console.log(`  Mã: ${order.maDonHang}`);
      console.log(`  Người nhận: "${order.tenNguoiNhan}"`);
      console.log(`  SĐT: "${order.soDienThoai}"`);
      console.log(`  Địa chỉ: "${order.diaChiGiaoHang}"`);
      console.log(`  Ghi chú: "${order.ghiChu}"`);
    });
    
  } catch (error) {
    console.error('❌ Error updating shipping info:', error);
  } finally {
    await sequelize.close();
  }
};

updateShippingInfo();
