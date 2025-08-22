import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Paper,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import styles from "./LoginPage.module.scss";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  // Get redirect path and message from location state
  const returnUrl = location.state?.returnUrl || "/";
  const authMessage = location.state?.message;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      // Map frontend field to backend field
      const loginData = {
        email: formData.email,
        matKhau: formData.password, // Transform password -> matKhau for backend
      };

      console.log("📊 Sending login data to backend:", {
        email: loginData.email,
        matKhau: "***",
      });

      const result = await login(loginData);

      if (result.success) {
        setSuccess("Đăng nhập thành công!");
        setTimeout(() => {
          navigate(returnUrl, { replace: true });
        }, 1000);
      } else {
        setApiError(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setApiError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      const result = await googleLogin(idToken);

      if (result.success) {
        setSuccess("Đăng nhập Google thành công!");
        setTimeout(() => {
          navigate(returnUrl, { replace: true });
        }, 1000);
      } else {
        setApiError(result.message);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setApiError("Có lỗi xảy ra khi đăng nhập Google");
    }
  };

  const handleGoogleError = (error) => {
    setApiError(error);
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
            Bằng cách tạo tài khoản, bạn sẽ có thể mua sắm nhanh hơn, cập nhật
            trạng thái đơn hàng và theo dõi các đơn hàng bạn đã thực hiện trước
            đó.
          </Typography>
          <Button
            className={styles.continueButton}
            onClick={() => navigate("/register")}
          >
            Tiếp tục
          </Button>
        </Box>

        {/* Right Column - Form đăng nhập */}
        <Box className={styles.rightColumn}>
          <Typography className={styles.formTitle}>
            Phần hồi khách hàng
          </Typography>
          <Typography className={styles.formSubtitle}>
            Tôi là một khách hàng cũ
          </Typography>

          {authMessage && (
            <Alert severity="info" className={styles.alert}>
              {authMessage}
            </Alert>
          )}

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
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Địa chỉ email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              required
              autoComplete="email"
              className={styles.textField}
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              label="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
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
            />

            <Link to="/forgot-password" className={styles.forgotPassword}>
              Đã quên mật khẩu
            </Link>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <Divider sx={{ my: 2 }}>hoặc</Divider>

            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={loading}
            />
          </Box>
        </Box>
      </Box>

      {/* Sidebar */}
      <Box className={styles.sidebar}>
        <Typography className={styles.sidebarTitle}>Tài khoản</Typography>
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

export default LoginPage;
