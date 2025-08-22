const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const Cart = sequelize.define('Cart', {
  id_GioHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_GioHang'
  },
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_NguoiDung',
    references: {
      model: 'NguoiDung',
      key: 'id_NguoiDung'
    }
  },
  id_SanPham: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_SanPham',
    references: {
      model: 'SanPham',
      key: 'id_SanPham'
    }
  },
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'soLuong'
  },
  giaTaiThoiDiem: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'giaTaiThoiDiem',
    comment: 'Giá sản phẩm tại thời điểm thêm vào giỏ'
  },
  ngayThem: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'ngayThem'
  },
  ngayCapNhat: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'ngayCapNhat'
  }
}, {
  tableName: 'GioHang',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_NguoiDung', 'id_SanPham'],
      name: 'unique_user_product'
    },
    {
      fields: ['id_NguoiDung'],
      name: 'idx_cart_user'
    },
    {
      fields: ['id_SanPham'],
      name: 'idx_cart_product'
    }
  ],
  hooks: {
    beforeUpdate: (cart, options) => {
      cart.ngayCapNhat = new Date();
    }
  }
});

module.exports = Cart; 