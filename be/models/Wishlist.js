const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Wishlist: Model danh sách yêu thích (tương ứng bảng yeuthich)
const Wishlist = sequelize.define('Wishlist', {
  id_YeuThich: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID người dùng'
  },
  id_SanPham: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID sản phẩm yêu thích'
  },
  ngayThem: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Ngày thêm vào yêu thích'
  },
}, {
  tableName: 'yeuthich',
  timestamps: false,
  indexes: [
    {
      // Unique constraint: 1 user chỉ có thể yêu thích 1 product 1 lần
      unique: true,
      fields: ['id_NguoiDung', 'id_SanPham']
    },
    {
      // Index để query nhanh theo user
      fields: ['id_NguoiDung']
    },
    {
      // Index để query nhanh theo product
      fields: ['id_SanPham']
    }
  ]
});

module.exports = Wishlist; 