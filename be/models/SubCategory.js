const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// SubCategory: Model danh mục chi tiết (tương ứng bảng danhmucchitiet)
const SubCategory = sequelize.define('SubCategory', {
  id_DanhMucChiTiet: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_DanhMuc: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tenDanhMucChiTiet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'danhmucchitiet',
  timestamps: false,
});

module.exports = SubCategory; 