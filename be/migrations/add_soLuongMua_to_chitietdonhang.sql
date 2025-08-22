-- Migration: Thêm cột soLuongMua vào bảng chitietdonhang
-- Thực hiện: ALTER TABLE chitietdonhang ADD COLUMN soLuongMua INT DEFAULT NULL AFTER id_DonHang;

-- Kiểm tra xem cột soLuongMua đã tồn tại chưa
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'chitietdonhang' 
   AND COLUMN_NAME = 'soLuongMua') > 0,
  'SELECT "Cột soLuongMua đã tồn tại" as message',
  'ALTER TABLE chitietdonhang ADD COLUMN soLuongMua INT DEFAULT NULL AFTER id_DonHang'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cập nhật dữ liệu cũ nếu có (copy từ cột soLuong nếu tồn tại)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'chitietdonhang' 
   AND COLUMN_NAME = 'soLuong') > 0,
  'UPDATE chitietdonhang SET soLuongMua = soLuong WHERE soLuongMua IS NULL',
  'SELECT "Không có cột soLuong để copy dữ liệu" as message'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm comment cho cột
ALTER TABLE chitietdonhang MODIFY COLUMN soLuongMua INT DEFAULT NULL COMMENT 'Số lượng mua của sản phẩm';

-- Kiểm tra kết quả
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'chitietdonhang'
ORDER BY ORDINAL_POSITION; 