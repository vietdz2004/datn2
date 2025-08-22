const axios = require('axios');

async function testOrderAPI() {
  try {
    console.log(' Testing order API...');
    
    const response = await axios.get('http://localhost:5002/api/orders/user/7');
    
    console.log('✅ API Response Status:', response.status);
    console.log('📦 Orders found:', response.data.length);
    
    response.data.forEach((order, index) => {
      console.log(`\n📋 Order ${index + 1}:`);
      console.log(`  - ID: ${order.id_DonHang}`);
      console.log(`  - MaDonHang: ${order.maDonHang}`);
      console.log(`  - Status: ${order.trangThaiDonHang}`);
      console.log(`  - Total: ${order.tongThanhToan}`);
      console.log(`  - Items: ${order.OrderDetails?.length || 0}`);
      
      if (order.OrderDetails && order.OrderDetails.length > 0) {
        order.OrderDetails.forEach((item, itemIndex) => {
          console.log(`    Item ${itemIndex + 1}:`);
          console.log(`      - Product: ${item.sanPham?.tenSp || item.tenSp}`);
          console.log(`      - Image: ${item.sanPham?.hinhAnh || item.hinhAnh}`);
          console.log(`      - Price: ${item.giaBan}`);
          console.log(`      - Qty: ${item.soLuong}`);
          console.log(`      - Subtotal: ${item.thanhTien}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
  }
}

testOrderAPI();
