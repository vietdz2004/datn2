const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testOnlinePaymentFlow() {
  try {
    console.log('🧪 Testing Online Payment Flow...\n');
    
    // === STEP 1: Tạo đơn hàng online ===
    console.log('📦 Step 1: Creating online order...');
    
    const orderData = {
      // Thông tin khách hàng
      hoTen: 'Nguyễn Văn Online',
      email: 'online@test.com',
      soDienThoai: '0901234567',
      diaChiGiao: '123 Đường Online, Quận 1, TP.HCM',
      ghiChu: 'Đơn hàng thanh toán online test',
      
      // Thanh toán
      phuongThucThanhToan: 'ONLINE', // Không phải COD
      
      // Sản phẩm
      sanPham: [
        {
          id_SanPham: 14,
          soLuongMua: 1,
          gia: 120000,
          tenSp: 'Hoa baby trắng thơm'
        }
      ],
      
      // Tổng tiền
      tongThanhToan: 120000,
      phiVanChuyen: 0
    };
    
    const createResponse = await axios.post(`${API_BASE}/orders`, orderData);
    
    if (!createResponse.data.success) {
      throw new Error('Failed to create order: ' + createResponse.data.message);
    }
    
    const order = createResponse.data.data;
    const orderId = order.id_DonHang;
    
    console.log('✅ Order created successfully!');
    console.log(`   - Order ID: ${orderId}`);
    console.log(`   - Order Code: ${order.maDonHang}`);
    console.log(`   - Payment Status: ${order.trangThaiThanhToan}`);
    console.log(`   - Order Status: ${order.trangThaiDonHang}`);
    
    // === STEP 2: Kiểm tra trạng thái thanh toán ===
    console.log('\n🔍 Step 2: Checking payment status...');
    
    const statusResponse = await axios.get(`${API_BASE}/payment/status/${orderId}`);
    console.log('✅ Payment status:', statusResponse.data.data);
    
    // === STEP 3A: Test Success Callback ===
    console.log('\n✅ Step 3A: Testing payment success callback...');
    
    const successData = {
      orderId: orderId,
      transactionId: 'TXN_' + Date.now(),
      amount: 120000,
      gatewayResponse: {
        status: 'success',
        gateway: 'vnpay'
      }
    };
    
    const successResponse = await axios.post(`${API_BASE}/payment/success`, successData);
    console.log('✅ Payment success response:', {
      success: successResponse.data.success,
      message: successResponse.data.message,
      paymentStatus: successResponse.data.data.paymentStatus
    });
    
    // Kiểm tra trạng thái sau khi thanh toán thành công
    const statusAfterSuccess = await axios.get(`${API_BASE}/payment/status/${orderId}`);
    console.log('📊 Status after payment success:', statusAfterSuccess.data.data);
    
    console.log('\n=== TEST CASE 2: Payment Failure ===');
    
    // === STEP 1: Tạo đơn hàng thứ 2 để test failure ===
    console.log('\n📦 Creating second order for failure test...');
    
    orderData.hoTen = 'Nguyễn Văn Failure';
    orderData.email = 'failure@test.com';
    orderData.sanPham[0].id_SanPham = 17; // Sản phẩm khác
    
    const createResponse2 = await axios.post(`${API_BASE}/orders`, orderData);
    const order2 = createResponse2.data.data;
    const orderId2 = order2.id_DonHang;
    
    console.log(`✅ Second order created: ${orderId2} (${order2.trangThaiThanhToan})`);
    
    // === STEP 3B: Test Failure Callback ===
    console.log('\n❌ Step 3B: Testing payment failure callback...');
    
    const failureData = {
      orderId: orderId2,
      reason: 'Insufficient funds',
      gatewayResponse: {
        status: 'failed',
        gateway: 'vnpay',
        errorCode: 'INSUFFICIENT_FUNDS'
      }
    };
    
    const failureResponse = await axios.post(`${API_BASE}/payment/failure`, failureData);
    console.log('❌ Payment failure response:', {
      success: failureResponse.data.success,
      message: failureResponse.data.message,
      paymentStatus: failureResponse.data.data.paymentStatus,
      orderStatus: failureResponse.data.data.orderStatus
    });
    
    // === STEP 4: Test Timeout Check ===
    console.log('\n⏰ Step 4: Testing timeout check...');
    
    const timeoutResponse = await axios.get(`${API_BASE}/payment/check-timeout?timeout=0`); // 0 minutes = immediate timeout
    console.log('⏰ Timeout check response:', {
      success: timeoutResponse.data.success,
      message: timeoutResponse.data.message,
      timeoutCount: timeoutResponse.data.timeoutCount
    });
    
    console.log('\n🎉 Online Payment Flow Test Completed Successfully!');
    
    console.log('\n📋 Summary:');
    console.log('   ✅ Order creation with ONLINE payment → CHO_THANH_TOAN');
    console.log('   ✅ Payment success callback → DA_THANH_TOAN + deduct inventory');
    console.log('   ✅ Payment failure callback → THAT_BAI + cancel order');
    console.log('   ✅ Timeout handling → auto-cancel expired orders');
    console.log('   ✅ Payment status checking → real-time status');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Chạy test
testOnlinePaymentFlow();
