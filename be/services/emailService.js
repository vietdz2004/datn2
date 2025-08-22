const nodemailer = require('nodemailer');

// Tạo transporter với Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Template email đặt lại mật khẩu
const getPasswordResetEmailTemplate = (userName, resetUrl) => {
  return {
    subject: 'Đặt lại mật khẩu - HoaNghe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Đặt lại mật khẩu HoaShop</h2>
        <p>Xin chào <b>${userName || 'bạn'}</b>!</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HoaShop.</p>
        <p>Nhấp vào liên kết dưới đây để đặt lại mật khẩu (liên kết chỉ có hiệu lực 15 phút):</p>
        <a href="${resetUrl}" style="background: #e91e63; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Đặt lại mật khẩu</a>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">HoaNghe - Đội ngũ hỗ trợ khách hàng</p>
      </div>
    `
  };
};

// Template email thông báo admin về yêu cầu hủy đơn hàng
const getCancelOrderNotificationTemplate = (orderData) => {
  const { maDonHang, id_DonHang, tongThanhToan, ngayDatHang, tenKhachHang, soDienThoai, email } = orderData;
  
  return {
    subject: `⚠️ Yêu cầu hủy đơn hàng #${maDonHang || id_DonHang} - HoaShop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">
          🚨 Yêu cầu hủy đơn hàng
        </h2>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #e65100;">Thông tin đơn hàng:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Mã đơn hàng:</td>
              <td style="padding: 8px;">#${maDonHang || id_DonHang}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; font-weight: bold;">Tổng tiền:</td>
              <td style="padding: 8px; color: #d32f2f; font-weight: bold;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tongThanhToan)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Ngày đặt:</td>
              <td style="padding: 8px;">${new Date(ngayDatHang).toLocaleString('vi-VN')}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; font-weight: bold;">Yêu cầu hủy lúc:</td>
              <td style="padding: 8px;">${new Date().toLocaleString('vi-VN')}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #7b1fa2;">Thông tin khách hàng:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Tên khách hàng:</td>
              <td style="padding: 8px;">${tenKhachHang || 'Không xác định'}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; font-weight: bold;">Số điện thoại:</td>
              <td style="padding: 8px;">${soDienThoai || 'Không xác định'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;">${email || 'Không xác định'}</td>
            </tr>
          </table>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1565c0;">📋 Cần thực hiện:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Xem xét lý do hủy đơn hàng</li>
            <li>Liên hệ khách hàng nếu cần thiết</li>
            <li>Xác nhận hoặc từ chối yêu cầu hủy</li>
            <li>Cập nhật trạng thái đơn hàng trên hệ thống</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.ADMIN_URL || 'http://localhost:3001'}/admin/cancellation-requests" 
             style="background: #2196f3; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
            🔗 Xem chi tiết trong Admin Panel
          </a>
        </div>

        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          HoaShop Admin System - Thông báo tự động
        </p>
      </div>
    `
  };
};

// Template email thông báo khách hàng khi admin chấp nhận hủy đơn
const getApprovedCancellationTemplate = (orderData, reason) => {
  const { maDonHang, id_DonHang, tongThanhToan, ngayDatHang, tenKhachHang, phuongThucThanhToan } = orderData;
  
  return {
    subject: `✅ Đơn hàng #${maDonHang || id_DonHang} đã được hủy thành công - HoaShop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
          ✅ Đơn hàng đã được hủy thành công
        </h2>
        
        <p>Xin chào <b>${tenKhachHang || 'quý khách'}</b>!</p>
        
        <p>Chúng tôi đã xử lý yêu cầu hủy đơn hàng của bạn. Đơn hàng <b>#${maDonHang || id_DonHang}</b> đã được hủy thành công.</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #0c4a6e;">📋 Thông tin đơn hàng đã hủy:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Mã đơn hàng:</td>
              <td style="padding: 8px;">#${maDonHang || id_DonHang}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 8px; font-weight: bold;">Ngày đặt hàng:</td>
              <td style="padding: 8px;">${new Date(ngayDatHang).toLocaleString('vi-VN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Tổng tiền:</td>
              <td style="padding: 8px; color: #dc2626; font-weight: bold;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tongThanhToan)}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 8px; font-weight: bold;">Phương thức thanh toán:</td>
              <td style="padding: 8px;">${phuongThucThanhToan || 'Không xác định'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Thời gian hủy:</td>
              <td style="padding: 8px;">${new Date().toLocaleString('vi-VN')}</td>
            </tr>
          </table>
        </div>

        ${reason ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">💬 Lý do hủy:</h3>
            <p style="margin: 0; font-style: italic;">"${reason}"</p>
          </div>
        ` : ''}

        <div style="background: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #065f46;">💰 Về việc hoàn tiền:</h3>
          <p style="margin: 0;">
            ${phuongThucThanhToan === 'TIEN_MAT' || phuongThucThanhToan === 'COD' 
              ? 'Đơn hàng của bạn sử dụng phương thức thanh toán khi nhận hàng, do đó không cần thực hiện hoàn tiền.'
              : 'Nếu bạn đã thanh toán trước, chúng tôi sẽ hoàn tiền trong vòng 3-5 ngày làm việc. Vui lòng kiểm tra tài khoản ngân hàng của bạn.'
            }
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" 
             style="background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
            📦 Xem đơn hàng khác
          </a>
        </div>

        <p>Cảm ơn bạn đã tin tưởng HoaShop. Chúng tôi hy vọng có thể phục vụ bạn trong tương lai!</p>

        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          HoaShop - Đội ngũ chăm sóc khách hàng<br/>
          Hotline: 1900-1234 | Email: support@hoashop.com
        </p>
      </div>
    `
  };
};

// Template email thông báo khách hàng khi admin từ chối hủy đơn
const getRejectedCancellationTemplate = (orderData, reason) => {
  const { maDonHang, id_DonHang, tongThanhToan, ngayDatHang, tenKhachHang, phuongThucThanhToan } = orderData;
  
  return {
    subject: `❌ Yêu cầu hủy đơn hàng #${maDonHang || id_DonHang} đã bị từ chối - HoaShop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">
          ❌ Yêu cầu hủy đơn hàng bị từ chối
        </h2>
        
        <p>Xin chào <b>${tenKhachHang || 'quý khách'}</b>!</p>
        
        <p>Chúng tôi đã xem xét yêu cầu hủy đơn hàng của bạn. Tuy nhiên, đơn hàng <b>#${maDonHang || id_DonHang}</b> không thể hủy được vào thời điểm này.</p>
        
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #7f1d1d;">📋 Thông tin đơn hàng:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Mã đơn hàng:</td>
              <td style="padding: 8px;">#${maDonHang || id_DonHang}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 8px; font-weight: bold;">Ngày đặt hàng:</td>
              <td style="padding: 8px;">${new Date(ngayDatHang).toLocaleString('vi-VN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Tổng tiền:</td>
              <td style="padding: 8px; color: #dc2626; font-weight: bold;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tongThanhToan)}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 8px; font-weight: bold;">Trạng thái hiện tại:</td>
              <td style="padding: 8px; color: #059669; font-weight: bold;">Đang xử lý</td>
            </tr>
          </table>
        </div>

        ${reason ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">💬 Lý do từ chối:</h3>
            <p style="margin: 0; font-style: italic;">"${reason}"</p>
          </div>
        ` : ''}

        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #1e40af;">📦 Đơn hàng sẽ tiếp tục được xử lý:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Đơn hàng của bạn đang được chuẩn bị</li>
            <li>Chúng tôi sẽ giao hàng theo đúng thời gian dự kiến</li>
            <li>Bạn có thể theo dõi trạng thái đơn hàng trên website</li>
          </ul>
        </div>

        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <h3 style="margin-top: 0; color: #15803d;">📞 Cần hỗ trợ?</h3>
          <p style="margin: 0;">
            Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi:
          </p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Hotline: <b>1900-1234</b></li>
            <li>Email: <b>support@hoashop.com</b></li>
            <li>Chat online trên website</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" 
             style="background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
            📦 Theo dõi đơn hàng
          </a>
        </div>

        <p>Cảm ơn bạn đã hiểu và tiếp tục tin tưởng HoaShop!</p>

        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          HoaShop - Đội ngũ chăm sóc khách hàng<br/>
          Hotline: 1900-1234 | Email: support@hoashop.com
        </p>
      </div>
    `
  };
};

// Gửi email cho khách khi admin hủy đơn hàng (shop hết hàng, lý do...)
const getAdminCancelledOrderTemplate = (orderData, reason) => {
  const { maDonHang, id_DonHang, tongThanhToan, ngayDatHang, tenKhachHang, phuongThucThanhToan } = orderData;
  return {
    subject: `🚫 Đơn hàng #${maDonHang || id_DonHang} đã bị hủy bởi shop - HoaShop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          🚫 Đơn hàng đã bị hủy bởi shop
        </h2>
        <p>Xin chào <b>${tenKhachHang || 'quý khách'}</b>!</p>
        <p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng <b>#${maDonHang || id_DonHang}</b> của bạn đã bị hủy bởi shop.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">💬 Lý do hủy:</h3>
          <p style="margin: 0; font-style: italic;">"${reason || 'Không xác định'}"</p>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #0c4a6e;">📋 Thông tin đơn hàng:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Mã đơn hàng:</td><td style="padding: 8px;">#${maDonHang || id_DonHang}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Ngày đặt hàng:</td><td style="padding: 8px;">${new Date(ngayDatHang).toLocaleString('vi-VN')}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Tổng tiền:</td><td style="padding: 8px; color: #dc2626; font-weight: bold;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tongThanhToan)}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Phương thức thanh toán:</td><td style="padding: 8px;">${phuongThucThanhToan || 'Không xác định'}</td></tr>
          </table>
        </div>
        <p>Chúng tôi xin lỗi vì sự bất tiện này. Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline hoặc email bên dưới.</p>
        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          HoaShop - Đội ngũ chăm sóc khách hàng<br/>
          Hotline: 1900-1234 | Email: support@hoashop.com
        </p>
      </div>
    `
  };
};

const sendAdminCancelledOrderEmail = async (customerEmail, orderData, reason) => {
  const transporter = createTransporter();
  const template = getAdminCancelledOrderTemplate(orderData, reason);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: template.subject,
    html: template.html
  });
};

// Gửi email khi bom hàng (giao hàng thất bại)
const getFailedDeliveryTemplate = (orderData, reason) => {
  const { maDonHang, id_DonHang, tongThanhToan, ngayDatHang, tenKhachHang, phuongThucThanhToan } = orderData;
  return {
    subject: `💣 Đơn hàng #${maDonHang || id_DonHang} giao hàng thất bại - HoaShop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          💣 Đơn hàng giao hàng thất bại
        </h2>
        <p>Xin chào <b>${tenKhachHang || 'quý khách'}</b>!</p>
        <p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng <b>#${maDonHang || id_DonHang}</b> của bạn đã giao hàng thất bại.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">💬 Lý do giao hàng thất bại:</h3>
          <p style="margin: 0; font-style: italic;">"${reason || 'Không xác định'}"</p>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #0c4a6e;">📋 Thông tin đơn hàng:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Mã đơn hàng:</td><td style="padding: 8px;">#${maDonHang || id_DonHang}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Ngày đặt hàng:</td><td style="padding: 8px;">${new Date(ngayDatHang).toLocaleString('vi-VN')}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Tổng tiền:</td><td style="padding: 8px; color: #dc2626; font-weight: bold;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tongThanhToan)}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Phương thức thanh toán:</td><td style="padding: 8px;">${phuongThucThanhToan || 'Không xác định'}</td></tr>
          </table>
        </div>
        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline hoặc email bên dưới.</p>
        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          HoaShop - Đội ngũ chăm sóc khách hàng<br/>
          Hotline: 1900-1234 | Email: support@hoashop.com
        </p>
      </div>
    `
  };
};

const sendFailedDeliveryEmail = async (customerEmail, orderData, reason, adminEmail = null) => {
  const transporter = createTransporter();
  const template = getFailedDeliveryTemplate(orderData, reason);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: template.subject,
    html: template.html
  });
  if (adminEmail) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: template.subject,
      html: template.html
    });
  }
};

// Hàm gửi email đặt lại mật khẩu
const sendResetPasswordEmail = async (toEmail, resetUrl, userName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'HoaShop'} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: toEmail,
      ...getPasswordResetEmailTemplate(userName, resetUrl)
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send password reset email:', err.message);
    return { success: false, message: 'Mock email sent (fallback)' };
  }
};

// Hàm gửi email thông báo admin về yêu cầu hủy đơn hàng
const sendCancelOrderNotificationEmail = async (orderData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hoashop.com';
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'HoaShop'} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: adminEmail,
      ...getCancelOrderNotificationTemplate(orderData)
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Cancel order notification sent to admin:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send cancel order notification:', err.message);
    // Log thông báo cho admin qua console thay vì email
    console.log(`📧 [MOCK EMAIL TO ADMIN] Khách hàng yêu cầu hủy đơn hàng #${orderData.maDonHang || orderData.id_DonHang}`);
    return { success: false, message: 'Mock notification logged to console' };
  }
};

// Hàm gửi email thông báo khách hàng khi admin chấp nhận hủy đơn
const sendApprovedCancellationEmail = async (customerEmail, orderData, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'HoaShop'} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: customerEmail,
      ...getApprovedCancellationTemplate(orderData, reason)
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Approved cancellation email sent to customer:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send approved cancellation email:', err.message);
    console.log(`📧 [MOCK EMAIL TO CUSTOMER] Đơn hàng #${orderData.maDonHang || orderData.id_DonHang} đã được duyệt hủy`);
    return { success: false, message: 'Mock notification logged to console' };
  }
};

// Hàm gửi email thông báo khách hàng khi admin từ chối hủy đơn
const sendRejectedCancellationEmail = async (customerEmail, orderData, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'HoaShop'} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: customerEmail,
      ...getRejectedCancellationTemplate(orderData, reason)
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejected cancellation email sent to customer:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send rejected cancellation email:', err.message);
    console.log(`📧 [MOCK EMAIL TO CUSTOMER] Yêu cầu hủy đơn hàng #${orderData.maDonHang || orderData.id_DonHang} đã bị từ chối`);
    return { success: false, message: 'Mock notification logged to console' };
  }
};

module.exports = { 
  sendResetPasswordEmail,
  sendCancelOrderNotificationEmail,
  sendApprovedCancellationEmail,
  sendRejectedCancellationEmail,
  sendAdminCancelledOrderEmail,
  sendFailedDeliveryEmail
};
 