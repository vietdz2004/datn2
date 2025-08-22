-- Create wishlist table (yeuthich)
-- Run this migration to create the wishlist table in your database

CREATE TABLE IF NOT EXISTS `yeuthich` (
  `id_YeuThich` int(11) NOT NULL AUTO_INCREMENT,
  `id_NguoiDung` int(11) NOT NULL,
  `id_SanPham` int(11) NOT NULL,
  `ngayThem` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_YeuThich`),
  
  -- Foreign keys
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id_NguoiDung`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id_SanPham`) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate wishlist items
  UNIQUE KEY `unique_user_product_wishlist` (`id_NguoiDung`, `id_SanPham`),
  
  -- Indexes for performance
  KEY `idx_wishlist_user` (`id_NguoiDung`),
  KEY `idx_wishlist_product` (`id_SanPham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Bảng yêu thích - lưu trữ sản phẩm người dùng yêu thích';

-- Sample data insertion (optional - for testing)
-- INSERT INTO `yeuthich` (`id_NguoiDung`, `id_SanPham`) VALUES
-- (1, 1),
-- (1, 2),
-- (2, 3); 