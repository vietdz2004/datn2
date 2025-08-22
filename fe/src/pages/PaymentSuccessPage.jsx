import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../services/api';
import { CartContext } from '../contexts/CartContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Hàm định nghĩa label tiếng Việt cho trạng thái đơn hàng
const getOrderStatusLabel = (status) => {
  const statusMap = {
    // Hệ thống trạng thái mới
    'pending': 'Chờ xử lý',
    'confirmed': 'Đã xác nhận',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy',
    
    // Hệ thống legacy
    'cho_xu_ly': 'Chờ xử lý',
    'da_xac_nhan': 'Đã xác nhận',
    'dang_chuan_bi': 'Đang chuẩn bị',
    'dang_giao': 'Đang giao',
    'da_giao': 'Đã giao',
    'huy_boi_khach': 'Đã hủy (Khách)',
    'huy_boi_admin': 'Đã hủy (Admin)',
    'khach_bom_hang': 'Bị bom hàng'
  };
  
  return statusMap[status] || status || 'Không xác định';
};

const PaymentSuccessPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const status = query.get('status');
  const orderId = query.get('orderId');
  const reason = query.get('reason');
  const { clearCart } = React.useContext(CartContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'success') {
      clearCart();
    }
  }, [status, clearCart]);

  useEffect(() => {
    if (status === 'success' && orderId) {
      setLoading(true);
      api.get(`/orders/${orderId}`)
        .then(res => setOrder(res.data.data))
        .catch(() => setError('Không lấy được thông tin đơn hàng.'))
        .finally(() => setLoading(false));
    }
  }, [status, orderId]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', maxWidth: 480 }}>
        {status === 'success' ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Cảm ơn bạn đã mua hàng tại HoaShop.<br/>
              Mã đơn hàng: <b>{orderId}</b>
            </Typography>
            {loading && <CircularProgress sx={{ my: 2 }} />}
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            {order && (
              <Box sx={{ my: 2, textAlign: 'left' }}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="subtitle1">Chi tiết đơn hàng:</Typography>
                <Typography variant="body2">Khách hàng: {order.hoTen}</Typography>
                <Typography variant="body2">Tổng tiền: {order.tongThanhToan?.toLocaleString('vi-VN')}đ</Typography>
                <Typography variant="body2">Trạng thái: {getOrderStatusLabel(order.trangThaiDonHang)}</Typography>
                <Typography variant="body2">Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}</Typography>
              </Box>
            )}
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/')}>Về trang chủ</Button>
            <Button variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={() => navigate('/orders')}>Xem đơn hàng</Button>
          </>
        ) : (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" gutterBottom>
              Đơn hàng chưa được thanh toán thành công.<br/>
              {reason && <span>Lý do: {reason}</span>}
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/')}>Về trang chủ</Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentSuccessPage; 