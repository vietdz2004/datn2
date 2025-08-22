const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Category: Model danh mục chính (tương ứng bảng danhmuc)
const Category = sequelize.define('Category', {
  id_DanhMuc: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tenDanhMuc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'danhmuc',
  timestamps: false,
});

module.exports = Category; 
