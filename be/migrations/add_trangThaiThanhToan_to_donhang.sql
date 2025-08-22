-- Migration: Add trangThaiThanhToan column to donhang if missing
-- Note: MySQL does not support IF NOT EXISTS for columns in older versions.
-- Run safely; rerunning will fail if column already exists.

ALTER TABLE `donhang`
  ADD COLUMN `trangThaiThanhToan` VARCHAR(50) NULL COMMENT 'Trạng thái thanh toán: CHUA_THANH_TOAN | PENDING | DA_THANH_TOAN | THAT_BAI | HOAN_TIEN'
  AFTER `lyDo`;
