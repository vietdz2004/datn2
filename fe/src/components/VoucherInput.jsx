import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { Close as CloseIcon, LocalOffer as VoucherIcon } from '@mui/icons-material';
import api from '../services/api';

const VoucherInput = ({ onVoucherApplied, onVoucherRemoved, orderTotal = 0, appliedVoucher, userId, productIds }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Nếu có appliedVoucher từ prop thì dùng luôn, không dùng state cục bộ
  const voucher = appliedVoucher !== undefined ? appliedVoucher : null;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/vouchers/apply', {
        code: voucherCode.trim(),
        orderTotal: orderTotal,
        userId: userId,
        productIds: productIds
      });

      if (response.data.success) {
        const voucherData = response.data.data;
        setSuccess(response.data.message);
        setVoucherCode('');
        
        // Gọi callback để cập nhật tổng tiền
        if (onVoucherApplied) {
          onVoucherApplied(voucherData);
        }
      } else {
        setError(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Voucher apply error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi áp dụng voucher'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setSuccess('');
    setError('');
    
    // Gọi callback để cập nhật tổng tiền
    if (onVoucherRemoved) {
      onVoucherRemoved();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyVoucher();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <VoucherIcon color="primary" />
        Mã giảm giá
      </Typography>

      {!voucher ? (
        // Hiển thị input khi chưa có voucher
        <>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập mã voucher..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleApplyVoucher}
              disabled={loading || !voucherCode.trim()}
              sx={{ minWidth: 100 }}
            >
              {loading ? 'Đang xử lý...' : 'Áp dụng'}
            </Button>
          </Box>
        </>
      ) : (
        // Hiển thị thông tin voucher đã áp dụng
        <Box sx={{ 
          p: 2, 
          border: '1px solid', 
          borderColor: 'success.main', 
          borderRadius: 1,
          backgroundColor: 'success.light',
          color: 'success.contrastText'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Voucher đã áp dụng
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleRemoveVoucher}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip 
              label={voucher.voucher?.maVoucher || 'VOUCHER'} 
              color="success" 
              variant="outlined"
              size="small"
            />
            <Typography variant="body2">
              Giảm {voucher.calculation?.discountAmount?.toLocaleString('vi-VN') || '0'}đ
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Tổng tiền sau giảm: {voucher.calculation?.finalTotal?.toLocaleString('vi-VN') || '0'}đ
          </Typography>
        </Box>
      )}

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      </Collapse>

      <Collapse in={!!success}>
        <Alert severity="success" sx={{ mt: 1 }}>
          {success}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default VoucherInput; 