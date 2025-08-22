const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testDbConnection() {
  let connection;
  
  try {
    console.log('🔌 Testing database connection...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'hoanghe');
    console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
    
    // Tạo connection
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
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'chitietdonhang'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 Table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Test INSERT đơn giản
    console.log('\n🧪 Testing simple INSERT...');
    const testData = {
      id_SanPham: 999,
      id_DonHang: 999,
      soLuongMua: 1,
      giaMua: 100000.00,
      donGia: 100000.00
    };
    
    console.log('Test data:', testData);
    
    const [result] = await connection.execute(`
      INSERT INTO chitietdonhang (id_SanPham, id_DonHang, soLuongMua, giaMua, donGia)
      VALUES (?, ?, ?, ?, ?)
    `, [testData.id_SanPham, testData.id_DonHang, testData.soLuongMua, testData.giaMua, testData.donGia]);
    
    console.log('✅ INSERT successful, ID:', result.insertId);
    
    // Xóa test data
    await connection.execute('DELETE FROM chitietdonhang WHERE id_ChiTietDH = ?', [result.insertId]);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Database access denied. Please check your credentials.');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('💡 Table does not exist.');
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      console.error('💡 Field does not exist in table.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testDbConnection(); 