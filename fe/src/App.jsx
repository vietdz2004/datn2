import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import OrderPage from './pages/OrderPage';
import UserPage from './pages/UserPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentResultPage from './pages/PaymentResultPage';
import './App.scss';

// Tạo theme Material-UI với màu hồng chính
const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
    },
    secondary: {
      main: '#f06292',
    },
  },
});

// App: Thành phần gốc của ứng dụng frontend
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/orders" element={<OrderPage />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/users" element={<UserPage />} />
                  <Route path="/profile" element={<UserPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/change-password" element={<ChangePasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/payment-success" element={<PaymentSuccessPage />} />
                  <Route path="/payment-result" element={<PaymentResultPage />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
