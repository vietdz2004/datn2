// Test tự động API voucher (chạy: node test-voucher-api.js)
const axios = require('axios');
const API_URL = 'http://localhost:3000/admin/vouchers'; // Sửa lại nếu port khác


async function runTests() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24*60*60*1000);
  const yesterday = new Date(today.getTime() - 24*60*60*1000);
  const format = d => d.toISOString().slice(0,10);

  // Helper
  async function createVoucher(data, expectSuccess = true, note = '') {
    try {
      const res = await axios.post(API_URL, data);
      if (expectSuccess) {
        console.log(`✅ [PASS] ${note}`);
        return res.data.data;
      } else {
        console.log(`❌ [FAIL] ${note} (expected error, got success)`);
      }
    } catch (err) {
      if (!expectSuccess) {
        console.log(`✅ [PASS] ${note} (error: ${err.response?.data?.message || err.message})`);
      } else {
        console.log(`❌ [FAIL] ${note} (error: ${err.response?.data?.message || err.message})`);
      }
    }
    return null;
  }

  // 1. Thêm voucher loại fixed
  const v1 = await createVoucher({
    maVoucher: 'TEST_FIXED',
    loaiVoucher: 'fixed',
    giaTriGiam: 50000,
    dieuKienApDung: '',
    soLuong: 10,
    trangThai: 'active',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Test fixed voucher'
  }, true, 'Thêm voucher fixed');

  // 2. Thêm voucher loại percentage
  const v2 = await createVoucher({
    maVoucher: 'TEST_PERCENT',
    loaiVoucher: 'percentage',
    giaTriGiam: 20,
    dieuKienApDung: '',
    soLuong: 5,
    trangThai: 'active',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Test percent voucher'
  }, true, 'Thêm voucher percentage');

  // 3. Thêm voucher trạng thái inactive
  await createVoucher({
    maVoucher: 'TEST_INACTIVE',
    loaiVoucher: 'fixed',
    giaTriGiam: 10000,
    dieuKienApDung: '',
    soLuong: 2,
    trangThai: 'inactive',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Inactive voucher'
  }, true, 'Thêm voucher trạng thái inactive');

  // 4. Thêm voucher trạng thái expired
  await createVoucher({
    maVoucher: 'TEST_EXPIRED',
    loaiVoucher: 'fixed',
    giaTriGiam: 10000,
    dieuKienApDung: '',
    soLuong: 2,
    trangThai: 'expired',
    ngayBatDau: format(yesterday),
    ngayHetHan: format(today),
    moTa: 'Expired voucher'
  }, true, 'Thêm voucher trạng thái expired');

  // 5. Ngày bắt đầu > ngày kết thúc (phải báo lỗi)
  await createVoucher({
    maVoucher: 'TEST_DATE_ERR',
    loaiVoucher: 'fixed',
    giaTriGiam: 10000,
    dieuKienApDung: '',
    soLuong: 2,
    trangThai: 'active',
    ngayBatDau: format(tomorrow),
    ngayHetHan: format(today),
    moTa: 'Date error'
  }, false, 'Thêm voucher với ngày bắt đầu > ngày kết thúc');

  // 6. Số lượng < 1 (phải báo lỗi)
  await createVoucher({
    maVoucher: 'TEST_SOLUONG_ERR',
    loaiVoucher: 'fixed',
    giaTriGiam: 10000,
    dieuKienApDung: '',
    soLuong: 0,
    trangThai: 'active',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Số lượng lỗi'
  }, false, 'Thêm voucher với số lượng < 1');

  // 7. Mã đã tồn tại (phải báo lỗi trùng mã)
  await createVoucher({
    maVoucher: 'TEST_FIXED',
    loaiVoucher: 'fixed',
    giaTriGiam: 10000,
    dieuKienApDung: '',
    soLuong: 1,
    trangThai: 'active',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Duplicate code'
  }, false, 'Thêm voucher với mã đã tồn tại');

  // 8. Giá trị giảm > 100% (phải báo lỗi nếu là percentage)
  await createVoucher({
    maVoucher: 'TEST_PERCENT_ERR',
    loaiVoucher: 'percentage',
    giaTriGiam: 150,
    dieuKienApDung: '',
    soLuong: 1,
    trangThai: 'active',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Percent > 100%'
  }, false, 'Thêm voucher với giá trị giảm > 100% (percentage)');

  // 9. Lỗi enum: loại voucher không hợp lệ
  await createVoucher({
    maVoucher: 'TEST_ENUM_ERR',
    loaiVoucher: 'abc',
    giaTriGiam: 10000,
    dieuKienApDung: '',
    soLuong: 1,
    trangThai: 'active',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Enum error'
  }, false, 'Thêm voucher với loại voucher không hợp lệ');

  // 10. Lỗi enum: trạng thái không hợp lệ
  await createVoucher({
    maVoucher: 'TEST_ENUM_ERR2',
    loaiVoucher: 'fixed',
    giaTriGiam: 10000,
    dieuKienApDung: '',
    soLuong: 1,
    trangThai: 'abc',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Enum error 2'
  }, false, 'Thêm voucher với trạng thái không hợp lệ');

  // 11. Lỗi số: giá trị giảm <= 0
  await createVoucher({
    maVoucher: 'TEST_GIATRI_ERR',
    loaiVoucher: 'fixed',
    giaTriGiam: 0,
    dieuKienApDung: '',
    soLuong: 1,
    trangThai: 'active',
    ngayBatDau: format(today),
    ngayHetHan: format(tomorrow),
    moTa: 'Giá trị giảm lỗi'
  }, false, 'Thêm voucher với giá trị giảm <= 0');

  console.log('🎯 Đã chạy xong các test case thêm voucher. Hãy kiểm tra lại danh sách voucher trên giao diện để xác nhận hiển thị!');
}

runTests(); 