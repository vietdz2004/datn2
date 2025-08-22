const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Review: Model đánh giá (tương ứng bảng danhgia)
const Review = sequelize.define('Review', {
  id_DanhGia: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_SanPham: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID sản phẩm được đánh giá'
  },
  id_DonHang: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID đơn hàng chứa sản phẩm'
  },
  id_NguoiDung: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID người dùng viết đánh giá'
  },
  noiDung: {
    type: DataTypes.TEXT,
    allowNull: true, // Không bắt buộc nội dung
    comment: 'Nội dung đánh giá (không bắt buộc)'
  },
  hinhAnh: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Hình ảnh đánh giá (không bắt buộc)'
  },
  danhGiaSao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Số sao đánh giá (1-5)'
  },
  ngayDanhGia: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Thời gian đánh giá'
  },
  trangThai: {
    type: DataTypes.ENUM('active', 'hidden', 'deleted'),
    defaultValue: 'active',
    comment: 'Trạng thái hiển thị đánh giá'
  },
  phanHoiAdmin: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Phản hồi của admin cho đánh giá'
  },
  ngayPhanHoi: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian admin phản hồi'
  }
}, {
  tableName: 'danhgia',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_SanPham', 'id_DonHang', 'id_NguoiDung'],
      name: 'unique_review_per_order'
    },
    {
      fields: ['id_SanPham']
    },
    {
      fields: ['id_DonHang']
    },
    {
      fields: ['id_NguoiDung']
    },
    {
      fields: ['trangThai']
    }
  ]
});

module.exports = Review; 