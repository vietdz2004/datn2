-- Dữ liệu mẫu cho bảng voucher
-- Chèn các voucher mẫu để test chức năng mã giảm giá

INSERT INTO `voucher` (`maVoucher`, `giaTriGiam`, `dieuKienApDung`, `ngayBatDau`, `ngayHetHan`) VALUES
-- Voucher giảm 50,000đ cho đơn hàng từ 200,000đ
('WELCOME50', 50000.00, '{"minOrderTotal": 200000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59'),

-- Voucher giảm 100,000đ cho đơn hàng từ 500,000đ
('SAVE100', 100000.00, '{"minOrderTotal": 500000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59'),

-- Voucher giảm 20,000đ cho đơn hàng từ 100,000đ
('FLOWER20', 20000.00, '{"minOrderTotal": 100000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59'),

-- Voucher giảm 30,000đ cho đơn hàng từ 150,000đ
('SPRING30', 30000.00, '{"minOrderTotal": 150000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59'),

-- Voucher giảm 75,000đ cho đơn hàng từ 300,000đ
('SUMMER75', 75000.00, '{"minOrderTotal": 300000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59'),

-- Voucher giảm 25,000đ cho đơn hàng từ 120,000đ (không có điều kiện)
('FREE25', 25000.00, NULL, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),

-- Voucher giảm 150,000đ cho đơn hàng từ 1,000,000đ
('VIP150', 150000.00, '{"minOrderTotal": 1000000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59'),

-- Voucher giảm 40,000đ cho đơn hàng từ 200,000đ
('HAPPY40', 40000.00, '{"minOrderTotal": 200000}', '2024-01-01 00:00:00', '2024-12-31 23:59:59');

-- Kiểm tra dữ liệu đã chèn
SELECT * FROM voucher ORDER BY giaTriGiam DESC; 