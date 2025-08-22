const { sequelize } = require('./models/database');

async function createRealisticOrderStatuses() {
  try {
    console.log('🎯 Tạo dữ liệu trạng thái đơn hàng thực tế...');

    // Lấy tất cả đơn hàng
    const orders = await sequelize.query(`
      SELECT id_DonHang, trangThaiThanhToan, phuongThucThanhToan, ngayDatHang
      FROM donhang 
      ORDER BY ngayDatHang DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(`📦 Tổng số đơn hàng: ${orders.length}`);

    let updates = [];

    // Phân bổ trạng thái theo logic thực tế
    orders.forEach((order, index) => {
      let newStatus = 'cho_xu_ly'; // mặc định

      // Logic phân bổ trạng thái dựa trên:
      // 1. Trạng thái thanh toán
      // 2. Thứ tự thời gian (đơn cũ hơn có thể đã hoàn thành)
      
      if (order.trangThaiThanhToan === 'paid') {
        // Đơn đã thanh toán
        if (index < 20) {
          newStatus = Math.random() > 0.7 ? 'da_giao' : 'dang_giao';
        } else if (index < 50) {
          newStatus = Math.random() > 0.5 ? 'dang_giao' : 'da_xac_nhan';
        } else {
          newStatus = 'da_xac_nhan';
        }
      } else if (order.trangThaiThanhToan === 'failed' || order.trangThaiThanhToan === 'REFUND_SUCCESS') {
        // Đơn thanh toán thất bại hoặc đã hoàn tiền
        newStatus = Math.random() > 0.3 ? 'huy_boi_admin' : 'huy_boi_khach';
      } else if (order.trangThaiThanhToan === 'unpaid' || order.trangThaiThanhToan === 'PENDING') {
        // Đơn chưa thanh toán
        if (order.phuongThucThanhToan === 'COD') {
          // COD có thể tiến triển bình thường
          if (index < 30) {
            newStatus = Math.random() > 0.6 ? 'da_giao' : 'dang_giao';
          } else if (index < 80) {
            newStatus = Math.random() > 0.4 ? 'dang_giao' : 'da_xac_nhan';
          } else {
            newStatus = 'cho_xu_ly';
          }
        } else {
          // Online chưa thanh toán thì chờ xử lý
          newStatus = 'cho_xu_ly';
        }
      }

      updates.push({ id: order.id_DonHang, status: newStatus });
    });

    // Thực hiện cập nhật
    console.log('\n🔄 Đang cập nhật trạng thái...');
    for (const update of updates) {
      await sequelize.query(`
        UPDATE donhang 
        SET trangThaiDonHang = ? 
        WHERE id_DonHang = ?
      `, { 
        replacements: [update.status, update.id],
        type: sequelize.QueryTypes.UPDATE 
      });
    }

    // Kiểm tra kết quả
    console.log('\n📊 Phân bổ trạng thái sau cập nhật:');
    const statusStats = await sequelize.query(`
      SELECT trangThaiDonHang, COUNT(*) as count 
      FROM donhang 
      GROUP BY trangThaiDonHang 
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    statusStats.forEach(row => {
      console.log(`${row.trangThaiDonHang}: ${row.count} đơn`);
    });

    // Hiển thị mẫu đơn hàng với trạng thái đa dạng
    console.log('\n📋 Mẫu đơn hàng với trạng thái đa dạng:');
    const sampleOrders = await sequelize.query(`
      SELECT id_DonHang, maDonHang, trangThaiDonHang, trangThaiThanhToan, phuongThucThanhToan
      FROM donhang 
      ORDER BY ngayDatHang DESC 
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    sampleOrders.forEach(order => {
      console.log(`ID: ${order.id_DonHang} | Trạng thái: "${order.trangThaiDonHang}" | Thanh toán: "${order.trangThaiThanhToan}" | PT: "${order.phuongThucThanhToan}"`);
    });

    console.log('\n🎉 Hoàn thành tạo dữ liệu thực tế!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createRealisticOrderStatuses();
