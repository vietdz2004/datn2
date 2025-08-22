const axios = require('axios');

async function testPaymentEndpoints() {
  try {
    console.log('🧪 Testing payment endpoints...');

    // Test 1: Kiểm tra server có chạy không
    console.log('\n📡 Test 1: Checking server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5002/api/health', { timeout: 5000 });
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running:', error.message);
      return;
    }

    // Test 2: Test VNPay endpoint
    console.log('\n🏦 Test 2: Testing VNPay payment creation...');
    try {
      const vnpayData = {
        amount: 100000,
        orderId: 999,
        orderDesc: 'Test VNPay payment'
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

    // Test 3: Test ZaloPay endpoint (sửa endpoint)
    console.log('\n🟡 Test 3: Testing ZaloPay payment creation...');
    try {
      const zalopayData = {
        amount: 100000,
        orderId: 999,
        orderDesc: 'Test ZaloPay payment'
      };

      console.log('📦 ZaloPay request data:', zalopayData);

      // Sửa endpoint từ /zalopay/create thành /create_zalopay_order
      const zalopayResponse = await axios.post('http://localhost:5002/api/payment/create_zalopay_order', zalopayData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ ZaloPay response:', zalopayResponse.data);
      
      if (zalopayResponse.data.success && zalopayResponse.data.order_url) {
        console.log('🚀 ZaloPay payment URL generated successfully');
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

    // Test 4: Test endpoint không tồn tại (để xác nhận lỗi)
    console.log('\n❌ Test 4: Testing non-existent endpoint...');
    try {
      const wrongResponse = await axios.post('http://localhost:5002/api/payment/zalopay/create', {
        amount: 100000,
        orderId: 999,
        orderDesc: 'Test wrong endpoint'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('⚠️ Unexpected success for wrong endpoint:', wrongResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Correctly got 404 for wrong endpoint');
      } else {
        console.log('❌ Unexpected error for wrong endpoint:', error.message);
      }
    }

    console.log('\n✅ Payment endpoint testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPaymentEndpoints(); 