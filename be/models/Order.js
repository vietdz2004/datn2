const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Order: Model đơn hàng (tương ứng bảng donhang)
const Order = sequelize.define('Order', {
  id_DonHang: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_voucher: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ngayDatHang: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  phuongThucThanhToan: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tongThanhToan: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  phiVanChuyen: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  trangThaiDonHang: {
    type: DataTypes.ENUM(
      'cho_xu_ly',
      'da_xac_nhan',
      'dang_chuan_bi',
      'dang_giao',
      'da_giao',
      'huy_boi_khach',
      'huy_boi_admin',
      'khach_bom_hang'
    ),
    allowNull: false,
    defaultValue: 'cho_xu_ly',
  },
  trangThaiThanhToan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  lyDo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tenNguoiNhan: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  diaChiGiaoHang: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ghiChu: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  maDonHang: {
    type: DataTypes.STRING(50),
    allowNull: true,
  }
}, {
  tableName: 'donhang',
  timestamps: false,
});

module.exports = Order; 