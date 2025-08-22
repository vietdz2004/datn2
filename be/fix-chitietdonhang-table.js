const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function fixChitietdonhangTable() {
  let connection;
  
  try {
    console.log('🔧 Fixing chitietdonhang table...');
    
    // Tạo connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hoanghe'
    });
    
    console.log('✅ Connected to database');
    
    // Kiểm tra cấu trúc bảng hiện tại
    console.log('📋 Checking current table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'chitietdonhang'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 Current columns:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Kiểm tra xem cột soLuongMua đã tồn tại chưa
    const hasSoLuongMua = columns.some(col => col.COLUMN_NAME === 'soLuongMua');
    
    if (hasSoLuongMua) {
      console.log('✅ Cột soLuongMua đã tồn tại');
    } else {
      console.log('➕ Adding cột soLuongMua...');
      
      // Thêm cột soLuongMua
      await connection.execute(`
        ALTER TABLE chitietdonhang 
        ADD COLUMN soLuongMua INT DEFAULT NULL 
        AFTER id_DonHang
      `);
      
      console.log('✅ Cột soLuongMua đã được thêm');
      
      // Kiểm tra xem có cột soLuong cũ không để copy dữ liệu
      const hasSoLuong = columns.some(col => col.COLUMN_NAME === 'soLuong');
      
      if (hasSoLuong) {
        console.log('📋 Copying data from soLuong to soLuongMua...');
        
        // Copy dữ liệu từ soLuong sang soLuongMua
        const [result] = await connection.execute(`
          UPDATE chitietdonhang 
          SET soLuongMua = soLuong 
          WHERE soLuongMua IS NULL AND soLuong IS NOT NULL
        `);
        
        console.log(`✅ Copied ${result.affectedRows} rows from soLuong to soLuongMua`);
      }
      
      // Thêm comment cho cột
      await connection.execute(`
        ALTER TABLE chitietdonhang 
        MODIFY COLUMN soLuongMua INT DEFAULT NULL 
        COMMENT 'Số lượng mua của sản phẩm'
      `);
      
      console.log('✅ Added comment for soLuongMua column');
    }
    
    // Kiểm tra kết quả cuối cùng
    console.log('\n📋 Final table structure:');
    const [finalColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'chitietdonhang'
      ORDER BY ORDINAL_POSITION
    `);
    
    finalColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_COMMENT ? `(${col.COLUMN_COMMENT})` : ''}`);
    });
    
    console.log('\n✅ Table fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing table:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Database access denied. Please check your DB_PASSWORD in config.env');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

fixChitietdonhangTable(); 