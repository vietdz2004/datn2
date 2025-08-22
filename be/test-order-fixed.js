const axios = require('axios');

async function testCreateOrder() {
  try {
    console.log('🧪 Testing order creation with improved validation...');
    
    // Test case 1: Valid order
    console.log('\n📦 Test Case 1: Valid order creation');
    const validOrderData = {
      hoTen: "Nguyễn Văn Test",
      soDienThoai: "0336636315",
      email: "test@example.com",
      diaChiGiao: "123 Test Street, Ho Chi Minh City",
      ghiChu: "Test order with improved validation",
      phuongThucThanhToan: "COD",
      sanPham: [
        {
          id_SanPham: 10,
          soLuong: 2,
          gia: 450000,
          giaTaiThoiDiem: 399000,
          tenSp: "Bó hoa hồng đỏ cao cấp"
        }
      ],
      tongThanhToan: 798000,
      phiVanChuyen: 30000
    };

    console.log('📤 Sending valid order data:', JSON.stringify(validOrderData, null, 2));

    const validResponse = await axios.post('http://localhost:5002/api/orders', validOrderData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Valid order response:', validResponse.data);
    
    if (validResponse.data.success) {
      console.log('🎉 Order created successfully with ID:', validResponse.data.data.id_DonHang);
    }

    // Test case 2: Invalid phone number
    console.log('\n📱 Test Case 2: Invalid phone number');
    const invalidPhoneOrder = {
      ...validOrderData,
      soDienThoai: "123" // Invalid phone
    };

    try {
      const invalidPhoneResponse = await axios.post('http://localhost:5002/api/orders', invalidPhoneOrder, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      console.log('❌ Should have failed but got:', invalidPhoneResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected invalid phone:', error.response?.data?.message);
    }

    // Test case 3: Invalid email
    console.log('\n📧 Test Case 3: Invalid email');
    const invalidEmailOrder = {
      ...validOrderData,
      email: "invalid-email"
    };

    try {
      const invalidEmailResponse = await axios.post('http://localhost:5002/api/orders', invalidEmailOrder, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      console.log('❌ Should have failed but got:', invalidEmailResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected invalid email:', error.response?.data?.message);
    }

    // Test case 4: Empty products
    console.log('\n🛒 Test Case 4: Empty products');
    const emptyProductsOrder = {
      ...validOrderData,
      sanPham: []
    };

    try {
      const emptyProductsResponse = await axios.post('http://localhost:5002/api/orders', emptyProductsOrder, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      console.log('❌ Should have failed but got:', emptyProductsResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected empty products:', error.response?.data?.message);
    }

    // Test case 5: Invalid product data
    console.log('\n🚫 Test Case 5: Invalid product data');
    const invalidProductOrder = {
      ...validOrderData,
      sanPham: [
        {
          id_SanPham: 10,
          soLuong: -1, // Invalid quantity
          gia: 450000,
          giaTaiThoiDiem: 399000,
          tenSp: "Bó hoa hồng đỏ cao cấp"
        }
      ]
    };

    try {
      const invalidProductResponse = await axios.post('http://localhost:5002/api/orders', invalidProductOrder, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      console.log('❌ Should have failed but got:', invalidProductResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected invalid product data:', error.response?.data?.message);
    }

    console.log('\n🎯 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response details:', error.response.data);
    }
  }
}

// Run the test
testCreateOrder(); 