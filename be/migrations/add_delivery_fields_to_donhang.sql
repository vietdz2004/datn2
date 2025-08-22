-- Add delivery information fields to donhang table
ALTER TABLE donhang 
ADD COLUMN tenNguoiNhan VARCHAR(100) NULL AFTER trangThaiThanhToan,
ADD COLUMN diaChiGiaoHang TEXT NULL AFTER tenNguoiNhan,
ADD COLUMN ghiChu TEXT NULL AFTER diaChiGiaoHang,
ADD COLUMN email VARCHAR(100) NULL AFTER ghiChu,
ADD COLUMN maDonHang VARCHAR(50) NULL AFTER email;
