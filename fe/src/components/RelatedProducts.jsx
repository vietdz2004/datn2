import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Skeleton, 
  Chip,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import { 
  ShoppingCart, 
  Favorite, 
  FavoriteBorder,
  Visibility,
  LocalShipping,
  Star,
  ArrowForward
} from '@mui/icons-material';
import { formatImageUrl } from '../services/api';
import ProductImage from './ProductImage';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import styles from './RelatedProducts.module.scss';

// Format giá theo chuẩn Việt Nam
const formatGia = (gia) => {
  if (!gia || gia === 0) return '0₫';
  return Number(gia).toLocaleString('vi-VN') + '₫';
};

// Tính phần trăm giảm giá
const calculateDiscountPercent = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Component sản phẩm liên quan
const RelatedProducts = ({ 
  products, 
  loading = false, 
  error = null,
  title = "Sản phẩm liên quan",
  subtitle = "Khám phá thêm các sản phẩm tương tự"
}) => {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/products/${product.id_SanPham}`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: `/products/${product.id_SanPham}`,
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng'
        }
      });
      return;
    }
    
    try {
      await addToCart(product, 1);
      // Có thể thêm notification ở đây nếu cần
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleQuickView = (e, product) => {
    e.stopPropagation();
    handleProductClick(product);
  };

  if (loading) {
    return (
      <Card className={styles.container}>
        <Box className={styles.header}>
          <Box className={styles.titleRow}>
            <Typography variant="h6" className={styles.title}>
              {title}
            </Typography>
            <Button
              variant="text"
              color="primary"
              endIcon={<ArrowForward />}
              className={styles.viewAllButton}
              onClick={() => navigate('/products')}
            >
              Xem tất cả
            </Button>
          </Box>
          <Typography variant="body2" className={styles.subtitle}>
            {subtitle}
          </Typography>
        </Box>
        <Box className={styles.productsGrid}>
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className={styles.productCard}>
              <Skeleton variant="rectangular" className={styles.imageSkeleton} />
              <CardContent className={styles.cardContent}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={16} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.container}>
        <Box className={styles.header}>
          <Box className={styles.titleRow}>
            <Typography variant="h6" className={styles.title}>
              {title}
            </Typography>
            <Button
              variant="text"
              color="primary"
              endIcon={<ArrowForward />}
              className={styles.viewAllButton}
              onClick={() => navigate('/products')}
            >
              Xem tất cả
            </Button>
          </Box>
        </Box>
        <Box className={styles.errorState}>
          <Typography variant="body1" color="error">
            Không thể tải sản phẩm liên quan. Vui lòng thử lại sau.
          </Typography>
        </Box>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className={styles.container}>
        <Box className={styles.header}>
          <Box className={styles.titleRow}>
            <Typography variant="h6" className={styles.title}>
              {title}
            </Typography>
            <Button
              variant="text"
              color="primary"
              endIcon={<ArrowForward />}
              className={styles.viewAllButton}
              onClick={() => navigate('/products')}
            >
              Xem tất cả
            </Button>
          </Box>
          <Typography variant="body2" className={styles.subtitle}>
            {subtitle}
          </Typography>
        </Box>
        <Box className={styles.emptyState}>
          <Typography variant="body1" className={styles.emptyText}>
            🌸 Hiện tại chưa có sản phẩm liên quan
          </Typography>
          <Typography variant="body2" className={styles.emptySubtext}>
            Hãy khám phá các sản phẩm khác trong cửa hàng của chúng tôi
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card className={styles.container}>
              <Box className={styles.header}>
          <Box className={styles.titleRow}>
            <Typography variant="h6" className={styles.title}>
              🔗 {title}
            </Typography>
            <Button
              variant="text"
              color="primary"
              endIcon={<ArrowForward />}
              className={styles.viewAllButton}
              onClick={() => navigate('/products')}
            >
              Xem tất cả
            </Button>
          </Box>
          <Typography variant="body2" className={styles.subtitle}>
            {subtitle}
          </Typography>
        </Box>
      
      <Box className={styles.productsGrid}>
        {products.map((product) => {
          const hasDiscount = product.giaKhuyenMai && 
                              Number(product.giaKhuyenMai) > 0 && 
                              Number(product.giaKhuyenMai) < Number(product.gia);
          const discountPercent = hasDiscount ? 
                                  calculateDiscountPercent(Number(product.gia), Number(product.giaKhuyenMai)) : 0;
          const isProductInCart = isInCart(product.id_SanPham);
          
          return (
            <Card 
              key={product.id_SanPham} 
              className={styles.productCard}
              onClick={() => handleProductClick(product)}
            >
              <Box className={styles.imageContainer}>
                {/* Badge giảm giá */}
                {hasDiscount && discountPercent > 0 && (
                  <Chip
                    label={`-${discountPercent}%`}
                    className={styles.discountChip}
                    size="small"
                  />
                )}
                
                {/* Badge hết hàng */}
                {Number(product.soLuongTon) <= 0 && (
                  <Chip
                    label="Hết hàng"
                    className={styles.outOfStockChip}
                    size="small"
                  />
                )}
                
                {/* Hình ảnh sản phẩm */}
                <ProductImage
                  imagePath={product.hinhAnh}
                  alt={product.tenSp}
                  width="100%"
                  height="200px"
                  objectFit="cover"
                />
                
                {/* Overlay actions */}
                <Box className={styles.overlayActions}>
                  <Tooltip title="Xem chi tiết">
                    <IconButton 
                      size="small" 
                      className={styles.actionButton}
                      onClick={(e) => handleQuickView(e, product)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={isProductInCart ? "Đã có trong giỏ" : "Thêm vào giỏ"}>
                    <IconButton 
                      size="small" 
                      className={`${styles.actionButton} ${isProductInCart ? styles.inCart : ''}`}
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={Number(product.soLuongTon) <= 0}
                    >
                      <ShoppingCart />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Yêu thích">
                    <IconButton size="small" className={styles.actionButton}>
                      <FavoriteBorder />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <CardContent className={styles.cardContent}>
                {/* Tên sản phẩm */}
                <Typography 
                  variant="subtitle1" 
                  className={styles.productName}
                  title={product.tenSp}
                >
                  {product.tenSp}
                </Typography>
                
                {/* Giá sản phẩm */}
                <Box className={styles.priceContainer}>
                  {hasDiscount ? (
                    <>
                      <Typography variant="body2" className={styles.oldPrice}>
                        {formatGia(product.gia)}
                      </Typography>
                      <Typography variant="h6" className={styles.salePrice}>
                        {formatGia(product.giaKhuyenMai)}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h6" className={styles.salePrice}>
                      {formatGia(product.gia)}
                    </Typography>
                  )}
                </Box>
                
                {/* Thông tin bổ sung */}
                <Box className={styles.productInfo}>
                  {Number(product.soLuongTon) > 0 && (
                    <Chip
                      icon={<LocalShipping />}
                      label="Giao hàng nhanh"
                      size="small"
                      className={styles.infoChip}
                    />
                  )}
                  
                  {product.rating && (
                    <Box className={styles.ratingContainer}>
                      <Star className={styles.starIcon} />
                      <Typography variant="body2" className={styles.ratingText}>
                        {product.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Card>
  );
};

export default RelatedProducts; 