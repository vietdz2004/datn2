const axios = require('axios');

async function testOrderStepByStep() {
  try {
    console.log('🧪 Testing order creation step by step...');
    
    // Test 1: Kiểm tra server có chạy không
    console.log('\n📡 Test 1: Checking server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5002/api/health', { timeout: 5000 });
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running:', error.message);
      return;
    }
    
    // Test 2: Kiểm tra endpoint orders có hoạt động không
    console.log('\n📡 Test 2: Checking orders endpoint...');
    try {
      const ordersResponse = await axios.get('http://localhost:5002/api/orders', { timeout: 5000 });
      console.log('✅ Orders endpoint is accessible');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Orders endpoint is accessible (requires auth)');
      } else {
        console.log('❌ Orders endpoint error:', error.message);
        return;
      }
    }
    
    // Test 3: Test tạo đơn hàng với dữ liệu đơn giản
    console.log('\n📡 Test 3: Testing order creation...');
    
    const orderData = {
      hoTen: "Nguyễn Test",
      soDienThoai: "0336636315",
      email: "test@example.com",
      diaChiGiao: "123 Test Street, Ho Chi Minh City",
      ghiChu: "Test order",
      phuongThucThanhToan: "COD",
      sanPham: [
        {
          id_SanPham: 10,
          soLuongMua: 1,
          gia: 450000,
          giaTaiThoiDiem: 399000,
          tenSp: "Bó hoa hồng đỏ cao cấp"
        }
      ],
      tongThanhToan: 399000
    };

    console.log('📦 Sending order data:', JSON.stringify(orderData, null, 2));

    try {
      const response = await axios.post('http://localhost:5002/api/orders', orderData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Order creation successful!');
      console.log('Response:', response.data);
      
    } catch (error) {
      console.log('❌ Order creation failed');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response:', error.response.data);
        
        // Phân tích lỗi
        if (error.response.data.error) {
          const errorMsg = error.response.data.error;
          if (errorMsg.includes('soLuongMua')) {
            console.log('💡 Error related to soLuongMua field');
          } else if (errorMsg.includes('thanhTien')) {
            console.log('💡 Error related to thanhTien field');
          } else if (errorMsg.includes('donGiaLucMua')) {
            console.log('💡 Error related to donGiaLucMua field');
          }
        }
      } else {
        console.log('Network error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrderStepByStep(); 