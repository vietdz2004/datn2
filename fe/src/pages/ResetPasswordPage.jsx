import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Shield,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { authAPI } from '../services/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token không hợp lệ hoặc thiếu');
        setVerifying(false);
        return;
      }

      try {
        const response = await authAPI.verifyResetToken(token);
        
        if (response.data.success) {
          setTokenValid(true);
          setUserEmail(response.data.data.email);
        } else {
          setError(response.data.message || 'Token không hợp lệ');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setError(
          err.response?.data?.message || 
          'Token không hợp lệ hoặc đã hết hạn'
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

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
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
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
      const response = await authAPI.resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      if (response.data.success) {
        setSuccess('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
        
        // Clear form
        setFormData({
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.'
            }
          });
        }, 3000);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.'
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

  // Loading state while verifying token
  if (verifying) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6">
              Đang xác thực liên kết đặt lại mật khẩu...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng chờ trong giây lát
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Error sx={{ fontSize: 60, color: 'error.main', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Liên kết không hợp lệ
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error || 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/forgot-password')}
              >
                Gửi lại liên kết
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
              >
                Về trang đăng nhập
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Valid token - show reset form
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Shield sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Đặt lại mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo mật khẩu mới cho tài khoản: <strong>{userEmail}</strong>
            </Typography>
          </Box>

          {/* Success Message */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              icon={<CheckCircle />}
            >
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
                onClick={() => navigate('/login')}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Hủy bỏ
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.newPassword || !formData.confirmPassword}
                sx={{ flex: 1 }}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </Box>

            {/* Security Info */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                🔒 Bảo mật tài khoản:
              </Typography>
              <Typography variant="caption" component="div" color="text.secondary">
                • Sau khi đặt lại, mật khẩu cũ sẽ không còn sử dụng được<br />
                • Bạn sẽ cần đăng nhập lại với mật khẩu mới<br />
                • Liên kết đặt lại này chỉ sử dụng được 1 lần
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage; 