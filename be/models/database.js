const path = require('path');
// Load env from backend folder reliably regardless of CWD
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
const { Sequelize } = require('sequelize');

// Tạo kết nối với MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+07:00',
    logging: false, // Disable logging for now
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Global flag để track database status
let isDatabaseConnected = false;

// Function to connect to database
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    isDatabaseConnected = true;
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    isDatabaseConnected = false;
    return false;
  }
};

// Check if database is available
const isDatabaseAvailable = () => {
  return isDatabaseConnected;
};

// Mock data for testing when database is not available
const mockData = {
  categories: [
    {
      id_DanhMuc: 1,
      tenDanhMuc: 'Hoa Sinh Nhật',
      SubCategories: [
        { id_DanhMucChiTiet: 1, tenDanhMucChiTiet: 'Hoa Hồng' },
        { id_DanhMucChiTiet: 2, tenDanhMucChiTiet: 'Hoa Cúc' }
      ]
    },
    {
      id_DanhMuc: 2,
      tenDanhMuc: 'Hoa Chúc Mừng',
      SubCategories: [
        { id_DanhMucChiTiet: 3, tenDanhMucChiTiet: 'Hoa Khai Trương' },
        { id_DanhMucChiTiet: 4, tenDanhMucChiTiet: 'Hoa Sự Kiện' }
      ]
    }
  ],
  products: [
    {
      id_SanPham: 1,
      tenSp: 'Bó hoa hồng đỏ cao cấp',
      gia: 450000,
      giaKhuyenMai: 399000,
      hinhAnh: '/images/products/rose.jpg',
      trangThai: 'active'
    }
  ]
};

// Get mock data by type
const getMockData = (type) => {
  return mockData[type] || [];
};

module.exports = { 
  sequelize, 
  connectToDatabase,
  isDatabaseAvailable,
  getMockData
};
