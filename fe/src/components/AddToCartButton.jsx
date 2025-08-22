import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  IconButton, 
  Snackbar, 
  Alert,
  Box,
  Typography
} from '@mui/material';
import { 
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const AddToCartButton = ({ 
  product, 
  variant = 'contained', 
  size = 'medium',
  showQuantityControls = false,
  fullWidth = false,
  className = ''
}) => {
  const { addToCart, updateQuantity, getItemQuantity, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  
  const currentQuantity = getItemQuantity(product.id_SanPham);
  const inCart = isInCart(product.id_SanPham);

  const handleAddToCart = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', {
        state: {
          returnUrl: window.location.pathname,
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng'
        }
      });
      return;
    }
    
    addToCart(product, 1);
    setShowAlert(true);
  };

  const handleQuantityChange = (newQuantity) => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: window.location.pathname,
          message: 'Vui lòng đăng nhập để quản lý giỏ hàng'
        }
      });
      return;
    }
    
    if (newQuantity <= 0) {
      updateQuantity(product.id_SanPham, 0);
    } else {
      updateQuantity(product.id_SanPham, newQuantity);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // If product is in cart and showQuantityControls is true, show quantity controls
  if (inCart && showQuantityControls) {
    return (
      <>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          className={className}
          sx={{ gap: 1 }}
        >
          <IconButton 
            size="small" 
            onClick={() => handleQuantityChange(currentQuantity - 1)}
            color="primary"
          >
            <RemoveIcon />
          </IconButton>
          
          <Typography 
            variant="body1" 
            sx={{ 
              minWidth: 40, 
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {currentQuantity}
          </Typography>
          
          <IconButton 
            size="small" 
            onClick={() => handleQuantityChange(currentQuantity + 1)}
            color="primary"
          >
            <AddIcon />
          </IconButton>
        </Box>

        <Snackbar
          open={showAlert}
          autoHideDuration={3000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity="success" 
            variant="filled"
          >
            Đã cập nhật giỏ hàng!
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Regular Add to Cart button
  return (
    <>
      <Button
        variant={variant}
        size={size}
        color="primary"
        fullWidth={fullWidth}
        startIcon={<CartIcon />}
        onClick={handleAddToCart}
        className={className}
        sx={{
          textTransform: 'none',
          fontWeight: 'bold'
        }}
      >
        {inCart ? `Đã thêm (${currentQuantity})` : 'Thêm vào giỏ'}
      </Button>

      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity="success" 
          variant="filled"
        >
          ✅ Đã thêm "{product.tenSp}" vào giỏ hàng!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddToCartButton; 