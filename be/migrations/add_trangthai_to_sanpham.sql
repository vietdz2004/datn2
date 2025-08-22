-- Migration: Thêm cột trangThai vào bảng sanpham
-- File: add_trangthai_to_sanpham.sql

-- Thêm cột trangThai để quản lý hiển thị/ẩn sản phẩm
ALTER TABLE `sanpham` 
ADD COLUMN `trangThai` VARCHAR(20) DEFAULT 'active' 
AFTER `id_DanhMucChiTiet`;

-- Thêm comment cho cột
ALTER TABLE `sanpham` 
MODIFY COLUMN `trangThai` VARCHAR(20) DEFAULT 'active' 
COMMENT 'Trạng thái sản phẩm: active (hiển thị), hidden (ẩn)';

-- Cập nhật tất cả sản phẩm hiện tại về trạng thái active
UPDATE `sanpham` SET `trangThai` = 'active' WHERE `trangThai` IS NULL;

-- Tạo index cho cột trangThai để tìm kiếm nhanh
CREATE INDEX idx_sanpham_trangthai ON `sanpham` (`trangThai`);

-- Optional: Thêm constraint check (MySQL 8.0+)
-- ALTER TABLE `sanpham` 
-- ADD CONSTRAINT chk_sanpham_trangthai 
-- CHECK (`trangThai` IN ('active', 'hidden')); 