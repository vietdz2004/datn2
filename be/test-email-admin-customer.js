require('dotenv').config({ path: './config.env' });
const { sendCancelOrderNotificationEmail, sendFailedDeliveryEmail } = require('./services/emailService');

// ===== Test gửi email cho admin khi khách hủy đơn =====
async function testCancelOrderNotificationToAdmin() {
  const orderData = {
    maDonHang: 'TESTCANCEL123',
    id_DonHang: 8888,
    tongThanhToan: 456000,
    ngayDatHang: new Date(),
    tenKhachHang: 'Test Khach',
    soDienThoai: '0987654321',
    email: 'testkhach@gmail.com',
    phuongThucThanhToan: 'COD'
  };
  try {
    await sendCancelOrderNotificationEmail(orderData);
    console.log('✅ Đã gửi email thông báo cho admin khi khách hủy đơn');
  } catch (err) {
    console.error('❌ Lỗi gửi email cho admin:', err.message);
  }
}

// ===== Test gửi email cảnh báo cho khách và admin khi giao hàng thất bại =====
async function testFailedDeliveryEmailToCustomerAndAdmin() {
  const orderData = {
    maDonHang: 'TESTFAILED123',
    id_DonHang: 7777,
    tongThanhToan: 789000,
    ngayDatHang: new Date(),
    tenKhachHang: 'Test Khach',
    soDienThoai: '0987654321',
    email: 'vjetdz002@gmail.com',
    phuongThucThanhToan: 'COD'
  };
  const reason = 'Không liên lạc được với khách, giao hàng thất bại';
  try {
    await sendFailedDeliveryEmail('vjetdz002@gmail.com', orderData, reason, process.env.EMAIL_USER);
    console.log('✅ Đã gửi email cảnh báo cho khách và admin khi giao hàng thất bại');
  } catch (err) {
    console.error('❌ Lỗi gửi email cảnh báo:', err.message);
  }
}

// Chạy cả hai test
if (require.main === module) {
  (async () => {
    await testCancelOrderNotificationToAdmin();
    await testFailedDeliveryEmailToCustomerAndAdmin();
  })();
} 