-- Migration: Cập nhật trạng thái đơn hàng từ cũ sang mới
-- File: update_order_statuses.sql

-- Cập nhật trạng thái đơn hàng từ hệ thống cũ sang hệ thống mới
-- CHO_XAC_NHAN -> pending_confirmation
-- DA_XAC_NHAN -> processing (hoặc có thể là processing tùy context)
-- DANG_GIAO -> processing
-- DA_GIAO -> delivered
-- DA_HUY -> cancelled_by_customer (hoặc cancelled_by_admin tùy context)

-- Cập nhật trạng thái cơ bản
UPDATE `donhang` SET `trangThaiDonHang` = 'pending_confirmation' WHERE `trangThaiDonHang` = 'CHO_XAC_NHAN';
UPDATE `donhang` SET `trangThaiDonHang` = 'processing' WHERE `trangThaiDonHang` = 'DA_XAC_NHAN';
UPDATE `donhang` SET `trangThaiDonHang` = 'processing' WHERE `trangThaiDonHang` = 'DANG_GIAO';
UPDATE `donhang` SET `trangThaiDonHang` = 'delivered' WHERE `trangThaiDonHang` = 'DA_GIAO';

-- Cập nhật trạng thái hủy (cần xem xét từng trường hợp cụ thể)
-- Mặc định chuyển DA_HUY thành cancelled_by_customer
UPDATE `donhang` SET `trangThaiDonHang` = 'cancelled_by_customer' WHERE `trangThaiDonHang` = 'DA_HUY';

-- Cập nhật các trạng thái khác
UPDATE `donhang` SET `trangThaiDonHang` = 'cancelled_by_admin' WHERE `trangThaiDonHang` = 'BI_TU_CHOI';

-- Thêm cột lyDo nếu chưa có (để lưu lý do hủy/bom hàng)
ALTER TABLE `donhang` 
ADD COLUMN `lyDo` TEXT DEFAULT NULL 
AFTER `trangThaiDonHang`;

-- Thêm comment cho cột
ALTER TABLE `donhang` 
MODIFY COLUMN `lyDo` TEXT DEFAULT NULL 
COMMENT 'Lý do hủy đơn hàng hoặc giao hàng thất bại';

-- Tạo index cho cột lyDo nếu cần
-- CREATE INDEX idx_donhang_lydo ON `donhang` (`lyDo`);

-- Kiểm tra kết quả
SELECT 
  trangThaiDonHang,
  COUNT(*) as count
FROM `donhang` 
GROUP BY trangThaiDonHang 
ORDER BY count DESC; 