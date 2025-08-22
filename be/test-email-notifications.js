require('dotenv').config({ path: './config.env' });
const { 
  sendCancelOrderNotificationEmail, 
  sendApprovedCancellationEmail, 
  sendRejectedCancellationEmail 
} = require('./services/emailService');

// Test data
const testOrderData = {
  id_DonHang: 123,
  maDonHang: 'DH123456789',
  tongThanhToan: 150000,
  ngayDatHang: new Date(),
  tenKhachHang: 'Nguyễn Văn A',
  email: 'customer@example.com',
  soDienThoai: '0123456789',
  phuongThucThanhToan: 'CHUYEN_KHOAN'
};

async function testEmailNotifications() {
  console.log('🧪 Testing Email Notification System...\n');

  try {
    // Test 1: Admin notification when customer requests cancellation
    console.log('1️⃣ Testing Admin Notification (Customer Cancellation Request)...');
    const adminResult = await sendCancelOrderNotificationEmail(testOrderData);
    console.log('Result:', adminResult.success ? '✅ Success' : '❌ Failed');
    console.log('Details:', adminResult.message || adminResult.messageId);
    console.log('');

    // Test 2: Customer notification when admin approves cancellation
    console.log('2️⃣ Testing Customer Notification (Admin Approves Cancellation)...');
    const approveResult = await sendApprovedCancellationEmail(
      testOrderData.email, 
      testOrderData, 
      'Đơn hàng đã được xác nhận hủy theo yêu cầu của khách hàng'
    );
    console.log('Result:', approveResult.success ? '✅ Success' : '❌ Failed');
    console.log('Details:', approveResult.message || approveResult.messageId);
    console.log('');

    // Test 3: Customer notification when admin rejects cancellation
    console.log('3️⃣ Testing Customer Notification (Admin Rejects Cancellation)...');
    const rejectResult = await sendRejectedCancellationEmail(
      testOrderData.email, 
      testOrderData, 
      'Đơn hàng đang trong quá trình chuẩn bị giao, không thể hủy được'
    );
    console.log('Result:', rejectResult.success ? '✅ Success' : '❌ Failed');
    console.log('Details:', rejectResult.message || rejectResult.messageId);
    console.log('');

    console.log('🎉 Email notification testing completed!');
    console.log('📧 Check your email inbox for test emails.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  console.log('📧 Email Notification Test for HoaShop Order Cancellation System\n');
  testEmailNotifications();
}

// ===== TEST GỬI EMAIL HỦY ĐƠN ĐẾN EMAIL THẬT =====
if (require.main === module) {
  (async () => {
    const sendAdminCancelledOrderEmail = require('./services/emailService').sendAdminCancelledOrderEmail;
    const orderData = {
      maDonHang: 'TEST123456',
      id_DonHang: 9999,
      tongThanhToan: 123000,
      ngayDatHang: new Date(),
      tenKhachHang: 'Test User',
      soDienThoai: '0123456789',
      email: 'vjetdz002@gmail.com',
      phuongThucThanhToan: 'TIEN_MAT'
    };
    const reason = 'Đây là email test gửi từ hệ thống HoaShop (admin hủy đơn)';
    try {
      await sendAdminCancelledOrderEmail('vjetdz002@gmail.com', orderData, reason);
      console.log('✅ Đã gửi email hủy đơn về vjetdz002@gmail.com');
    } catch (err) {
      console.error('❌ Lỗi gửi email:', err.message);
    }
  })();
}

module.exports = { testEmailNotifications }; 