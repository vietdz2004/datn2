-- Migration: Cập nhật cấu trúc bảng danhgia để hỗ trợ đánh giá theo đơn hàng
-- Thực hiện: 2024-12-19

-- 1. Thêm cột mới
ALTER TABLE `danhgia` 
ADD COLUMN `id_DonHang` INT NOT NULL AFTER `id_SanPham`,
ADD COLUMN `trangThai` ENUM('active', 'hidden', 'deleted') DEFAULT 'active' AFTER `ngayDanhGia`,
ADD COLUMN `phanHoiAdmin` TEXT NULL AFTER `trangThai`,
ADD COLUMN `ngayPhanHoi` DATETIME NULL AFTER `phanHoiAdmin`;

-- 2. Cập nhật các cột hiện có để không cho phép NULL
ALTER TABLE `danhgia` 
MODIFY COLUMN `id_SanPham` INT NOT NULL,
MODIFY COLUMN `id_NguoiDung` INT NOT NULL,
MODIFY COLUMN `noiDung` TEXT NOT NULL,
MODIFY COLUMN `danhGiaSao` INT NOT NULL;

-- 3. Xóa cột cũ không còn sử dụng
ALTER TABLE `danhgia` DROP COLUMN `id_ChiTietDH`;

-- 4. Tạo index unique để đảm bảo mỗi sản phẩm chỉ được đánh giá 1 lần trong 1 đơn hàng
CREATE UNIQUE INDEX `unique_review_per_order` ON `danhgia` (`id_SanPham`, `id_DonHang`, `id_NguoiDung`);

-- 5. Tạo các index khác để tối ưu truy vấn
CREATE INDEX `idx_review_product` ON `danhgia` (`id_SanPham`);
CREATE INDEX `idx_review_order` ON `danhgia` (`id_DonHang`);
CREATE INDEX `idx_review_user` ON `danhgia` (`id_NguoiDung`);
CREATE INDEX `idx_review_status` ON `danhgia` (`trangThai`);

-- 6. Cập nhật dữ liệu cũ (nếu có) - giả sử tất cả đánh giá cũ đều thuộc đơn hàng đầu tiên của user
-- Lưu ý: Chỉ chạy khi đã có dữ liệu và muốn migrate
-- UPDATE `danhgia` SET `id_DonHang` = (
--   SELECT MIN(`id_DonHang`) FROM `donhang` WHERE `donhang`.`id_NguoiDung` = `danhgia`.`id_NguoiDung`
-- ) WHERE `id_DonHang` IS NULL OR `id_DonHang` = 0;
