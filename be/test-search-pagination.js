const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testSearchPagination() {
  try {
    console.log('🧪 Testing search pagination...\n');

    // Test 1: Search with page 1
    console.log('📄 Test 1: Search page 1');
    const response1 = await axios.get(`${BASE_URL}/products/search?q=hoa&page=1&limit=5`);
    console.log('Page 1 Response:', {
      success: response1.data.success,
      totalItems: response1.data.pagination?.total,
      totalPages: response1.data.pagination?.totalPages,
      currentPage: response1.data.pagination?.page,
      itemsCount: response1.data.data?.length
    });

    // Test 2: Search with page 2
    console.log('\n📄 Test 2: Search page 2');
    const response2 = await axios.get(`${BASE_URL}/products/search?q=hoa&page=2&limit=5`);
    console.log('Page 2 Response:', {
      success: response2.data.success,
      totalItems: response2.data.pagination?.total,
      totalPages: response2.data.pagination?.totalPages,
      currentPage: response2.data.pagination?.page,
      itemsCount: response2.data.data?.length
    });

    // Test 3: Verify pagination consistency
    console.log('\n📊 Pagination Consistency Check:');
    console.log('Page 1 totalItems:', response1.data.pagination?.total);
    console.log('Page 2 totalItems:', response2.data.pagination?.total);
    console.log('Consistent totalItems:', response1.data.pagination?.total === response2.data.pagination?.total);
    console.log('Page 1 currentPage:', response1.data.pagination?.page);
    console.log('Page 2 currentPage:', response2.data.pagination?.page);

    // Test 4: Check if products are different
    const page1Ids = response1.data.data?.map(p => p.id_SanPham) || [];
    const page2Ids = response2.data.data?.map(p => p.id_SanPham) || [];
    const hasOverlap = page1Ids.some(id => page2Ids.includes(id));
    console.log('\n🔄 Product Overlap Check:');
    console.log('Page 1 products:', page1Ids);
    console.log('Page 2 products:', page2Ids);
    console.log('Has overlap:', hasOverlap);
    console.log('Products are different:', !hasOverlap);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSearchPagination(); 