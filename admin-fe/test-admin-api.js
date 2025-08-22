// Test script to check admin API connectivity
const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testAdminAPI() {
  console.log('🧪 Testing Admin API Connectivity...\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const healthCheck = await axios.get(`${API_BASE}/health`).catch(() => null);
    if (healthCheck) {
      console.log('✅ Basic connectivity: OK');
    } else {
      console.log('❌ Basic connectivity: Failed');
    }
    
    // Test 2: Admin orders endpoint
    console.log('\n2️⃣ Testing admin orders endpoint...');
    try {
      const ordersResponse = await axios.get(`${API_BASE}/admin/orders?page=1&limit=5`);
      console.log('✅ Admin orders endpoint: OK');
      console.log('📊 Response status:', ordersResponse.status);
      console.log('📋 Data structure:', {
        hasData: !!ordersResponse.data.data,
        dataLength: ordersResponse.data.data?.length || 0,
        hasPagination: !!ordersResponse.data.pagination
      });
    } catch (ordersError) {
      console.log('❌ Admin orders endpoint: Failed');
      console.log('Error:', ordersError.response?.status, ordersError.response?.data?.message || ordersError.message);
    }
    
    // Test 3: Search functionality
    console.log('\n3️⃣ Testing search functionality...');
    try {
      const searchResponse = await axios.get(`${API_BASE}/admin/orders?search=pham&page=1&limit=5`);
      console.log('✅ Search functionality: OK');
      console.log('📊 Search results:', searchResponse.data.data?.length || 0, 'orders found');
    } catch (searchError) {
      console.log('❌ Search functionality: Failed');
      console.log('Error:', searchError.response?.status, searchError.response?.data?.message || searchError.message);
    }
    
    // Test 4: Status filtering
    console.log('\n4️⃣ Testing status filtering...');
    try {
      const statusResponse = await axios.get(`${API_BASE}/admin/orders?trangThaiDonHang=CHO_XAC_NHAN&page=1&limit=5`);
      console.log('✅ Status filtering: OK');
      console.log('📊 Filtered results:', statusResponse.data.data?.length || 0, 'orders found');
    } catch (statusError) {
      console.log('❌ Status filtering: Failed');
      console.log('Error:', statusError.response?.status, statusError.response?.data?.message || statusError.message);
    }
    
  } catch (error) {
    console.log('❌ General error:', error.message);
  }
  
  console.log('\n🏁 API testing completed!');
}

// Run test
if (require.main === module) {
  testAdminAPI();
}

module.exports = { testAdminAPI }; 