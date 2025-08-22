// Load environment variables reliably from the backend folder
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');

// Import admin routes - Import routes quản trị
const adminRoutes = require('./routes/adminRoutes');

// Import database connection
const { connectToDatabase } = require('./models/database');

// Initialize Express app
const app = express();

// CORS configuration - Allow all for development
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware with proper headers
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'public/images')));

app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Debug middleware - Log all requests
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - Body:`, req.body);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HoaShop Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug middleware - Log all requests
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - Body:`, req.body);
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);

// Admin API Routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      error: 'Bad Request'
    });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'Not Found'
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 5002;

async function startServer() {
  try {
    // Try to connect to database
    const dbConnected = await connectToDatabase();
    
    if (dbConnected) {
      console.log('🎯 Running in PRODUCTION mode with database');
    } else {
      console.log('🔧 Running in DEVELOPMENT mode with mock data');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log('🌸 HoaShop Backend Server');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`🔧 Admin API: http://localhost:${PORT}/api/admin`);
      console.log(`💖 Health Check: http://localhost:${PORT}/api/health`);
      console.log('==========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app; 
