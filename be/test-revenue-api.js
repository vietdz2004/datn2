const axios = require('axios');

async function testRevenueAPI() {
  try {
    console.log('🔍 Testing Revenue Chart API...');
    
    const response = await axios.get('http://localhost:5002/api/admin/dashboard/revenue-chart?period=30d');
    
    console.log('✅ Status:', response.status);
    console.log('📊 Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data?.chart) {
      const chartData = response.data.data.chart;
      console.log(`📈 Chart has ${chartData.length} data points`);
      
      chartData.forEach((item, index) => {
        console.log(`${index + 1}. ${item.period}: ${item.orderCount} orders, ${item.revenue} revenue`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRevenueAPI();
