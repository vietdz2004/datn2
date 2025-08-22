const axios = require('axios');

async function testPaymentFlow() {
  try {
    console.log('🧪 Testing complete payment flow...');

    // Test 1: Kiểm tra server có chạy không
    console.log('\n📡 Test 1: Checking server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5002/api/health', { timeout: 5000 });
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running:', error.message);
      return;
    }

    // Test 2: Tạo đơn hàng test
    console.log('\n📦 Test 2: Creating test order...');
    try {
      const orderData = {
        hoTen: "Nguyễn Test Thanh Toán",
        soDienThoai: "0336636315",
        email: "test-payment@example.com",
        diaChiGiao: "123 Test Street, Ho Chi Minh City",
        ghiChu: "Test payment order",
        phuongThucThanhToan: "VNPay",
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

      console.log('📦 Order data:', JSON.stringify(orderData, null, 2));

      const orderResponse = await axios.post('http://localhost:5002/api/orders', orderData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (orderResponse.data?.success && orderResponse.data?.data?.id_DonHang) {
        const orderId = orderResponse.data.data.id_DonHang;
        console.log('✅ Order created successfully with ID:', orderId);
        
        // Test 3: Test VNPay payment
        console.log('\n🏦 Test 3: Testing VNPay payment...');
        await testVNPayPayment(orderId, 399000);
        
        // Test 4: Test ZaloPay payment
        console.log('\n🟡 Test 4: Testing ZaloPay payment...');
        await testZaloPayPayment(orderId, 399000);
        
      } else {
        console.log('❌ Failed to create order:', orderResponse.data);
      }

    } catch (error) {
      console.log('❌ Order creation failed');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response:', error.response.data);
      } else {
        console.log('Network error:', error.message);
      }
    }

    console.log('\n✅ Payment flow testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testVNPayPayment(orderId, amount) {
  try {
    const vnpayData = {
      amount: amount,
      orderId: orderId,
      orderDesc: `Thanh toán đơn hàng #${orderId} - HoaShop`
    };

    console.log('📦 VNPay request data:', vnpayData);

    const vnpayResponse = await axios.post('http://localhost:5002/api/payment/create_payment_url', vnpayData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ VNPay response:', vnpayResponse.data);
    
    if (vnpayResponse.data.success && vnpayResponse.data.paymentUrl) {
      console.log('🚀 VNPay payment URL generated successfully');
      console.log('💡 Payment URL:', vnpayResponse.data.paymentUrl);
    } else {
      console.log('❌ VNPay failed to generate payment URL');
    }

  } catch (error) {
    console.log('❌ VNPay test failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('Network error:', error.message);
    }
  }
}

async function testZaloPayPayment(orderId, amount) {
  try {
    const zalopayData = {
      amount: amount,
      orderId: orderId,
      orderDesc: `Thanh toán đơn hàng #${orderId} - HoaShop`
    };

    console.log('📦 ZaloPay request data:', zalopayData);

    const zalopayResponse = await axios.post('http://localhost:5002/api/payment/create_zalopay_order', zalopayData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ ZaloPay response:', zalopayResponse.data);
    
    if (zalopayResponse.data.success && zalopayResponse.data.order_url) {
      console.log('🚀 ZaloPay payment URL generated successfully');
      console.log('💡 Payment URL:', zalopayResponse.data.order_url);
    } else {
      console.log('❌ ZaloPay failed to generate payment URL');
    }

  } catch (error) {
    console.log('❌ ZaloPay test failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('Network error:', error.message);
    }
  }
}

testPaymentFlow(); 