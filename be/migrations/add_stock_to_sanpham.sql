-- Migration: Add stock quantity to sanpham table
-- Date: 2024-12-20
-- Description: Add inventory management field

ALTER TABLE sanpham 
ADD COLUMN soLuongTon INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho',
ADD COLUMN soLuongToiThieu INT NOT NULL DEFAULT 5 COMMENT 'Số lượng tồn kho tối thiểu để cảnh báo',
ADD INDEX idx_stock (soLuongTon);

-- Update existing products with sample stock data
UPDATE sanpham 
SET 
  soLuongTon = FLOOR(RAND() * 100) + 10,  -- Random stock 10-109
  soLuongToiThieu = 5
WHERE id_SanPham > 0; 