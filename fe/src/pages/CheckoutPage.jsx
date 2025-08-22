import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button, Typography, Box, Paper, TextField, RadioGroup, FormControlLabel, Radio, CircularProgress, Divider } from '@mui/material';
import { CartContext } from '../contexts/CartContext';
import AuthContext from '../contexts/AuthContext';
import VoucherInput from '../components/VoucherInput';
import api from '../services/api';

const steps = ['Thông tin khách hàng', 'Địa chỉ giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

const initialCustomerInfo = {
  name: '',
  phone: '',
  email: '',
};
const initialShipping = {
  address: '',
  note: '',
};

const CheckoutPage = () => {
  const { cartItems, totalAmount, clearCart, voucher, applyVoucher, removeVoucher } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState(initialCustomerInfo);
  const [shipping, setShipping] = useState(initialShipping);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user info when component mounts or user changes
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.hoTen || user.ten || '',
        phone: user.soDienThoai || '',
        email: user.email || '',
      });
      setShipping({
        address: user.diaChi || '',
        note: '',
      });
    }
  }, [user]);

  // Tính toán tổng tiền cuối cùng
  const finalTotal = voucher ? voucher.calculation.finalTotal : totalAmount;

  // Xử lý khi voucher được áp dụng
  const handleVoucherApplied = (voucherData) => {
    applyVoucher(voucherData);
  };

  // Xử lý khi voucher bị xóa
  const handleVoucherRemoved = () => {
    removeVoucher();
  };

  // Validate từng bước
  const validateStep = () => {
    if (activeStep === 0) {
      if (!customerInfo.name || !customerInfo.phone) return 'Vui lòng nhập họ tên và số điện thoại.';
    }
    if (activeStep === 1) {
      if (!shipping.address) return 'Vui lòng nhập địa chỉ giao hàng.';
    }
    if (activeStep === 2) {
      if (!paymentMethod) return 'Vui lòng chọn phương thức thanh toán.';
    }
    if (activeStep === 3) {
      if (
        !customerInfo.name?.trim() || customerInfo.name.trim().length < 2 ||
        !customerInfo.phone?.trim() || customerInfo.phone.trim().length < 8 ||
        !shipping.address?.trim() || shipping.address.trim().length < 5 ||
        !paymentMethod?.trim()
      ) {
        return 'Vui lòng nhập đầy đủ và hợp lệ họ tên (tối thiểu 2 ký tự), số điện thoại (tối thiểu 8 số), địa chỉ giao hàng (tối thiểu 5 ký tự), phương thức thanh toán!';
      }
      if (
        !cartItems ||
        !Array.isArray(cartItems) ||
        cartItems.length === 0 ||
        !cartItems.every(item => item.id_SanPham && ((item.soLuong || item.quantity) && item.gia))
      ) {
        return 'Giỏ hàng trống hoặc không hợp lệ';
      }
    }
    return '';
  };

  const handleNext = async () => {
    setError('');
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    if (activeStep === steps.length - 1) {
      // Đặt hàng
      setLoading(true);
      try {
        // Format cartItems data để match backend expectation
        const formattedCartItems = cartItems.map(item => ({
          id_SanPham: item.id_SanPham,
          soLuongMua: item.quantity || item.soLuong || 1, // Sửa từ soLuong thành soLuongMua
          gia: item.giaKhuyenMai || item.gia,
          giaTaiThoiDiem: item.giaKhuyenMai || item.gia,
          tenSp: item.tenSp || 'Sản phẩm'
        }));

        console.log('📦 Creating order with data:', {
          hoTen: customerInfo.name,
          soDienThoai: customerInfo.phone,
          email: customerInfo.email,
          diaChiGiao: shipping.address,
          ghiChu: shipping.note,
          phuongThucThanhToan: paymentMethod,
          sanPham: formattedCartItems,
          tongThanhToan: finalTotal,
          id_NguoiDung: user?.id_NguoiDung,
          maVoucher: voucher?.voucher?.maVoucher
        });

        // 1. Tạo đơn hàng
        const orderRes = await api.post('/orders', {
          hoTen: customerInfo.name,
          soDienThoai: customerInfo.phone,
          email: customerInfo.email,
          diaChiGiao: shipping.address,
          ghiChu: shipping.note,
          phuongThucThanhToan: paymentMethod,
          sanPham: formattedCartItems,
          tongThanhToan: finalTotal,
          id_NguoiDung: user?.id_NguoiDung,
          maVoucher: voucher?.voucher?.maVoucher
        });
        
        if (!orderRes.data?.success) {
          throw new Error('API không trả về success=true: ' + JSON.stringify(orderRes.data));
        }
        
        if (!orderRes.data?.data?.id_DonHang) {
          throw new Error('API không trả về id_DonHang: ' + JSON.stringify(orderRes.data));
        }
        
        const order = orderRes.data.data;
        console.log('✅ Order created with ID:', order.id_DonHang);
        
        // 2. Xử lý thanh toán theo phương thức đã chọn
        if (paymentMethod === 'VNPay') {
          await handleVNPayPayment(order, finalTotal);
        } else if (paymentMethod === 'ZaloPay') {
          await handleZaloPayPayment(order, finalTotal);
        } else {
          // 3. Thanh toán COD: chuyển sang trang thành công
          console.log('✅ COD order completed, clearing cart and redirecting...');
          clearCart();
          navigate(`/order-success/${order.id_DonHang}`);
        }
      } catch (e) {
        console.error('❌ Checkout error:', e);
        
        // Xử lý lỗi chi tiết hơn
        let errorMessage = 'Có lỗi xảy ra khi đặt hàng.';
        
        if (e.response?.data) {
          const errorData = e.response.data;
          
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          // Xử lý các trường hợp lỗi cụ thể
          if (errorData.missingFields) {
            const missingFields = Object.keys(errorData.missingFields).filter(field => errorData.missingFields[field]);
            if (missingFields.length > 0) {
              errorMessage = `Thiếu thông tin: ${missingFields.join(', ')}`;
            }
          }
          
          if (errorData.invalidItem) {
            errorMessage += ` - Sản phẩm không hợp lệ: ${JSON.stringify(errorData.invalidItem)}`;
          }
          
          console.log('📋 Error details:', errorData);
        } else if (e.message) {
          errorMessage = e.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async (order, amount) => {
    console.log('💳 Creating VNPay payment with amount:', amount);
    const payRes = await api.post('/payment/create_payment_url', {
      amount: amount,
      orderId: order.id_DonHang,
      orderDesc: `Thanh toán đơn hàng #${order.id_DonHang} - HoaShop`,
    });
    
    const paymentData = payRes.data;
    if (paymentData?.success && paymentData?.paymentUrl) {
      console.log('🚀 Redirecting to VNPay:', paymentData.paymentUrl);
      window.location.href = paymentData.paymentUrl;
    } else {
      throw new Error('VNPay không trả về payment URL: ' + JSON.stringify(paymentData));
    }
  };

  // Xử lý thanh toán ZaloPay
  const handleZaloPayPayment = async (order, amount) => {
    console.log('💳 Creating ZaloPay payment with amount:', amount);
    const payRes = await api.post('/payment/create_zalopay_order', {
      amount: amount,
      orderId: order.id_DonHang,
      orderDesc: `Thanh toán đơn hàng #${order.id_DonHang} - HoaShop`,
    });
    
    const paymentData = payRes.data;
    if (paymentData?.success && paymentData?.order_url) {
      console.log('🚀 Redirecting to ZaloPay:', paymentData.order_url);
      window.location.href = paymentData.order_url;
    } else {
      throw new Error('ZaloPay không trả về payment URL: ' + JSON.stringify(paymentData));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Render từng bước
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Thông tin khách hàng</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user ? 'Thông tin được tự động điền từ tài khoản của bạn. Bạn có thể chỉnh sửa nếu cần.' : 'Vui lòng nhập thông tin của bạn.'}
            </Typography>
            <TextField 
              label="Họ tên" 
              fullWidth 
              margin="normal" 
              value={customerInfo.name} 
              onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder="Nhập họ và tên đầy đủ"
              required
            />
            <TextField 
              label="Số điện thoại" 
              fullWidth 
              margin="normal" 
              value={customerInfo.phone} 
              onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              placeholder="Nhập số điện thoại"
              required
            />
            <TextField 
              label="Email" 
              fullWidth 
              margin="normal" 
              type="email"
              value={customerInfo.email} 
              onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              placeholder="Nhập địa chỉ email"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Địa chỉ giao hàng</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user?.diaChi ? 'Địa chỉ được tự động điền từ tài khoản của bạn. Bạn có thể chỉnh sửa nếu cần.' : 'Vui lòng nhập địa chỉ giao hàng.'}
            </Typography>
            <TextField 
              label="Địa chỉ giao hàng" 
              fullWidth 
              margin="normal" 
              value={shipping.address} 
              onChange={e => setShipping({ ...shipping, address: e.target.value })}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              multiline
              rows={3}
              required
            />
            <TextField 
              label="Ghi chú (tùy chọn)" 
              fullWidth 
              margin="normal" 
              value={shipping.note} 
              onChange={e => setShipping({ ...shipping, note: e.target.value })}
              placeholder="Ghi chú thêm cho người giao hàng (nếu có)"
              multiline
              rows={2}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Phương thức thanh toán</Typography>
            <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
              <FormControlLabel value="VNPay" control={<Radio />} label="Thanh toán qua VNPay (ATM, QR, thẻ quốc tế)" />
              <FormControlLabel value="ZaloPay" control={<Radio />} label="Thanh toán qua ZaloPay (Ví điện tử, thẻ ATM)" />
            </RadioGroup>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Xác nhận đơn hàng</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Thông tin khách hàng</Typography>
              <Typography>Họ tên: {customerInfo.name}</Typography>
              <Typography>Số điện thoại: {customerInfo.phone}</Typography>
              <Typography>Email: {customerInfo.email || 'Không có'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Địa chỉ giao hàng</Typography>
              <Typography>Địa chỉ: {shipping.address}</Typography>
              {shipping.note && <Typography>Ghi chú: {shipping.note}</Typography>}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Phương thức thanh toán</Typography>
              <Typography>{
                paymentMethod === 'VNPay' ? 'VNPay (ATM, QR, thẻ quốc tế)' : 
                paymentMethod === 'ZaloPay' ? 'ZaloPay (Ví điện tử, thẻ ATM)' : 
                'Thanh toán khi nhận hàng (COD)'
              }</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Tổng quan đơn hàng</Typography>
              <Typography>Số sản phẩm: {cartItems.length}</Typography>
              <Typography>Tổng tiền hàng: {totalAmount.toLocaleString('vi-VN')}₫</Typography>
              
              {/* Voucher input ở bước xác nhận */}
              <Box sx={{ my: 2 }}>
                <VoucherInput
                  onVoucherApplied={handleVoucherApplied}
                  onVoucherRemoved={handleVoucherRemoved}
                  orderTotal={totalAmount}
                  appliedVoucher={voucher}
                  userId={user?.id_NguoiDung}
                  productIds={cartItems.map(item => item.id_SanPham)}
                />
              </Box>
              
              {voucher && (
                <>
                  <Typography color="success.main">
                    Giảm giá: -{voucher.calculation.discountAmount.toLocaleString('vi-VN')}₫
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    Tổng thanh toán: {finalTotal.toLocaleString('vi-VN')}₫
                  </Typography>
                </>
              )}
              
              {!voucher && (
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  Tổng thanh toán: {finalTotal.toLocaleString('vi-VN')}₫
                </Typography>
              )}
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ maxWidth: 600, margin: '32px auto', p: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box mt={3} mb={2}>{renderStepContent(activeStep)}</Box>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>Quay lại</Button>
        <Button variant="contained" color="primary" onClick={handleNext} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Đặt hàng' : 'Tiếp tục')}
        </Button>
      </Box>
    </Paper>
  );
};

export default CheckoutPage; 