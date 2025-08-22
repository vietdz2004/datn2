import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
  Fade,
  Grow,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Phone,
  Email,
  LocationOn,
  Schedule,
  LocalShipping,
  Inventory,
  Done,
  Notifications,
  NotificationsActive,
  Timeline as TimelineIcon,
  Celebration,
  Cancel,
  Error
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import styles from './OrderSuccessPage.module.scss';
import api from '../services/api';

// Animation keyframes
const confettiAnimation = keyframes`
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  // State for order data and loading
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for animations and notifications
  const [showConfetti, setShowConfetti] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [orderStatus, setOrderStatus] = useState('CHO_XAC_NHAN');

  // Order status steps - Cập nhật theo logic mới
  const orderSteps = [
    {
      status: 'cho_xu_ly',
      label: 'Chờ xử lý',
      icon: <Schedule />, color: 'info',
      description: 'Đơn hàng mới tạo, chờ admin xác nhận'
    },
    {
      status: 'da_xac_nhan',
      label: 'Đã xác nhận',
      icon: <CheckCircle />, color: 'primary',
      description: 'Đơn đã được admin xác nhận'
    },
    {
      status: 'dang_chuan_bi',
      label: 'Đang chuẩn bị',
      icon: <LocalShipping />, color: 'primary',
      description: 'Đơn đang được đóng gói, chờ giao'
    },
    {
      status: 'dang_giao',
      label: 'Đang giao',
      icon: <LocalShipping />, color: 'info',
      description: 'Đơn đang được vận chuyển đến bạn'
    },
    {
      status: 'da_giao',
      label: 'Đã giao',
      icon: <CheckCircle />, color: 'success',
      description: 'Đơn đã giao thành công'
    },
    {
      status: 'huy_boi_khach',
      label: 'Đã huỷ (Khách)',
      icon: <Cancel />, color: 'error',
      description: 'Bạn đã huỷ đơn này'
    },
    {
      status: 'huy_boi_admin',
      label: 'Đã huỷ (Admin)',
      icon: <Cancel />, color: 'error',
      description: 'Admin đã huỷ đơn này'
    },
    {
      status: 'khach_bom_hang',
      label: 'Bị bom hàng',
      icon: <Error />, color: 'error',
      description: 'Đơn bị bom hàng (khách từ chối nhận)'
    },
  ];

  // Fetch real order data from API
  useEffect(() => {
    const fetchOrderData = async () => {
      // If no orderId, show demo data
      if (!orderId) {
        setOrderData({
          id_DonHang: 'DEMO12345',
          tongThanhToan: 850000,
          phuongThucThanhToan: 'COD',
          hoTen: 'Nguyễn Văn A',
          soDienThoai: '0123456789',
          email: 'nguyenvana@email.com',
          diaChiGiao: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
          ngayDatHang: new Date().toISOString(),
          trangThaiDonHang: 'confirmed',
          ghiChu: 'Giao hàng giờ hành chính'
        });
        setLoading(false);
        
        // Hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching order data for ID:', orderId);
        
        const response = await api.get(`/orders/${orderId}`);
        console.log('✅ Order data response:', response.data);
        
        if (response.data.success && response.data.data) {
          console.log('📋 Full order data received:', response.data.data);
          setOrderData(response.data.data);
          setOrderStatus(response.data.data.trangThaiDonHang || 'CHO_XAC_NHAN');
          
          // Hide confetti after 3 seconds
          setTimeout(() => {
            setShowConfetti(false);
          }, 3000);
        } else {
          throw new Error('Không thể tải thông tin đơn hàng');
        }
      } catch (err) {
        console.error('❌ Error fetching order:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Request notification permission
  const handleNotificationToggle = async (event) => {
    const enabled = event.target.checked;
    
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('🎉 Thông báo đã được bật!', {
          body: 'Bạn sẽ nhận được thông báo khi đơn hàng có cập nhật.',
          icon: '/favicon.ico'
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '0đ';
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  const getStatusColor = (status) => {
    const step = orderSteps.find(s => s.status === status);
    return step?.color || 'default';
  };

  const getCurrentStepIndex = () => {
    return orderSteps.findIndex(step => step.status === orderStatus);
  };

  // Don't render if no order data and not in demo mode
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Đang tải dữ liệu đơn hàng...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!orderData) {
    return null; // Should not happen if loading and error are handled
  }

  // Confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => (
    <Box
      key={i}
      sx={{
        position: 'fixed',
        top: '-10px',
        left: `${Math.random() * 100}%`,
        width: '10px',
        height: '10px',
        backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)],
        animation: `${confettiAnimation} ${2 + Math.random() * 3}s linear infinite`,
        animationDelay: `${Math.random() * 3}s`,
        zIndex: 1000,
        borderRadius: '50%'
      }}
    />
  ));

  return (
    <Box className={styles.successPage} sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Confetti Effect */}
      {showConfetti && confettiParticles}

      {/* Demo Mode Banner */}
      {!orderId && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bgcolor: 'warning.main', 
          color: 'white', 
          p: 1, 
          textAlign: 'center', 
          zIndex: 2000,
          fontWeight: 'bold'
        }}>
          🎭 CHẾĐỘ DEMO - Dữ liệu mẫu để xem trước giao diện
        </Box>
      )}

      <Paper elevation={3} className={styles.successPaper} sx={{ position: 'relative', zIndex: 1, mt: !orderId ? 6 : 0 }}>
        {/* Success Header with Animation */}
        <Zoom in={true} timeout={1000}>
          <Box className={styles.successHeader} sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              animation: `${bounceAnimation} 2s ease-in-out infinite`,
              display: 'inline-block'
            }}>
              <CheckCircle 
                sx={{ 
                  fontSize: 80, 
                  color: 'success.main',
                  filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))'
                }} 
              />
            </Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              color: 'success.main',
              mt: 2,
              mb: 1,
              animation: `${pulseAnimation} 2s ease-in-out infinite`
            }}>
              🎉 Cảm ơn bạn đã đặt hàng!
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
              Đơn hàng của bạn đã được ghi nhận thành công.
            </Typography>
            
            {/* Order ID Badge */}
            <Chip 
              label={`Mã đơn hàng: #${orderData.id_DonHang}`}
              color="primary"
              size="large"
              sx={{ fontSize: '1.1rem', px: 2, py: 1 }}
            />
          </Box>
        </Zoom>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4}>
          {/* Left Column - Order Information */}
          <Grid item xs={12} lg={6}>
            <Fade in={true} timeout={1500}>
              <Box>
                {/* Basic Order Info */}
                <Card elevation={2} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShoppingBag color="primary" />
                      Thông tin đơn hàng cơ bản
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">Tổng tiền:</Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {formatPrice(orderData.tongThanhToan)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">Phương thức thanh toán:</Typography>
                      <Typography>
                        {orderData.phuongThucThanhToan === 'COD' ? '💵 COD' :
                         orderData.phuongThucThanhToan === 'VNPay' ? '💳 VNPay' : 
                         orderData.phuongThucThanhToan === 'ZaloPay' ? '📱 ZaloPay' :
                         orderData.phuongThucThanhToan}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Thời gian đặt:</Typography>
                      <Typography>
                        {new Date(orderData.ngayDatHang || Date.now()).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="primary" />
                      Thông tin giao hàng
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <Phone />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={orderData.hoTen || orderData.customerName || 'Không có'}
                          secondary={orderData.soDienThoai || orderData.customerPhone || 'Không có'}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light' }}>
                            <Email />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Email"
                          secondary={orderData.email || orderData.customerEmail || 'Không có'}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light' }}>
                            <LocationOn />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Địa chỉ giao hàng"
                          secondary={orderData.diaChiGiao || orderData.customerAddress || 'Không có'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          </Grid>

          {/* Right Column - Order Status & Timeline */}
          <Grid item xs={12} lg={6}>
            <Grow in={true} timeout={2000}>
              <Box>
                {/* Current Status */}
                <Card elevation={2} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon color="primary" />
                      Trạng thái đơn hàng ban đầu
                    </Typography>
                    
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Chip 
                        label={orderSteps.find(s => s.status === orderStatus)?.label || orderStatus}
                        color={getStatusColor(orderStatus)}
                        size="large"
                        icon={orderSteps.find(s => s.status === orderStatus)?.icon}
                        sx={{ fontSize: '1rem', px: 2, py: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {orderSteps.find(s => s.status === orderStatus)?.description}
                      </Typography>
                    </Box>
                    
                    {/* Status Stepper instead of Timeline */}
                    <Stepper activeStep={getCurrentStepIndex()} orientation="vertical">
                      {orderSteps.map((step, index) => (
                        <Step key={step.status}>
                          <StepLabel 
                            icon={
                              <Avatar 
                                sx={{ 
                                  bgcolor: getCurrentStepIndex() >= index ? `${step.color}.main` : 'grey.300',
                                  width: 40, 
                                  height: 40 
                                }}
                              >
                                {step.icon}
                              </Avatar>
                            }
                          >
                            <Box>
                              <Typography 
                                variant="body1" 
                                fontWeight={getCurrentStepIndex() >= index ? 'bold' : 'normal'}
                                color={getCurrentStepIndex() >= index ? 'primary' : 'text.secondary'}
                              >
                                {step.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {step.description}
                              </Typography>
                            </Box>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Notifications color="primary" />
                      Tùy chọn tiếp theo cho khách hàng
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationsEnabled}
                          onChange={handleNotificationToggle}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <NotificationsActive />
                          <Typography>Đăng ký thông báo khi đơn hàng giao/đổi trạng thái</Typography>
                        </Box>
                      }
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                      Nhận thông báo ngay khi đơn hàng có cập nhật trạng thái
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        startIcon={<Home />}
                        onClick={() => navigate('/')}
                        sx={{ flex: 1, minWidth: '200px' }}
                      >
                        Về trang chủ
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<ShoppingBag />}
                        onClick={() => navigate('/orders')}
                        sx={{ flex: 1, minWidth: '200px' }}
                      >
                        Xem đơn hàng
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grow>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default OrderSuccessPage; 