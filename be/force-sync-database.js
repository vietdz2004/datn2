const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });
const { sequelize } = require('./models/database');
const OrderDetail = require('./models/OrderDetail');
const Order = require('./models/Order');

async function forceSyncDatabase() {
  try {
    console.log('🔄 Force syncing database...');
    
  // Force sync để cập nhật schema
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synced');
    
    // Kiểm tra model OrderDetail
    console.log('📋 OrderDetail model fields:');
    const attributes = OrderDetail.getTableName();
    console.log('Table name:', attributes);
    
    // Kiểm tra cấu trúc bảng thực tế
  const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'chitietdonhang'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 Actual table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Kiểm tra cấu trúc bảng donhang để xác nhận cột trangThaiThanhToan
    const [orderColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'donhang'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('\n📊 Order table structure (donhang):');
    orderColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    const hasPaymentCol = orderColumns.some(c => c.COLUMN_NAME === 'trangThaiThanhToan');
    if (!hasPaymentCol) {
      console.warn('\n⚠️  Missing column trangThaiThanhToan on donhang. You may need to run a migration to add it.');
    } else {
      console.log('\n✅ Column trangThaiThanhToan exists on donhang.');
    }
    
    console.log('✅ Force sync completed');
    
  } catch (error) {
    console.error('❌ Error during force sync:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

forceSyncDatabase(); 