const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

// Test voucher APIs
async function testVoucherAPIs() {
  console.log('🧪 Testing Voucher APIs...\n');

  try {
    // 1. Test get available vouchers
    console.log('1️⃣ Testing GET /vouchers/available');
    const availableRes = await axios.get(`${API_BASE}/vouchers/available`);
    console.log('✅ Available vouchers:', availableRes.data);
    console.log('📊 Found', availableRes.data.data?.length || 0, 'available vouchers\n');

    // 2. Test validate voucher - valid code
    console.log('2️⃣ Testing POST /vouchers/validate - Valid code');
    const validateRes = await axios.post(`${API_BASE}/vouchers/validate`, {
      code: 'WELCOME50',
      orderTotal: 250000
    });
    console.log('✅ Validate response:', validateRes.data);

    // 3. Test validate voucher - invalid code
    console.log('\n3️⃣ Testing POST /vouchers/validate - Invalid code');
    try {
      const invalidRes = await axios.post(`${API_BASE}/vouchers/validate`, {
        code: 'INVALID123',
        orderTotal: 250000
      });
      console.log('❌ Should have failed:', invalidRes.data);
    } catch (error) {
      console.log('✅ Correctly rejected invalid voucher:', error.response?.data?.message);
    }

    // 4. Test validate voucher - insufficient order total
    console.log('\n4️⃣ Testing POST /vouchers/validate - Insufficient order total');
    try {
      const insufficientRes = await axios.post(`${API_BASE}/vouchers/validate`, {
        code: 'WELCOME50',
        orderTotal: 100000 // Less than required 200,000
      });
      console.log('❌ Should have failed:', insufficientRes.data);
    } catch (error) {
      console.log('✅ Correctly rejected insufficient order total:', error.response?.data?.message);
    }

    // 5. Test apply voucher
    console.log('\n5️⃣ Testing POST /vouchers/apply');
    const applyRes = await axios.post(`${API_BASE}/vouchers/apply`, {
      code: 'WELCOME50',
      orderTotal: 250000
    });
    console.log('✅ Apply response:', applyRes.data);

    // 6. Test apply voucher with high discount
    console.log('\n6️⃣ Testing POST /vouchers/apply - High discount');
    const highDiscountRes = await axios.post(`${API_BASE}/vouchers/apply`, {
      code: 'FREE25',
      orderTotal: 10000 // Less than discount amount
    });
    console.log('✅ High discount response:', highDiscountRes.data);

    // 7. Test VIP voucher
    console.log('\n7️⃣ Testing VIP voucher');
    const vipRes = await axios.post(`${API_BASE}/vouchers/apply`, {
      code: 'VIP150',
      orderTotal: 1200000
    });
    console.log('✅ VIP voucher response:', vipRes.data);

    console.log('\n🎉 All voucher tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test voucher integration with order
async function testVoucherOrderIntegration() {
  console.log('\n🛒 Testing Voucher + Order Integration...\n');

  try {
    // 1. Create order with voucher
    console.log('1️⃣ Creating order with voucher');
    const orderData = {
      hoTen: 'Nguyễn Văn Test',
      soDienThoai: '0123456789',
      email: 'test@example.com',
      diaChiGiao: '123 Đường Test, Quận 1, TP.HCM',
      ghiChu: 'Test order with voucher',
      phuongThucThanhToan: 'COD',
      sanPham: [
        {
          id_SanPham: 1,
          soLuong: 2,
          gia: 150000,
          giaTaiThoiDiem: 150000,
          tenSp: 'Hoa hồng đỏ'
        }
      ],
      tongThanhToan: 250000,
      maVoucher: 'WELCOME50'
    };

    const orderRes = await axios.post(`${API_BASE}/orders`, orderData);
    console.log('✅ Order created with voucher:', orderRes.data);

    // 2. Check if voucher was applied correctly
    if (orderRes.data.success) {
      const order = orderRes.data.data;
      console.log('📊 Order details:');
      console.log('   - Order ID:', order.id_DonHang);
      console.log('   - Voucher ID:', order.id_voucher);
      console.log('   - Total amount:', order.tongThanhToan);
    }

    console.log('\n🎉 Voucher + Order integration test completed!');

  } catch (error) {
    console.error('❌ Integration test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Voucher System Tests...\n');
  
  await testVoucherAPIs();
  await testVoucherOrderIntegration();
  
  console.log('\n✨ All tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testVoucherAPIs, testVoucherOrderIntegration }; 