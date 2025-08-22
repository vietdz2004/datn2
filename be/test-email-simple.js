// Load environment variables
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
  
  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'admin@hoashop.com (default)');
  console.log('');

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
      'phamvanviet2004z@gmail.com', // Test với email thật
      testOrderData, 
      'Đơn hàng đã được xác nhận hủy theo yêu cầu của khách hàng'
    );
    console.log('Result:', approveResult.success ? '✅ Success' : '❌ Failed');
    console.log('Details:', approveResult.message || approveResult.messageId);
    console.log('');

    console.log('🎉 Email notification testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmailNotifications(); 