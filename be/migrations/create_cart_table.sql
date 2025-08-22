-- Create cart table (giohang)
-- Run this migration to create the cart table in your database

CREATE TABLE IF NOT EXISTS `giohang` (
  `id_GioHang` int(11) NOT NULL AUTO_INCREMENT,
  `id_NguoiDung` int(11) NOT NULL,
  `id_SanPham` int(11) NOT NULL,
  `soLuong` int(11) NOT NULL DEFAULT 1,
  `giaTaiThoiDiem` decimal(10,2) NOT NULL COMMENT 'Giá sản phẩm tại thời điểm thêm vào giỏ',
  `ngayThem` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngayCapNhat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_GioHang`),
  
  -- Foreign keys
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id_NguoiDung`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id_SanPham`) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate cart items
  UNIQUE KEY `unique_user_product_cart` (`id_NguoiDung`, `id_SanPham`),
  
  -- Indexes for performance
  KEY `idx_cart_user` (`id_NguoiDung`),
  KEY `idx_cart_product` (`id_SanPham`),
  
  -- Constraints
  CONSTRAINT `chk_cart_quantity` CHECK (`soLuong` > 0),
  CONSTRAINT `chk_cart_price` CHECK (`giaTaiThoiDiem` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Bảng giỏ hàng - lưu trữ sản phẩm người dùng đã chọn';

-- Sample data insertion (optional - for testing)
-- INSERT INTO `giohang` (`id_NguoiDung`, `id_SanPham`, `soLuong`, `giaTaiThoiDiem`) VALUES
-- (1, 1, 2, 150000.00),
-- (1, 2, 1, 200000.00),
-- (2, 3, 3, 100000.00); 