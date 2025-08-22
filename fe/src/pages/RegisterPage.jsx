import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Alert, Container, Paper,
  FormControlLabel, Checkbox, Grid
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Email, Lock, Person, Phone
} from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import styles from './RegisterPage.module.scss';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    password: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Họ tên là bắt buộc';
    } else if (formData.hoTen.trim().length < 2) {
      newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phone
    if (!formData.soDienThoai) {
      newErrors.soDienThoai = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại phải có 10-11 chữ số';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }



    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const { password, ...otherData } = formData;
      
      // Map frontend field to backend field
      const registerData = {
        ...otherData,
        matKhau: password  // Transform password -> matKhau for backend
      };
      
      console.log('📊 Sending to backend:', registerData);
      
      const result = await register(registerData);
      
      if (result.success) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        setApiError(result.message);
      }
    } catch {
      setApiError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <Box className={styles.registerContainer}>
      {/* Banner */}
      <Box className={styles.banner}>
        ĐẶT HOA ONLINE - GIAO MIỄN PHÍ TP HCM & HÀ NỘI - GỌI NGAY 1234 123 123 HOẶC 4312 160 123
      </Box>
      
      {/* Main Content */}
      <Box className={styles.mainContent}>
        {/* Form đăng ký - Full width */}
        <Box className={styles.registerFormColumn}>
          <Typography className={styles.pageTitle}>
            Đăng ký tài khoản
          </Typography>
          <Typography className={styles.pageDescription}>
            Nếu bạn đã có tài khoản với chúng tôi, vui lòng đăng nhập tại <Link to="/login" className={styles.link}>trang đăng nhập</Link> .
          </Typography>
          
          <Typography className={styles.formTitle}>
            Thông tin cá nhân của bạn
          </Typography>

          {apiError && (
            <Alert severity="error" className={styles.alert}>
              {apiError}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className={styles.alert}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className={styles.form}>
            <Box className={styles.formRow}>
              <Typography className={styles.fieldLabel}>
                <span className={styles.required}>*</span> Họ tên
              </Typography>
              <TextField
                name="hoTen"
                placeholder="Họ tên"
                value={formData.hoTen}
                onChange={handleChange}
                error={!!errors.hoTen}
                disabled={loading}
                required
                className={styles.textField}
                InputLabelProps={{ shrink: false }}
              />
            </Box>
            {errors.hoTen && (
              <Typography variant="body2" color="error" className={styles.errorText}>
                {errors.hoTen}
              </Typography>
            )}

            <Box className={styles.formRow}>
              <Typography className={styles.fieldLabel}>
                <span className={styles.required}>*</span> E-mail
              </Typography>
              <TextField
                name="email"
                type="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                disabled={loading}
                required
                className={styles.textField}
                InputLabelProps={{ shrink: false }}
              />
            </Box>
            {errors.email && (
              <Typography variant="body2" color="error" className={styles.errorText}>
                {errors.email}
              </Typography>
            )}

            <Box className={styles.formRow}>
              <Typography className={styles.fieldLabel}>
                <span className={styles.required}>*</span> Điện thoại
              </Typography>
              <TextField
                name="soDienThoai"
                placeholder="Điện thoại"
                value={formData.soDienThoai}
                onChange={handleChange}
                error={!!errors.soDienThoai}
                disabled={loading}
                required
                className={styles.textField}
                InputLabelProps={{ shrink: false }}
              />
            </Box>
            {errors.soDienThoai && (
              <Typography variant="body2" color="error" className={styles.errorText}>
                {errors.soDienThoai}
              </Typography>
            )}

            <Typography className={styles.formTitle} style={{ marginTop: '30px' }}>
              Mật khẩu của bạn
            </Typography>

            <Box className={styles.formRow}>
              <Typography className={styles.fieldLabel}>
                <span className={styles.required}>*</span> Mật khẩu
              </Typography>
              <TextField
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className={styles.textField}
                InputLabelProps={{ shrink: false }}
              />
            </Box>
            {errors.password && (
              <Typography variant="body2" color="error" className={styles.errorText}>
                {errors.password}
              </Typography>
            )}



            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Tôi đã đọc và đồng ý với <Link to="/terms" className={styles.link}>Điều khoản</Link> & <Link to="/privacy" className={styles.link}>Điều kiện</Link>
                </Typography>
              }
              className={styles.checkbox}
            />
            {errors.agreeToTerms && (
              <Typography variant="body2" color="error" className={styles.errorText}>
                {errors.agreeToTerms}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Đang đăng ký...' : 'Tiếp tục'}
            </Button>
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
    </Box>
  );
};

export default RegisterPage; 