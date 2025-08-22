import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Button, 
  Box, 
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Rating
} from '@mui/material';
import { 
  ShoppingBag, 
  LocalShipping, 
  CheckCircle, 
  Cancel, 
  Schedule,
  Visibility,
  Star,
  Error,
  BugReport
} from '@mui/icons-material';
import { orderAPI, reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm';
import OrderTimeline from '../components/OrderTimeline';
import LoadingProgress from '../components/LoadingProgress';
import ErrorDisplay from '../components/ErrorDisplay';
import OrderCard from '../components/OrderCard';
import OrderDetails from '../components/OrderDetails';
import ImageWithFallback from '../components/ImageWithFallback';

import { useFormatters } from '../utils/formatters';
import styles from './OrderPage.module.scss';

const OrderPage = () => {
  // State declarations
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState('success');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Hooks
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useFormatters();

  // Helper functions
  const checkReviewStatus = async (orderId, productId, userId) => {
    try {
      const response = await reviewAPI.getUserProductReview(productId, userId, orderId);
      return response.data.success && response.data.data !== null;
    } catch {
      console.log('Product not reviewed yet:', productId);
      return false;
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      // ===== HỆ THỐNG TRẠNG THÁI MỚI =====
      'pending': {
        label: 'Chờ xử lý',
        color: 'warning',
        icon: <Schedule fontSize="small" />,
        canCancel: true,
        canPay: true,
        showReview: false,
        description: 'Đơn hàng mới được tạo, đang chờ xác nhận từ cửa hàng',
        timeline: 1
      },
      'confirmed': {
        label: 'Đã xác nhận',
        color: 'info',
        icon: <CheckCircle fontSize="small" />,
        canCancel: false,
        canPay: true,
        showReview: false,
        description: 'Đơn hàng đã được xác nhận, đang chuẩn bị hàng',
        timeline: 2
      },
      'shipping': {
        label: 'Đang giao hàng',
        color: 'primary',
        icon: <LocalShipping fontSize="small" />,
        canCancel: false,
        canPay: true,
        showReview: false,
        description: 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển',
        timeline: 3
      },
      'delivered': {
        label: 'Đã giao',
        color: 'success',
        icon: <CheckCircle fontSize="small" />,
        canCancel: false,
        canReview: true,
        description: 'Đơn hàng đã giao thành công',
        timeline: 4
      },
      'cancelled': {
        label: 'Đã hủy',
        color: 'error',
        icon: <Cancel fontSize="small" />,
        canCancel: false,
        description: 'Đơn hàng đã bị hủy'
      },

      // ===== HỆ THỐNG TRẠNG THÁI LEGACY (Hỗ trợ tương thích) =====
      'cho_xu_ly': {
        label: 'Chờ xử lý',
        color: 'warning',
        icon: <Schedule fontSize="small" />,
        canCancel: true,
        canPay: true,
        showReview: false,
        description: 'Đơn hàng mới được tạo, đang chờ xác nhận từ cửa hàng',
        timeline: 1
      },
      'da_xac_nhan': {
        label: 'Đã xác nhận',
        color: 'info',
        icon: <CheckCircle fontSize="small" />,
        canCancel: false,
        canPay: true,
        showReview: false,
        description: 'Đơn hàng đã được xác nhận, đang chuẩn bị hàng',
        timeline: 2
      },
      'dang_chuan_bi': {
        label: 'Đang chuẩn bị',
        color: 'info',
        icon: <LocalShipping fontSize="small" />,
        canCancel: false,
        canPay: true,
        showReview: false,
        description: 'Đơn hàng đang được chuẩn bị và đóng gói',
        timeline: 3
      },
      'dang_giao': {
        label: 'Đang giao',
        color: 'primary',
        icon: <LocalShipping fontSize="small" />,
        canCancel: false,
        canPay: true,
        showReview: false,
        description: 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển',
        timeline: 4
      },
      'da_giao': {
        label: 'Đã giao',
        color: 'success',
        icon: <CheckCircle fontSize="small" />,
        canCancel: false,
        canReview: true,
        description: 'Đơn hàng đã giao thành công'
      },
      'huy_boi_khach': {
        label: 'Đã hủy (Khách)',
        color: 'error',
        icon: <Cancel fontSize="small" />,
        canCancel: false,
        description: 'Bạn đã hủy đơn hàng này'
      },
      'huy_boi_admin': {
        label: 'Đã hủy (Admin)',
        color: 'error',
        icon: <Cancel fontSize="small" />,
        canCancel: false,
        description: 'Quản trị viên đã hủy đơn hàng này'
      },
      'khach_bom_hang': {
        label: 'Bị bom hàng',
        color: 'error',
        icon: <Error fontSize="small" />,
        canCancel: false,
        description: 'Đơn hàng bị bom hàng (khách từ chối nhận)'
      },
      'failed_delivery': {
        label: 'Giao hàng thất bại',
        color: 'error',
        icon: <Error fontSize="small" />,
        canCancel: false,
        description: 'Giao hàng thất bại'
      }
    };
    
    return statusMap[status] || {
      label: status || 'Không xác định',
      color: 'default',
      icon: <BugReport fontSize="small" />,
      canCancel: false,
      description: 'Trạng thái không xác định'
    };
  };

  // Hàm lấy thông tin trạng thái thanh toán với label tiếng Việt
  const getPaymentStatusLabel = (paymentStatus) => {
    const paymentStatusMap = {
      // Hệ thống trạng thái thanh toán mới
      'paid': 'Đã thanh toán',
      'unpaid': 'Chưa thanh toán',
      'pending': 'Đang xử lý',
      'failed': 'Thanh toán thất bại',
      'refunded': 'Đã hoàn tiền',
      'partial_refund': 'Hoàn tiền một phần',
      
      // Hệ thống legacy (hỗ trợ tương thích)
      'DA_THANH_TOAN': 'Đã thanh toán',
      'CHUA_THANH_TOAN': 'Chưa thanh toán',
      'DANG_XU_LY': 'Đang xử lý',
      'THAT_BAI': 'Thanh toán thất bại',
      'REFUND_SUCCESS': 'Đã hoàn tiền',
      'REFUND_FAILED': 'Hoàn tiền thất bại',
      'REFUND_PARTIAL': 'Hoàn tiền một phần',
      
      // Các trạng thái khác
      'COD_PENDING': 'Thanh toán khi nhận hàng',
      'COD_PAID': 'Đã thanh toán (COD)',
      'BANK_TRANSFER': 'Chuyển khoản ngân hàng',
      'CREDIT_CARD': 'Thẻ tín dụng',
      'E_WALLET': 'Ví điện tử'
    };
    
    return paymentStatusMap[paymentStatus] || paymentStatus || 'Chưa thanh toán';
  };

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id_NguoiDung || !isAuthenticated) {
        setError('Vui lòng đăng nhập để xem đơn hàng');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        console.log('🔄 Đang tải đơn hàng cho user:', user.id_NguoiDung);
        
        // Thêm timeout và retry logic - sửa lỗi Error constructor
        const response = await Promise.race([
          orderAPI.getUserOrders(user.id_NguoiDung),
          new Promise((_, reject) => 
            setTimeout(() => reject({ message: 'Request timeout' }), 10000)
          )
        ]);
        
        if (!response?.data) {
          throw { message: 'Không nhận được dữ liệu từ server' };
        }
        
        console.log('📦 Dữ liệu nhận được:', response.data);
        
        // Kiểm tra và xử lý dữ liệu
        let ordersData = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            ordersData = response.data.map(order => {
              console.log('Processing order:', order.id_DonHang, 'Details:', order.OrderDetails);
              
              // Kiểm tra trạng thái đánh giá cho từng sản phẩm trong đơn hàng
              return {
                ...order,
                OrderDetails: Array.isArray(order.OrderDetails) 
                  ? order.OrderDetails.map(detail => {
                      console.log('Processing detail:', detail);
                      console.log('🖼️ Image path for product:', detail.id_SanPham, ':', detail.hinhAnh);
                      return {
                        ...detail,
                        giaBan: Number(detail.giaBan || detail.giaSanPham) || 0,
                        soLuong: Number(detail.soLuongMua) || 1
                      };
                    })
                  : []
              };
            });
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Handle case where data is nested
            ordersData = response.data.data.map(order => {
              console.log('Processing nested order:', order.id_DonHang, 'Details:', order.OrderDetails);
              
              return {
                ...order,
                OrderDetails: Array.isArray(order.OrderDetails) 
                  ? order.OrderDetails.map(detail => {
                      console.log('Processing nested detail:', detail);
                      return {
                        ...detail,
                        giaBan: Number(detail.giaBan || detail.giaSanPham) || 0,
                        soLuong: Number(detail.soLuongMua) || 1
                      };
                    })
                  : []
              };
            });
          }
        }
        console.log('Processed orders:', ordersData); // Log để debug
        
        // Kiểm tra trạng thái đánh giá cho từng sản phẩm (chỉ khi có đơn hàng)
        if (ordersData.length > 0) {
          const ordersWithReviewStatus = await Promise.all(
            ordersData.map(async (order) => {
              if (order.trangThaiDonHang === 'da_giao' && order.OrderDetails) {
                const orderWithReviews = {
                  ...order,
                  OrderDetails: await Promise.all(
                    order.OrderDetails.map(async (item) => {
                      try {
                        const isReviewed = await checkReviewStatus(
                          order.id_DonHang, 
                          item.id_SanPham, 
                          user.id_NguoiDung
                        );
                        return { ...item, isReviewed };
                      } catch (reviewError) {
                        console.warn('Error checking review status:', reviewError);
                        return { ...item, isReviewed: false };
                      }
                    })
                  )
                };
                return orderWithReviews;
              }
              return order;
            })
          );
          setOrders(ordersWithReviewStatus);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('❌ Lỗi khi tải đơn hàng:', error);
        console.error('🔍 Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
        
        let errorMessage = 'Không thể tải danh sách đơn hàng';
        
        if (error.response) {
          console.error('🔍 Chi tiết lỗi:', error.response);
          
          // Handle specific error cases
          switch (error.response.status) {
            case 401:
              errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
              navigate('/login');
              break;
            case 403:
              errorMessage = 'Bạn không có quyền xem thông tin này';
              break;
            case 404:
              errorMessage = 'Không tìm thấy thông tin đơn hàng';
              break;
            case 500:
              errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
              // Log thêm thông tin cho lỗi 500
              console.error('🚨 Server Error Details:', {
                url: error.config?.url,
                method: error.config?.method,
                userId: user.id_NguoiDung,
                timestamp: new Date().toISOString()
              });
              break;
            default:
              errorMessage = error.response.data?.message || errorMessage;
          }
        } else if (error.message === 'Request timeout') {
          errorMessage = 'Yêu cầu tải đơn hàng bị timeout, vui lòng thử lại';
        }
        
        setError(errorMessage);
        
        // Show notification for network errors
        if (!error.response && error.message === 'Network Error') {
          setNotificationMessage('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
          setNotificationSeverity('error');
          setShowNotification(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.id_NguoiDung) {
      fetchOrders();
    }
  }, [user?.id_NguoiDung, isAuthenticated, navigate]);

  // Handle view order details
  const handleViewDetails = (order) => {
    console.log('🔍 Order details for modal:', order);
    console.log('📦 Shipping info:', {
      tenNguoiNhan: order.tenNguoiNhan,
      soDienThoai: order.soDienThoai,
      diaChiGiaoHang: order.diaChiGiaoHang,
      ghiChu: order.ghiChu
    });
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Handle cancel order
  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setShowCancelDialog(true);
  };

  // Confirm order cancellation
  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      setCancelLoading(true);
      const response = await orderAPI.cancel(orderToCancel.id_DonHang);
      
      if (response.data.success) {
        const ordersResponse = await orderAPI.getUserOrders(user.id_NguoiDung);
        const ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        setOrders(ordersData);
        
        setShowCancelDialog(false);
        setOrderToCancel(null);
        setNotificationMessage('Đã hủy đơn hàng thành công');
        setNotificationSeverity('success');
        setShowNotification(true);
      } else {
        setNotificationMessage(response.data.message);
        setNotificationSeverity('error');
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      setNotificationMessage(
        error.response?.data?.message || 
        'Không thể hủy đơn hàng. Vui lòng thử lại sau.'
      );
      setNotificationSeverity('error');
      setShowNotification(true);
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle review product
  const handleReviewProduct = (product, orderId) => {
    setSelectedProduct({
      ...product,
      orderId: orderId,
      id_SanPham: product.id_SanPham || 1
    });
    setShowReviewForm(true);
  };

  // Handle close review form
  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setSelectedProduct(null);
  };

  // Handle review submitted
  const handleReviewSubmitted = async () => {
    try {
      if (!selectedProduct || !user?.id_NguoiDung) {
        throw new Error('Thiếu thông tin cần thiết để đánh giá');
      }

      // Refresh lại trạng thái đánh giá từ server
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          if (order.id_DonHang === selectedProduct.orderId && order.trangThaiDonHang === 'da_giao') {
            const orderWithReviews = {
              ...order,
              OrderDetails: await Promise.all(
                order.OrderDetails.map(async (item) => {
                  const isReviewed = await checkReviewStatus(
                    order.id_DonHang, 
                    item.id_SanPham, 
                    user.id_NguoiDung
                  );
                  return { ...item, isReviewed };
                })
              )
            };
            return orderWithReviews;
          }
          return order;
        })
      );
      
      setOrders(updatedOrders);
      setShowReviewForm(false);
      setSelectedProduct(null);
      setNotificationMessage('Cảm ơn bạn đã đánh giá sản phẩm! Đánh giá của bạn đã được ghi nhận.');
      setNotificationSeverity('success');
      setShowNotification(true);
    } catch (error) {
      console.error('Error updating review status:', error);
      setNotificationMessage(error.message || 'Có lỗi xảy ra khi cập nhật đánh giá');
      setNotificationSeverity('error');
      setShowNotification(true);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className={styles.loadingState}>
        <CircularProgress size={40} className={styles.spinner} />
        <Typography variant="h6" className={styles.loadingText}>
          Đang tải đơn hàng...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className={styles.errorState}>
        <Error className={styles.errorIcon} />
        <Typography variant="h6" className={styles.errorMessage}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Thử lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity={notificationSeverity}
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      <Box className={styles.header}>
        <Typography 
          variant="h4" 
          component="h1" 
          className={styles.title}
        >
          <ShoppingBag className={styles.icon} />
          Đơn hàng của tôi
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Paper className={styles.emptyState}>
          <ShoppingBag className={styles.icon} />
          <Typography variant="h6" className={styles.title}>
            Bạn chưa có đơn hàng nào
          </Typography>
          <Typography variant="body1" className={styles.description}>
            Hãy bắt đầu mua sắm để xem đơn hàng của bạn ở đây
          </Typography>
          <Button 
            variant="contained" 
            className={styles.actionButton}
            onClick={() => navigate('/products')}
          >
            Bắt đầu mua sắm
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.trangThaiDonHang);
            
            return (
              <Grid item xs={12} key={order.id_DonHang}>
                <Card className={styles.orderCard}>
                  <CardContent>
                    <Box className={styles.cardHeader}>
                      <Box className={styles.orderInfo}>
                        <Typography variant="h6" className={styles.orderNumber}>
                          Đơn hàng #{order.maDonHang || order.id_DonHang}
                        </Typography>
                        <Typography variant="body2" className={styles.orderDate}>
                          Ngày đặt: {formatDate(order.ngayDatHang)}
                        </Typography>
                      </Box>
                      <Chip 
                        label={statusInfo.label}
                        color={statusInfo.color}
                        icon={statusInfo.icon}
                        className={`${styles.statusChip} ${styles[statusInfo.color]}`}
                      />
                    </Box>

                    <Box className={styles.cardContent}>
                      <List className={styles.productList}>
                        {order.OrderDetails?.map((item, index) => (
                          <ListItem key={index} className={styles.productItem}>
                            <ListItemAvatar>
                              <ImageWithFallback 
                                src={item.sanPham?.hinhAnh || item.hinhAnh}
                                alt={item.sanPham?.tenSp || item.tenSp || 'Product image'}
                                showLogs={true}
                                className={styles.productImage}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={item.sanPham?.tenSp || item.tenSp || 'Không có tên sản phẩm'}
                              className={styles.productInfo}
                              secondary={
                                <Box className={styles.productDetails}>
                                  <Typography variant="body2" className={styles.detail}>
                                    <span className={styles.label}>Đơn giá:</span>
                                    <span className={styles.value}> {formatCurrency(Number(item.giaBan))}</span>
                                  </Typography>
                                  <Typography variant="body2" className={styles.detail}>
                                    <span className={styles.label}>Số lượng:</span>
                                    <span className={styles.value}> {Number(item.soLuong)}</span>
                                  </Typography>
                                  <Typography variant="body2" className={styles.detail}>
                                    <span className={styles.label}>Thành tiền:</span>
                                    <span className={styles.value}> {formatCurrency(Number(item.thanhTien))}</span>
                                  </Typography>
                                </Box>
                              }
                            />
                            {statusInfo.canReview && !item.isReviewed && (
                              <Box className={styles.productActions}>
                                <Button
                                  variant="outlined"
                                  startIcon={<Star />}
                                  onClick={() => handleReviewProduct(item, order.id_DonHang)}
                                  className={styles.reviewButton}
                                >
                                  Đánh giá
                                </Button>
                              </Box>
                            )}
                          </ListItem>
                        ))}
                      </List>

                      <Box className={styles.orderSummary}>
                        <Box className={styles.summaryHeader}>
                          <Typography variant="h6" className={styles.totalLabel}>
                            Tổng tiền:
                          </Typography>
                          <Typography variant="h6" className={styles.totalAmount}>
                            {formatCurrency(order.tongThanhToan)}
                          </Typography>
                        </Box>
                        <Box className={styles.actionButtons}>
                          <Button
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewDetails(order)}
                            className={`${styles.actionButton} ${styles.secondary}`}
                          >
                            Chi tiết
                          </Button>
                          {statusInfo.canCancel && (
                            <Button
                              variant="outlined"
                              startIcon={<Cancel />}
                              onClick={() => handleCancelOrder(order)}
                              className={`${styles.actionButton} ${styles.danger}`}
                            >
                              Hủy đơn
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
      >
        <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn hủy đơn hàng này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowCancelDialog(false)}
          >
            Không
          </Button>
          <Button 
            onClick={confirmCancelOrder}
            color="error"
            variant="contained"
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        maxWidth="md"
        fullWidth
        className={styles.dialog}
      >
        <DialogTitle className={styles.dialogTitle}>
          Chi tiết đơn hàng #{selectedOrder?.maDonHang || selectedOrder?.id_DonHang}
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          {selectedOrder && (
            <>
              <Grid container spacing={2} className={styles.infoGrid}>
                <Grid item xs={12} md={6} className={styles.infoSection}>
                  <Typography variant="subtitle1" className={styles.sectionTitle}>
                    Thông tin đơn hàng
                  </Typography>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Trạng thái:</span>
                    <Chip 
                      size="small"
                      label={getStatusInfo(selectedOrder.trangThaiDonHang).label}
                      color={getStatusInfo(selectedOrder.trangThaiDonHang).color}
                      icon={getStatusInfo(selectedOrder.trangThaiDonHang).icon}
                    />
                  </Box>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Ngày đặt:</span>
                    <span className={styles.value}>{formatDate(selectedOrder.ngayDatHang)}</span>
                  </Box>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Phương thức thanh toán:</span>
                    <span className={styles.value}>{selectedOrder.phuongThucThanhToan || 'Chưa chọn'}</span>
                  </Box>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Trạng thái thanh toán:</span>
                    <span className={styles.value}>{getPaymentStatusLabel(selectedOrder.trangThaiThanhToan)}</span>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} className={styles.infoSection}>
                  <Typography variant="subtitle1" className={styles.sectionTitle}>
                    Thông tin giao hàng
                  </Typography>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Người nhận:</span>
                    <span className={styles.value}>
                      {selectedOrder.tenNguoiNhan && selectedOrder.tenNguoiNhan.trim() 
                        ? selectedOrder.tenNguoiNhan 
                        : 'Chưa có thông tin'}
                    </span>
                  </Box>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Số điện thoại:</span>
                    <span className={styles.value}>
                      {selectedOrder.soDienThoai && selectedOrder.soDienThoai.trim() 
                        ? selectedOrder.soDienThoai 
                        : 'Chưa có thông tin'}
                    </span>
                  </Box>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Địa chỉ:</span>
                    <span className={styles.value}>
                      {selectedOrder.diaChiGiaoHang && selectedOrder.diaChiGiaoHang.trim() 
                        ? selectedOrder.diaChiGiaoHang 
                        : 'Chưa có thông tin'}
                    </span>
                  </Box>
                  <Box className={styles.infoItem}>
                    <span className={styles.label}>Ghi chú:</span>
                    <span className={styles.value}>
                      {selectedOrder.ghiChu && selectedOrder.ghiChu.trim() 
                        ? selectedOrder.ghiChu 
                        : 'Không có'}
                    </span>
                  </Box>
                </Grid>
              </Grid>

              <Divider className={styles.mb3} />

              <List className={styles.productList}>
                {selectedOrder.OrderDetails?.map((item, index) => (
                  <ListItem key={index} className={styles.productItem}>
                    <ListItemAvatar>
                      <ImageWithFallback 
                        src={item.sanPham?.hinhAnh || item.hinhAnh}
                        alt={item.sanPham?.tenSp || item.tenSp || 'Product image'}
                        showLogs={true}
                        className={styles.productImage}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.tenSp}
                      className={styles.productInfo}
                      secondary={
                        <Box className={styles.productDetails}>
                          <Typography variant="body2" className={styles.detail}>
                            <span className={styles.label}>Đơn giá:</span>
                            <span className={styles.value}> {formatCurrency(item.giaBan)}</span>
                          </Typography>
                          <Typography variant="body2" className={styles.detail}>
                            <span className={styles.label}>Số lượng:</span>
                            <span className={styles.value}> {item.soLuong}</span>
                          </Typography>
                          <Typography variant="body2" className={styles.detail}>
                            <span className={styles.label}>Thành tiền:</span>
                            <span className={styles.value}> {formatCurrency(item.giaBan * item.soLuong)}</span>
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider className={styles.mb3} />

              <Box className={styles.mb3}>
                <Typography variant="subtitle1" className={styles.sectionTitle}>
                  Trạng thái đơn hàng
                </Typography>
                <OrderTimeline status={selectedOrder.trangThaiDonHang} />
              </Box>

              <Box className={styles.orderSummary}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1" className={styles.detail}>
                      <span className={styles.label}>Tạm tính:</span>
                      <span className={styles.value}> {formatCurrency(selectedOrder.OrderDetails?.reduce((acc, item) => 
                        acc + (Number(item.giaBan) * Number(item.soLuong)), 0) || 0)}</span>
                    </Typography>
                    {selectedOrder.giamGia > 0 && (
                      <Typography variant="body1" className={styles.detail}>
                        <span className={styles.label}>Giảm giá:</span>
                        <span className={styles.value}> -{formatCurrency(selectedOrder.giamGia)}</span>
                      </Typography>
                    )}
                    {selectedOrder.phiVanChuyen > 0 && (
                      <Typography variant="body1" className={styles.detail}>
                        <span className={styles.label}>Phí vận chuyển:</span>
                        <span className={styles.value}> +{formatCurrency(selectedOrder.phiVanChuyen)}</span>
                      </Typography>
                    )}
                    <Divider className={styles.mt1} />
                    <Typography variant="h6" className={styles.totalAmount}>
                      Tổng cộng: {formatCurrency(
                        (selectedOrder.OrderDetails?.reduce((acc, item) => 
                          acc + (Number(item.giaBan) * Number(item.soLuong)), 0) || 0)
                        - (Number(selectedOrder.giamGia) || 0)
                        + (Number(selectedOrder.phiVanChuyen) || 0)
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {selectedOrder.ghiChu && (
                <>
                  <Divider className={styles.mt3} />
                  <Typography variant="subtitle1" className={styles.sectionTitle}>
                    Ghi chú:
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.ghiChu}
                  </Typography>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowOrderDetail(false)}
            className={`${styles.actionButton} ${styles.secondary}`}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {selectedProduct && (
        <ReviewForm
          open={showReviewForm}
          onClose={handleCloseReviewForm}
          productId={selectedProduct.id_SanPham}
          productName={selectedProduct.tenSp}
          userHasPurchased={true}
          onReviewSubmitted={handleReviewSubmitted}
          orderId={selectedProduct.orderId}
          userId={user?.id_NguoiDung}
          isOrderReview={true}
        />
      )}
    </Container>
  );
};

export default OrderPage;
