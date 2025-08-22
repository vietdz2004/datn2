const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing order creation...');
    
    const orderData = {
      hoTen: "Test User",
      soDienThoai: "0336636315", 
      email: "test@test.com",
      diaChiGiao: "hoa cuc - Chất Lượng Cao | HoaShop",
      phuongThucThanhToan: "VNPay",
      sanPham: [
        {
          id_SanPham: 17,
          soLuong: 1,
          gia: 800000,
          giaTaiThoiDiem: 600000
        }
      ],
      tongThanhToan: 650000
    };

    const response = await axios.post('http://localhost:5002/api/orders', orderData);
    console.log('Order Response:', response.data);
    
    if (response.data.success) {
      console.log('Testing VNPay...');
      const vnpayResponse = await axios.post('http://localhost:5002/api/payment/create_payment_url', {
        amount: 650000,
        orderId: response.data.data.id_DonHang,
        orderDesc: `Thanh toán đơn hàng #${response.data.data.id_DonHang} - HoaShop`
      });
      console.log('VNPay Response:', vnpayResponse.data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI(); 