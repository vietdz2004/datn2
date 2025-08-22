const { sequelize } = require('./models/database');

async function checkReviewTable() {
  try {
    console.log('🔍 Checking review table structure...');
    
    // Kiểm tra cấu trúc bảng danhgia
    const [results] = await sequelize.query('DESCRIBE danhgia');
    console.log('\n📋 Table structure for danhgia:');
    console.table(results);
    
    // Kiểm tra dữ liệu mẫu
    const [sampleData] = await sequelize.query('SELECT * FROM danhgia LIMIT 3');
    console.log('\n📊 Sample data from danhgia:');
    console.table(sampleData);
    
    // Kiểm tra foreign keys
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'hoanghe' 
      AND TABLE_NAME = 'danhgia'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\n🔗 Foreign key relationships:');
    console.table(foreignKeys);
    
    // Kiểm tra associations
    console.log('\n🔍 Checking associations...');
    const [associations] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'hoanghe' 
      AND TABLE_NAME = 'danhgia'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n📋 All columns in danhgia:');
    console.table(associations);
    
  } catch (error) {
    console.error('❌ Error checking review table structure:', error);
  } finally {
    await sequelize.close();
  }
}

// Chạy kiểm tra
if (require.main === module) {
  checkReviewTable().catch(console.error);
}

module.exports = { checkReviewTable };
