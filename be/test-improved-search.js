const axios = require('axios');

async function testSearch() {
  try {
    console.log('🔍 Testing improved search algorithm...\n');
    
    const searchTerms = ['hoa cúc', 'hoa cuc', 'cúc', 'hoa'];
    
    for (const term of searchTerms) {
      console.log(`\n📝 Searching for: "${term}"`);
      const response = await axios.get('http://localhost:5000/api/products/search', {
        params: { q: term, limit: 5 }
      });
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} products:`);
        response.data.data.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.tenSp} (Score: ${product.relevance_score})`);
        });
        console.log(`  Metadata:`, response.data.metadata);
      } else {
        console.log(`❌ Error:`, response.data.message);
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSearch(); 