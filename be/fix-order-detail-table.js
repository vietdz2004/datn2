const { sequelize } = require('./models/database');

async function fixOrderDetailTable() {
  try {
    console.log('🔧 Fixing order detail table...');
    
    // Kiểm tra xem bảng có tồn tại không
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'hoanghe' AND TABLE_NAME = 'chitietdonhang'
    `);
    
    if (tables.length === 0) {
      console.log('❌ Table chitietdonhang does not exist. Creating...');
      
      // Tạo bảng chitietdonhang
      await sequelize.query(`
        CREATE TABLE chitietdonhang (
          id_ChiTietDH int(11) NOT NULL AUTO_INCREMENT,
          id_SanPham int(11) DEFAULT NULL,
          id_DonHang int(11) DEFAULT NULL,
          soLuongMua int(11) DEFAULT NULL,
          thanhTien decimal(10,2) DEFAULT NULL,
          donGiaLucMua decimal(10,2) DEFAULT NULL,
          PRIMARY KEY (id_ChiTietDH),
          KEY id_SanPham (id_SanPham),
          KEY id_DonHang (id_DonHang)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      
      console.log('✅ Table chitietdonhang created successfully');
    } else {
      console.log('✅ Table chitietdonhang exists');
      
      // Kiểm tra cấu trúc bảng
      const [columns] = await sequelize.query('DESCRIBE chitietdonhang');
      console.log('\n📋 Current table structure:');
      console.table(columns);
      
      // Kiểm tra xem có cột soLuongMua không
      const hasSoLuongMua = columns.some(col => col.Field === 'soLuongMua');
      
      if (!hasSoLuongMua) {
        console.log('❌ Column soLuongMua missing. Adding...');
        
        // Thêm cột soLuongMua
        await sequelize.query(`
          ALTER TABLE chitietdonhang 
          ADD COLUMN soLuongMua int(11) DEFAULT NULL AFTER id_DonHang
        `);
        
        console.log('✅ Column soLuongMua added successfully');
      } else {
        console.log('✅ Column soLuongMua exists');
      }
      
      // Kiểm tra các cột khác
      const requiredColumns = ['id_ChiTietDH', 'id_SanPham', 'id_DonHang', 'soLuongMua', 'thanhTien', 'donGiaLucMua'];
      const existingColumns = columns.map(col => col.Field);
      
      for (const col of requiredColumns) {
        if (!existingColumns.includes(col)) {
          console.log(`❌ Column ${col} missing. Adding...`);
          
          let columnDefinition = '';
          switch (col) {
            case 'id_ChiTietDH':
              columnDefinition = 'ADD COLUMN id_ChiTietDH int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST';
              break;
            case 'id_SanPham':
              columnDefinition = 'ADD COLUMN id_SanPham int(11) DEFAULT NULL AFTER id_ChiTietDH';
              break;
            case 'id_DonHang':
              columnDefinition = 'ADD COLUMN id_DonHang int(11) DEFAULT NULL AFTER id_SanPham';
              break;
            case 'soLuongMua':
              columnDefinition = 'ADD COLUMN soLuongMua int(11) DEFAULT NULL AFTER id_DonHang';
              break;
            case 'thanhTien':
              columnDefinition = 'ADD COLUMN thanhTien decimal(10,2) DEFAULT NULL AFTER soLuongMua';
              break;
            case 'donGiaLucMua':
              columnDefinition = 'ADD COLUMN donGiaLucMua decimal(10,2) DEFAULT NULL AFTER thanhTien';
              break;
          }
          
          if (columnDefinition) {
            await sequelize.query(`ALTER TABLE chitietdonhang ${columnDefinition}`);
            console.log(`✅ Column ${col} added successfully`);
          }
        }
      }
    }
    
    // Kiểm tra bảng donhang
    const [orderTables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'hoanghe' AND TABLE_NAME = 'donhang'
    `);
    
    if (orderTables.length === 0) {
      console.log('❌ Table donhang does not exist. Creating...');
      
      // Tạo bảng donhang
      await sequelize.query(`
        CREATE TABLE donhang (
          id_DonHang int(11) NOT NULL AUTO_INCREMENT,
          id_NguoiDung int(11) DEFAULT NULL,
          id_voucher int(11) DEFAULT NULL,
          ngayDatHang datetime DEFAULT CURRENT_TIMESTAMP,
          phuongThucThanhToan varchar(100) DEFAULT NULL,
          soLuong int(11) DEFAULT NULL,
          tongThanhToan decimal(10,2) DEFAULT NULL,
          phiVanChuyen decimal(10,2) DEFAULT NULL,
          trangThaiDonHang varchar(100) DEFAULT NULL,
          PRIMARY KEY (id_DonHang),
          KEY id_NguoiDung (id_NguoiDung),
          KEY id_voucher (id_voucher)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      
      console.log('✅ Table donhang created successfully');
    } else {
      console.log('✅ Table donhang exists');
    }
    
    console.log('\n🎉 Table structure fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing table structure:', error);
  } finally {
    await sequelize.close();
  }
}

// Chạy fix
if (require.main === module) {
  fixOrderDetailTable().catch(console.error);
}

module.exports = { fixOrderDetailTable }; 