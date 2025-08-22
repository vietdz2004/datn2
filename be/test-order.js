const axios = require('axios');

async function testCreateOrder() {
  try {
    console.log('🧪 Testing order creation...');
    
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

    const response = await axios.post('http://localhost:5002/api/orders', orderData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Order creation response:', response.data);
    
    if (response.data.success && response.data.data?.id_DonHang) {
      console.log('✅ Order created successfully with ID:', response.data.data.id_DonHang);
      
      // Test VNPay payment URL creation
      console.log('\n💳 Testing VNPay payment URL creation...');
      
      const vnpayData = {
        amount: 399000,
        orderId: response.data.data.id_DonHang,
        orderDesc: `Thanh toán đơn hàng #${response.data.data.id_DonHang} - HoaShop`
      };
      
      console.log('💳 VNPay data:', vnpayData);
      
      const vnpayResponse = await axios.post('http://localhost:5002/api/payment/create_payment_url', vnpayData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ VNPay response:', vnpayResponse.data);
      
      if (vnpayResponse.data.success && vnpayResponse.data.paymentUrl) {
        console.log('✅ VNPay payment URL created successfully');
        console.log('🔗 Payment URL:', vnpayResponse.data.paymentUrl);
      } else {
        console.log('❌ VNPay payment URL creation failed');
      }
    } else {
      console.log('❌ Order creation failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
  }
}

testCreateOrder(); 