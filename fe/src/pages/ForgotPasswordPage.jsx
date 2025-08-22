import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import styles from './LoginPage.module.scss'; // Reuse LoginPage styles
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authAPI.forgotPassword(email);
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Đã gửi liên kết đặt lại mật khẩu đến email của bạn');
        
        // Show additional info for development
        if (response.data.resetToken && import.meta.env.MODE === 'development') {
          console.log('🔗 Development Reset Link:', `http://localhost:3000/reset-password?token=${response.data.resetToken}`);
        }
        
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Vui lòng kiểm tra email để lấy liên kết đặt lại mật khẩu.'
            }
          });
        }, 3000);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={styles.loginContainer}>
      {/* Main Content */}
      <Box className={styles.mainContent}>
        {/* Left Column - Khách hàng mới */}
        <Box className={styles.leftColumn}>
          <Typography className={styles.sectionTitle}>
            Đăng ký tài khoản
          </Typography>
          <Typography className={styles.sectionDescription}>
            Bằng cách tạo tài khoản, bạn sẽ có thể mua sắm nhanh hơn, cập nhật trạng thái đơn hàng và theo dõi các đơn hàng bạn đã thực hiện trước đó.
          </Typography>
          <Button 
            className={styles.continueButton}
            onClick={() => navigate('/register')}
          >
            Tiếp tục
          </Button>
        </Box>

        {/* Right Column - Form quên mật khẩu */}
        <Box className={styles.rightColumn}>
          <Typography className={styles.formTitle}>
            Quên mật khẩu?
          </Typography>
          <Typography className={styles.formSubtitle}>
            Nhập địa chỉ e-mail được liên kết với tài khoản của bạn. Nhấp vào gửi để có một liên kết đặt lại mật khẩu được gửi qua email cho bạn.
          </Typography>

          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className={styles.alert}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className={styles.form}>
            <Typography className={styles.formSubtitle}>
              Địa chỉ email của bạn
            </Typography>
            
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
              disabled={loading}
              required
              className={styles.textField}
            />

            <Box style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Button
                onClick={() => navigate('/login')}
                variant="outlined"
                className={styles.forgotPassword}
                style={{ 
                  border: '1px solid #ddd',
                  color: '#666',
                  padding: '12px 30px',
                  borderRadius: '4px'
                }}
              >
                Quay lại
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Đang gửi...' : 'Tiếp tục'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Sidebar */}
      <Box className={styles.sidebar}>
        <Typography className={styles.sidebarTitle}>
          Tài khoản
        </Typography>
        <Link to="/login" className={styles.sidebarLink}>
          Đăng nhập
        </Link>
        <Link to="/register" className={styles.sidebarLink}>
          Đăng ký
        </Link>
        <Link to="/forgot-password" className={styles.sidebarLink}>
          Đã quên mật khẩu
        </Link>
        <Link to="/profile" className={styles.sidebarLink}>
          Tài khoản của tôi
        </Link>
        <Link to="/orders" className={styles.sidebarLink}>
          Lịch sử đơn hàng
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage; 