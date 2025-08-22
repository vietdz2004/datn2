import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { productAPI, formatImageUrl, orderAPI } from '../services/api';
import ProductImage from '../components/ProductImage';
import RelatedProducts from '../components/RelatedProducts';
import ReviewForm from '../components/ReviewForm';
import ReviewStats from '../components/ReviewStats';
import ReviewItem from '../components/ReviewItem';
import { Avatar } from '@mui/material';
import { 
  Box, 
  Typography, 
  Button, 
  Rating, 
  Chip, 
  Divider, 
  Grid, 
  IconButton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Container,
  Card,
  CardContent
} from '@mui/material';
import { 
  ShoppingCart, 
  Favorite, 
  Share, 
  LocalShipping,
  Verified,
  ArrowBack,
  Description,
  Info,
  LocalFlorist,
  Category,
  Tag,
  Inventory,
  Add,
  Remove
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Format giá theo chuẩn Việt Nam
const formatGia = (gia) => {
  if (!gia || gia === 0) return '0VND';
  return Number(gia).toLocaleString('vi-VN') + 'VND';
};

// ProductDetailPage: Trang chi tiết sản phẩm
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productAPI.getById(id);
        
        // Handle both response formats: {success: true, data: {}} and direct data
        const productData = res.data.success ? res.data.data : res.data;
        
        setProduct(productData);

        // Check if user has purchased this product
        if (user && user.id) {
          try {
            const ordersRes = await orderAPI.getUserOrders();
            const orders = ordersRes.data.success ? ordersRes.data.data : ordersRes.data;
            const hasPurchased = orders.some(order => 
              order.chiTietDonHang.some(detail => 
                detail.sanPhamId === parseInt(id) && order.trangThai === 'Đã giao hàng'
              )
            );
            setUserHasPurchased(hasPurchased);
          } catch (err) {
            console.error('Error checking purchase history:', err);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching product:', err);
        setError('Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Use explicit reviews endpoint to avoid relying on product route proxy
        const res = await api.get(`/reviews/product/${id}`);
        console.log('Reviews API response:', res.data);
        
        // Handle both response formats
        const reviewsData = res.data.success ? res.data.data : res.data;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        // Fetch review stats
        try {
          const statsRes = await api.get(`/reviews/product/${id}/stats`);
          const statsData = statsRes.data.success ? statsRes.data.data : statsRes.data;
          setReviewStats(statsData);
        } catch (err) {
          console.error('Error fetching review stats:', err);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    };
    
    // Fetch sản phẩm liên quan từ server-side API
    const fetchRelatedProducts = async () => {
      try {
        setRelatedProductsLoading(true);
        const res = await productAPI.getRelatedProducts(id, 4);
        console.log('Related products API response:', res.data);
        
        // Handle both response formats
        const relatedData = res.data.success ? res.data.data : res.data;
        setRelatedProducts(Array.isArray(relatedData) ? relatedData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setRelatedProducts([]);
        setError('Không thể tải sản phẩm liên quan');
      } finally {
        setRelatedProductsLoading(false);
      }
    };
    
    // Kiểm tra xem user đã mua sản phẩm này chưa
    const checkUserPurchase = async () => {
      try {
        if (!user || !user.id_NguoiDung) {
          setUserHasPurchased(false);
          return;
        }

        // Gọi API lấy đơn hàng của user và kiểm tra xem có đơn nào đã giao chứa sản phẩm
        const res = await orderAPI.getUserOrders(user.id_NguoiDung);
        const orders = res.data?.data || res.data || [];

        let purchased = false;
        if (Array.isArray(orders)) {
          for (const o of orders) {
            const status = o.trangThaiDonHang || o.trangThai || '';
            if (status !== 'da_giao') continue;

            // một số API trả về chi tiết đơn hàng trong property OrderDetails, chitietdonhang, hoặc ChiTietDonHang
            const details = o.OrderDetails || o.chiTietDonHang || o.ChiTietDonHang || o.items || o.chitiet || [];
            if (Array.isArray(details) && details.some(d => Number(d.id_SanPham || d.idSanPham || d.productId) === Number(id))) {
              purchased = true;
              break;
            }
          }
        }

        setUserHasPurchased(Boolean(purchased));
      } catch (err) {
        console.warn('Could not verify purchase status, defaulting to false', err);
        setUserHasPurchased(false);
      }
    };
    
    fetchReviews();
    fetchRelatedProducts();
    checkUserPurchase();
  }, [id, user]);

  // Handler thêm giỏ hàng
  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: `/products/${id}`,
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng'
        }
      });
      return;
    }
    
    try {
      addToCart(product, quantity);
      setNotificationMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      setShowNotification(true);
    } catch {
      setNotificationMessage('Có lỗi khi thêm vào giỏ hàng');
      setShowNotification(true);
    }
  };

  // Handler đặt hàng
  const handleOrder = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: `/products/${id}`,
          message: 'Vui lòng đăng nhập để đặt hàng'
        }
      });
      return;
    }
    
    // Thêm vào giỏ hàng trước
    addToCart(product, quantity);
    // Chuyển đến trang thanh toán
    navigate('/checkout');
  };

  // Handler yêu thích
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setNotificationMessage(isFavorite ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
    setShowNotification(true);
  };

  // Handler chia sẻ
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.tenSp,
        text: product.moTa,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotificationMessage('Đã copy link sản phẩm!');
      setShowNotification(true);
    }
  };

  // Handler thay đổi số lượng
  const handleQuantityChange = (newQuantity) => {
    const maxQuantity = Math.min(99, Number(product?.soLuongTon) || 0);
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };



  // Handler mở form viết đánh giá
  const handleOpenReviewForm = () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: `/products/${id}`,
          message: 'Vui lòng đăng nhập để viết đánh giá'
        }
      });
      return;
    }

    // Kiểm tra đã mua hàng chưa
    if (!userHasPurchased) {
      setNotificationMessage('Bạn cần mua sản phẩm này trước khi đánh giá');
      setShowNotification(true);
      return;
    }

    // Kiểm tra đã đánh giá chưa
    const hasReviewed = reviews.some(review => review.userId === user.id);
    if (hasReviewed) {
      setNotificationMessage('Bạn đã đánh giá sản phẩm này rồi');
      setShowNotification(true);
      return;
    }

    setShowReviewForm(true);
  };

  // Handler đóng form viết đánh giá
  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
  };

  // Handler sau khi submit đánh giá thành công
  const handleReviewSubmitted = async () => {
    try {
      // Refresh danh sách đánh giá
      const res = await api.get(`/reviews/product/${id}`);
      const reviewsData = res.data.success ? res.data.data : res.data;
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // Refresh thống kê đánh giá
      try {
        const statsRes = await reviewAPI.getProductStats(id);
        if (statsRes.data.success) {
          setReviewStats(statsRes.data.data);
        }
      } catch (statsError) {
        console.error('Error refreshing review stats:', statsError);
      }
      
      // Đóng form và hiện thông báo
      setShowReviewForm(false);
      setNotificationMessage('Đánh giá của bạn đã được gửi thành công! Đánh giá sẽ hiển thị ngay lập tức.');
      setShowNotification(true);
    } catch (err) {
      console.error('Error refreshing reviews:', err);
      setNotificationMessage('Có lỗi xảy ra khi cập nhật đánh giá');
      setShowNotification(true);
    }
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h6">Đang tải...</Typography>
    </Container>
  );
  
  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );
  
  if (!product) return null;

  // Compute rating summary
  const ratingCount = reviews.length;
  const avgRating = ratingCount > 0 ? (reviews.reduce((s, r) => s + (r.danhGiaSao || r.sao || 0), 0) / ratingCount) : 0;
  const avgRatingFormatted = avgRating.toFixed(1);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Trang chủ
          </Link>
          <Link color="inherit" href="/products">
            Sản phẩm
          </Link>
          <Typography color="text.primary">{product.tenSp}</Typography>
        </Breadcrumbs>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Grid container spacing={4}>
        {/* Hình ảnh sản phẩm */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <ProductImage
              imagePath={product.hinhAnh}
              alt={product.tenSp}
              width="100%"
              height="400px"
            />
            
            {/* Action buttons overlay */}
            <Box sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1,
              zIndex: 10 
            }}>
              <IconButton 
                onClick={handleToggleFavorite}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  color: isFavorite ? 'red' : 'gray',
                  '&:hover': { bgcolor: 'white' },
                  boxShadow: 1
                }}
              >
                <Favorite />
              </IconButton>
              <IconButton 
                onClick={handleShare}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  color: 'gray',
                  '&:hover': { bgcolor: 'white' },
                  boxShadow: 1
                }}
              >
                <Share />
              </IconButton>
            </Box>
          </Box>
        </Grid>

        {/* Thông tin sản phẩm */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Tên sản phẩm */}
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              {product.tenSp}
            </Typography>

            {/* Đánh giá */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={Number(avgRatingFormatted)} readOnly size="small" precision={0.1} />
              <Typography variant="body2" color="text.secondary">
                {avgRatingFormatted} ★ ({ratingCount} đánh giá)
              </Typography>
            </Box>

            {/* Giá */}
            <Card sx={{ bgcolor: '#fce4ec', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                {product.giaKhuyenMai && Number(product.giaKhuyenMai) > 0 && Number(product.giaKhuyenMai) < Number(product.gia) ? (
                  <>
                    <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
                      {formatGia(product.giaKhuyenMai)}
                    </Typography>
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                      {formatGia(product.gia)}
                    </Typography>
                    <Chip 
                      label={`-${Math.round(((product.gia - product.giaKhuyenMai) / product.gia) * 100)}%`}
                      color="error"
                      size="small"
                    />
                  </>
                ) : (
                  <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
                    {formatGia(product.gia)}
                  </Typography>
                )}
              </Box>
            </Card>

            {/* Thông tin chi tiết */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Mã: SP{(product.maSanPham || product.id_SanPham || 0).toString().padStart(6, '0')}
            </Typography>

            {/* Thông tin tồn kho */}
            <Box sx={{ mb: 2 }}>
              {(() => {
                const stock = Number(product.soLuongTon) || 0;
                const minStock = Number(product.soLuongToiThieu) || 5;
                
                if (stock <= 0) {
                  return <Chip label="Hết hàng" color="error" />;
                } else if (stock <= minStock) {
                  return <Chip label={`Còn ${stock} sản phẩm`} color="warning" />;
                } else {
                  return <Chip label={`Còn ${stock} sản phẩm`} color="success" />;
                }
              })()}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Số lượng */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Số lượng:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                <IconButton 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= Math.min(99, Number(product.soLuongTon) || 0)}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Buttons hành động */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={Number(product.soLuongTon) <= 0}
                fullWidth
              >
                {Number(product.soLuongTon) <= 0 ? 'Hết hàng' : 'Thêm giỏ hàng'}
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleOrder}
                disabled={Number(product.soLuongTon) <= 0}
                fullWidth
              >
                Đặt hàng
              </Button>
            </Box>

            {/* Thông tin giao hàng */}
            <Card sx={{ bgcolor: '#f5f5f5', p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ✓ Giao hàng miễn phí nội thành | ✓ Đảm bảo hoa tươi 100%
              </Typography>
              {Number(product.soLuongTon) > 0 && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  🚚 Có thể giao hàng ngay trong ngày
                </Typography>
              )}
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Mô tả sản phẩm */}
      <Card sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Mô tả sản phẩm
        </Typography>
        <Typography variant="body1">
          {product.moTa}
        </Typography>
      </Card>

      {/* Đánh giá sản phẩm */}
      <Card sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Đánh giá sản phẩm
        </Typography>
        
        {/* Review Statistics */}
        <ReviewStats 
          stats={reviewStats}
          avgRating={avgRatingFormatted}
          totalReviews={ratingCount}
        />
        {reviews.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {userHasPurchased 
                ? 'Chưa có đánh giá. Hãy là người đầu tiên đánh giá sản phẩm!' 
                : 'Chưa có đánh giá. Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá.'
              }
            </Typography>
            {userHasPurchased && (
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                startIcon={<Description />}
                onClick={handleOpenReviewForm}
                sx={{ mt: 2 }}
              >
                Viết đánh giá
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            {reviews.map((review, index) => (
              <ReviewItem key={index} review={review} />
            ))}
            {userHasPurchased && (
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<Description />}
                onClick={handleOpenReviewForm}
              >
                Viết đánh giá
              </Button>
            )}
          </Box>
        )}
      </Card>

      {/* Sản phẩm liên quan */}
      <RelatedProducts
        products={relatedProducts}
        loading={relatedProductsLoading}
        error={error}
        title="Sản phẩm liên quan"
        subtitle="Khám phá thêm các sản phẩm tương tự"
      />

      {/* Review Form Modal */}
      <ReviewForm
        open={showReviewForm}
        onClose={handleCloseReviewForm}
        productId={product.id_SanPham}
        productName={product.tenSp}
        userHasPurchased={userHasPurchased}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity="success"
          variant="filled"
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetailPage;