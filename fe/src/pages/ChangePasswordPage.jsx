import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Container,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Shield,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        userId: user.id_NguoiDung
      });
      
      if (response.data.success) {
        setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');
        
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: 'default' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return { score: score * 20, text: 'Yếu', color: 'error' };
    if (score <= 3) return { score: score * 20, text: 'Trung bình', color: 'warning' };
    if (score <= 4) return { score: score * 20, text: 'Mạnh', color: 'success' };
    return { score: 100, text: 'Rất mạnh', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Shield sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Đổi mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đảm bảo tài khoản của bạn an toàn bằng cách sử dụng mật khẩu mạnh
            </Typography>
          </Box>

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading Progress */}
          {loading && (
            <LinearProgress sx={{ mb: 3 }} />
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Current Password */}
            <TextField
              fullWidth
              label="Mật khẩu hiện tại"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange('currentPassword')}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* New Password */}
            <TextField
              fullWidth
              label="Mật khẩu mới"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              disabled={loading}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Độ mạnh mật khẩu
                  </Typography>
                  <Typography variant="caption" color={`${passwordStrength.color}.main`}>
                    {passwordStrength.text}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.score}
                  color={passwordStrength.color}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            )}

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Xác nhận mật khẩu mới"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/profile')}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Quay lại
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                sx={{ flex: 1 }}
              >
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </Button>
            </Box>

            {/* Security Tips */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                💡 Mẹo tạo mật khẩu mạnh:
              </Typography>
              <Typography variant="caption" component="div" color="text.secondary">
                • Sử dụng ít nhất 8 ký tự<br />
                • Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt<br />
                • Không sử dụng thông tin cá nhân<br />
                • Không chia sẻ mật khẩu với ai
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ChangePasswordPage; 