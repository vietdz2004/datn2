const { sequelize } = require('./models/database');
const { QueryTypes } = require('sequelize');

async function testProductData() {
  try {
    console.log('🔍 Testing product data...');
    
    // Test sản phẩm ID 17
    const product = await sequelize.query(
      `SELECT * FROM sanpham WHERE id_SanPham = ?`,
      { replacements: [17], type: QueryTypes.SELECT }
    );
    
    if (product.length > 0) {
      console.log('📦 Product 17 found:', {
        id: product[0].id_SanPham,
        name: product[0].tenSp,
        image: product[0].hinhAnh,
        price: product[0].gia,
        salePrice: product[0].giaKhuyenMai
      });
      
      // Test image file exists
      const fs = require('fs');
      const path = require('path');
      
      if (product[0].hinhAnh) {
        const imagePath = path.join(__dirname, 'public', 'images', 'products', product[0].hinhAnh.replace(/^\/images\/products\//, ''));
        const exists = fs.existsSync(imagePath);
        console.log(`🖼️ Image ${product[0].hinhAnh} exists: ${exists}`);
        
        if (exists) {
          const stats = fs.statSync(imagePath);
          console.log(`📏 Image size: ${stats.size} bytes`);
        }
      } else {
        console.log('❌ No image found for product 17');
      }
    } else {
      console.log('❌ Product 17 not found');
    }
    
    // Lấy vài sản phẩm có hình ảnh
    const productsWithImages = await sequelize.query(
      `SELECT id_SanPham, tenSp, hinhAnh FROM sanpham WHERE hinhAnh IS NOT NULL AND hinhAnh != '' LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('\n📸 Products with images:');
    productsWithImages.forEach(p => {
      console.log(`  - ID ${p.id_SanPham}: ${p.tenSp} -> ${p.hinhAnh}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testProductData(); 