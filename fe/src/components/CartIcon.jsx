import React from 'react';
import { IconButton, Badge } from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartIconComponent = ({ className = '', size = "large" }) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <IconButton 
      size={size}
      className={className}
      aria-label="Giỏ hàng"
      onClick={handleCartClick}
      color="inherit"
    >
      <Badge badgeContent={totalItems} color="error" max={99}>
        <CartIcon />
      </Badge>
    </IconButton>
  );
};

export default CartIconComponent; 