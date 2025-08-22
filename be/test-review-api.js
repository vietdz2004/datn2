const axios = require('axios');

// Test API review
const testReviewAPI = async () => {
  try {
    console.log('🧪 Testing Review API...');
    
    // Test data
    const testData = {
      noiDung: 'Sản phẩm rất đẹp và chất lượng tốt!',
      danhGiaSao: 5,
      hinhAnh: null
    };
    
    // Test URL (thay đổi theo cấu hình của bạn)
    const url = 'http://localhost:5002/api/reviews/order/1/product/1/user/1';
    
    console.log('📝 Sending test request to:', url);
    console.log('📦 Test data:', testData);
    
    const response = await axios.post(url, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('🔍 Status:', error.response?.status);
    console.error('🔍 Headers:', error.response?.headers);
  }
};

// Run test
testReviewAPI();
