const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// User: Model người dùng (tương ứng bảng nguoidung)
const User = sequelize.define('User', {
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tenDangNhap: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  matKhau: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ten: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  diaChi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  soDienThoai: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vaiTro: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  trangThai: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  ngayTao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'nguoidung',
  timestamps: false,
});

// Helper methods for authentication
User.findByEmail = async function(email) {
  try {
    const user = await this.findOne({
      where: { email: email }
    });
    return user ? user.toJSON() : null;
  } catch (error) {
    console.error('findByEmail error:', error);
    return null;
  }
};

User.findById = async function(id) {
  try {
    const user = await this.findByPk(id);
    return user ? user.toJSON() : null;
  } catch (error) {
    console.error('findById error:', error);
    return null;
  }
};

User.createUser = async function(userData) {
  try {
    const user = await this.create({
      ten: userData.hoTen,
      email: userData.email,
      soDienThoai: userData.soDienThoai,
      matKhau: userData.matKhau,
      vaiTro: userData.vaiTro || 'KHACH_HANG',
      trangThai: 'HOAT_DONG'
    });
    return user.id_NguoiDung;
  } catch (error) {
    console.error('createUser error:', error);
    throw error;
  }
};

module.exports = User; 