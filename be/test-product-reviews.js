const axios = require('axios');

async function testProductReviews() {
  try {
    console.log('🔍 Testing Product Reviews API...');
    
    const response = await axios.get('http://localhost:5002/api/products/17/reviews');
    
    console.log('✅ Status:', response.status);
    console.log('📊 Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      const reviews = response.data.data;
      console.log(`📝 Found ${reviews.length} reviews for product 17`);
      
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. User: ${review.User?.ten || 'Unknown'}, Rating: ${review.danhGiaSao}⭐, Content: ${review.noiDung}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProductReviews();
