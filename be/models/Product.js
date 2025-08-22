const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Product: Model sản phẩm (tương ứng bảng sanpham)
const Product = sequelize.define('Product', {
  id_SanPham: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  maSKU: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  tenSp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  moTa: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hinhAnh: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thuongHieu: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  giaKhuyenMai: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  id_DanhMucChiTiet: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  trangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'active', // active, hidden
  },
  // SEO Fields
  seoTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'SEO Title for search engines',
  },
  seoDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO Meta Description for search engines',
  },
  seoKeywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO Keywords separated by commas',
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL-friendly slug for product page',
  },
  // Inventory Management Fields
  soLuongTon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Số lượng tồn kho',
  },
  soLuongToiThieu: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    comment: 'Số lượng tồn kho tối thiểu để cảnh báo',
  },
}, {
  tableName: 'sanpham',
  timestamps: false,
});

module.exports = Product; 