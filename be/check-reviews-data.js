const { sequelize } = require('./models/database');

async function checkReviewsData() {
  try {
    console.log('🔍 Checking reviews data in database...');
    
    // Kiểm tra tất cả đánh giá
    const [allReviews] = await sequelize.query('SELECT * FROM danhgia LIMIT 10');
    console.log('\n📊 All reviews:', allReviews.length);
    console.table(allReviews);
    
    // Kiểm tra đánh giá cho sản phẩm 17
    const [product17Reviews] = await sequelize.query(`
      SELECT * FROM danhgia 
      WHERE id_SanPham = 17 
      AND trangThai = 'active'
    `);
    console.log('\n🎯 Reviews for product 17:', product17Reviews.length);
    console.table(product17Reviews);
    
    // Kiểm tra cấu trúc bảng danhgia
    const [tableStructure] = await sequelize.query('DESCRIBE danhgia');
    console.log('\n📋 Table structure:');
    console.table(tableStructure);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkReviewsData();
