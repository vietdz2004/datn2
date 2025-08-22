// Test script to check admin API connectivity
import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

async function testAdminAPI() {
  console.log('🧪 Testing Admin API Connectivity...\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    try {
      const response = await axios.get(`${API_BASE}/`);
      console.log('✅ Backend server: RUNNING');
    } catch (error) {
      console.log('❌ Backend server: NOT RUNNING');
      console.log('Please start the backend server with: npm run dev');
      return;
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
    
    // Test 5: Combined filters
    console.log('\n5️⃣ Testing combined filters...');
    try {
      const combinedResponse = await axios.get(`${API_BASE}/admin/orders?search=pham&trangThaiDonHang=DA_HUY&page=1&limit=5`);
      console.log('✅ Combined filters: OK');
      console.log('📊 Combined results:', combinedResponse.data.data?.length || 0, 'orders found');
    } catch (combinedError) {
      console.log('❌ Combined filters: Failed');
      console.log('Error:', combinedError.response?.status, combinedError.response?.data?.message || combinedError.message);
    }
    
  } catch (error) {
    console.log('❌ General error:', error.message);
  }
  
  console.log('\n🏁 API testing completed!');
  console.log('\n💡 If tests fail, make sure:');
  console.log('   1. Backend server is running (npm run dev in backend folder)');
  console.log('   2. Database is connected');
  console.log('   3. Admin routes are properly configured');
}

// Run test
testAdminAPI(); 