import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import api from '../services/api';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState('');

  const checkPaymentResult = useCallback(async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const status = searchParams.get('status');
      const paymentMethod = searchParams.get('paymentMethod');
      const orderId = searchParams.get('orderId');
      const reason = searchParams.get('reason');

      console.log('🔍 Payment Result Params:', {
        status,
        paymentMethod,
        orderId,
        reason,
        allParams: Object.fromEntries(searchParams.entries())
      });

      if (paymentMethod === 'vnpay') {
        // Xử lý kết quả VNPay
        await handleVNPayResult(searchParams);
      } else if (paymentMethod === 'zalopay') {
        // Xử lý kết quả ZaloPay
        await handleZaloPayResult(searchParams);
      } else {
        // Fallback cho các trường hợp khác
        setPaymentResult({
          success: status === 'success',
          message: status === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại',
          orderId: orderId,
          paymentMethod: paymentMethod || 'Unknown',
          reason: reason
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Payment result check error:', error);
      setError('Có lỗi xảy ra khi kiểm tra kết quả thanh toán');
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    checkPaymentResult();
  }, [checkPaymentResult]);

  const handleVNPayResult = async (searchParams) => {
    try {
      // Gọi API backend để xác thực kết quả VNPay
      const queryString = searchParams.toString();
      const response = await api.get(`/payment/check_payment?${queryString}&paymentMethod=vnpay`);
      
      console.log('💳 VNPay check response:', response.data);

      if (response.data.success) {
        setPaymentResult({
          success: true,
          message: 'Thanh toán VNPay thành công',
          orderId: response.data.data.vnp_TxnRef,
          paymentMethod: 'VNPay',
          amount: response.data.data.vnp_Amount ? response.data.data.vnp_Amount / 100 : null,
          transactionId: response.data.data.vnp_TransactionNo
        });
      } else {
        setPaymentResult({
          success: false,
          message: 'Thanh toán VNPay thất bại',
          orderId: response.data.data.vnp_TxnRef,
          paymentMethod: 'VNPay',
          reason: response.data.data.vnp_ResponseCode,
          amount: response.data.data.vnp_Amount ? response.data.data.vnp_Amount / 100 : null
        });
      }
    } catch (error) {
      console.error('❌ VNPay result check error:', error);
      setPaymentResult({
        success: false,
        message: 'Không thể xác thực kết quả thanh toán VNPay',
        paymentMethod: 'VNPay',
        reason: 'verification_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleZaloPayResult = async (searchParams) => {
    try {
      const status = searchParams.get('status');
      
      if (Number(status) === 1) {
        setPaymentResult({
          success: true,
          message: 'Thanh toán ZaloPay thành công',
          orderId: searchParams.get('app_trans_id'),
          paymentMethod: 'ZaloPay',
          transactionId: searchParams.get('zp_trans_id')
        });
      } else {
        setPaymentResult({
          success: false,
          message: 'Khách hàng hủy thanh toán ZaloPay',
          orderId: searchParams.get('app_trans_id'),
          paymentMethod: 'ZaloPay',
          reason: 'user_cancelled'
        });
      }
    } catch (error) {
      console.error('❌ ZaloPay result check error:', error);
      setPaymentResult({
        success: false,
        message: 'Không thể xác thực kết quả thanh toán ZaloPay',
        paymentMethod: 'ZaloPay',
        reason: 'verification_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const getStatusIcon = () => {
    if (paymentResult?.success) {
      return <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />;
    } else {
      return <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />;
    }
  };

  const getStatusColor = () => {
    return paymentResult?.success ? 'success' : 'error';
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'vnpay':
      case 'VNPay':
        return 'VNPay';
      case 'zalopay':
      case 'ZaloPay':
        return 'ZaloPay';
      default:
        return method || 'Unknown';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" mt={2}>
            Đang kiểm tra kết quả thanh toán...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Lỗi
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {error}
          </Typography>
          <Button variant="contained" onClick={handleGoHome} startIcon={<HomeIcon />}>
            Về trang chủ
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" p={2}>
      <Paper sx={{ p: 4, maxWidth: 600, width: '100%' }}>
        <Box textAlign="center" mb={3}>
          {getStatusIcon()}
          <Typography variant="h4" color={getStatusColor()} gutterBottom>
            {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {paymentResult?.message}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Chi tiết giao dịch
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Phương thức thanh toán:</Typography>
              <Typography fontWeight="medium">
                {getPaymentMethodName(paymentResult?.paymentMethod)}
              </Typography>
            </Box>
            
            {paymentResult?.orderId && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Mã đơn hàng:</Typography>
                <Typography fontWeight="medium">#{paymentResult.orderId}</Typography>
              </Box>
            )}
            
            {paymentResult?.transactionId && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Mã giao dịch:</Typography>
                <Typography fontWeight="medium">{paymentResult.transactionId}</Typography>
              </Box>
            )}
            
            {paymentResult?.amount && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Số tiền:</Typography>
                <Typography fontWeight="medium">
                  {paymentResult.amount.toLocaleString()}₫
                </Typography>
              </Box>
            )}
            
            {paymentResult?.reason && !paymentResult?.success && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Lý do:</Typography>
                <Typography color="error" fontWeight="medium">
                  {paymentResult.reason}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {!paymentResult?.success && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Lưu ý</AlertTitle>
            Đơn hàng của bạn vẫn được tạo và đang chờ xử lý. 
            Vui lòng liên hệ với chúng tôi nếu bạn đã thanh toán thành công.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={handleGoHome}
            startIcon={<HomeIcon />}
          >
            Về trang chủ
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleGoToOrders}
            startIcon={<ShoppingCartIcon />}
          >
            Xem đơn hàng
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentResultPage; 