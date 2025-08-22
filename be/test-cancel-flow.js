const axios = require('axios');

async function run() {
  const api = axios.create({ baseURL: 'http://localhost:5002/api', validateStatus: () => true });

  try {
    console.log('1) Creating COD order...');
    const createRes = await api.post('/orders', {
      hoTen: 'Test User',
      soDienThoai: '0900000000',
      email: 'test@example.com',
      diaChiGiao: '123 Test St',
      ghiChu: '',
      phuongThucThanhToan: 'COD',
      sanPham: [
        {
          id_SanPham: 17,
          soLuongMua: 1,
          gia: 600000,
          giaTaiThoiDiem: 600000,
          tenSp: 'hoa cuc'
        }
      ],
      tongThanhToan: 600000,
      id_NguoiDung: 9
    });

    if (createRes.status !== 201) {
      console.error('Create order failed:', createRes.status, createRes.data);
      return;
    }

    const order = createRes.data?.data || createRes.data; // controller may return {data:{...}} or payload
    const orderId = order?.id_DonHang || order?.orderId || order?.id;
    if (!orderId) {
      console.error('Unable to determine new order id from response:', createRes.data);
      return;
    }
    console.log('✅ Created order id:', orderId);

    console.log('2) Admin sets status -> da_xac_nhan ...');
    const adminRes = await api.put(`/admin/orders/${orderId}/status`, { status: 'da_xac_nhan', lyDo: '' });
    console.log('Admin update status:', adminRes.status, adminRes.data?.message || adminRes.data);

    console.log('3) Customer tries to cancel ...');
    const cancelRes = await api.put(`/orders/${orderId}/cancel`);
    console.log('Cancel response status:', cancelRes.status);
    console.log('Cancel response body:', cancelRes.data);

    if (cancelRes.status === 400) {
      console.log('✅ Expectation met: cancel blocked after confirmation');
    } else {
      console.warn('⚠ Unexpected status; expected 400 when canceling after confirmation');
    }
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

run();
