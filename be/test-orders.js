const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testOrders() {
  let connection;
  
  try {
    console.log('🔌 Testing orders data...');
    
    // Tạo connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hoanghe'
    });
    
    console.log('✅ Connected to database');
    
    // 1. Kiểm tra dữ liệu trong bảng donhang
    console.log('\n📋 Checking donhang table data...');
    const [orders] = await connection.execute(`
      SELECT 
        id_DonHang,
        id_NguoiDung,
        ngayDatHang,
        trangThaiDonHang,
        tongThanhToan
      FROM donhang 
      LIMIT 5
    `);
    
    console.log('📊 Orders found:', orders.length);
    orders.forEach(order => {
      console.log(`  - Order ${order.id_DonHang}: User ${order.id_NguoiDung}, Status: ${order.trangThaiDonHang}, Total: ${order.tongThanhToan}`);
    });
    
    // 2. Kiểm tra dữ liệu trong bảng chitietdonhang
    console.log('\n📋 Checking chitietdonhang table data...');
    const [details] = await connection.execute(`
      SELECT 
        od.id_ChiTietDH,
        od.id_DonHang,
        od.id_SanPham,
        od.soLuongMua,
        -- Compute safe unit price and subtotal without relying on non-existent columns
        COALESCE(od.donGia, od.giaMua) AS donGiaDuLieu,
        (od.soLuongMua * COALESCE(od.donGia, od.giaMua)) AS thanhTienTinh
      FROM chitietdonhang od
      LIMIT 5
    `);
    
    console.log('📊 Order details found:', details.length);
    details.forEach(detail => {
      console.log(`  - Detail ${detail.id_ChiTietDH}: Order ${detail.id_DonHang}, Product ${detail.id_SanPham}, Qty: ${detail.soLuongMua}`);
    });
    
    // 3. Kiểm tra dữ liệu trong bảng sanpham
    console.log('\n📋 Checking sanpham table data...');
    const [products] = await connection.execute(`
      SELECT 
        id_SanPham,
        tenSp,
        gia,
        hinhAnh
      FROM sanpham 
      LIMIT 5
    `);
    
    console.log('📊 Products found:', products.length);
    products.forEach(product => {
      console.log(`  - Product ${product.id_SanPham}: ${product.tenSp}, Price: ${product.gia}`);
    });
    
    // 4. Test query đơn hàng cho user 7
    console.log('\n🧪 Testing orders query for user 7...');
    try {
      const [userOrders] = await connection.execute(`
        SELECT 
          o.id_DonHang,
          o.id_NguoiDung,
          o.ngayDatHang,
          o.trangThaiDonHang,
          o.tongThanhToan,
          o.maDonHang,
          o.tenNguoiNhan,
          o.soDienThoai,
          o.diaChiGiaoHang
        FROM donhang o
        WHERE o.id_NguoiDung = ?
        ORDER BY o.ngayDatHang DESC
      `, [7]);
      
      console.log('📦 User 7 orders found:', userOrders.length);
      userOrders.forEach(order => {
        console.log(`  - Order ${order.id_DonHang}: ${order.maDonHang}, Status: ${order.trangThaiDonHang}, Total: ${order.tongThanhToan}`);
      });
      
      // 5. Test query chi tiết đơn hàng
      if (userOrders.length > 0) {
        const orderIds = userOrders.map(o => o.id_DonHang);
        console.log('\n🧪 Testing order details query...');
        
        const [orderDetails] = await connection.execute(`
          SELECT 
            od.id_ChiTietDH,
            od.id_DonHang,
            od.id_SanPham,
            od.soLuongMua,
            -- Compute prices without relying on od.thanhTien/donGiaLucMua columns
            COALESCE(od.donGia, od.giaMua, p.gia) AS donGiaHienTai,
            (od.soLuongMua * COALESCE(od.donGia, od.giaMua, p.gia)) AS thanhTienTinh,
            p.tenSp,
            p.hinhAnh,
            p.gia AS giaSanPham
          FROM chitietdonhang od
          LEFT JOIN sanpham p ON od.id_SanPham = p.id_SanPham
          WHERE od.id_DonHang IN (${orderIds.map(() => '?').join(',')})
          ORDER BY od.id_DonHang, od.id_ChiTietDH
        `, orderIds);
        
        console.log('📦 Order details found:', orderDetails.length);
        orderDetails.forEach(detail => {
          console.log(`  - Detail: Order ${detail.id_DonHang}, Product: ${detail.tenSp}, Qty: ${detail.soLuongMua}, Unit: ${detail.donGiaHienTai}, Subtotal: ${detail.thanhTienTinh}`);
        });
      }
      
    } catch (queryError) {
      console.error('❌ Query error:', queryError.message);
      console.error('❌ Error code:', queryError.code);
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

testOrders();
