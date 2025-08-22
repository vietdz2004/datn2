-- Migration: Drop bảng don_hang_nhanh (quick orders table)
-- File: drop_quick_orders_table.sql
-- Run this to remove quick order functionality from database

-- Drop table if exists
DROP TABLE IF EXISTS `don_hang_nhanh`;
DROP TABLE IF EXISTS `quick_orders`;

-- Note: This will permanently remove all quick order data
-- Make sure to backup data if needed before running this migration 