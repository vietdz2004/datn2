import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Divider,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import OrderTimeline from './OrderTimeline';

const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numericAmount);
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

const OrderDetails = React.memo(({
  open,
  onClose,
  order,
  getStatusInfo,
  formatDate,
  formatImageUrl,
  onCancel,
  onPay
}) => {
  if (!order) return null;

  const statusInfo = getStatusInfo(order.trangThaiDonHang);
  const subTotal = order.OrderDetails?.reduce((total, item) => 
    total + (Number(item.giaBan) * Number(item.soLuong)), 0) || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        Chi tiết đơn hàng #{order.maDonHang || order.id_DonHang}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Thông tin đơn hàng
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
              Trạng thái: 
              <Chip 
                size="small"
                label={statusInfo.label}
                color={statusInfo.color}
                icon={statusInfo.icon}
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
              Ngày đặt: {formatDate(order.ngayDatHang)}
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
              Phương thức thanh toán: {order.phuongThucThanhToan || 'Chưa chọn'}
            </Typography>
            <Typography variant="body2">
              Trạng thái thanh toán: {getPaymentStatusLabel(order.trangThaiThanhToan)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Thông tin giao hàng
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
              Người nhận: {order.tenNguoiNhan || order.hoTen || 'Chưa có thông tin'}
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
              Số điện thoại: {order.soDienThoai || 'Chưa có thông tin'}
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
              Địa chỉ: {order.diaChiGiaoHang || 'Chưa có thông tin'}
            </Typography>
            <Typography variant="body2">
              Ghi chú: {order.ghiChu || 'Không có'}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Trạng thái đơn hàng
          </Typography>
          <OrderTimeline status={order.trangThaiDonHang} />
        </Box>

        <List>
          {order.OrderDetails?.map((item, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar 
                  variant="square"
                  src={formatImageUrl(item.hinhAnh)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/no-image.png';
                  }}
                  sx={{ width: 80, height: 80 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.tenSp}
                secondary={
                  <>
                    <Typography variant="body2">
                      Đơn giá: {formatCurrency(item.giaBan)}
                    </Typography>
                    <Typography variant="body2">
                      Số lượng: {item.soLuong}
                    </Typography>
                    <Typography variant="body2">
                      Thành tiền: {formatCurrency(item.giaBan * item.soLuong)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{mb: 1}}>
                Tạm tính: {formatCurrency(subTotal)}
              </Typography>
              {order.giamGia > 0 && (
                <Typography variant="body1" sx={{mb: 1}}>
                  Giảm giá: -{formatCurrency(order.giamGia)}
                </Typography>
              )}
              {order.phiVanChuyen > 0 && (
                <Typography variant="body1" sx={{mb: 1}}>
                  Phí vận chuyển: +{formatCurrency(order.phiVanChuyen)}
                </Typography>
              )}
              <Divider sx={{my: 1}} />
              <Typography variant="h6" color="primary">
                Tổng cộng: {formatCurrency(
                  subTotal - 
                  (Number(order.giamGia) || 0) + 
                  (Number(order.phiVanChuyen) || 0)
                )}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Đóng
        </Button>
        {statusInfo.canCancel && (
          <Button 
            color="error"
            variant="contained"
            onClick={() => {
              onClose();
              onCancel(order);
            }}
          >
            Hủy đơn hàng
          </Button>
        )}
        {statusInfo.canPay && 
         !order.trangThaiThanhToan?.includes('da_thanh_toan') && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => onPay(order)}
          >
            Thanh toán
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});

OrderDetails.displayName = 'OrderDetails';

export default OrderDetails;
