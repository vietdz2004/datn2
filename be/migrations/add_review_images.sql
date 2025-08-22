-- Migration: Thêm hỗ trợ hình ảnh đánh giá và cập nhật validation
-- Thực hiện: 2024-12-19

-- 1. Thêm cột hinhAnh để lưu trữ hình ảnh đánh giá
ALTER TABLE `danhgia` 
ADD COLUMN `hinhAnh` TEXT NULL AFTER `noiDung`,
COMMENT = 'Hình ảnh đánh giá (không bắt buộc)';

-- 2. Cập nhật cột noiDung để không bắt buộc
ALTER TABLE `danhgia` 
MODIFY COLUMN `noiDung` TEXT NULL,
COMMENT = 'Nội dung đánh giá (không bắt buộc)';

-- 3. Thêm index cho cột hinhAnh để tối ưu truy vấn
CREATE INDEX `idx_review_images` ON `danhgia` (`hinhAnh`(100));

-- 4. Cập nhật comment cho bảng
ALTER TABLE `danhgia` 
COMMENT = 'Bảng đánh giá sản phẩm - hỗ trợ hình ảnh và nội dung không bắt buộc';
