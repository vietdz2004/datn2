require('dotenv').config({ path: './config.env' });
const { sequelize } = require('./models/database');

const testShippingData = async () => {
  try {
    console.log('🔍 Testing shipping data in database...');
    
    // Test 1: Kiểm tra cấu trúc bảng donhang
    console.log('\n📋 Checking donhang table structure...');
    const tableStructure = await sequelize.query(
      `DESCRIBE donhang`,
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('Table structure:', tableStructure.map(col => `${col.Field}: ${col.Type}`));
    
    // Test 2: Kiểm tra dữ liệu mẫu
    console.log('\n📦 Checking sample order data...');
    const sampleOrders = await sequelize.query(
      `SELECT 
        id_DonHang,
        maDonHang,
        tenNguoiNhan,
        soDienThoai,
        diaChiGiaoHang,
        ghiChu,
        trangThaiDonHang,
        ngayDatHang
      FROM donhang 
      LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Sample orders:');
    sampleOrders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  ID: ${order.id_DonHang}`);
      console.log(`  Mã: ${order.maDonHang}`);
      console.log(`  Người nhận: "${order.tenNguoiNhan}"`);
      console.log(`  SĐT: "${order.soDienThoai}"`);
      console.log(`  Địa chỉ: "${order.diaChiGiaoHang}"`);
      console.log(`  Ghi chú: "${order.ghiChu}"`);
      console.log(`  Trạng thái: ${order.trangThaiDonHang}`);
      console.log(`  Ngày đặt: ${order.ngayDatHang}`);
    });
    
    // Test 3: Kiểm tra đơn hàng có thông tin giao hàng
    console.log('\n📦 Checking orders with shipping info...');
    const ordersWithShipping = await sequelize.query(
      `SELECT 
        id_DonHang,
        maDonHang,
        tenNguoiNhan,
        soDienThoai,
        diaChiGiaoHang,
        ghiChu
      FROM donhang 
      WHERE tenNguoiNhan IS NOT NULL 
        AND tenNguoiNhan != ''
        AND soDienThoai IS NOT NULL 
        AND soDienThoai != ''
        AND diaChiGiaoHang IS NOT NULL 
        AND diaChiGiaoHang != ''
      LIMIT 3`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${ordersWithShipping.length} orders with complete shipping info:`);
    ordersWithShipping.forEach((order, index) => {
      console.log(`\nComplete Order ${index + 1}:`);
      console.log(`  ID: ${order.id_DonHang}`);
      console.log(`  Mã: ${order.maDonHang}`);
      console.log(`  Người nhận: "${order.tenNguoiNhan}"`);
      console.log(`  SĐT: "${order.soDienThoai}"`);
      console.log(`  Địa chỉ: "${order.diaChiGiaoHang}"`);
      console.log(`  Ghi chú: "${order.ghiChu}"`);
    });
    
    // Test 4: Kiểm tra đơn hàng của user cụ thể
    console.log('\n👤 Checking orders for specific user...');
    const userOrders = await sequelize.query(
      `SELECT 
        o.id_DonHang,
        o.maDonHang,
        o.tenNguoiNhan,
        o.soDienThoai,
        o.diaChiGiaoHang,
        o.ghiChu,
        u.ten as userName,
        u.email
      FROM donhang o
      JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      LIMIT 3`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${userOrders.length} user orders:`);
    userOrders.forEach((order, index) => {
      console.log(`\nUser Order ${index + 1}:`);
      console.log(`  User: ${order.userName} (${order.email})`);
      console.log(`  Order ID: ${order.id_DonHang}`);
      console.log(`  Order Code: ${order.maDonHang}`);
      console.log(`  Người nhận: "${order.tenNguoiNhan}"`);
      console.log(`  SĐT: "${order.soDienThoai}"`);
      console.log(`  Địa chỉ: "${order.diaChiGiaoHang}"`);
      console.log(`  Ghi chú: "${order.ghiChu}"`);
    });
    
  } catch (error) {
    console.error('❌ Error testing shipping data:', error);
  } finally {
    await sequelize.close();
  }
};

testShippingData();
