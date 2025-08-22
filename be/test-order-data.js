const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testOrderData() {
  let connection;
  
  try {
    console.log(' Testing order data...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hoanghe'
    });
    
    console.log('✅ Connected to database');
    
    // Kiểm tra cấu trúc bảng chitietdonhang
    console.log('\n📋 Checking chitietdonhang table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE chitietdonhang
    `);
    
    console.log('📊 chitietdonhang columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Kiểm tra dữ liệu đơn hàng của user 7
    console.log('\n📋 Checking orders for user 7...');
    const [userOrders] = await connection.execute(`
      SELECT 
        id_DonHang,
        id_NguoiDung,
        ngayDatHang,
        trangThaiDonHang,
        tongThanhToan,
        maDonHang,
        tenNguoiNhan,
        soDienThoai,
        diaChiGiaoHang
      FROM donhang 
      WHERE id_NguoiDung = 7
      ORDER BY ngayDatHang DESC
    `);
    
    console.log('📊 User 7 orders found:', userOrders.length);
    userOrders.forEach(order => {
      console.log(`  - Order ${order.id_DonHang}: ${order.maDonHang}, Status: ${order.trangThaiDonHang}, Total: ${order.tongThanhToan}`);
    });
    
    // Kiểm tra chi tiết đơn hàng (sử dụng cấu trúc thực tế)
    if (userOrders.length > 0) {
      const orderIds = userOrders.map(o => o.id_DonHang);
      console.log('\n📋 Checking order details...');
      
      // Sử dụng cấu trúc bảng thực tế
      const [orderDetails] = await connection.execute(`
        SELECT 
          od.id_ChiTietDH,
          od.id_DonHang,
          od.id_SanPham,
          od.soLuongMua,
          od.thanhTien,
          p.tenSp,
          p.gia as giaHienTai
        FROM chitietdonhang od
        LEFT JOIN sanpham p ON od.id_SanPham = p.id_SanPham
        WHERE od.id_DonHang IN (${orderIds.map(() => '?').join(',')})
        ORDER BY od.id_DonHang, od.id_ChiTietDH
      `, orderIds);
      
      console.log('📊 Order details found:', orderDetails.length);
      orderDetails.forEach(detail => {
        const calculatedTotal = detail.soLuongMua * detail.giaHienTai;
        console.log(`  - Detail: Order ${detail.id_DonHang}, Product: ${detail.tenSp}, Qty: ${detail.soLuongMua}, Current Price: ${detail.giaHienTai}, DB Total: ${detail.thanhTien}, Calculated: ${calculatedTotal}`);
      });
      
      // Tính toán tổng tiền cho từng đơn hàng
      console.log('\n Calculating totals...');
      userOrders.forEach(order => {
        const orderItems = orderDetails.filter(d => d.id_DonHang === order.id_DonHang);
        const calculatedTotal = orderItems.reduce((total, item) => {
          return total + (Number(item.thanhTien) || 0);
        }, 0);
        
        console.log(`  - Order ${order.id_DonHang}: DB Total=${order.tongThanhToan}, Calculated=${calculatedTotal}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Error code:', error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testOrderData(); 