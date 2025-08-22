const { sequelize } = require('./models/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structure...');
    
    // Kiểm tra cấu trúc bảng chitietdonhang
    const [results] = await sequelize.query('DESCRIBE chitietdonhang');
    console.log('\n📋 Table structure for chitietdonhang:');
    console.table(results);
    
    // Kiểm tra cấu trúc bảng donhang
    const [orderResults] = await sequelize.query('DESCRIBE donhang');
    console.log('\n📋 Table structure for donhang:');
    console.table(orderResults);
    
    // Kiểm tra dữ liệu mẫu
    const [sampleData] = await sequelize.query('SELECT * FROM chitietdonhang LIMIT 3');
    console.log('\n📊 Sample data from chitietdonhang:');
    console.table(sampleData);
    
    const [orderData] = await sequelize.query('SELECT * FROM donhang LIMIT 3');
    console.log('\n📊 Sample data from donhang:');
    console.table(orderData);
    
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
      AND (TABLE_NAME = 'chitietdonhang' OR TABLE_NAME = 'donhang')
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\n🔗 Foreign key relationships:');
    console.table(foreignKeys);
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    await sequelize.close();
  }
}

// Chạy kiểm tra
if (require.main === module) {
  checkTableStructure().catch(console.error);
}

module.exports = { checkTableStructure }; 