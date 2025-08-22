import axios from 'axios';

// ============================================
// API CONFIGURATION - Cấu hình API
// ============================================
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5002';

// Helper function để format image URL
export const formatImageUrl = (imagePath) => {
  if (!imagePath) return '/no-image.svg';
  
  // Nếu đã là URL đầy đủ
  if (imagePath.startsWith('http')) return imagePath;
  
  // Nếu có đường dẫn relative bắt đầu với /images/
  if (imagePath.startsWith('/images/')) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }
  
  // Nếu chỉ có tên file
  if (imagePath && !imagePath.includes('/')) {
    return `${IMAGE_BASE_URL}/images/products/${imagePath}`;
  }
  
  // Fallback cho trường hợp khác
  return `${IMAGE_BASE_URL}/images/products/${imagePath.replace(/^\/images\/products\//, '')}`;
};

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ============================================
// INTERCEPTORS - Xử lý request/response
// ============================================

// Request interceptor - Thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi và logout tự động khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ - tự động logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// UTILITY FUNCTIONS - Hàm tiện ích
// ============================================

// Lấy URL đầy đủ cho ảnh
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/no-image.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${IMAGE_BASE_URL}/public/images/${imagePath}`;
};

// Xử lý lỗi API thống nhất
export const handleAPIError = (error) => {
  if (error.response) {
    // Lỗi từ server
    const message = error.response.data?.message || 'Có lỗi xảy ra';
    return { success: false, message, status: error.response.status };
  } else if (error.request) {
    // Lỗi mạng
    return { success: false, message: 'Không thể kết nối đến server' };
  } else {
    // Lỗi khác
    return { success: false, message: error.message || 'Có lỗi xảy ra' };
  }
};

// ============================================
// AUTH SERVICES - Dịch vụ xác thực
// ============================================
export const authAPI = {
  // Basic authentication
  login: (credentials) => api.post('/users/auth/login', credentials),
  register: (userData) => api.post('/users/auth/register', userData),
  logout: () => api.post('/users/auth/logout'),
  verifyToken: () => api.get('/users/auth/verify'),
  
  // Profile management
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/auth/profile', data),
  
  // Password management
  changePassword: (data) => api.post('/users/auth/change-password', data),
  forgotPassword: (email) => api.post('/users/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/users/auth/reset-password', data),
  verifyResetToken: (token) => api.get(`/users/auth/verify-reset-token/${token}`),
  googleLogin: (idToken) => api.post("/auth/google", { idToken }),
};

// ============================================
// PRODUCT SERVICES - Dịch vụ sản phẩm
// ============================================
export const productAPI = {
  // Cơ bản
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId, params = {}) => 
    api.get(`/products/category/${categoryId}`, { params }),
  search: (query, params = {}) => 
    api.get('/products/search', { params: { q: query, ...params } }),
  getFeatured: () => api.get('/products/featured'),
  getRelated: (productId) => api.get(`/products/${productId}/related`),
  getRelatedProducts: (productId, limit = 4) => api.get(`/products/${productId}/related`, { params: { limit } }),
  
  // Sản phẩm đặc biệt cho trang chủ
  getDiscountProducts: (params = {}) => api.get('/products/discount', { params }),
  getPopularProducts: (params = {}) => api.get('/products/popular', { params }),
  getNewProducts: (params = {}) => api.get('/products/new', { params }),
  getBestsellerProducts: (params = {}) => api.get('/products/bestseller', { params }),
  getProductsByCategories: (params = {}) => api.get('/products/by-categories', { params }),
};

// ============================================
// CATEGORY SERVICES - Dịch vụ danh mục
// ============================================
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  getWithSubcategories: () => api.get('/categories/with-subcategories'),
};

// ============================================
// SUBCATEGORY SERVICES - Dịch vụ danh mục con
// ============================================
export const subCategoryAPI = {
  getAll: () => api.get('/subcategories'),
  getByCategory: (categoryId) => api.get(`/subcategories/category/${categoryId}`),
  getById: (id) => api.get(`/subcategories/${id}`),
};

// ============================================
// CART SERVICES - Dịch vụ giỏ hàng
// ============================================
export const cartAPI = {
  get: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to get cart');
    }
    
    return api.get(`/cart/${userId}`);
  },
  add: (productId, quantity) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to add items to cart');
    }
    
    return api.post('/cart/add', { userId, productId, quantity });
  },
  update: (productId, quantity) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to update cart');
    }
    
    return api.put(`/cart/${userId}/${productId}`, { quantity });
  },
  remove: (productId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to remove from cart');
    }
    
    return api.delete(`/cart/${userId}/${productId}`);
  },
  clear: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to clear cart');
    }
    
    return api.delete(`/cart/${userId}`);
  },
  sync: (cartItems) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to sync cart');
    }
    
    return api.post('/cart/sync', { userId, cartItems });
  }
};

// ============================================
// ORDER SERVICES - Dịch vụ đơn hàng
// ============================================
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  createOrder: (orderData) => api.post('/orders', orderData), // Alias để tương thích
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getHistory: () => api.get('/orders/history'),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
};

// ============================================
// REVIEW SERVICES - Dịch vụ đánh giá
// ============================================
export const reviewAPI = {
  // Lấy đánh giá theo sản phẩm (public)
  getByProduct: (productId, params = {}) => 
    api.get(`/reviews/product/${productId}`, { params }),
  
  // Lấy thống kê đánh giá theo sản phẩm (public)
  getProductStats: (productId) => 
    api.get(`/reviews/product/${productId}/stats`),
  
  // Tạo đánh giá mới (cần đăng nhập)
  create: (reviewData) => api.post('/reviews', reviewData),
  
  // Cập nhật đánh giá của user
  update: (id, data) => api.put(`/reviews/${id}`, data),
  
  // Xóa đánh giá (admin)
  delete: (id) => api.delete(`/reviews/${id}`),
  
  // Lấy tất cả đánh giá của user
  getUserReviews: (userId, params = {}) => 
    api.get(`/reviews/user/${userId}`, { params }),
  
  // Order-based review APIs
  getOrderProductsForReview: (orderId, userId) => 
    api.get(`/reviews/order/${orderId}/user/${userId}/products`),
  
  createOrderReview: (orderId, productId, userId, reviewData) => 
    api.post(`/reviews/order/${orderId}/product/${productId}/user/${userId}`, reviewData),
  
  getUserProductReview: (productId, userId, orderId) => 
    api.get(`/reviews/product/${productId}/user/${userId}/order/${orderId}`),
  
  // Admin APIs
  getAll: (params = {}) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  reply: (id, replyData) => api.post(`/reviews/${id}/reply`, replyData),
  toggleVisibility: (id, trangThai) => api.patch(`/reviews/${id}/visibility`, { trangThai }),
};

// ============================================
// WISHLIST SERVICES - Dịch vụ danh sách yêu thích
// ============================================
export const wishlistAPI = {
  get: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to get wishlist');
    }
    
    return api.get(`/wishlist/${userId}`);
  },
  add: (productId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to add to wishlist');
    }
    
    return api.post('/wishlist/add', { userId, productId });
  },
  remove: (productId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id_NguoiDung;
    
    if (!userId) {
      throw new Error('User must be logged in to remove from wishlist');
    }
    
    return api.delete(`/wishlist/${userId}/${productId}`);
  }
};

// ============================================
// VOUCHER SERVICES - Dịch vụ voucher
// ============================================
export const voucherAPI = {
  validate: (code, orderTotal, userId, productIds) => 
    api.post('/vouchers/validate', { code, orderTotal, userId, productIds }),
  apply: (code, orderId) => 
    api.post('/vouchers/apply', { code, orderId })
};

// ============================================
// DASHBOARD SERVICES - Dịch vụ dashboard/thống kê
// ============================================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getBestSellers: () => api.get('/dashboard/best-sellers'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
};

// ============================================
// EXPORTS - Xuất các module
// ============================================
export default api;
export {
  BASE_URL,
  IMAGE_BASE_URL,
};

// Export aliases để tương thích ngược
export const productsAPI = productAPI;
export const categoriesAPI = categoryAPI;

export const createVNPayPayment = async (payload) => {
  try {
    console.log('🏦 Creating VNPay payment with payload:', payload);
    const res = await fetch('http://localhost:5002/api/payment/create_payment_url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log('🏦 VNPay response:', data);
    
    if (!res.ok) {
      throw new Error(data.message || 'Lỗi tạo link thanh toán VNPay');
    }
    
    if (!data.success || !data.paymentUrl) {
      throw new Error(data.message || 'Không nhận được link thanh toán VNPay');
    }
    
    return data;
  } catch (error) {
    console.error('❌ VNPay payment error:', error);
    throw error;
  }
}; 