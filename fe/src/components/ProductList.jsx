import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatImageUrl } from '../services/api';
import styles from './ProductList.module.scss';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ProductImage from './ProductImage';

// Format giá theo chuẩn Việt Nam
const formatGia = (gia) => {
  if (!gia || gia === 0) return '0VND';
  return Number(gia).toLocaleString('vi-VN') + 'VND';
};

// Tính phần trăm giảm giá
const calculateDiscountPercent = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// ProductList: Hiển thị danh sách sản phẩm dạng lưới
const ProductList = ({ products, onProductClick, highlightKeyword }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className={styles.gridContainer}>
      <div className={styles.productsGrid}>
        {products.map((product) => {
          const hasDiscount = product.giaKhuyenMai && 
                              Number(product.giaKhuyenMai) > 0 && 
                              Number(product.giaKhuyenMai) < Number(product.gia);
          const discountPercent = hasDiscount ? 
                                  calculateDiscountPercent(Number(product.gia), Number(product.giaKhuyenMai)) : 0;
          
          return (
            <div key={product.id_SanPham} className={styles.gridItem}>
              <Card className={styles.card}>
                <Box 
                  className={styles.imgBox}
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick && onProductClick(product);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  {/* Hiển thị phần trăm giảm giá cho tất cả sản phẩm có giảm giá */}
                  {hasDiscount && discountPercent > 0 && (
                    <div className={styles.discountBadge}>
                      -{discountPercent}%
                    </div>
                  )}
                  <ProductImage
                    imagePath={product.hinhAnh}
                    alt={product.tenSp}
                    width="100%"
                    height="220px"
                  />
                </Box>
                <CardContent className={styles.cardContent}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    className={styles.productName}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick && onProductClick(product);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    {highlightKeyword
                      ? highlightKeyword(product.tenSp)
                      : product.tenSp}
                  </Typography>
                  <Box className={styles.priceBlock}>
                    {hasDiscount ? (
                      <>
                        <span className={styles.oldPrice}>{formatGia(product.gia)}</span>
                        <span className={styles.salePrice}>{formatGia(product.giaKhuyenMai)}</span>
                      </>
                    ) : (
                      <span className={styles.salePrice}>{formatGia(product.gia)}</span>
                    )}
                  </Box>
                  
                  {/* Action Button - Chỉ có nút Đặt hàng hoặc Đăng nhập */}
                  <Box sx={{ mt: 2 }}>
                    {user ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductClick && onProductClick(product);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Đặt hàng
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/login', {
                            state: {
                              returnUrl: `/products/${product.id_SanPham}`,
                              message: 'Vui lòng đăng nhập để đặt hàng'
                            }
                          });
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Đăng nhập để đặt hàng
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList; 