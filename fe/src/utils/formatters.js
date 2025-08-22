// Utility functions for formatting
import { useCallback } from 'react';

export const formatImageUrl = (imagePath) => {
  // Check for null, undefined or empty string
  if (!imagePath || imagePath.trim() === '') {
    return '/no-image.png';
  }
  
  // If the path already starts with /images/products, don't modify it
  if (imagePath.startsWith('/images/products/')) {
    return imagePath;
  }

  // Add /images/products/ if not already present
  return `/images/products/${imagePath}`;
};

// Custom hook for formatting functions
export const useFormatters = () => {
  const formatCurrency = useCallback((amount) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numericAmount);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return { formatCurrency, formatDate };
};
