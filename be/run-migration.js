const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

async function runMigration() {
  let connection;
  
  try {
  // Đọc file migration từ args hoặc mặc định
  const fileArg = process.argv[2] || 'add_trangThaiThanhToan_to_donhang.sql';
  const migrationPath = path.join(__dirname, 'migrations', fileArg);
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Kết nối database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hoanghe'
    });
    
    console.log('✅ Kết nối database thành công');
    
    // Chạy migration
    // Remove line comments starting with -- and split by semicolon
    const cleaned = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    const statements = cleaned.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      const sql = statement.trim();
      if (sql) {
        console.log('🔄 Đang thực thi:', sql.substring(0, 50) + '...');
        await connection.query(sql);
      }
    }
    
    console.log('✅ Migration hoàn thành thành công!');
    
    // Kiểm tra cấu trúc bảng sau migration
    const [rows] = await connection.execute('DESCRIBE danhgia');
    console.log('\n📋 Cấu trúc bảng danhgia sau migration:');
    rows.forEach(row => {
      console.log(`- ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi chạy migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
