-- Migration: Add product and user references to reviews table
-- Date: 2024-12-20
-- Description: Add id_SanPham and id_NguoiDung to enable direct product reviews

ALTER TABLE `danhgia` 
ADD COLUMN `id_SanPham` int(11) NULL COMMENT 'ID sản phẩm được đánh giá',
ADD COLUMN `id_NguoiDung` int(11) NULL COMMENT 'ID người dùng viết đánh giá';

-- Add foreign key constraints
ALTER TABLE `danhgia` 
ADD CONSTRAINT `fk_review_product` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id_SanPham`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id_NguoiDung`) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX `idx_review_product` ON `danhgia` (`id_SanPham`);
CREATE INDEX `idx_review_user` ON `danhgia` (`id_NguoiDung`); 