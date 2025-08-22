-- Migration: Chuẩn hóa trạng thái đơn hàng và thanh toán
-- File: be/migrations/standardize_order_status.sql

-- 1. Cập nhật trạng thái đơn hàng (orderStatus)
UPDATE donhang SET trangThaiDonHang = 'pending' WHERE trangThaiDonHang IN ('cho_xu_ly', 'CHO_XAC_NHAN');
UPDATE donhang SET trangThaiDonHang = 'confirmed' WHERE trangThaiDonHang IN ('da_xac_nhan', 'DA_XAC_NHAN', 'dang_chuan_bi');
UPDATE donhang SET trangThaiDonHang = 'shipping' WHERE trangThaiDonHang IN ('dang_giao', 'DANG_GIAO');
UPDATE donhang SET trangThaiDonHang = 'delivered' WHERE trangThaiDonHang IN ('da_giao', 'DA_GIAO', 'hoan_tat');
UPDATE donhang SET trangThaiDonHang = 'cancelled' WHERE trangThaiDonHang IN ('huy_boi_khach', 'huy_boi_admin', 'DA_HUY', 'khach_bom_hang', 'KHACH_YEU_CAU_HUY');

-- 2. Cập nhật trạng thái thanh toán (paymentStatus)
UPDATE donhang SET trangThaiThanhToan = 'unpaid' WHERE trangThaiThanhToan = 'CHUA_THANH_TOAN';
UPDATE donhang SET trangThaiThanhToan = 'pending' WHERE trangThaiThanhToan = 'CHO_THANH_TOAN';
UPDATE donhang SET trangThaiThanhToan = 'paid' WHERE trangThaiThanhToan = 'DA_THANH_TOAN';
UPDATE donhang SET trangThaiThanhToan = 'failed' WHERE trangThaiThanhToan = 'THAT_BAI';
UPDATE donhang SET trangThaiThanhToan = 'refunded' WHERE trangThaiThanhToan = 'HOAN_TIEN';

-- 3. Cập nhật logic COD: delivered orders should be paid
UPDATE donhang 
SET trangThaiThanhToan = 'paid' 
WHERE phuongThucThanhToan IN ('COD', 'TIEN_MAT') 
  AND trangThaiDonHang = 'delivered' 
  AND trangThaiThanhToan = 'unpaid';

SELECT 'Migration completed successfully!' as status;
