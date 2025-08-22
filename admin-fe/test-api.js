import orderService from '../src/services/orderService.js';

console.log('Testing orderService updateStatus...');

orderService.updateStatus(186, { status: 'da_xac_nhan' })
  .then(res => {
    console.log('✅ Success:', res.data);
  })
  .catch(err => {
    console.error('❌ Error:', err.response?.data || err.message);
  });
