const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Voucher: Model voucher (tương ứng bảng voucher)
const Voucher = sequelize.define('Voucher', {
  id_voucher: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_voucher',
  },
  maVoucher: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'maVoucher',
  },
  loai: {
    type: DataTypes.ENUM('fixed', 'percentage'),
    allowNull: false,
    field: 'loai',
  },
  giaTriGiam: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'giaTriGiam',
  },
  dieuKienApDung: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'dieuKienApDung',
  },
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'soLuong',
  },
  soLuongDaDung: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'soLuongDaDung',
  },
  moTa: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'moTa',
  },
  trangThai: {
    type: DataTypes.ENUM('dang_hoat_dong', 'het_han'),
    allowNull: false,
    defaultValue: 'dang_hoat_dong',
    field: 'trangThai',
  },
  ngayBatDau: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'ngayBatDau',
  },
  ngayHetHan: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'ngayHetHan',
  },
}, {
  tableName: 'voucher',
  timestamps: false,
});

module.exports = Voucher; 