import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Visibility,
  Cancel,
  Star
} from '@mui/icons-material';

const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numericAmount);
};

const OrderCard = React.memo(({ 
  order, 
  statusInfo, 
  formatDate,
  formatImageUrl,
  onViewDetails,
  onCancelOrder,
  onReviewProduct
}) => {
  // Calculate total from order details
  const orderTotal = order.OrderDetails?.reduce((total, item) => 
    total + (Number(item.giaBan) * Number(item.soLuong)), 0) || 0;

  return (
    <Card>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Typography variant="h6">
            Đơn hàng #{order.maDonHang || order.id_DonHang}
          </Typography>
          <Chip 
            label={statusInfo.label}
            color={statusInfo.color}
            icon={statusInfo.icon}
            sx={{ ml: 1 }}
          />
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Ngày đặt: {formatDate(order.ngayDatHang)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <List disablePadding>
          {order.OrderDetails?.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 2 }}>
              <ListItemAvatar>
                <Avatar 
                  variant="rounded"
                  src={formatImageUrl(item.hinhAnh)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/no-image.png';
                  }}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.tenSp || 'Không có tên sản phẩm'}
                secondary={
                  <>
                    <Typography variant="body2">
                      Đơn giá: {formatCurrency(Number(item.giaBan))}
                    </Typography>
                    <Typography variant="body2">
                      Số lượng: {Number(item.soLuong)}
                    </Typography>
                    <Typography variant="body2">
                      Thành tiền: {formatCurrency(Number(item.giaBan) * Number(item.soLuong))}
                    </Typography>
                  </>
                }
              />
              {statusInfo.canReview && (
                item.isReviewed ? (
                  <Chip
                    label="Đã đánh giá"
                    color="success"
                    size="small"
                    icon={<CheckCircle />}
                    sx={{ ml: 1 }}
                  />
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Star />}
                    onClick={() => onReviewProduct(item, order.id_DonHang)}
                    sx={{ ml: 1 }}
                  >
                    Đánh giá
                  </Button>
                )
              )}
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          <Typography variant="h6">
            Tổng tiền: {formatCurrency(orderTotal)}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => onViewDetails(order)}
              sx={{ mr: 1 }}
            >
              Chi tiết
            </Button>
            {statusInfo.canCancel && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => onCancelOrder(order)}
              >
                Hủy đơn
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;
