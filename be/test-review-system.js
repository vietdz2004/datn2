const axios = require('axios');

// Test script cho hệ thống đánh giá mới
const BASE_URL = 'http://localhost:5002/api';

async function testReviewSystem() {
  console.log('🧪 Testing Review System...\n');

  try {
    // Test 1: Lấy đánh giá theo sản phẩm (public)
    console.log('1️⃣ Testing: GET /reviews/product/:productId');
    try {
      const response = await axios.get(`${BASE_URL}/reviews/product/1`);
      console.log('✅ Success:', response.data.success);
      console.log('📊 Reviews count:', response.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 2: Lấy danh sách sản phẩm có thể đánh giá trong đơn hàng
    console.log('\n2️⃣ Testing: GET /reviews/order/:orderId/user/:userId/products');
    try {
      const response = await axios.get(`${BASE_URL}/reviews/order/1/user/1/products`);
      console.log('✅ Success:', response.data.success);
      console.log('📦 Products count:', response.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 3: Tạo đánh giá mới (cần đăng nhập)
    console.log('\n3️⃣ Testing: POST /reviews (create review)');
    try {
      const reviewData = {
        id_SanPham: 1,
        id_DonHang: 1,
        noiDung: 'Sản phẩm rất tốt, giao hàng nhanh chóng!',
        danhGiaSao: 5
      };
      
      const response = await axios.post(`${BASE_URL}/reviews`, reviewData);
      console.log('✅ Success:', response.data.success);
      console.log('📝 Review ID:', response.data.data?.id_DanhGia);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 4: Tạo đánh giá theo đơn hàng
    console.log('\n4️⃣ Testing: POST /reviews/order/:orderId/product/:productId/user/:userId');
    try {
      const reviewData = {
        noiDung: 'Sản phẩm chất lượng cao, đóng gói cẩn thận!',
        danhGiaSao: 4
      };
      
      const response = await axios.post(`${BASE_URL}/reviews/order/1/product/1/user/1`, reviewData);
      console.log('✅ Success:', response.data.success);
      console.log('📝 Review ID:', response.data.data?.id_DanhGia);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 5: Lấy đánh giá của user cho sản phẩm trong đơn hàng
    console.log('\n5️⃣ Testing: GET /reviews/product/:productId/user/:userId/order/:orderId');
    try {
      const response = await axios.get(`${BASE_URL}/reviews/product/1/user/1/order/1`);
      console.log('✅ Success:', response.data.success);
      if (response.data.data) {
        console.log('📝 Review found:', response.data.data.noiDung?.substring(0, 50) + '...');
      } else {
        console.log('📝 No review found');
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 6: Lấy tất cả đánh giá (admin)
    console.log('\n6️⃣ Testing: GET /reviews (admin)');
    try {
      const response = await axios.get(`${BASE_URL}/reviews`, {
        params: { page: 1, limit: 5 }
      });
      console.log('✅ Success:', response.data.success);
      console.log('📊 Total reviews:', response.data.pagination?.totalItems || 0);
      console.log('📄 Current page:', response.data.pagination?.currentPage || 1);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 7: Lấy đánh giá theo ID
    console.log('\n7️⃣ Testing: GET /reviews/:id');
    try {
      const response = await axios.get(`${BASE_URL}/reviews/1`);
      console.log('✅ Success:', response.data.success);
      console.log('📝 Review content:', response.data.noiDung?.substring(0, 50) + '...');
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 8: Gửi phản hồi admin (cần quyền admin)
    console.log('\n8️⃣ Testing: POST /reviews/:id/reply (admin)');
    try {
      const replyData = {
        reply: 'Cảm ơn bạn đã đánh giá chi tiết! Chúng tôi sẽ cải thiện dịch vụ.'
      };
      
      const response = await axios.post(`${BASE_URL}/reviews/1/reply`, replyData);
      console.log('✅ Success:', response.data.success);
      console.log('💬 Reply sent');
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 9: Ẩn/hiện đánh giá (admin)
    console.log('\n9️⃣ Testing: PATCH /reviews/:id/visibility (admin)');
    try {
      const response = await axios.patch(`${BASE_URL}/reviews/1/visibility`, {
        trangThai: 'hidden'
      });
      console.log('✅ Success:', response.data.success);
      console.log('👁️ Review hidden');
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 10: Xóa đánh giá (admin - soft delete)
    console.log('\n🔟 Testing: DELETE /reviews/:id (admin)');
    try {
      const response = await axios.delete(`${BASE_URL}/reviews/1`);
      console.log('✅ Success:', response.data.success);
      console.log('🗑️ Review deleted (soft delete)');
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Review System Test Completed!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Chạy test
if (require.main === module) {
  testReviewSystem().catch(console.error);
}

module.exports = { testReviewSystem };
