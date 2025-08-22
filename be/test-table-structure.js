const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testTableStructure() {
  let connection;
  
  try {
    console.log('🔌 Testing table structure...');
    
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
    
    // Kiểm tra cấu trúc bảng donhang
    console.log('\n📋 Checking donhang table structure...');
    const [orderColumns] = await connection.execute(`
      DESCRIBE donhang
    `);
    
    console.log('📊 donhang columns:');
    orderColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Test query đơn giản
    console.log('\n🧪 Testing simple query...');
    const [testData] = await connection.execute(`
      SELECT COUNT(*) as count FROM chitietdonhang
    `);
    
    console.log('📊 Total order details:', testData[0].count);
    
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

testTableStructure();
