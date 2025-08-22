import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Avatar,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VoucherInput from '../components/VoucherInput';
import styles from './CartPage.module.scss';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const getImageUrl = (hinhAnh) => {
  if (!hinhAnh) return '/no-image.png';
  if (hinhAnh.startsWith('http')) return hinhAnh;
  if (hinhAnh.startsWith('/')) return `http://localhost:5002${hinhAnh}`;
  return `http://localhost:5002/images/products/${hinhAnh}`;
};

const CartPage = () => {
  const {
    cartItems,
    getTotalItems,
    getTotalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    voucher,
    applyVoucher,
    removeVoucher
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // UI state
  const [confirmClear, setConfirmClear] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tính toán tổng tiền cuối cùng
  const finalTotal = voucher ? voucher.calculation.finalTotal : getTotalPrice();

  // Tự động xóa voucher nếu không đủ điều kiện
  React.useEffect(() => {
    if (voucher && finalTotal + voucher.calculation.discountAmount < (voucher.voucher?.dieuKienApDung ? JSON.parse(voucher.voucher.dieuKienApDung).minOrderTotal || 0 : 0)) {
      removeVoucher();
      setSnackbar({ open: true, message: 'Voucher đã bị xóa do không còn đủ điều kiện!', severity: 'warning' });
    }
    // eslint-disable-next-line
  }, [cartItems, getTotalPrice()]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: '/checkout',
          message: 'Vui lòng đăng nhập để tiếp tục thanh toán'
        }
      });
      return;
    }
    navigate('/checkout');
  };

  // Xử lý khi voucher được áp dụng
  const handleVoucherApplied = (voucherData) => {
    applyVoucher(voucherData);
    setSnackbar({ open: true, message: 'Áp dụng voucher thành công!', severity: 'success' });
  };

  // Xử lý khi voucher bị xóa
  const handleVoucherRemoved = () => {
    removeVoucher();
    setSnackbar({ open: true, message: 'Đã xóa voucher.', severity: 'info' });
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" className={styles.cartContainer}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm!
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/products')}
            startIcon={<BackIcon />}
            className={styles.cartBackBtn}
          >
            Tiếp tục mua sắm
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.cartContainer}>
      <Box className={styles.cartHeader}>
        <Typography className={styles.cartTitle}>
          <CartIcon color="primary" sx={{ fontSize: 32 }} />
          Giỏ hàng ({getTotalItems()} sản phẩm)
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/products')}
          className={styles.cartBackBtn}
        >
          Tiếp tục mua sắm
        </Button>
      </Box>

      <div className={styles.cartGrid}>
        {/* Cart Items */}
        <div className={styles.cartItems}>
          <div className={styles.cartCard}>
            {cartItems.map((item, index) => (
              <div key={item.id_SanPham} className={styles.cartProductRow}>
                <img
                  src={getImageUrl(item.hinhAnh)}
                  alt={item.tenSp}
                  className={styles.cartProductImage}
                />
                <div className={styles.cartProductInfo}>
                  <div className={styles.cartProductName}>{item.tenSp}</div>
                  <div className={styles.cartProductBrand}>{item.thuongHieu}</div>
                  <div>
                    {item.giaKhuyenMai ? (
                      <>
                        <span className={styles.cartProductPrice}>{formatPrice(item.giaKhuyenMai)}</span>
                        <span className={styles.cartProductOldPrice}>{formatPrice(item.gia)}</span>
                      </>
                    ) : (
                      <span className={styles.cartProductPrice}>{formatPrice(item.gia)}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cartQuantityBox}>
                  <IconButton size="small" onClick={() => handleQuantityChange(item.id_SanPham, item.soLuong - 1)}>
                    <RemoveIcon />
                  </IconButton>
                  <span>{item.soLuong}</span>
                  <IconButton size="small" onClick={() => handleQuantityChange(item.id_SanPham, item.soLuong + 1)}>
                    <AddIcon />
                  </IconButton>
                </div>
                <div className={styles.cartSubtotal}>{formatPrice((item.giaKhuyenMai || item.gia) * item.soLuong)}</div>
                <IconButton 
                  size="small" 
                  className={styles.cartRemoveBtn}
                  onClick={() => removeFromCart(item.id_SanPham)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => setConfirmClear(true)}
              startIcon={<DeleteIcon />}
              className={styles.cartClearBtn}
            >
              Xóa tất cả
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className={styles.cartSummary}>
          <div className={styles.cartSummaryCard}>
            <div className={styles.cartSummaryTitle}>Tóm tắt đơn hàng</div>
            <div className={styles.cartSummaryRow}>
              <span>Số lượng sản phẩm:</span>
              <span>{getTotalItems()} sản phẩm</span>
            </div>
            <div className={styles.cartSummaryRow}>
              <span>Tạm tính:</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <Divider sx={{ my: 2 }} />
            <div className={styles.cartVoucherBox}>
              <VoucherInput
                onVoucherApplied={handleVoucherApplied}
                onVoucherRemoved={handleVoucherRemoved}
                orderTotal={getTotalPrice()}
                userId={user?.id_NguoiDung}
                productIds={cartItems.map(item => item.id_SanPham)}
                appliedVoucher={voucher}
              />
            </div>
            <Divider sx={{ my: 2 }} />
            <div className={styles.cartSummaryRow}>
              <span className={styles.cartSummaryTotal}>Tổng cộng:</span>
              <span className={styles.cartSummaryTotal}>{formatPrice(finalTotal)}</span>
            </div>
            {voucher && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Tiết kiệm: {formatPrice(voucher.calculation.discountAmount)}
                </Typography>
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleCheckout}
              className={styles.cartCheckoutBtn}
              disabled={cartItems.length === 0 || finalTotal <= 0}
            >
              Thanh toán
            </Button>
            <Alert severity="info" sx={{ mt: 2 }}>
              Miễn phí vận chuyển cho đơn hàng trên 500.000đ
            </Alert>
          </div>
        </div>
      </div>

      {/* Xác nhận xóa tất cả */}
      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>Xác nhận xóa tất cả sản phẩm?</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Hủy</Button>
          <Button color="error" onClick={() => { clearCart(); setConfirmClear(false); setSnackbar({ open: true, message: 'Đã xóa toàn bộ giỏ hàng.', severity: 'info' }); }}>Xóa tất cả</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default CartPage; 