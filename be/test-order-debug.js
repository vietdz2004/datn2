const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api';

// Test data để debug
const testOrderData = {
  hoTen: 'Nguyễn Văn Test',
  soDienThoai: '0123456789',
  email: 'test@example.com',
  diaChiGiao: '123 Đường Test, Quận Test, TP Test',
  ghiChu: 'Test order',
  phuongThucThanhToan: 'COD',
  sanPham: [
    {
      id_SanPham: 1,
      soLuong: 2,
      gia: 100000,
      giaTaiThoiDiem: 100000,
      tenSp: 'Hoa Test'
    }
  ],
  tongThanhToan: 200000,
  id_NguoiDung: null,
  maVoucher: null
};

async function testOrderCreation() {
  try {
    console.log('🧪 Testing order creation with data:');
    console.log(JSON.stringify(testOrderData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/orders`, testOrderData);
    
    console.log('✅ Order created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating order:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.sqlError) {
        console.error('🔍 SQL Error:', error.response.data.sqlError);
      }
      
      if (error.response.data.details) {
        console.error('📋 Error Details:', error.response.data.details);
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test với dữ liệu khác nhau
async function testMultipleScenarios() {
  console.log('\n=== TESTING MULTIPLE SCENARIOS ===\n');
  
  // Test 1: Dữ liệu cơ bản
  console.log('🧪 Test 1: Basic order data');
  await testOrderCreation();
  
  // Test 2: Với voucher
  console.log('\n🧪 Test 2: Order with voucher');
  const testOrderWithVoucher = {
    ...testOrderData,
    maVoucher: 'TEST123'
  };
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, testOrderWithVoucher);
    console.log('✅ Order with voucher created successfully!');
  } catch (error) {
    console.error('❌ Error with voucher:', error.response?.data?.message || error.message);
  }
  
  // Test 3: Dữ liệu sản phẩm khác
  console.log('\n🧪 Test 3: Different product data structure');
  const testOrderDifferentProduct = {
    ...testOrderData,
    sanPham: [
      {
        id_SanPham: 1,
        quantity: 3, // Sử dụng quantity thay vì soLuong
        gia: 150000,
        giaTaiThoiDiem: 150000,
        tenSp: 'Hoa Test 2'
      }
    ],
    tongThanhToan: 450000
  };
  
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, testOrderDifferentProduct);
    console.log('✅ Order with different product structure created successfully!');
  } catch (error) {
    console.error('❌ Error with different product structure:', error.response?.data?.message || error.message);
  }
}

// Chạy test
if (require.main === module) {
  testMultipleScenarios().catch(console.error);
}

module.exports = { testOrderCreation, testMultipleScenarios }; 