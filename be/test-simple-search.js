const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testSimpleSearch() {
  try {
    console.log('🧪 Testing simple search...\n');

    // Test basic search without pagination
    console.log('📄 Test: Basic search');
    const response = await axios.get(`${BASE_URL}/products/search?q=hoa`);
    console.log('Response status:', response.status);
    console.log('Response success:', response.data.success);
    
    if (response.data.success) {
      console.log('✅ Search successful!');
      console.log('Total items:', response.data.pagination?.total);
      console.log('Total pages:', response.data.pagination?.totalPages);
      console.log('Current page:', response.data.pagination?.page);
      console.log('Items returned:', response.data.data?.length);
    } else {
      console.log('❌ Search failed:', response.data.message);
      console.log('Error:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSimpleSearch(); 